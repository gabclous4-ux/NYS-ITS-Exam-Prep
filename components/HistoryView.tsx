import React, { useState, useEffect, useMemo } from 'react';
import type { QuizResult } from '../types';
import { TrashIcon, HistoryIcon } from './Icons';
import { TOPICS } from '../constants';
import { ImportExportControls } from './ImportExportControls';

const HISTORY_KEY = 'nysit-quiz-history';

export const HistoryView: React.FC<{ addToast: (message: string) => void; }> = ({ addToast }) => {
  const [history, setHistory] = useState<QuizResult[]>([]);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(HISTORY_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (e) {
      console.error("Failed to load history from localStorage", e);
    }
  }, []);

  const topicIconMap = useMemo(() => {
    return new Map(TOPICS.flatMap(topic => 
        topic.subTopics 
            ? [{ id: topic.id, icon: topic.icon }, ...topic.subTopics.map(sub => ({ id: sub.id, icon: sub.icon }))]
            : [{ id: topic.id, icon: topic.icon }]
    ).map(item => [item.id, item.icon]));
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to permanently delete your quiz history?")) {
      try {
        localStorage.removeItem(HISTORY_KEY);
        setHistory([]);
      } catch (e) {
        console.error("Failed to clear history from localStorage", e);
        alert("There was an error clearing your history.");
      }
    }
  };
  
  const handleImportHistory = (importedData: any) => {
    if (!Array.isArray(importedData)) {
        addToast("Error: Imported file is not a valid history format.");
        return;
    }

    const newHistory = importedData.filter(item => 
        typeof item === 'object' && item.id && item.topicId && typeof item.score === 'number'
    );

    if (newHistory.length === 0 && importedData.length > 0) {
        addToast("Warning: No valid quiz results found in the imported file.");
        return;
    }

    setHistory(prevHistory => {
        const combined = [...newHistory, ...prevHistory];
        const uniqueHistoryMap = new Map<string, QuizResult>();
        combined.forEach(item => {
            if (!uniqueHistoryMap.has(item.id)) {
                uniqueHistoryMap.set(item.id, item);
            }
        });

        const updatedHistory = Array.from(uniqueHistoryMap.values())
                                    .sort((a, b) => b.timestamp - a.timestamp)
                                    .slice(0, 100); // Allow more after import, capped at 100

        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
            addToast(`Successfully imported ${newHistory.length} quiz results.`);
        } catch (e) {
            console.error("Failed to save imported history", e);
            addToast("Error: Could not save the imported history.");
        }
        
        return updatedHistory;
    });
  };


  const getDifficultyClass = (difficulty: string) => {
    switch(difficulty) {
        case 'easy': return 'bg-green-500/20 text-green-400';
        case 'medium': return 'bg-yellow-500/20 text-yellow-400';
        case 'hard': return 'bg-red-500/20 text-red-400';
        default: return 'bg-gray-500/20 text-gray-400';
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Quiz History</h2>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            <ImportExportControls 
              dataToExport={history}
              exportFileName="quiz_history.json"
              onImport={handleImportHistory}
              importLabel="Import quiz history"
              addToast={addToast}
            />
            <button 
              onClick={handleClearHistory}
              className="flex items-center px-4 py-2 bg-red-800/50 text-red-300 text-sm font-semibold rounded-lg shadow-md hover:bg-red-800/80 transition-colors duration-300"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Clear History
            </button>
          </div>
        )}
      </div>
      
      {history.length > 0 ? (
        <div className="space-y-4">
          {history.map(result => {
            const Icon = topicIconMap.get(result.topicId);
            const scorePercentage = (result.score / result.totalQuestions) * 100;
            return (
              <div key={result.id} className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-4">
                {Icon && <Icon className="w-8 h-8 text-purple-400 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="font-bold text-white">{result.topicTitle}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(result.timestamp).toLocaleString()}
                  </p>
                </div>
                <div className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${getDifficultyClass(result.difficulty)}`}>
                  {result.difficulty}
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-white">{result.score} / {result.totalQuestions}</p>
                  <p className="text-sm font-bold" style={{ color: scorePercentage > 75 ? '#4ade80' : scorePercentage > 50 ? '#facc15' : '#f87171'}}>
                    {scorePercentage.toFixed(0)}%
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg">
          <HistoryIcon className="w-12 h-12 mx-auto text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-300 mt-4">No History Yet</h3>
          <p className="text-gray-400 mt-2">Your completed quiz results will appear here. You can also import a history file.</p>
          <div className="mt-6 flex justify-center">
             <ImportExportControls 
                dataToExport={[]}
                exportFileName="quiz_history.json"
                onImport={handleImportHistory}
                importLabel="Import quiz history"
                addToast={addToast}
              />
           </div>
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
`;
document.head.append(style);