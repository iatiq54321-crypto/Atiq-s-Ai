/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import LiveConversation from './components/LiveConversation';
import ApiKeyDialog from './components/ApiKeyDialog';
import ImageGeneration from './components/ImageGeneration';

type Mode = 'live' | 'chat' | 'image';

// A simple loading spinner component
const FullscreenSpinner: React.FC = () => (
  <div className="h-screen bg-black flex flex-col items-center justify-center text-white">
    <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
    <p className="mt-4 text-gray-400">Initializing...</p>
  </div>
);

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('image');
  const [apiKeySelected, setApiKeySelected] = useState<boolean | null>(null);

  useEffect(() => {
    const checkApiKey = async () => {
      try {
        if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setApiKeySelected(hasKey);
        } else {
          console.warn('window.aistudio.hasSelectedApiKey not found.');
          setApiKeySelected(false);
        }
      } catch (error) {
        console.error("Error checking for API key:", error);
        setApiKeySelected(false); // Assume no key on error
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    try {
      if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
        await window.aistudio.openSelectKey();
        // Per docs, assume success to handle race condition and update UI immediately.
        setApiKeySelected(true);
      }
    } catch (error) {
      console.error("Error opening API key selection:", error);
    }
  };

  const handleApiKeyError = () => {
    // This is called from child components when an API call fails due to an invalid key.
    setApiKeySelected(false);
  };

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
      case 'live':
        return <LiveConversation onApiKeyError={handleApiKeyError} />;
      case 'chat':
        return <Chat onApiKeyError={handleApiKeyError} />;
      case 'image':
        return <ImageGeneration onApiKeyError={handleApiKeyError} />;
      default:
        return null;
    }
  };

  if (apiKeySelected === null) {
    return <FullscreenSpinner />;
  }

  if (!apiKeySelected) {
    return <ApiKeyDialog onContinue={handleSelectApiKey} />;
  }

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      <header className="py-4 px-8 relative z-10 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Atiq's Ai
          </h1>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg">
          <ModeButton current={mode} target="image" onClick={setMode}>
            Image
          </ModeButton>
          <ModeButton current={mode} target="chat" onClick={setMode}>
            Chat
          </ModeButton>
          <ModeButton current={mode} target="live" onClick={setMode}>
            Live Conversation
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