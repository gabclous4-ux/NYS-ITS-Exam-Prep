import React, { useState } from 'react';
import { saveApiKey } from '../services/apiKeyService';
import { CogIcon } from './Icons';

interface ApiKeyModalProps {
  onKeySaved: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onKeySaved }) => {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (apiKey.trim().length < 10) { 
      setError('Please enter a valid API key.');
      return;
    }
    setError('');
    saveApiKey(apiKey.trim());
    onKeySaved();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all animate-fade-in">
        <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mr-4">
                <CogIcon className="w-7 h-7 text-purple-400"/>
            </div>
            <div>
                <h2 className="text-2xl font-bold text-white">Enter Your API Key</h2>
                <p className="text-gray-400">A Google Gemini API key is required to use this app.</p>
            </div>
        </div>
        
        <p className="text-gray-300 mb-4 text-sm">
          Your API key is stored securely in your browser's local storage and is never shared. You can generate a free key from Google AI Studio.
        </p>

        <input
          type="password"
          value={apiKey}
          onChange={(e) => {
            setApiKey(e.target.value);
            if(error) setError('');
          }}
          placeholder="Enter your Gemini API key here"
          className={`w-full bg-gray-900 text-gray-200 border rounded-lg py-3 px-4 focus:outline-none focus:ring-2 transition-colors ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-600 focus:ring-purple-500 focus:border-transparent'}`}
          aria-label="Gemini API Key"
        />
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        
        <div className="flex justify-between items-center mt-6">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:text-blue-300 underline">
                Get an API Key
            </a>
            <button
                onClick={handleSave}
                className="px-6 py-2.5 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
                disabled={!apiKey.trim()}
            >
                Save and Continue
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
