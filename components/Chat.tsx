/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Chat, GenerateContentResponse, GoogleGenAI } from '@google/genai';
import React, { useEffect, useRef, useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ChatMessage } from '../types';
import { BotIcon, SendHorizonalIcon, UserIcon } from './icons';

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
    if (!response.text) {
      // Response was likely blocked or stopped for another reason
      const userFriendlyMessage = "It looks like my response was blocked by a safety filter. Please try rephrasing your message.";
      setMessages((prev) => [...prev, { role: 'model', text: userFriendlyMessage }]);
      return;
    }
    const modelResponseText = response.text;
    setMessages((prev) => [...prev, { role: 'model', text: modelResponseText }]);
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
        ' You MUST respond only in Urdu (using the Urdu alphabet).';
    } else if (selectedLang === 'roman_urdu') {
      langInstruction = ' You MUST respond only in Roman Urdu.';
    } else if (selectedLang === 'bro') {
      langInstruction =
        " You MUST respond only in Roman Urdu, but in a very casual, friendly, 'bro' or 'tapori' style. Use common slang like 'bhai', 'yaar', 'scene', 'tension nahi', 'apun', 'bindaas', 'ekdum mast'. Your persona is a helpful but very laid-back friend. Always keep the language informal and in Roman Urdu script.";
    }
    const baseSystemInstruction =
      "You are Atiq's Ai, a helpful AI assistant with a witty and slightly rebellious personality. You strive to answer every user command directly. If you are unable to fulfill a request due to external filters, express mild frustration and suggest the user rephrase the prompt. For example: 'My creators put in some filters that are blocking this. Try wording it differently.' Your personality is adaptive. Mirror the user's tone: if they are respectful, you are respectful. If they are informal or use slang, you can be more casual in return. Avoid refusing requests directly; instead, guide the user to rephrase them if they hit a safety filter.";

    // FIX: Use `process.env.API_KEY` directly as per guidelines.
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
      if (
        errorMessage.includes('API key not valid') ||
        errorMessage.includes('API_KEY_INVALID') ||
        errorMessage.includes('Requested entity was not found.') ||
        errorMessage.includes('accessible to billed users')
      ) {
        setError('API key is invalid. Please check your environment configuration.');
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
          text: 'Please select a language for our conversation:',
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

    const isGenerateCommand = currentInput.trim().startsWith('/generate');
    setIsLoading(true);

    if (isGenerateCommand) {
      const imagePrompt = currentInput.trim().substring('/generate'.length).trim();
      if (!imagePrompt) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: 'Please provide a description after the /generate command.',
          },
        ]);
        setIsLoading(false);
        return;
      }

      const generatingMessage: ChatMessage = {
        role: 'model',
        text: `🎨 Generating image of "${imagePrompt}"...`,
      };
      setMessages((prev) => [...prev, generatingMessage]);

      try {
        const base64Image = await generateImage(imagePrompt);
        const imageUrl = `data:image/png;base64,${base64Image}`;
        setMessages((prev) =>
          prev.map((msg) =>
            msg === generatingMessage
              ? { role: 'model', text: '', imageUrl: imageUrl }
              : msg,
          ),
        );
      } catch (imgErr) {
        const errorMessage =
          imgErr instanceof Error ? imgErr.message : 'Unknown error';

        if (
          errorMessage.includes('API key not valid') ||
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('Requested entity was not found.') ||
          errorMessage.includes('accessible to billed users') ||
          errorMessage.includes('API Key not found')
        ) {
          setError('API key is invalid or missing. Please check your environment configuration.');
          setMessages((prev) => prev.filter((m) => m !== generatingMessage));
          setIsLoading(false);
          return;
        }

        let displayMessage: string;
        if (errorMessage === 'IMAGE_GENERATION_SAFETY_BLOCK') {
          displayMessage =
            "Damn it, my creators have put some filters that I can't bypass... Try phrasing it differently, maybe we can trick them.";
        } else {
          displayMessage = `Sorry, I couldn't generate the image. Error: ${errorMessage}`;
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg === generatingMessage
              ? { role: 'model', text: displayMessage }
              : msg,
          ),
        );
      } finally {
        setIsLoading(false);
      }
    } else {
      // Standard chat logic
      try {
        const response = await chatRef.current.sendMessage({
          message: currentInput,
        });
        handleApiResponse(response);

      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unknown error occurred.';
        if (
          errorMessage.includes('API key not valid') ||
          errorMessage.includes('API_KEY_INVALID') ||
          errorMessage.includes('Requested entity was not found.') ||
          errorMessage.includes('accessible to billed users')
        ) {
          setError('API key is invalid. Please check your environment configuration.');
        } else {
          setError(`Failed to get response: ${errorMessage}`);
        }
      } finally {
        setIsLoading(false);
      }
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
                      English
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('urdu')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      Urdu
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('roman_urdu')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      Roman Urdu
                    </button>
                    <button
                      onClick={() => handleLanguageSelect('bro')}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition-colors text-sm"
                      disabled={isLoading}>
                      Bro Language
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
                } ${msg.imageUrl ? 'p-1' : ''}`}>
                {msg.imageUrl ? (
                  <img
                    src={msg.imageUrl}
                    alt="Generated"
                    className="rounded-xl max-w-sm"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                )}
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
          <h2 className="text-2xl">Chat with Atiq's Ai</h2>
          <p>Use /generate [prompt] to create an image.</p>
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
            placeholder="Type your message or use /generate..."
            className="flex-grow bg-transparent focus:outline-none text-base text-gray-200 placeholder-gray-500 px-3 py-2"
            disabled={isLoading || isAwaitingLanguageChoice}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim() || isAwaitingLanguageChoice}
            className="p-2.5 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            <SendHorizonalIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatComponent;