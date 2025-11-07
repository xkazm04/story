'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, ChevronRight } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import StoryRightPanel from '@/app/features/story/sub_StoryRightPanel/StoryRightPanel';
import CharRightPanel from '@/app/features/characters/sub_CharRightPanel/CharRightPanel';

type RightPanelMode = 'story' | 'characters';

const RightPanel: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [mode, setMode] = useState<RightPanelMode>('story');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const contentVariants = {
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.3 }
    },
    hidden: {
      opacity: 0,
      x: 60,
      scale: 0.9,
      transition: { duration: 0.2 }
    }
  };

  if (!selectedProject) {
    return (
      <div className="h-full w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center border-l border-gray-800">
        <p className="text-gray-500 text-sm">Select a project to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col border-l border-gray-800 relative overflow-hidden">
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-4 left-4 z-20 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        title={isCollapsed ? 'Expand' : 'Collapse'}
      >
        <ChevronRight
          className={`w-4 h-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence mode="wait">
        {!isCollapsed && (
          <motion.div
            className="flex-1 flex flex-col overflow-hidden"
            initial="visible"
            animate="visible"
            exit="hidden"
            variants={contentVariants}
          >
            {/* Mode Selector */}
            <div className="p-4 border-b border-gray-700 pl-14">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('story')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${mode === 'story'
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  <BookOpen className="w-4 h-4" />
                  Story
                </button>

                <button
                  onClick={() => setMode('characters')}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${mode === 'characters'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }
                  `}
                >
                  <Users className="w-4 h-4" />
                  Characters
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {mode === 'story' && <StoryRightPanel />}
              {mode === 'characters' && <CharRightPanel />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed State */}
      {isCollapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center h-full gap-4"
        >
          <BookOpen className="w-8 h-8 text-gray-600" />
        </motion.div>
      )}
    </div>
  );
};

export default RightPanel;
