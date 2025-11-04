import React from 'react';

interface ModeSwitcherProps {
  mode: 'study' | 'quiz';
  onModeChange: (mode: 'study' | 'quiz') => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ mode, onModeChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-full mt-4 sm:mt-0">
      <button
        onClick={() => onModeChange('study')}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
          mode === 'study' ? 'bg-blue-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        Study
      </button>
      <button
        onClick={() => onModeChange('quiz')}
        className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-colors duration-300 ${
          mode === 'quiz' ? 'bg-purple-600 text-white shadow' : 'text-gray-300 hover:bg-gray-700'
        }`}
      >
        Quiz
      </button>
    </div>
  );
};
