import React from 'react';
import { BookmarkIcon } from './Icons';

interface FilterControlProps {
  filterMode: 'all' | 'bookmarked';
  onFilterChange: (mode: 'all' | 'bookmarked') => void;
}

export const FilterControl: React.FC<FilterControlProps> = ({ filterMode, onFilterChange }) => {
  return (
    <div className="flex bg-gray-900/50 p-1 rounded-lg mb-4">
      <button
        onClick={() => onFilterChange('all')}
        className={`flex-1 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
          filterMode === 'all' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'
        }`}
      >
        All
      </button>
      <button
        onClick={() => onFilterChange('bookmarked')}
        className={`flex-1 flex items-center justify-center space-x-1.5 text-center text-sm font-semibold py-1.5 rounded-md transition-colors duration-200 ${
          filterMode === 'bookmarked' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50'
        }`}
      >
        <BookmarkIcon className="w-4 h-4" />
        <span>Bookmarked</span>
      </button>
    </div>
  );
};
