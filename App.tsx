/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import Chat from './components/Chat';
import LiveConversation from './components/LiveConversation';
import ImageGeneration from './components/ImageGeneration';

type Mode = 'live' | 'chat' | 'image';

const App: React.FC = () => {
  const [mode, setMode] = useState<Mode>('chat');

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
      case 'image':
        return <ImageGeneration />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      <header className="py-4 px-8 relative z-10 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="Atiq's AI App Logo" className="h-10 w-10 rounded-full" />
          <h1 className="text-2xl font-semibold tracking-wide bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Atiq's AI App
          </h1>
        </div>
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
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col p-4 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;