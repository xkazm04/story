'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavStore } from '@/app/store/navigationStore';
import { focusRing } from '@/app/utils/focusRing';

interface TabMenuProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
  /** Sort tabs alphabetically by label (default: false) */
  sortAlphabetically?: boolean;
  /** Callback when tab changes - receives tab id */
  onTabChange?: (tabId: string) => void;
}

const TabMenu: React.FC<TabMenuProps> = ({ tabs = [], sortAlphabetically = true, onTabChange }) => {
  const {activeTab, setActiveTab} = useNavStore()
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Sort tabs alphabetically if enabled
  const sortedTabs = useMemo(() => {
    if (!sortAlphabetically) return tabs;
    return [...tabs].sort((a, b) => a.label.localeCompare(b.label));
  }, [tabs, sortAlphabetically]);

  // Ensure activeTab is within valid range
  const safeActiveTab = sortedTabs.length > 0 ?
    Math.min(Math.max(0, activeTab), sortedTabs.length - 1) : 0;

  const checkScrollControls = () => {
    if (tabsContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = tabsContainerRef.current;
      setShowLeftScroll(scrollLeft > 0);
      setShowRightScroll(scrollLeft + clientWidth < scrollWidth - 5); 
    }
  };

  useEffect(() => {
    checkScrollControls();
    window.addEventListener('resize', checkScrollControls);
    return () => window.removeEventListener('resize', checkScrollControls);
  }, [tabs]);

  const scroll = (direction: 'left' | 'right') => {
    if (tabsContainerRef.current) {
      const scrollAmount = 200;
      tabsContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
      setTimeout(checkScrollControls, 300);
    }
  };

  // Scroll tab into view when focused or selected
  const scrollTabIntoView = useCallback((index: number) => {
    const tabElement = tabRefs.current[index];
    if (tabElement && tabsContainerRef.current) {
      const container = tabsContainerRef.current;
      const tabRect = tabElement.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      if (tabRect.left < containerRect.left) {
        container.scrollBy({ left: tabRect.left - containerRect.left - 8, behavior: 'smooth' });
      } else if (tabRect.right > containerRect.right) {
        container.scrollBy({ left: tabRect.right - containerRect.right + 8, behavior: 'smooth' });
      }
    }
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: React.KeyboardEvent, currentIndex: number) => {
    let newIndex: number | null = null;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = currentIndex > 0 ? currentIndex - 1 : sortedTabs.length - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        newIndex = currentIndex < sortedTabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = sortedTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        setActiveTab(currentIndex);
        onTabChange?.(sortedTabs[currentIndex].id);
        return;
    }

    if (newIndex !== null) {
      setFocusedIndex(newIndex);
      tabRefs.current[newIndex]?.focus();
      scrollTabIntoView(newIndex);
    }
  }, [sortedTabs, setActiveTab, scrollTabIntoView, onTabChange]);

  // Scroll active tab into view when it changes
  useEffect(() => {
    scrollTabIntoView(safeActiveTab);
  }, [safeActiveTab, scrollTabIntoView]);

  // If there are no tabs, show a message
  if (!sortedTabs || sortedTabs.length === 0) {
    return <div className="text-gray-400 text-sm p-4">No tabs available</div>;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative shrink-0">
        {showLeftScroll && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={"absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-slate-950/80 border border-slate-800/80 rounded-r-full p-1 " + focusRing.compact}
            aria-label="Scroll left" data-testid="tab-scroll-left"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={20} />
          </motion.button>
        )}
        <div
          ref={tabsContainerRef}
          role="tablist"
          aria-label="Story features"
          className="flex overflow-hidden scrollbar-hide py-1.5 px-1.5 bg-slate-950/95 border border-slate-900/70 rounded-xl backdrop-blur-sm"
          onScroll={checkScrollControls}
        >
          {sortedTabs.map((tab, index) => (
            <button
              key={tab.id}
              ref={(el) => { tabRefs.current[index] = el; }}
              role="tab"
              aria-selected={safeActiveTab === index}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={safeActiveTab === index ? 0 : -1}
              className={`relative whitespace-nowrap px-3 py-1.5 mx-1 text-xs font-medium rounded-lg transition-all duration-200 ${focusRing.nav} ${
                safeActiveTab === index
                  ? 'text-slate-50 bg-cyan-600/20 border border-cyan-500/40 shadow-[0_0_0_1px_rgba(8,145,178,0.28)]'
                  : 'text-slate-400 bg-slate-900/60 border border-slate-800 hover:bg-slate-900 hover:text-slate-100'
              } ${focusedIndex === index ? 'ring-2 ring-cyan-400/60 ring-offset-1 ring-offset-slate-950' : ''}`}
              onClick={() => {
                setActiveTab(index);
                onTabChange?.(sortedTabs[index].id);
              }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              data-testid={`story-tab-${tab.id}`}
            >
              {tab.label}
              {safeActiveTab === index && (
                <motion.div
                  className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-cyan-500/80"
                  layoutId="activeTabIndicator"
                />
              )}
            </button>
          ))}
        </div>

        {showRightScroll && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={"absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-slate-950/80 border border-slate-800/80 rounded-l-full p-1 " + focusRing.compact}
            aria-label="Scroll right" data-testid="tab-scroll-right"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={20} />
          </motion.button>
        )}
      </div>

      <div className="mt-4 flex-1 min-h-0">
        {sortedTabs.length > 0 && (
          <motion.div
            key={safeActiveTab}
            id={`tabpanel-${sortedTabs[safeActiveTab]?.id}`}
            role="tabpanel"
            aria-labelledby={`story-tab-${sortedTabs[safeActiveTab]?.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {sortedTabs[safeActiveTab]?.content || (
              <div className="text-gray-400 text-sm italic">No content available</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TabMenu;
