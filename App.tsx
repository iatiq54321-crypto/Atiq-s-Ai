/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import LiveConversation from './components/LiveConversation';
import { KeyIcon } from './components/icons';

type Mode = 'chat' | 'live';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('chat');
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);

  useEffect(() => {
    // Check if the API key is missing.
    // If it's undefined or an empty string, show the overlay.
    // FIX: Use process.env.API_KEY instead of import.meta.env.VITE_API_KEY.
    if (!process.env.API_KEY) {
      console.error('API_KEY environment variable not set.');
      setIsApiKeyMissing(true);
    }
  }, []);

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
        return <LiveConversation />;
      case 'chat':
        return <Chat />;
      default:
        return null;
    }
  };

  const ApiKeyErrorOverlay: React.FC = () => (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4 text-center">
      <div className="bg-gray-800 border border-red-500/50 rounded-2xl shadow-xl max-w-lg w-full p-8 flex flex-col items-center">
        <div className="bg-red-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">API Key Not Found</h2>
        <p className="text-gray-300 mb-6">
          The application cannot connect to the Gemini API because the API key is missing.
        </p>
        <div className="text-left bg-gray-900/50 p-4 rounded-lg border border-gray-700 w-full">
          <h3 className="font-semibold text-lg text-white mb-2">How to Fix:</h3>
          <p className="text-gray-400 text-sm mb-2">
            {/* FIX: Use API_KEY instead of VITE_API_KEY. */}
            You must set the <code>API_KEY</code> environment variable in your deployment service (e.g., Vercel).
          </p>
          <ol className="list-decimal list-inside text-gray-400 space-y-1 text-sm">
              <li>Go to your project's settings on your hosting platform.</li>
              <li>Find the "Environment Variables" section.</li>
              {/* FIX: Use API_KEY instead of VITE_API_KEY. */}
              <li>Create a new variable with the name <code>API_KEY</code>.</li>
              <li>Paste your Google AI API key as the value.</li>
              <li>Redeploy your application to apply the change.</li>
          </ol>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      {isApiKeyMissing && <ApiKeyErrorOverlay />}
      <header className={`py-4 px-8 relative z-10 flex justify-between items-center border-b border-gray-800 ${isApiKeyMissing ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Atiq's Ai
          </h1>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-900 rounded-lg">
          <ModeButton current={mode} target="chat" onClick={setMode}>
            Chat
          </ModeButton>
          <ModeButton current={mode} target="live" onClick={setMode}>
            Live Conversation
          </ModeButton>
        </div>
      </header>
      <main className={`w-full max-w-4xl mx-auto flex-grow flex flex-col p-4 overflow-y-auto ${isApiKeyMissing ? 'blur-sm pointer-events-none' : ''}`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;