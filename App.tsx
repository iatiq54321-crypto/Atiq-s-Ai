/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import Chat from './components/Chat';
import ImageGeneration from './components/ImageGeneration';
import LiveConversation from './components/LiveConversation';
import { MessageCircleIcon, ImageIcon, MicIcon } from './components/icons';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');

  const renderContent = () => {
    switch (activeTab) {
      case 'image':
        return <ImageGeneration />;
      case 'live':
        return <LiveConversation />;
      case 'chat':
      default:
        return <Chat />;
    }
  };

  const TabButton: React.FC<{
    tabName: string;
    icon: React.ReactNode;
    children: React.ReactNode;
  }> = ({ tabName, icon, children }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabName
          ? 'bg-indigo-600 text-white'
          : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      {children}
    </button>
  );

  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      <header className="py-3 px-6 relative z-10 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Atiq's Ai
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <TabButton tabName="chat" icon={<MessageCircleIcon className="w-4 h-4" />}>
            Chat
          </TabButton>
          <TabButton tabName="image" icon={<ImageIcon className="w-4 h-4" />}>
            Image
          </TabButton>
          <TabButton tabName="live" icon={<MicIcon className="w-4 h-4" />}>
            Live
          </TabButton>
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col p-4 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;