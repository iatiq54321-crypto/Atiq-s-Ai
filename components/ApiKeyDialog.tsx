/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: (apiKey: string) => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onContinue(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 flex flex-col items-center">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">API Key Setup</h2>
        <p className="text-gray-300 mb-6 text-center">
          To use this app, please enter your Google AI API key below. You can get a key from a Google Cloud project with billing enabled.
        </p>
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-8">
            <input
                type="password"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Paste your API Key here"
                className="w-full bg-[#1f1f1f] border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="API Key Input"
            />

            <div className="text-left bg-gray-900/50 p-4 rounded-lg border border-gray-700 w-full">
                <h3 className="font-semibold text-lg text-white mb-2">How to get a key:</h3>
                <ol className="list-decimal list-inside text-gray-400 space-y-1 text-sm">
                    <li>
                        Go to the Google Cloud Console and create or select a project.
                    </li>
                    <li>
                        Enable billing for your project. More info in the{' '}
                        <a
                            href="https://ai.google.dev/gemini-api/docs/billing"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-indigo-400 hover:underline font-medium"
                        >
                            billing documentation
                        </a>.
                    </li>
                    <li>
                        Create an API key and paste it above.
                    </li>
                </ol>
            </div>

            <button
              type="submit"
              disabled={!key.trim()}
              className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Save and Continue
            </button>
        </form>
      </div>
    </div>
  );
};

export default ApiKeyDialog;