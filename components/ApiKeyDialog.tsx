/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { KeyIcon } from './icons';

interface ApiKeyDialogProps {
  onContinue: () => void;
}

const ApiKeyDialog: React.FC<ApiKeyDialogProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-xl max-w-lg w-full p-8 text-center flex flex-col items-center">
        <div className="bg-indigo-600/20 p-4 rounded-full mb-6">
          <KeyIcon className="w-12 h-12 text-indigo-400" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">API Key Setup</h2>
        <p className="text-gray-300 mb-6">
          To use premium features like image generation, you need an API key from a Google Cloud project with billing enabled.
        </p>
        
        <div className="text-left bg-gray-900/50 p-4 rounded-lg border border-gray-700 w-full mb-8">
            <h3 className="font-semibold text-lg text-white mb-2">Steps to follow:</h3>
            <ol className="list-decimal list-inside text-gray-400 space-y-2">
                <li>
                    Go to the Google Cloud Console and create a new project (or select an existing one).
                </li>
                <li>
                    Enable billing for your project. You can find instructions in the{' '}
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
                    Once billing is set up, return here and click the button below to create or select your API key.
                </li>
            </ol>
        </div>

        <button
          onClick={onContinue}
          className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-lg"
        >
          Select API Key
        </button>
      </div>
    </div>
  );
};

export default ApiKeyDialog;