import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StudyTopicView } from './components/StudyTopicView';
import { QuizView } from './components/QuizView';
import { HistoryView } from './components/HistoryView';
import { SavedQuestionsView } from './components/SavedQuestionsView';
import { TopicCard } from './components/TopicCard';
import { TOPICS } from './constants';
import type { StudyTopic, ToastMessage } from './types';
import { ModeSwitcher } from './components/ModeSwitcher';
import { SearchBar } from './components/SearchBar';
import { FilterControl } from './components/FilterControl';
import { ToastContainer } from './components/ToastContainer';
import { ApiKeyModal } from './components/ApiKeyModal';
import { getApiKey, clearApiKey } from './services/apiKeyService';

type View = 'topics' | 'study' | 'quiz' | 'history' | 'saved-questions';

const BOOKMARKS_KEY = 'nysit-bookmarked-topics';

const useBookmarks = () => {
    const [bookmarkedTopics, setBookmarkedTopics] = useState<string[]>(() => {
        try {
            const storedBookmarks = localStorage.getItem(BOOKMARKS_KEY);
            return storedBookmarks ? JSON.parse(storedBookmarks) : [];
        } catch (e) {
            console.error("Failed to load bookmarks from localStorage", e);
            return [];
        }
    });

    const toggleBookmark = useCallback((topicId: string) => {
        setBookmarkedTopics(prev => {
            const newBookmarks = prev.includes(topicId)
                ? prev.filter(id => id !== topicId)
                : [...prev, topicId];
            
            try {
                localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
            } catch (e) {
                console.error("Failed to save bookmarks to localStorage", e);
            }
            return newBookmarks;
        });
    }, []);

    const isTopicBookmarked = useCallback((topicId: string) => {
        return bookmarkedTopics.includes(topicId);
    }, [bookmarkedTopics]);

    return { bookmarkedTopics, toggleBookmark, isTopicBookmarked };
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('topics');
  const [selectedTopic, setSelectedTopic] = useState<StudyTopic | null>(null);
  const [path, setPath] = useState<StudyTopic[]>([]);
  const [mode, setMode] = useState<'study' | 'quiz'>('study');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'bookmarked'>('all');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  
  const { bookmarkedTopics, toggleBookmark, isTopicBookmarked } = useBookmarks();

  useEffect(() => {
    setIsApiKeySet(!!getApiKey());
  }, []);

  const handleApiKeySaved = () => {
    setIsApiKeySet(true);
  };

  const handleChangeApiKey = () => {
    clearApiKey();
    setIsApiKeySet(false);
  };

  const handleSelectTopic = (topic: StudyTopic) => {
    if (topic.subTopics && topic.subTopics.length > 0) {
      setPath(prev => [...prev, topic]);
      setSearchQuery(''); // Clear search when navigating
    } else {
      setSelectedTopic(topic);
      setCurrentView(mode === 'study' ? 'study' : 'quiz');
    }
  };

  const handleBack = () => {
    if (selectedTopic) {
      setCurrentView('topics');
      setSelectedTopic(null);
    } else if (path.length > 0) {
      setPath(prev => prev.slice(0, -1));
    }
  };
  
  const handleNav = (view: View) => {
      setCurrentView(view);
      setSelectedTopic(null);
      setPath([]); // Reset path on main navigation
  }

  const handleModeChange = (newMode: 'study' | 'quiz') => {
    setMode(newMode);
    if (selectedTopic) {
      setCurrentView(newMode === 'study' ? 'study' : 'quiz');
    }
  };
  
  const addToast = (message: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message }]);
  };

  const dismissToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const currentTopicLevel = useMemo(() => {
    if (path.length === 0) return TOPICS;
    const lastTopic = path[path.length - 1];
    return lastTopic.subTopics || [];
  }, [path]);
  
  const filteredTopics = useMemo(() => currentTopicLevel.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          topic.iconName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterMode === 'all' || bookmarkedTopics.includes(topic.id);
      return matchesSearch && matchesFilter;
  }), [searchQuery, filterMode, bookmarkedTopics, currentTopicLevel]);

  const renderContent = () => {
    switch (currentView) {
      case 'study':
        return selectedTopic && <StudyTopicView topic={selectedTopic} />;
      case 'quiz':
        return selectedTopic && <QuizView topic={selectedTopic} addToast={addToast} />;
      case 'history':
          return <HistoryView addToast={addToast} />;
      case 'saved-questions':
          return <SavedQuestionsView addToast={addToast} />;
      case 'topics':
      default:
        const currentCategory = path.length > 0 ? path[path.length - 1] : null;
        return (
          <div className="animate-fade-in">
              {path.length > 0 && (
                <nav className="mb-4 text-sm text-gray-400 flex items-center flex-wrap">
                  <button onClick={() => setPath([])} className="hover:text-white transition-colors">All Topics</button>
                  {path.map((p, i) => (
                      <React.Fragment key={p.id}>
                          <span className="mx-2">/</span>
                          {i < path.length - 1 ? (
                              <button onClick={() => setPath(path.slice(0, i + 1))} className="hover:text-white transition-colors">{p.title}</button>
                          ) : (
                              <span className="text-white font-semibold">{p.title}</span>
                          )}
                      </React.Fragment>
                  ))}
                </nav>
              )}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">
                      {currentCategory ? currentCategory.title : 'NYS IT Specialist Prep'}
                    </h1>
                    <p className="text-gray-400 mt-1 max-w-2xl">
                      {currentCategory ? currentCategory.description : 'Select a topic to start studying or take a quiz.'}
                    </p>
                </div>
                <ModeSwitcher mode={mode} onModeChange={handleModeChange} />
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  onSelectTopic={() => handleSelectTopic(topic)}
                  mode={mode}
                  isBookmarked={isTopicBookmarked(topic.id)}
                  onToggleBookmark={toggleBookmark}
                />
              ))}
            </div>
            {filteredTopics.length === 0 && (
                <div className="text-center py-16 bg-gray-800/50 rounded-lg col-span-full">
                    <h3 className="text-xl font-semibold text-gray-300">No Topics Found</h3>
                    <p className="text-gray-400 mt-2">Try adjusting your search or filter.</p>
                </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {!isApiKeySet && <ApiKeyModal onKeySaved={handleApiKeySaved} />}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      <div className={`flex ${!isApiKeySet ? 'blur-sm pointer-events-none' : ''}`}>
        <Sidebar 
          currentView={currentView}
          onNav={handleNav}
          onBack={handleBack}
          showBack={!!selectedTopic || path.length > 0}
          onChangeApiKey={handleChangeApiKey}
        >
          {currentView === 'topics' && (
             <>
                <SearchBar query={searchQuery} onQueryChange={setSearchQuery} />
                <FilterControl filterMode={filterMode} onFilterChange={setFilterMode} />
            </>
          )}
        </Sidebar>

        <main className="flex-1 p-8 overflow-y-auto h-screen">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
