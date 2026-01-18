'use client';

import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle,
  Search,
  X,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Compass,
  Keyboard,
  ExternalLink,
  Play,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button, IconButton } from '@/app/components/UI/Button';
import { useTour } from '@/lib/tutorial';

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: 'getting-started' | 'features' | 'tips' | 'shortcuts';
  keywords?: string[];
  relatedTourId?: string;
}

export interface HelpPanelProps {
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel should close */
  onClose: () => void;
  /** Custom help articles to display */
  articles?: HelpArticle[];
  /** Additional class names */
  className?: string;
}

// Default help articles
const defaultArticles: HelpArticle[] = [
  {
    id: 'getting-started',
    title: 'Getting Started with StudioStory',
    content: 'StudioStory helps you manage your creative writing projects. Start by creating a new project, then add characters, factions, and scenes to bring your story to life.',
    category: 'getting-started',
    keywords: ['start', 'begin', 'new', 'project', 'create'],
    relatedTourId: 'onboarding',
  },
  {
    id: 'creating-project',
    title: 'Creating Your First Project',
    content: 'Click the "Create New Project" card on the landing page. You\'ll be guided through setting up your story\'s basic information including title, genre, and description.',
    category: 'getting-started',
    keywords: ['project', 'create', 'new', 'setup'],
  },
  {
    id: 'characters',
    title: 'Managing Characters',
    content: 'Characters are the heart of your story. Create detailed character profiles with personality traits, backgrounds, and relationships. Use the character panel to organize protagonists, antagonists, and supporting cast.',
    category: 'features',
    keywords: ['character', 'protagonist', 'antagonist', 'cast', 'profile'],
  },
  {
    id: 'scenes-beats',
    title: 'Organizing Scenes and Beats',
    content: 'Structure your narrative using acts, scenes, and beats. Each beat represents a moment in your story, while scenes group related beats together. Use the visual timeline to see your story\'s flow.',
    category: 'features',
    keywords: ['scene', 'beat', 'act', 'structure', 'timeline', 'narrative'],
  },
  {
    id: 'factions',
    title: 'Building Factions',
    content: 'Create groups and organizations that shape your world. Factions can represent kingdoms, companies, secret societies, or any collective entity with shared goals and conflicts.',
    category: 'features',
    keywords: ['faction', 'group', 'organization', 'world', 'building'],
  },
  {
    id: 'keyboard-shortcuts',
    title: 'Keyboard Shortcuts',
    content: 'Speed up your workflow with keyboard shortcuts:\n• Ctrl/Cmd + N: New item\n• Ctrl/Cmd + S: Save\n• Escape: Close modal/panel\n• Arrow keys: Navigate tour steps',
    category: 'shortcuts',
    keywords: ['keyboard', 'shortcut', 'hotkey', 'quick'],
  },
  {
    id: 'ai-assistance',
    title: 'Using AI Assistance',
    content: 'StudioStory includes AI-powered features to help generate character ideas, scene descriptions, and dialogue. Look for the sparkle icon to access AI suggestions.',
    category: 'tips',
    keywords: ['ai', 'generate', 'assist', 'smart', 'suggestion'],
  },
  {
    id: 'saving-work',
    title: 'Saving Your Work',
    content: 'Your work is automatically saved as you make changes. The status indicator shows when saves are in progress. For extra safety, you can export your project at any time.',
    category: 'tips',
    keywords: ['save', 'auto', 'backup', 'export'],
  },
];

const categoryIcons = {
  'getting-started': Compass,
  features: BookOpen,
  tips: Lightbulb,
  shortcuts: Keyboard,
};

const categoryLabels = {
  'getting-started': 'Getting Started',
  features: 'Features',
  tips: 'Tips & Tricks',
  shortcuts: 'Shortcuts',
};

/**
 * HelpPanel - Searchable context-sensitive help panel
 *
 * Provides searchable help articles organized by category,
 * with the ability to launch related tours.
 */
