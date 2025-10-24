/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import Chat from './components/Chat';

const App: React.FC = () => {
  return (
    <div className="h-screen bg-black text-gray-200 flex flex-col font-sans overflow-hidden">
      <header className="py-4 px-8 relative z-10 flex justify-between items-center border-b border-gray-800">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            Atiq's Ai
          </h1>
        </div>
      </header>
      <main className="w-full max-w-4xl mx-auto flex-grow flex flex-col p-4 overflow-y-auto">
        <Chat />
      </main>
    </div>
  );
};

export default App;