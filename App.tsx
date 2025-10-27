
import React, { useState, useEffect, useCallback } from 'react';
import { generateVideo } from './services/geminiService';
import { urlToBase64 } from './utils/imageUtils';
import { INITIAL_IMAGE_URL, LOADING_MESSAGES } from './constants';
import LoadingSpinner from './components/LoadingSpinner';

// FIX: The anonymous type for `aistudio` conflicted with another global declaration.
// By defining and using a named `AIStudio` interface, we resolve the "Subsequent property declarations must have the same type" error.
interface AIStudio {
  hasSelectedApiKey: () => Promise<boolean>;
  openSelectKey: () => Promise<void>;
}

// Define a custom window interface to include aistudio property
declare global {
  interface Window {
    aistudio?: AIStudio;
  }
}

const App: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    if (window.aistudio) {
      const hasKey = await window.aistudio.hasSelectedApiKey();
      setApiKeySelected(hasKey);
    } else {
      // Fallback for environments where aistudio is not available
      console.warn("aistudio is not available. Assuming API key is set via environment variables.");
      setApiKeySelected(true); 
    }
  }, []);

  useEffect(() => {
    checkApiKey();
    urlToBase64(INITIAL_IMAGE_URL)
      .then(setImageBase64)
      .catch(err => {
        console.error("Failed to load initial image:", err);
        setError("Could not load the initial panda image. Please refresh the page.");
      });
  }, [checkApiKey]);

  const handleSelectApiKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Optimistically set to true after the dialog is closed.
        setApiKeySelected(true);
      } catch (e) {
        console.error("Error opening API key selection:", e);
        setError("Failed to open the API key selection dialog.");
      }
    }
  };

  const handleGenerateVideo = async () => {
    if (!imageBase64 || !apiKeySelected) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const generatedVideoUrl = await generateVideo(
        imageBase64,
        "Animate this image. Make the panda wave its hand gently and blink its eyes. The grass and leaves in the background should sway subtly in a gentle breeze. The clouds should drift slowly across the sky."
      );
      setVideoUrl(generatedVideoUrl);
    } catch (e: any) {
      console.error(e);
      let errorMessage = "An unknown error occurred. Please check the console for details.";
      if (e instanceof Error) {
        errorMessage = e.message;
        if (e.message.includes("Requested entity was not found")) {
          errorMessage = "Your API key seems to be invalid. Please select a valid key and try again.";
          setApiKeySelected(false);
        }
      }
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonDisabled = isGenerating || !imageBase64 || !apiKeySelected;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-2xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
            Panda Video Animator
          </h1>
          <p className="text-gray-400 mt-2">Bring a static image to life with the power of Gemini.</p>
        </header>

        <main className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8">
          <div className="aspect-w-1 aspect-h-1 mb-6 relative w-full overflow-hidden rounded-lg border-2 border-gray-700">
            {isGenerating ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm">
                 <LoadingSpinner messages={LOADING_MESSAGES} />
              </div>
            ) : videoUrl ? (
              <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
            ) : (
              <img src={INITIAL_IMAGE_URL} alt="Cute panda by a railway" className="w-full h-full object-contain" />
            )}
          </div>
          
          {error && <p className="text-red-400 text-center mb-4">{error}</p>}

          <div className="flex flex-col items-center space-y-4">
             {!apiKeySelected && window.aistudio && (
                <div className="w-full text-center bg-yellow-900/50 border border-yellow-700 p-4 rounded-lg">
                    <p className="mb-3">To generate videos, you need to select a Google AI Studio API key.</p>
                    <button
                        onClick={handleSelectApiKey}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-full transition-transform transform hover:scale-105"
                    >
                        Select API Key
                    </button>
                    <p className="text-xs text-gray-400 mt-3">
                        For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">billing documentation</a>.
                    </p>
                </div>
            )}
            
            <button
              onClick={handleGenerateVideo}
              disabled={buttonDisabled}
              className={`w-full max-w-xs font-bold py-3 px-6 rounded-full transition-all duration-300 ease-in-out text-lg flex items-center justify-center
                ${buttonDisabled
                  ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                  : 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 transform hover:scale-105'
                }`}
            >
              {isGenerating ? 'Animating...' : (videoUrl ? 'Animate Again' : 'Animate Image')}
            </button>

            {videoUrl && !isGenerating && (
              <a
                href={videoUrl}
                download="animated-panda.mp4"
                className="inline-block text-green-400 hover:text-green-300 underline mt-2"
              >
                Download Video
              </a>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