export function HelpPanel({
  isOpen,
  onClose,
  articles = defaultArticles,
  className,
}: HelpPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { startTour, getSuggestedTours } = useTour();

  // Focus search on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let results = articles;

    if (selectedCategory) {
      results = results.filter(article => article.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(query);
        const contentMatch = article.content.toLowerCase().includes(query);
        const keywordMatch = article.keywords?.some(kw => kw.toLowerCase().includes(query));
        return titleMatch || contentMatch || keywordMatch;
      });
    }

    return results;
  }, [articles, searchQuery, selectedCategory]);

  // Group articles by category
  const articlesByCategory = useMemo(() => {
    const groups: Record<string, HelpArticle[]> = {};
    filteredArticles.forEach(article => {
      if (!groups[article.category]) {
        groups[article.category] = [];
      }
      groups[article.category].push(article);
    });
    return groups;
  }, [filteredArticles]);

  const categories = Object.keys(categoryLabels) as Array<keyof typeof categoryLabels>;

  const handleStartTour = useCallback((tourId: string) => {
    startTour(tourId);
    onClose();
  }, [startTour, onClose]);

  const suggestedTours = getSuggestedTours();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9990]"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={clsx(
              'fixed right-0 top-0 bottom-0 w-full max-w-md',
              'bg-slate-900/95 border-l border-slate-700/50 backdrop-blur-md',
              'flex flex-col shadow-2xl shadow-black/50 z-[9991]',
              className
            )}
            data-testid="help-panel"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                  <HelpCircle className="w-5 h-5 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-50">Help Center</h2>
              </div>
              <IconButton
                icon={<X className="w-5 h-5" />}
                size="sm"
                variant="ghost"
                onClick={onClose}
                aria-label="Close help panel"
              />
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b border-slate-700/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={clsx(
                    'w-full pl-10 pr-4 py-2 rounded-lg',
                    'bg-slate-800/50 border border-slate-700/50',
                    'text-sm text-slate-100 placeholder:text-slate-500',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50'
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Category filters */}
            <div className="px-4 py-2 border-b border-slate-700/50 overflow-x-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                    !selectedCategory
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200'
                  )}
                >
                  All
                </button>
                {categories.map(category => {
                  const Icon = categoryIcons[category];
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={clsx(
                        'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors',
                        'flex items-center gap-1.5',
                        selectedCategory === category
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:text-slate-200'
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {categoryLabels[category]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Suggested Tours */}
              {!searchQuery && !selectedCategory && suggestedTours.length > 0 && (
                <div className="px-4 py-3 border-b border-slate-700/50">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Recommended Tours
                  </h3>
                  <div className="space-y-2">
                    {suggestedTours.slice(0, 2).map(tour => (
                      <button
                        key={tour.id}
                        onClick={() => handleStartTour(tour.id)}
                        className={clsx(
                          'w-full flex items-center gap-3 p-3 rounded-lg',
                          'bg-gradient-to-r from-cyan-500/10 to-blue-500/10',
                          'border border-cyan-500/20 hover:border-cyan-500/40',
                          'transition-colors text-left'
                        )}
                      >
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <Play className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-100 truncate">
                            {tour.name}
                          </div>
                          {tour.description && (
                            <div className="text-xs text-slate-400 truncate">
                              {tour.description}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Articles */}
              {filteredArticles.length > 0 ? (
                <div className="py-2">
                  {Object.entries(articlesByCategory).map(([category, categoryArticles]) => (
                    <div key={category} className="px-4 py-2">
                      {!selectedCategory && (
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                          {(() => {
                            const Icon = categoryIcons[category as keyof typeof categoryIcons];
                            return Icon ? <Icon className="w-3.5 h-3.5" /> : null;
                          })()}
                          {categoryLabels[category as keyof typeof categoryLabels]}
                        </h3>
                      )}
                      <div className="space-y-2">
                        {categoryArticles.map(article => (
                          <div
                            key={article.id}
                            className={clsx(
                              'rounded-lg border transition-colors',
                              expandedArticle === article.id
                                ? 'bg-slate-800/50 border-slate-600/50'
                                : 'bg-slate-800/30 border-slate-700/30 hover:border-slate-600/50'
                            )}
                          >
                            <button
                              onClick={() => setExpandedArticle(
                                expandedArticle === article.id ? null : article.id
                              )}
                              className="w-full flex items-center justify-between p-3 text-left"
                            >
                              <span className="text-sm font-medium text-slate-100">
                                {article.title}
                              </span>
                              <ChevronRight
                                className={clsx(
                                  'w-4 h-4 text-slate-400 transition-transform',
                                  expandedArticle === article.id && 'rotate-90'
                                )}
                              />
                            </button>
                            <AnimatePresence>
                              {expandedArticle === article.id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="overflow-hidden"
                                >
                                  <div className="px-3 pb-3 pt-0">
                                    <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                                      {article.content}
                                    </p>
                                    {article.relatedTourId && (
                                      <Button
                                        size="xs"
                                        variant="secondary"
                                        onClick={() => handleStartTour(article.relatedTourId!)}
                                        icon={<Play className="w-3 h-3" />}
                                        className="mt-3"
                                      >
                                        Take the tour
                                      </Button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <div className="p-3 bg-slate-800/50 rounded-full mb-3">
                    <Search className="w-6 h-6 text-slate-400" />
                  </div>
                  <p className="text-sm text-slate-400 text-center">
                    No articles found for &quot;{searchQuery}&quot;
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                    className="mt-2 text-xs text-cyan-400 hover:text-cyan-300"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-slate-700/50 bg-slate-900/50">
              <Button
                size="sm"
                variant="ghost"
                icon={<ExternalLink className="w-4 h-4" />}
                fullWidth
                onClick={() => window.open('https://docs.studiostory.app', '_blank')}
              >
                View full documentation
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default HelpPanel;
