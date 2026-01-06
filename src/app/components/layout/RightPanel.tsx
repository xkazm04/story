'use client';

import React, { useState, lazy, Suspense, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Users, ChevronRight, Image } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { useAssetManagerStore } from '@/app/features/assets/store/assetManagerStore';
import StoryRightPanel from '@/app/features/story/sub_StoryRightPanel/StoryRightPanel';
import CharRightPanel from '@/app/features/characters/sub_CharRightPanel/CharRightPanel';

// Lazy load asset panel for code splitting
const AssetRightPanel = lazy(() => import('@/app/features/assets/components/panels/AssetRightPanel'));

// Loading state for lazy-loaded panels
const PanelLoader = () => (
  <div className="h-full flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-cyan-500/40 border-t-transparent rounded-full animate-spin" />
  </div>
);

type RightPanelMode = 'story' | 'characters' | 'assets';

const RightPanel: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [mode, setMode] = useState<RightPanelMode>('story');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isAssetFeatureActive = useAssetManagerStore((s) => s.isAssetFeatureActive);
  const detailPanelOpen = useAssetManagerStore((s) => s.detailPanelOpen);

  // Auto-switch to assets mode when assets feature becomes active
  useEffect(() => {
    if (isAssetFeatureActive) {
      setMode('assets');
    } else if (mode === 'assets') {
      // Switch back to story when leaving assets feature
      setMode('story');
    }
  }, [isAssetFeatureActive, mode]);

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
      <div className="h-full w-full bg-slate-950/95 flex items-center justify-center border-l border-slate-900/70">
        <p className="text-slate-500 text-xs">Select a project to get started</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-slate-950/95 text-slate-100 flex flex-col border-l border-slate-900/70 relative overflow-hidden">
      {/* Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-3 left-3 z-20 p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-lg border border-slate-800/80 transition-colors"
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
            <div className="p-3 border-b border-slate-800/70 pl-12">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setMode('story')}
                    className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-150
                    ${mode === 'story'
                      ? 'bg-cyan-600/20 text-slate-50 border border-cyan-500/40'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-900'
                    }
                  `}
                >
                  <BookOpen className="w-4 h-4" />
                  Story
                </button>

                <button
                  onClick={() => setMode('characters')}
                    className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-150
                    ${mode === 'characters'
                      ? 'bg-cyan-600/20 text-slate-50 border border-cyan-500/40'
                      : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-900'
                    }
                  `}
                >
                  <Users className="w-4 h-4" />
                  Characters
                </button>

                {/* Assets mode - auto-activates when asset feature is active */}
                {isAssetFeatureActive && (
                  <button
                    onClick={() => setMode('assets')}
                    className={`
                      flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium
                      transition-all duration-150
                      ${mode === 'assets'
                        ? 'bg-cyan-600/20 text-slate-50 border border-cyan-500/40'
                        : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:bg-slate-900'
                      }
                    `}
                  >
                    <Image className="w-4 h-4" />
                    Assets
                    {detailPanelOpen && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
              {mode === 'story' && <StoryRightPanel />}
              {mode === 'characters' && <CharRightPanel />}
              {mode === 'assets' && (
                <Suspense fallback={<PanelLoader />}>
                  <AssetRightPanel />
                </Suspense>
              )}
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
