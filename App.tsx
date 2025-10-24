/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {Video} from '@google/genai';
import React, {useCallback, useEffect, useState} from 'react';
// FIX: Added import for ApiKeyDialog
import ApiKeyDialog from './components/ApiKeyDialog';
import Chat from './components/Chat';
import {CurvedArrowDownIcon} from './components/icons';
import LiveConversation from './components/LiveConversation';
import LoadingIndicator from './components/LoadingIndicator';
import PromptForm from './components/PromptForm';
import VideoResult from './components/VideoResult';
import {generateVideo} from './services/geminiService';
import {
  AppState,
  GenerateVideoParams,
  GenerationMode,
  Resolution,
  VideoFile,
} from './types';
import ImageGeneration from './components/ImageGeneration';

type Mode = 'veo' | 'live' | 'chat' | 'image';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastConfig, setLastConfig] = useState<GenerateVideoParams | null>(
    null,
  );
  const [lastVideoObject, setLastVideoObject] = useState<Video | null>(null);
  const [lastVideoBlob, setLastVideoBlob] = useState<Blob | null>(null);
  const [mode, setMode] = useState<Mode>('chat');

  // A single state to hold the initial values for the prompt form
  const [initialFormValues, setInitialFormValues] =
    useState<GenerateVideoParams | null>(null);

  // FIX: Added states for Veo API key management as per guidelines.
  const [hasVeoApiKey, setHasVeoApiKey] = useState(false);
  const [isCheckingVeoApiKey, setIsCheckingVeoApiKey] = useState(true);

  // FIX: Added effect to check for Veo API key when switching to Veo mode.
  useEffect(() => {
    if (mode === 'veo') {
      const checkApiKey = async () => {
        setIsCheckingVeoApiKey(true);
        try {
          // Assuming window.aistudio is available.
          const hasKey = await (window as any).aistudio.hasSelectedApiKey();
          setHasVeoApiKey(hasKey);
        } catch (e) {
          console.error('Error checking for API key:', e);
          setHasVeoApiKey(false); // Assume no key on error
        } finally {
          setIsCheckingVeoApiKey(false);
        }
      };
      checkApiKey();
    }
  }, [mode]);

  const showStatusError = (message: string) => {
    setErrorMessage(message);
    setAppState(AppState.ERROR);
  };

  // FIX: Added handler to open the API key selection dialog.
  const handleSelectKey = async () => {
    try {
      await (window as any).aistudio.openSelectKey();
      // Assume key selection was successful to avoid race conditions.
      setHasVeoApiKey(true);
    } catch (e) {
      console.error('Could not open API key selection:', e);
      showStatusError('Could not open the API key selection dialog.');
    }
  };

  const handleGenerate = useCallback(async (params: GenerateVideoParams) => {
    setAppState(AppState.LOADING);
    setErrorMessage(null);
    setLastConfig(params);
    // Reset initial form values for the next fresh start
    setInitialFormValues(null);

    try {
      const {objectUrl, blob, video} = await generateVideo(params);
      setVideoUrl(objectUrl);
      setLastVideoBlob(blob);
      setLastVideoObject(video);
      setAppState(AppState.SUCCESS);
    } catch (error) {
      console.error('Video generation failed:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';

      // FIX: Handle API key not found error for Veo, prompting user to select again.
      if (
        typeof errorMessage === 'string' &&
        errorMessage.includes('Requested entity was not found.')
      ) {
        setHasVeoApiKey(false);
        setAppState(AppState.IDLE);
        return;
      }

      let userFriendlyMessage = `Video generation failed: ${errorMessage}`;

      if (typeof errorMessage === 'string') {
        // FIX: Updated user-facing error message for invalid keys.
        if (
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('API key not valid')
        ) {
          userFriendlyMessage =
            'Your API key is invalid. Please try selecting another key.';
        }
      }

      setErrorMessage(userFriendlyMessage);
      setAppState(AppState.ERROR);
    }
  }, []);

  const handleRetry = useCallback(() => {
    if (lastConfig) {
      handleGenerate(lastConfig);
    }
  }, [lastConfig, handleGenerate]);

  const handleNewVideo = useCallback(() => {
    setAppState(AppState.IDLE);
    setVideoUrl(null);
    setErrorMessage(null);
    setLastConfig(null);
    setLastVideoObject(null);
    setLastVideoBlob(null);
    setInitialFormValues(null); // Clear the form state
  }, []);

  const handleTryAgainFromError = useCallback(() => {
    if (lastConfig) {
      setInitialFormValues(lastConfig);
      setAppState(AppState.IDLE);
      setErrorMessage(null);
    } else {
      // Fallback to a fresh start if there's no last config
      handleNewVideo();
    }
  }, [lastConfig, handleNewVideo]);

  const handleExtend = useCallback(async () => {
    if (lastConfig && lastVideoBlob && lastVideoObject) {
      try {
        const file = new File([lastVideoBlob], 'last_video.mp4', {
          type: lastVideoBlob.type,
        });
        const videoFile: VideoFile = {file, base64: ''};

        setInitialFormValues({
          ...lastConfig, // Carry over model, aspect ratio
          mode: GenerationMode.EXTEND_VIDEO,
          prompt: '', // Start with a blank prompt
          inputVideo: videoFile, // for preview in the form
          inputVideoObject: lastVideoObject, // for the API call
          resolution: Resolution.P720, // Extend requires 720p
          // Reset other media types
          startFrame: null,
          endFrame: null,
          referenceImages: [],
          styleImage: null,
          isLooping: false,
        });

        setAppState(AppState.IDLE);
        setVideoUrl(null);
        setErrorMessage(null);
      } catch (error) {
        // FIX: Added braces to the catch block to fix syntax error.
        console.error('Failed to process video for extension:', error);
        const message =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        showStatusError(`Failed to prepare video for extension: ${message}`);
      }
    }
  }, [lastConfig, lastVideoBlob, lastVideoObject]);

  const renderError = (message: string) => (
    <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
      <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
      <p className="text-red-300">{message}</p>
      <button
        onClick={handleTryAgainFromError}
        className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
        Try Again
      </button>
    </div>
  );

  const ModeButton: React.FC<{
    current: Mode;
    target: Mode;
    onClick: (mode: Mode) => void;
    children: React.ReactNode;
  }> = ({current, target, onClick, children}) => (
    <button
      onClick={() => onClick(target)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
        current === target
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
      }`}>
      {children}
    </button>
  );

  const renderContent = () => {
    switch (mode) {
      case 'veo':
        // FIX: Added loading and API key dialog rendering for Veo mode.
        if (isCheckingVeoApiKey) {
          return (
            <div className="flex-grow flex items-center justify-center">
              <LoadingIndicator />
            </div>
          );
        }
        if (!hasVeoApiKey) {
          return (
            <div className="flex-grow flex items-center justify-center">
              <ApiKeyDialog onContinue={handleSelectKey} />
            </div>
          );
        }
        return (
          <>
            {appState === AppState.IDLE ? (
              <>
                <div className="flex-grow flex items-center justify-center">
                  <div className="relative text-center">
                    <h2 className="text-3xl text-gray-600">
                      Type in the prompt box to start
                    </h2>
                    <CurvedArrowDownIcon className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-24 h-24 text-gray-700 opacity-60" />
                  </div>
                </div>
                <div className="pb-4">
                  <PromptForm
                    onGenerate={handleGenerate}
                    initialValues={initialFormValues}
                  />
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center">
                {appState === AppState.LOADING && <LoadingIndicator />}
                {appState === AppState.SUCCESS && videoUrl && (
                  <VideoResult
                    videoUrl={videoUrl}
                    onRetry={handleRetry}
                    onNewVideo={handleNewVideo}
                    onExtend={handleExtend}
                    canExtend={lastConfig?.resolution === Resolution.P720}
                  />
                )}
                {appState === AppState.SUCCESS &&
                  !videoUrl &&
                  renderError(
                    'Video generated, but URL is missing. Please try again.',
                  )}
                {appState === AppState.ERROR &&
                  errorMessage &&
                  renderError(errorMessage)}
              </div>
            )}
          </>
        );
      case 'live':
        return <LiveConversation />;
      case 'chat':
        return <Chat />;
      case 'image':
        return <ImageGeneration />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      <header className="py-4 px-8 relative z-10 flex justify-between items-center border-b border-gray-800">
        <h1 className="text-3xl font-semibold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Atiq's Ai
        </h1>
        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg">
          <ModeButton current={mode} target="chat" onClick={setMode}>
            Chat
          </ModeButton>
          <ModeButton current={mode} target="live" onClick={setMode}>
            Live Conversation
          </ModeButton>
          <ModeButton current={mode} target="image" onClick={setMode}>
            Image Generation
          </ModeButton>
          <ModeButton current={mode} target="veo" onClick={setMode}>
            Veo Studio
          </ModeButton>
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col p-4 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;