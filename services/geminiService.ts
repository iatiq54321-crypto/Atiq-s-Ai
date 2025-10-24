/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  GoogleGenAI,
} from '@google/genai';

// FIX: Remove apiKey parameter and use process.env.API_KEY as per guidelines.
export const generateImage = async (prompt: string): Promise<string> => {
  console.log('Starting image generation with prompt:', prompt);
  
  // FIX: Initialize with API key from environment variables.
  const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

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
