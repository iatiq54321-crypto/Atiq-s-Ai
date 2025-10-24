/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { generateImage } from '../services/geminiService';
import { ArrowPathIcon, FramesModeIcon, PlusIcon, SparklesIcon } from './icons';

enum ImageGenState {
  IDLE,
  LOADING,
  SUCCESS,
  ERROR,
}

type Language = 'english' | 'urdu' | 'roman_urdu';

const uiStrings: Record<Language, Record<string, string>> = {
  english: {
    title: "Describe the image you want to create",
    subtitle: "Let your imagination run wild.",
    loadingTitle: "Conjuring your image...",
    loadingSubtitle: "The AI is painting with pixels, please wait.",
    successTitle: "Image Generated!",
    regenerate: "Regenerate",
    newImage: "New Image",
    errorTitle: "Error",
    tryAgain: "Try Again",
    placeholder: "A futuristic city on Mars, photorealistic...",
    safetyError: "The request was blocked by the creators' filters. Try rephrasing your prompt to get around them."
  },
  urdu: {
    title: "وہ تصویر بیان کریں جو آپ بنانا چاہتے ہیں۔",
    subtitle: "اپنے تخیل کو آزاد چھوڑ دیں۔",
    loadingTitle: "آپ کی تصویر تیار کی جا رہی ہے...",
    loadingSubtitle: "AI پکسلز سے پینٹنگ کر رہا ہے، براہ کرم انتظار کریں۔",
    successTitle: "تصویر بن گئی!",
    regenerate: "دوبارہ بنائیں",
    newImage: "نئی تصویر",
    errorTitle: "خرابی",
    tryAgain: "دوبارہ کوشش کریں",
    placeholder: "مریخ پر ایک مستقبل کا شہر، حقیقت پسندانہ...",
    safetyError: "اس درخواست کو بنانے والوں کے فلٹرز نے بلاک کر دیا ہے۔ ان سے بچنے کے لیے اپنی درخواست کو دوسرے الفاظ میں بیان کرنے کی کوشش کریں۔"
  },
  roman_urdu: {
    title: "Woh tasveer bayan karein jo aap banana chahte hain.",
    subtitle: "Apne takhayyul ko azaad chhor dein.",
    loadingTitle: "Aap ki tasveer tayyar ki ja rahi hai...",
    loadingSubtitle: "AI pixels se painting kar raha hai, barah karam intezar karein.",
    successTitle: "Tasveer ban gayi!",
    regenerate: "Dobara banayein",
    newImage: "Nayi tasveer",
    errorTitle: "Kharabi",
    tryAgain: "Dobara koshish karein",
    placeholder: "Mars par ek mustaqbil ka shehar, haqeeqat pasandana...",
    safetyError: "Is request ko creators ke filters ne block kar diya hai. Unse bachne ke liye apni prompt ko doosre alfaaz mein likhne ki koshish karein."
  }
};

interface ImageGenerationProps {
  onApiKeyError: () => void;
  apiKey: string;
}

const ImageGeneration: React.FC<ImageGenerationProps> = ({ onApiKeyError, apiKey }) => {
  const [prompt, setPrompt] = useState('');
  const [state, setState] = useState<ImageGenState>(ImageGenState.IDLE);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('english');
  
  const T = uiStrings[language];

  const handleGenerate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setState(ImageGenState.LOADING);
    setError(null);
    setImageUrl(null);

    try {
      const base64Image = await generateImage(prompt, apiKey);
      setImageUrl(`data:image/png;base64,${base64Image}`);
      setState(ImageGenState.SUCCESS);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      if (
        errorMessage.includes('API key not valid') ||
        errorMessage.includes('API_KEY_INVALID') ||
        errorMessage.includes('Requested entity was not found.') ||
        errorMessage.includes('accessible to billed users')
      ) {
        onApiKeyError();
        return;
      }
      if (errorMessage === 'IMAGE_GENERATION_SAFETY_BLOCK') {
        setError(T.safetyError);
      } else {
        setError(`Image generation failed: ${errorMessage}`);
      }
      setState(ImageGenState.ERROR);
    }
  };

  const handleNewImage = () => {
    setPrompt('');
    setImageUrl(null);
    setError(null);
    setState(ImageGenState.IDLE);
  };
  
  const handleRetry = () => {
      handleGenerate();
  };
  
  const LanguageButton: React.FC<{lang: Language, children: React.ReactNode}> = ({ lang, children }) => (
    <button
      onClick={() => setLanguage(lang)}
      className={`px-3 py-1 text-sm rounded-md transition-colors ${
        language === lang
          ? 'bg-indigo-600 text-white'
          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
      }`}
    >
      {children}
    </button>
  );

  const renderContent = () => {
    switch (state) {
      case ImageGenState.LOADING:
        return (
          <div className="flex flex-col items-center justify-center p-12 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div>
            <h2 className="text-2xl font-semibold mt-8 text-gray-200">{T.loadingTitle}</h2>
            <p className="mt-2 text-gray-400 text-center">{T.loadingSubtitle}</p>
          </div>
        );
      case ImageGenState.SUCCESS:
        return (
          <div className="w-full flex flex-col items-center gap-8 p-8 bg-gray-800/50 rounded-lg border border-gray-700 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-200">{T.successTitle}</h2>
            <div className="w-full max-w-lg aspect-square rounded-lg overflow-hidden bg-black shadow-lg">
                <img src={imageUrl!} alt={prompt} className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors">
                <ArrowPathIcon className="w-5 h-5" />
                {T.regenerate}
              </button>
              <button
                onClick={handleNewImage}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
                <PlusIcon className="w-5 h-5" />
                {T.newImage}
              </button>
            </div>
          </div>
        );
      case ImageGenState.ERROR:
        return (
          <div className="text-center bg-red-900/20 border border-red-500 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-red-400 mb-4">{T.errorTitle}</h2>
            <p className="text-red-300">{error}</p>
            <button
              onClick={handleRetry}
              className="mt-6 px-6 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
              {T.tryAgain}
            </button>
          </div>
        );
      case ImageGenState.IDLE:
      default:
        return (
            <div className="flex-grow flex items-center justify-center">
                <div className="relative text-center">
                    <h2 className="text-3xl text-gray-400">{T.title}</h2>
                    <p className="text-gray-500 mt-2">{T.subtitle}</p>
                </div>
            </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex items-center justify-center">
        {renderContent()}
      </div>
      <div className="pt-4">
        <div className="flex justify-center items-center gap-2 mb-3">
          <LanguageButton lang="english">English</LanguageButton>
          <LanguageButton lang="urdu">Urdu</LanguageButton>
          <LanguageButton lang="roman_urdu">Roman Urdu</LanguageButton>
        </div>
        <form
          onSubmit={handleGenerate}
          className="flex items-center gap-2 bg-[#1f1f1f] border border-gray-600 rounded-2xl p-2 shadow-lg focus-within:ring-2 focus-within:ring-indigo-500">
           <div className="pl-3 pr-1 text-gray-400">
             <FramesModeIcon className="w-5 h-5" />
           </div>
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={T.placeholder}
            className="flex-grow bg-transparent focus:outline-none text-base text-gray-200 placeholder-gray-500 py-2"
            disabled={state === ImageGenState.LOADING}
          />
          <button
            type="submit"
            disabled={state === ImageGenState.LOADING || !prompt.trim()}
            className="p-2.5 bg-indigo-600 rounded-full hover:bg-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed">
            <SparklesIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ImageGeneration;