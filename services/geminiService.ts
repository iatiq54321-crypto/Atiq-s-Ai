/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
  Video,
  VideoGenerationReferenceImage,
  VideoGenerationReferenceType,
} from '@google/genai';
import {GenerateVideoParams, GenerationMode} from '../types';

// FIX: Switched from import.meta.env to process.env and moved inside the function.
// const API_KEY = import.meta.env.VITE_API_KEY;

export const generateVideo = async (
  params: GenerateVideoParams,
): Promise<{objectUrl: string; blob: Blob; uri: string; video: Video}> => {
  console.log('Starting video generation with params:', params);
  
  // FIX: Get API_KEY from process.env inside the function to ensure it's fresh for each call.
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    // FIX: Updated error message to be more generic and not mention environment variables.
    throw new Error('API key is missing.');
  }

  const ai = new GoogleGenAI({apiKey: API_KEY});

  const config: any = {
    numberOfVideos: 1,
    resolution: params.resolution,
  };

  // Conditionally add aspect ratio. It's not used for extending videos.
  if (params.mode !== GenerationMode.EXTEND_VIDEO) {
    config.aspectRatio = params.aspectRatio;
  }

  const generateVideoPayload: any = {
    model: params.model,
    config: config,
  };

  // Only add the prompt if it's not empty, as an empty prompt might interfere with other parameters.
  if (params.prompt) {
    generateVideoPayload.prompt = params.prompt;
  }

  if (params.mode === GenerationMode.FRAMES_TO_VIDEO) {
    if (params.startFrame) {
      generateVideoPayload.image = {
        imageBytes: params.startFrame.base64,
        mimeType: params.startFrame.file.type,
      };
      console.log(
        `Generating with start frame: ${params.startFrame.file.name}`,
      );
    }

    const finalEndFrame = params.isLooping
      ? params.startFrame
      : params.endFrame;
    if (finalEndFrame) {
      generateVideoPayload.config.lastFrame = {
        imageBytes: finalEndFrame.base64,
        mimeType: finalEndFrame.file.type,
      };
      if (params.isLooping) {
        console.log(
          `Generating a looping video using start frame as end frame: ${finalEndFrame.file.name}`,
        );
      } else {
        console.log(`Generating with end frame: ${finalEndFrame.file.name}`);
      }
    }
  } else if (params.mode === GenerationMode.REFERENCES_TO_VIDEO) {
    const referenceImagesPayload: VideoGenerationReferenceImage[] = [];

    if (params.referenceImages) {
      for (const img of params.referenceImages) {
        console.log(`Adding reference image: ${img.file.name}`);
        referenceImagesPayload.push({
          image: {
            imageBytes: img.base64,
            mimeType: img.file.type,
          },
          referenceType: VideoGenerationReferenceType.ASSET,
        });
      }
    }

    if (params.styleImage) {
      console.log(
        `Adding style image as a reference: ${params.styleImage.file.name}`,
      );
      referenceImagesPayload.push({
        image: {
          imageBytes: params.styleImage.base64,
          mimeType: params.styleImage.file.type,
        },
        referenceType: VideoGenerationReferenceType.STYLE,
      });
    }

    if (referenceImagesPayload.length > 0) {
      generateVideoPayload.config.referenceImages = referenceImagesPayload;
    }
  } else if (params.mode === GenerationMode.EXTEND_VIDEO) {
    if (params.inputVideoObject) {
      generateVideoPayload.video = params.inputVideoObject;
      console.log(`Generating extension from input video object.`);
    } else {
      throw new Error('An input video object is required to extend a video.');
    }
  }

  console.log('Submitting video generation request...', generateVideoPayload);
  let operation = await ai.models.generateVideos(generateVideoPayload);
  console.log('Video generation operation started:', operation);

  while (!operation.done) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    console.log('...Generating...');
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  if (operation?.response) {
    const videos = operation.response.generatedVideos;

    if (!videos || videos.length === 0) {
      throw new Error('No videos were generated.');
    }

    const firstVideo = videos[0];
    if (!firstVideo?.video?.uri) {
      throw new Error('Generated video is missing a URI.');
    }
    const videoObject = firstVideo.video;

    const url = decodeURIComponent(videoObject.uri);
    console.log('Fetching video from:', url);

    const res = await fetch(`${url}&key=${API_KEY}`);

    if (!res.ok) {
      throw new Error(`Failed to fetch video: ${res.status} ${res.statusText}`);
    }

    const videoBlob = await res.blob();
    const objectUrl = URL.createObjectURL(videoBlob);

    return {objectUrl, blob: videoBlob, uri: url, video: videoObject};
  } else {
    console.error('Operation failed:', operation);
    throw new Error('No videos generated.');
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  console.log('Starting image generation with prompt:', prompt);
  
  const API_KEY = process.env.API_KEY;

  if (!API_KEY) {
    throw new Error('API key is missing.');
  }

  const ai = new GoogleGenAI({apiKey: API_KEY});

  try {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    if (!response.generatedImages || response.generatedImages.length === 0) {
      // This case is a "silent" safety block. Throw the specific error
      // so the UI can show the desired rebellious message.
      throw new Error('IMAGE_GENERATION_SAFETY_BLOCK');
    }

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;

    if (!base64ImageBytes) {
        throw new Error('Generated image data is empty.');
    }
    
    console.log('Image generation successful.');
    return base64ImageBytes;

  } catch (error) {
    console.error('Image generation API call failed:', error);

    let detailedMessage = 'An unknown error occurred during image generation.';
    if (error instanceof Error) {
      detailedMessage = error.message;

      // If it's already our specific block error, re-throw it directly.
      if (detailedMessage === 'IMAGE_GENERATION_SAFETY_BLOCK') {
        throw error;
      }
      
      try {
        // The error message might be a JSON string from the API.
        const parsedError = JSON.parse(detailedMessage);
        if (parsedError?.error?.message) {
          detailedMessage = parsedError.error.message;
        }
      } catch (e) {
        // It wasn't a JSON string, so we'll proceed with the original message.
      }
    }

    // Per user request to remove restrictions, we'll provide a more neutral
    // message for safety-related blocks instead of showing Google's policy message.
    const safetyKeywords = [
      'sensitive words',
      'Responsible AI practices',
      'SAFETY',
    ];
    const isSafetyError = safetyKeywords.some((keyword) =>
      detailedMessage.includes(keyword),
    );

    if (isSafetyError) {
      // Throw a specific error identifier for safety blocks.
      throw new Error('IMAGE_GENERATION_SAFETY_BLOCK');
    }

    throw new Error(detailedMessage);
  }
};