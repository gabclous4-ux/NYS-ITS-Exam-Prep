import React from 'react';
import { HomeIcon, ArrowLeftIcon, HistoryIcon, BookmarkSquareIcon, CogIcon } from './Icons';

interface SidebarProps {
  currentView: string;
  onNav: (view: 'topics' | 'history' | 'saved-questions') => void;
  onBack: () => void;
  showBack: boolean;
  onChangeApiKey: () => void;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNav, onBack, showBack, onChangeApiKey, children }) => {
  const NavItem: React.FC<{
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    onClick: () => void;
    isActive: boolean;
  }> = ({ label, icon: Icon, onClick, isActive }) => (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-lg transition-colors duration-200 ${
        isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
      }`}
    >
      <Icon className="w-6 h-6 mr-4" />
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <aside className="w-80 bg-gray-800/50 p-6 flex-shrink-0 flex flex-col h-screen overflow-y-auto">
      <div className="flex items-center mb-8">
        {showBack ? (
          <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-700 transition-colors mr-3">
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg mr-4" />
        )}
        <h1 className="text-xl font-bold text-white tracking-tight">NYS IT Prep</h1>
      </div>
      
      <nav className="space-y-3">
        <NavItem label="All Topics" icon={HomeIcon} onClick={() => onNav('topics')} isActive={currentView === 'topics'} />
        <NavItem label="Quiz History" icon={HistoryIcon} onClick={() => onNav('history')} isActive={currentView === 'history'} />
        <NavItem label="Saved Questions" icon={BookmarkSquareIcon} onClick={() => onNav('saved-questions')} isActive={currentView === 'saved-questions'} />
      </nav>
      
      {children && <div className="mt-8 border-t border-gray-700 pt-6">{children}</div>}
      
      <div className="mt-auto pt-6 border-t border-gray-700 space-y-3">
          <NavItem label="Change API Key" icon={CogIcon} onClick={onChangeApiKey} isActive={false} />
      </div>
    </aside>
  );
};
