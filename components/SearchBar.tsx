import React from 'react';
import { SearchIcon } from './Icons';

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ query, onQueryChange }) => {
  return (
    <div className="relative mb-4">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3">
        <SearchIcon className="text-gray-500" />
      </span>
      <input
        type="text"
        placeholder="Filter topics..."
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full bg-gray-900 text-gray-200 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        aria-label="Filter topics"
      />
    </div>
  );
};