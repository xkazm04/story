'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavStore } from '@/app/store/navigationStore';

interface TabMenuProps {
  tabs: {
    id: string;
    label: string;
    content: React.ReactNode;
  }[];
}

const TabMenu: React.FC<TabMenuProps> = ({ tabs = [] }) => {
  const {activeTab, setActiveTab} = useNavStore()
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  // Ensure activeTab is within valid range
  const safeActiveTab = tabs.length > 0 ? 
    Math.min(Math.max(0, activeTab), tabs.length - 1) : 0;

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

  // If there are no tabs, show a message
  if (!tabs || tabs.length === 0) {
    return <div className="text-gray-400 text-sm p-4">No tabs available</div>;
  }

  return (
    <div className="w-full">
      <div className="relative">
        {showLeftScroll && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/20 backdrop-blur-xs rounded-r-full p-1"
            onClick={() => scroll('left')}
          >
            <ChevronLeft size={20} />
          </motion.button>
        )}
        <div 
          ref={tabsContainerRef}
          className="flex overflow-hidden scrollbar-hide py-2 px-2 bg-black/10 rounded-xl backdrop-blur-xs"
          onScroll={checkScrollControls}
        >
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              className={`relative whitespace-nowrap px-4 py-2 mx-1 text-sm font-medium rounded-lg transition-all duration-300 ${
                safeActiveTab === index 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
              onClick={() => setActiveTab(index)}
            >
              {tab.label}
              {safeActiveTab === index && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500"
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
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/20 backdrop-blur-xs rounded-l-full p-1"
            onClick={() => scroll('right')}
          >
            <ChevronRight size={20} />
          </motion.button>
        )}
      </div>

      <div className="mt-4">
        {tabs.length > 0 && (
          <motion.div
            key={safeActiveTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {tabs[safeActiveTab]?.content || (
              <div className="text-gray-400 text-sm italic">No content available</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TabMenu;
