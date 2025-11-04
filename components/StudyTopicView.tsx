import React, { useState, useCallback, useEffect } from 'react';
import { generateStudyGuide } from '../services/geminiService';
import type { StudyTopic, Source, StudyGuideCache } from '../types';
import { SpinnerIcon, ErrorIcon, RestartIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

interface StudyTopicViewProps {
  topic: StudyTopic;
}

export const StudyTopicView: React.FC<StudyTopicViewProps> = ({ topic }) => {
  const [studyNotes, setStudyNotes] = useState<string>('');
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isCached, setIsCached] = useState<boolean>(false);

  const cacheKey = `studyGuideCache_${topic.id}`;

  const handleGenerate = useCallback(async (forceRegenerate = false) => {
    setIsLoading(true);
    setError('');
    
    if (!forceRegenerate) {
        setStudyNotes('');
        setSources([]);
    }

    try {
      const notesResponse = await generateStudyGuide(topic);
      setStudyNotes(notesResponse.content);
      setSources(notesResponse.sources);

      // Save to cache
      const cacheEntry: StudyGuideCache = {
        ...notesResponse,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
      setIsCached(true);

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, cacheKey]);

  useEffect(() => {
    // Check for cached data on component mount
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const parsedData: StudyGuideCache = JSON.parse(cachedData);
        setStudyNotes(parsedData.content);
        setSources(parsedData.sources);
        setIsCached(true);
      } else {
        setIsCached(false);
        setStudyNotes('');
        setSources([]);
      }
    } catch (e) {
      console.error("Failed to read from cache", e);
      setIsCached(false);
    }
    
    // Reset state when topic changes
    setError('');
    setIsLoading(false);

  }, [topic.id, cacheKey]);

  return (
    <div className="bg-gray-800/50 rounded-lg p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{topic.title}</h2>
          <p className="text-gray-400 mb-6">{topic.description}</p>
        </div>
         {isCached && !isLoading && (
           <button
             onClick={() => handleGenerate(true)}
             className="flex items-center justify-center px-4 py-2 mb-4 sm:mb-0 sm:ml-4 bg-gray-600 text-white text-sm font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
             disabled={isLoading}
           >
             <RestartIcon className="mr-2 h-4 w-4" />
             Regenerate
           </button>
         )}
      </div>

      {!studyNotes && !isLoading && (
        <button
          onClick={() => handleGenerate()}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-800 disabled:cursor-not-allowed"
        >
          Generate Study Guide
        </button>
      )}

      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg mt-6">
            <SpinnerIcon className="h-10 w-10 text-blue-400"/>
            <p className="mt-4 text-lg font-semibold text-gray-300">Generating your study guide...</p>
            <p className="text-gray-400">This may take a moment.</p>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex items-center space-x-3">
          <ErrorIcon />
          <div>
            <h4 className="font-bold">Generation Failed</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      {studyNotes && (
        <div className="mt-6">
          <MarkdownRenderer content={studyNotes} />
          {sources.length > 0 && (
            <div className="mt-10 pt-6 border-t border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">Sources</h3>
              <ul className="space-y-3 list-disc pl-5">
                {sources.map((source, index) => (
                  <li key={index} className="text-blue-400 hover:text-blue-300 transition-colors">
                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="underline">
                      {source.title || new URL(source.uri).hostname}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }
  .mermaid-container {
    background-color: #1a202c; 
    border-radius: 0.5rem;
    padding: 1rem;
    margin: 1.5rem 0;
    display: flex;
    justify-content: center;
    overflow-x: auto;
  }
  .mermaid svg {
    max-width: 100%;
    height: auto;
  }
`;
document.head.append(style);