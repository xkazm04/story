'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { TourOverlay } from './TourOverlay';
import { HelpPanel, HelpArticle } from './HelpPanel';
import { TourEngine, Tour } from '@/lib/tutorial';

interface TutorialContextValue {
  openHelpPanel: () => void;
  closeHelpPanel: () => void;
  toggleHelpPanel: () => void;
  isHelpPanelOpen: boolean;
  startTour: (tourId: string) => Promise<boolean>;
}

const TutorialContext = createContext<TutorialContextValue | null>(null);

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}

interface TutorialProviderProps {
  children: ReactNode;
  /** Tours to register on mount */
  tours?: Tour[];
  /** Custom help articles */
  helpArticles?: HelpArticle[];
  /** Whether to show the help button */
  showHelpButton?: boolean;
  /** Auto-start tour ID for first-time users */
  autoStartTourId?: string;
}

const FIRST_VISIT_KEY = 'story-first-visit';

/**
 * TutorialProvider - Provides tutorial system context and components
 *
 * Wraps your app to enable guided tours, contextual help, and
 * progressive feature disclosure throughout the application.
 */
export function TutorialProvider({
  children,
  tours = [],
  helpArticles,
  showHelpButton = true,
  autoStartTourId,
}: TutorialProviderProps) {
  const [isHelpPanelOpen, setIsHelpPanelOpen] = useState(false);

  // Register tours on mount
  useEffect(() => {
    tours.forEach(tour => TourEngine.registerTour(tour));
    return () => {
      tours.forEach(tour => TourEngine.unregisterTour(tour.id));
    };
  }, [tours]);

  // Auto-start tour for first-time users
  useEffect(() => {
    if (!autoStartTourId || typeof window === 'undefined') return;

    const isFirstVisit = !localStorage.getItem(FIRST_VISIT_KEY);
    if (isFirstVisit) {
      localStorage.setItem(FIRST_VISIT_KEY, 'true');
      // Delay to allow UI to settle
      setTimeout(() => {
        TourEngine.startTour(autoStartTourId);
      }, 500);
    }
  }, [autoStartTourId]);

  // Keyboard shortcut for help panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1 or Cmd/Ctrl + ?
      if (e.key === 'F1' || (e.key === '?' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setIsHelpPanelOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openHelpPanel = useCallback(() => setIsHelpPanelOpen(true), []);
  const closeHelpPanel = useCallback(() => setIsHelpPanelOpen(false), []);
  const toggleHelpPanel = useCallback(() => setIsHelpPanelOpen(prev => !prev), []);

  const startTour = useCallback((tourId: string) => {
    return TourEngine.startTour(tourId);
  }, []);

  const contextValue: TutorialContextValue = {
    openHelpPanel,
    closeHelpPanel,
    toggleHelpPanel,
    isHelpPanelOpen,
    startTour,
  };

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}

      {/* Tour overlay - rendered at top level */}
      <TourOverlay />

      {/* Help panel */}
      <HelpPanel
        isOpen={isHelpPanelOpen}
        onClose={closeHelpPanel}
        articles={helpArticles}
      />

      {/* Floating help button */}
      {showHelpButton && (
        <HelpButton onClick={toggleHelpPanel} />
      )}
    </TutorialContext.Provider>
  );
}

interface HelpButtonProps {
  onClick: () => void;
}

function HelpButton({ onClick }: HelpButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-[9980] p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-shadow"
      aria-label="Open help center (F1)"
      data-testid="help-button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
      </svg>
    </button>
  );
}

export default TutorialProvider;
