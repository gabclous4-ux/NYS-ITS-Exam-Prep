import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateQuiz } from '../services/geminiService';
import type { StudyTopic, QuizQuestion, Difficulty, AnswerState, QuizResult, SavedQuestion } from '../types';
import { SpinnerIcon, ErrorIcon, RestartIcon, CheckCircleIcon, XCircleIcon, BookmarkIcon, BookmarkSolidIcon, ClockIcon } from './Icons';
import { MarkdownRenderer } from './MarkdownRenderer';

const HISTORY_KEY = 'nysit-quiz-history';
const SAVED_QUESTIONS_KEY = 'nysit-saved-questions';

const useSavedQuestions = () => {
    const [savedQuestions, setSavedQuestions] = useState<Record<string, SavedQuestion>>(() => {
        try {
            const stored = localStorage.getItem(SAVED_QUESTIONS_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error("Failed to load saved questions", e);
            return {};
        }
    });

    const saveQuestion = useCallback((question: SavedQuestion) => {
        setSavedQuestions(prev => {
            const newSaved = { ...prev, [question.id]: question };
            localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(newSaved));
            return newSaved;
        });
    }, []);

    const unsaveQuestion = useCallback((questionId: string) => {
        setSavedQuestions(prev => {
            const newSaved = { ...prev };
            delete newSaved[questionId];
            localStorage.setItem(SAVED_QUESTIONS_KEY, JSON.stringify(newSaved));
            return newSaved;
        });
    }, []);

    const isQuestionSaved = useCallback((questionId: string) => {
        return !!savedQuestions[questionId];
    }, [savedQuestions]);

    return { savedQuestions, saveQuestion, unsaveQuestion, isQuestionSaved };
};

const TimerDisplay: React.FC<{ timeLeft: number; duration: number }> = ({ timeLeft, duration }) => {
    const percentage = duration > 0 ? (timeLeft / duration) * 100 : 0;
    const circumference = 2 * Math.PI * 20; // radius is 20
    const offset = circumference - (percentage / 100) * circumference;

    let color = 'stroke-green-400';
    if (percentage < 50) color = 'stroke-yellow-400';
    if (percentage < 25) color = 'stroke-red-500';

    return (
        <div className="relative w-16 h-16">
            <svg className="w-full h-full" viewBox="0 0 50 50">
                <circle className="text-gray-600" strokeWidth="5" stroke="currentColor" fill="transparent" r="20" cx="25" cy="25" />
                <circle
                    className={`transition-stroke-dashoffset duration-1000 linear ${color}`}
                    strokeWidth="5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="20"
                    cx="25"
                    cy="25"
                    transform="rotate(-90 25 25)"
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">
                {timeLeft}
            </div>
        </div>
    );
};


