import React, { useState, useEffect, useMemo } from 'react';
import type { SavedQuestion } from '../types';
import { TrashIcon, BookmarkSquareIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';
import { TOPICS } from '../constants';
import { ImportExportControls } from './ImportExportControls';

const SAVED_QUESTIONS_KEY = 'nysit-saved-questions';

export const SavedQuestionsView: React.FC<{ addToast: (message: string) => void; }> = ({ addToast }) => {
  const [savedQuestions, setSavedQuestions] = useState<SavedQuestion[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_QUESTIONS_KEY);
      if (stored) {
        setSavedQuestions(Object.values(JSON.parse(stored)));
      }
    } catch (e) {
      console.error("Failed to load saved questions from localStorage", e);
    }
  }, []);

  const topicIconMap = useMemo(() => {
    return new Map(TOPICS.flatMap(topic => 
        topic.subTopics 
            ? [{ id: topic.id, icon: topic.icon }, ...topic.subTopics.map(sub => ({ id: sub.id, icon: sub.icon }))]
            : [{ id: topic.id, icon: topic.icon }]
    ).map(item => [item.id, item.icon]));
  }, []);

  const handleRemoveQuestion = (questionId: string) => {
    try {
        const stored = localStorage.getItem(SAVED_QUESTIONS_KEY);
        if (stored) {
            const questionsObj = JSON.parse(stored);
            delete questionsObj[questionId];
            localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(questionsObj));
            setSavedQuestions(Object.values(questionsObj));
            addToast("Question removed.");
        }
    } catch (e) {
        console.error("Failed to remove question", e);
    }
  };

  const handleClearAll = () => {
      if (window.confirm("Are you sure you want to remove all saved questions? This cannot be undone.")) {
          try {
              localStorage.removeItem(SAVED_QUESTIONS_KEY);
              setSavedQuestions([]);
              addToast("All saved questions have been removed.");
          } catch(e) {
              console.error("Failed to clear saved questions", e);
          }
      }
  };

  const handleImportQuestions = (importedData: any) => {
    if (!Array.isArray(importedData)) {
        addToast("Error: Imported file is not a valid saved questions format.");
        return;
    }

    const newQuestions = importedData.filter(item => 
        typeof item === 'object' && item.id && item.question && Array.isArray(item.options)
    );

    if (newQuestions.length === 0 && importedData.length > 0) {
        addToast("Warning: No valid questions found in the imported file.");
        return;
    }
    
    try {
        const stored = localStorage.getItem(SAVED_QUESTIONS_KEY);
        const questionsObj: Record<string, SavedQuestion> = stored ? JSON.parse(stored) : {};

        let importedCount = 0;
        newQuestions.forEach(q => {
            if (!questionsObj[q.id]) {
                questionsObj[q.id] = q;
                importedCount++;
            }
        });
        
        localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(questionsObj));
        setSavedQuestions(Object.values(questionsObj));
        addToast(`Successfully imported ${importedCount} new questions.`);
    } catch (e) {
        console.error("Failed to save imported questions", e);
        addToast("Error: Could not save the imported questions.");
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Saved Questions</h2>
        {savedQuestions.length > 0 && (
          <div className="flex items-center gap-2">
            <ImportExportControls 
              dataToExport={savedQuestions}
              exportFileName="saved_questions.json"
              onImport={handleImportQuestions}
              importLabel="Import saved questions"
              addToast={addToast}
            />
            <button 
              onClick={handleClearAll}
              className="flex items-center px-4 py-2 bg-red-800/50 text-red-300 text-sm font-semibold rounded-lg shadow-md hover:bg-red-800/80 transition-colors duration-300"
            >
              <TrashIcon className="mr-2 h-4 w-4" />
              Clear All
            </button>
          </div>
        )}
      </div>
      
      {savedQuestions.length > 0 ? (
        <div className="space-y-6">
          {savedQuestions.map(q => {
             const Icon = topicIconMap.get(q.topicId);
             return (
                <div key={q.id} className="bg-gray-800/50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                            {Icon && <Icon className="w-6 h-6 text-purple-400 mr-3 flex-shrink-0" />}
                            <p className="font-semibold text-gray-300">{q.topicTitle}</p>
                        </div>
                        <button
                            onClick={() => handleRemoveQuestion(q.id)}
                            className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                            aria-label="Remove question"
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <MarkdownRenderer content={q.question} />
                    </div>

                    <div className="space-y-2">
                        {q.options.map((option, index) => (
                             <div 
                                key={index}
                                className={`p-3 rounded-md text-sm ${index === q.correctAnswerIndex ? 'bg-green-500/20 text-green-300' : 'bg-gray-700/50 text-gray-400'}`}
                             >
                                 <strong>{String.fromCharCode(65 + index)}.</strong> {option}
                             </div>
                        ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                        <h4 className="font-bold text-white mb-1">Explanation</h4>
                        <p className="text-gray-300 text-sm">{q.explanation}</p>
                    </div>

                </div>
             )
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-800/50 rounded-lg">
          <BookmarkSquareIcon className="w-12 h-12 mx-auto text-gray-500" />
          <h3 className="text-xl font-semibold text-gray-300 mt-4">No Saved Questions</h3>
          <p className="text-gray-400 mt-2">You can save questions during a quiz to review them here later. You can also import questions.</p>
          <div className="mt-6 flex justify-center">
             <ImportExportControls 
                dataToExport={[]}
                exportFileName="saved_questions.json"
                onImport={handleImportQuestions}
                importLabel="Import saved questions"
                addToast={addToast}
              />
           </div>
        </div>
      )}
    </div>
  );
};