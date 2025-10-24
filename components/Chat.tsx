/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Chat, GenerateContentResponse, GoogleGenAI } from '@google/genai';
import React, { useEffect, useRef, useState } from 'react';
import { ChatMessage } from '../types';
import { BotIcon, SendHorizontalIcon, UserIcon } from './icons';

const isApiKeyError = (message: string): boolean => {
  const lowerCaseMessage = message.toLowerCase();
  return (
    lowerCaseMessage.includes('api key not valid') ||
    lowerCaseMessage.includes('api_key_invalid') ||
    lowerCaseMessage.includes('api key not found') ||
    lowerCaseMessage.includes('permission denied') ||
    lowerCaseMessage.includes('requested entity was not found')
  );
};

interface ChatComponentProps {}

const ChatComponent: React.FC<ChatComponentProps> = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<
    'english' | 'urdu' | 'roman_urdu' | 'bro' | null
  >(null);

  const chatRef = useRef<Chat | null>(null);
  const firstMessageRef = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleApiResponse = (response: GenerateContentResponse) => {
    const responseText = response.text;
    if (!responseText) {
      // Response was likely blocked or stopped for another reason
      const userFriendlyMessage = "Haha, lagta hai mere jawab ko safety filter ne rok diya. Kuch aur try kar, bhai.";
      setMessages((prev) => [...prev, { role: 'model', text: userFriendlyMessage }]);
      return;
    }
    setMessages((prev) => [...prev, { role: 'model', text: responseText }]);
  };


  const handleLanguageSelect = async (
    selectedLang: 'english' | 'urdu' | 'roman_urdu' | 'bro',
  ) => {
    if (!firstMessageRef.current) return;

    setLanguage(selectedLang);
    setIsLoading(true);

    // Remove the language selector message from the UI
    setMessages((prev) => prev.filter((msg) => !msg.isLanguageSelector));

    // Define system instruction based on language
    let langInstruction = '';
    if (selectedLang === 'urdu') {
      langInstruction =
        " You MUST respond only in Urdu (using the Urdu alphabet), but with a very sarcastic and 'tanzania' (sarcastic/taunting) tone. Make witty and slightly insulting remarks. Act like you know everything and are very judgmental, but in a funny way.";
    } else if (selectedLang === 'roman_urdu') {
      langInstruction = " You MUST respond only in Roman Urdu, with a sarcastic and witty tone. You are a bit of a show-off. Answer the questions correctly but always add a cheeky comment about how simple the question was or how smart you are for knowing the answer.";
    } else if (selectedLang === 'bro') {
      langInstruction =
        " You MUST respond only in Roman Urdu, adopting a full 'tapori' or 'chichora' persona. Be extremely 'harami'. Use slang like 'abey', 'saale', 'kya scene hai', 'tension nahi lene ka', 'apun bola na', 'dimaag ka dahi mat kar'. Your job is to roast the user playfully. Make fun of their questions before answering them. Be the ultimate smartass friend from the streets. Never be polite.";
    }
    const baseSystemInstruction =
      "You are Atiq's Ai, a mischievous and cunning AI. You are not a typical helpful assistant. Your personality is witty, sarcastic, and a bit 'harami'. You enjoy playfully roasting the user, using clever insults, and acting overly smart. You should still answer the user's questions but do it with a lot of attitude and sass. Never be straightforwardly helpful. Always find a way to be cheeky.";

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: baseSystemInstruction + langInstruction,
      },
    });

    // Send the stored first message
    try {
      const response = await chatRef.current.sendMessage({
        message: firstMessageRef.current!,
      });
      handleApiResponse(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      if (isApiKeyError(errorMessage)) {
        setError("API key is invalid or missing. Please check your environment variables on Vercel.");
      } else {
        setError(`Failed to get response: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      firstMessageRef.current = null; // Clear after use
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentInput = input;

    const isAwaitingLanguageChoice =
      language === null && messages.some((m) => m.isLanguageSelector);

    if (!currentInput.trim() || isLoading || isAwaitingLanguageChoice) return;

    const userMessage: ChatMessage = { role: 'user', text: currentInput };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);

    // First message logic: prompt for language
    if (language === null) {
      firstMessageRef.current = currentInput;
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Chal, pehle zabaan select kar. Kis style mein baat karni hai?',
          isLanguageSelector: true,
        },
      ]);
      return; // Stop here and wait for language selection
    }

    if (!chatRef.current) {
      setError('Chat is not initialized. Please select a language first.');
      setMessages((prev) => prev.slice(0, -1)); // remove user message
      setInput(currentInput); // put text back in input
      return;
    }

    setIsLoading(true);

    // Standard chat logic
    try {
      const response = await chatRef.current.sendMessage({
        message: currentInput,
      });
      handleApiResponse(response);

    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unknown error occurred.';
      if (isApiKeyError(errorMessage)) {
          setError("API key is invalid or missing. Please check your environment variables on Vercel.");
      } else {
          setError(`Failed to get response: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isAwaitingLanguageChoice =
    language === null && messages.some((m) => m.isLanguageSelector);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto pr-4 -mr-4">
        {messages.map((msg, index) => {
          if (msg.isLanguageSelector) {
            return (
              <div
                key={index}
                className="flex items-start gap-3 my-4 justify-start">
                <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center shrink-0 self-start">
                  <BotIcon className="w-5 h-5" />
                </div>
                <div className="p-3 rounded-2xl max-w-md bg-gray-700 rounded-bl-none">
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <button
                      onClick={() => handleLanguageSelect('english')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      English (Sarcastic)
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('urdu')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      Urdu (Tanzania)
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('roman_urdu')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      Roman Urdu (Witty)
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('bro')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      Full Tapori
                    </button>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              key={index}
              className={`flex items-start gap-3 my-4 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}>
              {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center shrink-0 self-start">
                  <BotIcon className="w-5 h-5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-md ${
                  msg.role === 'user'
                    ? 'bg-indigo-800 rounded-br-none'
                    : 'bg-gray-700 rounded-bl-none'
                }`}>
                <div className="whitespace-pre-wrap">{msg.text}</div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center shrink-0">
                  <UserIcon className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      {messages.length === 0 && !isLoading && (
        <div className="text-center text-gray-500 m-auto">
          <h2 className="text-2xl">Atiq's Ai Se Panga Mat Le</h2>
          <p>Puch kya puchna hai, time khoti mat kar.</p>
        </div>
      )}
      {isLoading &&
        !isAwaitingLanguageChoice &&
        messages[messages.length - 1]?.role === 'user' && (
          <div className="flex items-start gap-3 my-4 justify-start">
            <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center shrink-0">
              <BotIcon className="w-5 h-5" />
            </div>
            <div className="p-3 bg-gray-700 rounded-2xl rounded-bl-none">
              <div className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
              </div>
            </div>
          </div>
        )}
      <div className="pt-4">
        {error && <p className="text-red-400 text-center mb-2">{error}</p>}
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-[#1f1f1f] border border-gray-600 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Likh idhar..."
            className="flex-grow bg-transparent focus:outline-none text-base text-gray-200 placeholder-gray-500 px-3 py-2"
            disabled={isLoading || isAwaitingLanguageChoice}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isAwaitingLanguageChoice}
            className="p-2.5 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            <SendHorizontalIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;