export const QuizView: React.FC<{ topic: StudyTopic; addToast: (message: string) => void; }> = ({ topic, addToast }) => {
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  
  const [selectedTimer, setSelectedTimer] = useState<number>(0); // 0 for no timer
  const [timerDuration, setTimerDuration] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const { saveQuestion, unsaveQuestion, isQuestionSaved } = useSavedQuestions();

  const handleTimeUp = useCallback(() => {
      setAnswers(prevAnswers => {
          // Prevent state update if already answered
          if (prevAnswers[currentQuestionIndex]?.selectedOption !== null) {
              return prevAnswers;
          }
          const newAnswers = [...prevAnswers];
          newAnswers[currentQuestionIndex] = { isCorrect: false, selectedOption: -1 }; // -1 indicates timeout
          return newAnswers;
      });
  }, [currentQuestionIndex]);

  useEffect(() => {
    // Clear any existing timer
    if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
    }

    // Conditions to not start a timer
    if (isFinished || !timerDuration || answers[currentQuestionIndex]?.selectedOption !== null) {
        return;
    }

    // Start a new timer
    setTimeLeft(timerDuration);

    timerIntervalRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
            if (prev === null) {
                clearInterval(timerIntervalRef.current!);
                return null;
            }
            if (prev <= 1) {
                clearInterval(timerIntervalRef.current!);
                handleTimeUp();
                return 0;
            }
            return prev - 1;
        });
    }, 1000);

    // Cleanup function
    return () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };
}, [currentQuestionIndex, timerDuration, isFinished, answers, handleTimeUp]);

  const handleStartQuiz = useCallback(async (selectedDifficulty: Difficulty, timer: number) => {
    setDifficulty(selectedDifficulty);
    setTimerDuration(timer > 0 ? timer : null);
    setIsLoading(true);
    setError('');
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setIsFinished(false);

    try {
      const quizQuestions = await generateQuiz(topic, selectedDifficulty);
      if (quizQuestions.length === 0) {
        throw new Error("The AI model returned no questions. Please try again.");
      }
      setQuestions(quizQuestions);
      setAnswers(new Array(quizQuestions.length).fill({ isCorrect: null, selectedOption: null }));
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while generating the quiz.');
    } finally {
      setIsLoading(false);
    }
  }, [topic]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (answers[currentQuestionIndex]?.selectedOption !== null) return; // Already answered

    const isCorrect = questions[currentQuestionIndex].correctAnswerIndex === optionIndex;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { isCorrect, selectedOption: optionIndex };
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };
  
  const handleToggleSaveQuestion = () => {
      const question = questions[currentQuestionIndex];
      const questionId = `${topic.id}-${currentQuestionIndex}-${question.question.slice(0, 20)}`; // simple unique ID
      if (isQuestionSaved(questionId)) {
          unsaveQuestion(questionId);
          addToast("Question removed from saved items.");
      } else {
          saveQuestion({ ...question, id: questionId, topicId: topic.id, topicTitle: topic.title });
          addToast("Question saved!");
      }
  };

  const score = useMemo(() => answers.filter(a => a.isCorrect).length, [answers]);

  const finishQuiz = () => {
    setIsFinished(true);
    // Save to history
    try {
        const storedHistory = localStorage.getItem(HISTORY_KEY);
        const history: QuizResult[] = storedHistory ? JSON.parse(storedHistory) : [];
        const newResult: QuizResult = {
            id: new Date().toISOString(),
            topicId: topic.id,
            topicTitle: topic.title,
            difficulty: difficulty!,
            score: score,
            totalQuestions: questions.length,
            timestamp: Date.now()
        };
        history.unshift(newResult);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 50))); // Keep last 50
    } catch (e) {
        console.error("Failed to save quiz history", e);
    }
  };

  if (!difficulty) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 animate-fade-in text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Quiz: {topic.title}</h2>
        <p className="text-gray-400 mb-8">Choose your difficulty level to begin.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
            {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                    key={d}
                    onClick={() => handleStartQuiz(d, selectedTimer)}
                    className={`px-8 py-4 text-lg font-bold rounded-lg transition-all transform hover:-translate-y-1 duration-300 shadow-lg capitalize disabled:opacity-50 ${
                        d === 'easy' ? 'bg-green-600 hover:bg-green-700' :
                        d === 'medium' ? 'bg-yellow-500 hover:bg-yellow-600' :
                        'bg-red-600 hover:bg-red-600'
                    }`}
                    disabled={isLoading}
                >
                    {d}
                </button>
            ))}
        </div>
        <div className="mt-10 max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-300 mb-4">Timer per Question (Optional)</h3>
            <div className="flex justify-center gap-3 bg-gray-900/50 p-2 rounded-full">
                {[0, 30, 60, 90].map(time => (
                    <button
                        key={time}
                        onClick={() => setSelectedTimer(time)}
                        className={`w-full px-4 py-2 rounded-full font-semibold transition-colors text-sm ${
                            selectedTimer === time
                                ? 'bg-purple-600 text-white shadow-md'
                                : 'text-gray-300 hover:bg-gray-700/50'
                        }`}
                    >
                        {time === 0 ? 'None' : `${time}s`}
                    </button>
                ))}
            </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800 rounded-lg mt-6">
        <SpinnerIcon className="h-10 w-10 text-purple-400" />
        <p className="mt-4 text-lg font-semibold text-gray-300">Generating your quiz...</p>
        <p className="text-gray-400">This may take a moment.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg flex flex-col items-center space-y-4">
        <ErrorIcon className="w-8 h-8"/>
        <h4 className="font-bold">Quiz Generation Failed</h4>
        <p className="text-center">{error}</p>
        <button
            onClick={() => setDifficulty(null)}
            className="flex items-center justify-center px-4 py-2 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700"
        >
            <RestartIcon className="mr-2 h-4 w-4"/>
            Try Again
        </button>
      </div>
    );
  }
  
  if (isFinished) {
    const scorePercentage = (score / questions.length) * 100;
    const scoreColor = scorePercentage >= 80 ? '#4ade80' : scorePercentage >= 50 ? '#facc15' : '#f87171';
    return (
         <div className="bg-gray-800/50 rounded-lg p-8 animate-fade-in text-center flex flex-col items-center">
            <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
            <p className="text-lg text-gray-400 mb-6">You scored {score} out of {questions.length}.</p>
            <div className="w-48 h-48 rounded-full flex items-center justify-center text-4xl font-bold"
                 style={{ 
                    background: `conic-gradient(${scoreColor} ${scorePercentage}%, #374151 0)`
                 }}
            >
                <div className="w-40 h-40 bg-gray-800 rounded-full flex items-center justify-center" style={{ color: scoreColor }}>
                    <span>{scorePercentage.toFixed(0)}%</span>
                </div>
            </div>
            <button
                onClick={() => setDifficulty(null)}
                className="mt-8 flex items-center justify-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700"
            >
                Take Another Quiz
            </button>
        </div>
    );
  }

  if (questions.length > 0) {
    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestionIndex];
    const questionId = `${topic.id}-${currentQuestionIndex}-${currentQuestion.question.slice(0, 20)}`;
    const isSaved = isQuestionSaved(questionId);

    return (
      <div className="bg-gray-800/50 rounded-lg p-6 sm:p-8 animate-fade-in">
        <div className="flex justify-between items-start mb-6">
            <div>
                <p className="text-sm font-semibold text-purple-400">Question {currentQuestionIndex + 1} of {questions.length}</p>
                <div className="mt-4">
                    <MarkdownRenderer content={currentQuestion.question} />
                </div>
            </div>
             <div className="flex flex-col items-end flex-shrink-0 ml-4 space-y-4">
                 <button 
                    onClick={handleToggleSaveQuestion}
                    aria-label={isSaved ? "Unsave question" : "Save question"}
                    className="p-2 rounded-full text-gray-400 hover:bg-gray-700 transition-colors"
                >
                    {isSaved ? <BookmarkSolidIcon className="w-6 h-6 text-yellow-400"/> : <BookmarkIcon className="w-6 h-6"/>}
                </button>
                {timerDuration && timeLeft !== null && (
                    <TimerDisplay timeLeft={timeLeft} duration={timerDuration} />
                )}
             </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isSelected = currentAnswer?.selectedOption === index;
            const isCorrect = currentQuestion.correctAnswerIndex === index;
            let buttonClass = 'bg-gray-700 hover:bg-gray-600';
            if (currentAnswer?.selectedOption !== null) { // Answered
                if (isCorrect) buttonClass = 'bg-green-700 border-green-500';
                else if (isSelected && !isCorrect) buttonClass = 'bg-red-700 border-red-500';
                else buttonClass = 'bg-gray-700 opacity-60';
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={currentAnswer?.selectedOption !== null}
                className={`text-left p-4 rounded-lg border-2 border-transparent transition-all duration-300 w-full disabled:cursor-not-allowed ${buttonClass}`}
              >
                <span className="font-semibold text-white">{option}</span>
              </button>
            );
          })}
        </div>
        
        {currentAnswer?.selectedOption !== null && (
            <div className="mt-6 p-4 rounded-lg bg-gray-900/70 animate-fade-in">
                <div className="flex items-center mb-2">
                    {currentAnswer.selectedOption === -1 ? (
                       <>
                         <ClockIcon className="text-yellow-400 mr-2 w-6 h-6" />
                         <h4 className="font-bold text-lg text-yellow-300">Time's Up!</h4>
                       </>
                    ) : currentAnswer.isCorrect ? (
                       <>
                         <CheckCircleIcon className="text-green-400 mr-2 w-6 h-6" />
                         <h4 className="font-bold text-lg text-green-300">Correct!</h4>
                       </>
                    ) : (
                       <>
                         <XCircleIcon className="text-red-400 mr-2 w-6 h-6" />
                         <h4 className="font-bold text-lg text-red-300">Incorrect</h4>
                       </>
                    )}
                </div>
                <p className="text-gray-300">{currentQuestion.explanation}</p>
                 <button
                    onClick={handleNextQuestion}
                    className="mt-4 px-6 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700"
                >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                </button>
            </div>
        )}
      </div>
    );
  }

  return null;
};
const style = document.createElement('style');
style.textContent = `
  .transition-stroke-dashoffset {
    transition: stroke-dashoffset 1s linear;
  }
`;
document.head.append(style);
