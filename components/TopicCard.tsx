import React from 'react';
import type { StudyTopic } from '../types';
import { BookmarkIcon, BookmarkSolidIcon } from './Icons';

interface TopicCardProps {
  topic: StudyTopic;
  onSelectTopic: () => void;
  mode: 'study' | 'quiz';
  isBookmarked: boolean;
  onToggleBookmark: (topicId: string) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onSelectTopic, mode, isBookmarked, onToggleBookmark }) => {
  const isQuizMode = mode === 'quiz';

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onSelectTopic from firing
    onToggleBookmark(topic.id);
  };

  return (
    <div
      onClick={onSelectTopic}
      className={`relative bg-gray-800 rounded-xl p-6 cursor-pointer border transition-all duration-300 transform hover:-translate-y-1 group ${
        isQuizMode
          ? 'border-transparent hover:border-purple-500 hover:bg-gray-700/50'
          : 'border-transparent hover:border-blue-500 hover:bg-gray-700/50'
      }`}
    >
       <button
        onClick={handleBookmarkClick}
        aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        className="absolute top-3 right-3 z-10 p-2 rounded-full text-gray-500 hover:bg-gray-900/50 transition-all duration-200 active:scale-125"
      >
        {isBookmarked ? (
          <BookmarkSolidIcon className="w-6 h-6 text-yellow-400" />
        ) : (
          <BookmarkIcon className="w-6 h-6 group-hover:text-yellow-300" />
        )}
      </button>

      {topic.icon && (
        <topic.icon
          className={`w-10 h-10 mb-4 transition-colors duration-300 ${
            isQuizMode ? 'text-purple-400' : 'text-blue-400'
          }`}
        />
      )}
      
      <h3 className="text-lg font-bold text-white mb-2">{topic.title}</h3>
      <p className="text-gray-400 text-sm">{topic.description}</p>
    </div>
  );
};