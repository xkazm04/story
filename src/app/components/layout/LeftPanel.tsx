'use client';

import React, { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoveLeft } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useAssetManagerStore } from '@/app/features/assets/store/assetManagerStore';
import { useAppShellStore } from '@/app/store/appShellStore';
import { SceneEditorProvider } from '@/contexts/SceneEditorContext';
import ProjectOverview from '@/app/features/projectOverview/ProjectOverview';
import { Scene } from '@/app/types/Scene';
import { SceneChoice } from '@/app/types/SceneChoice';

// Lazy load panels for code splitting
const AssetLeftPanel = lazy(() => import('@/app/features/assets/components/panels/AssetLeftPanel'));
const StoryLeftPanel = lazy(() => import('@/app/features/story/components/StoryLeftPanel'));

// Mock data for SceneEditorContext (same as StoryFeature)
const MOCK_SCENES: Scene[] = [
  { id: 'scene-1', name: 'The Crossroads', project_id: 'proj-1', act_id: 'act-1', order: 1, description: 'You stand at a crossroads in the ancient forest.', content: 'The morning mist parts before you as you reach the crossroads.', image_url: 'https://cdn.leonardo.ai/users/a6457d6b-367e-4a65-9ee2-e5b5d7d2b5a0/generations/7a8f4c3e-3b1e-4f7a-8c1e-2d3f4a5b6c7d/Leonardo_Phoenix_A_mystical_crossroads_in_an_ancient_forest_wi_0.jpg' },
  { id: 'scene-2', name: 'Mountain Fortress', project_id: 'proj-1', act_id: 'act-1', order: 2, description: 'The towering fortress looms above.', content: 'After a steep climb, the fortress gates stand before you.', image_url: 'https://cdn.leonardo.ai/users/a6457d6b-367e-4a65-9ee2-e5b5d7d2b5a0/generations/8b9f5d4e-4c2f-5g8b-9d2f-3e4g5a6b7c8e/Leonardo_Phoenix_A_towering_medieval_fortress_on_a_mountain_pe_0.jpg' },
  { id: 'scene-3', name: 'Shadow Woods', project_id: 'proj-1', act_id: 'act-1', order: 3, description: 'Darkness envelops the twisted trees.', content: 'The canopy thickens overhead, blocking out the sun.' },
  { id: 'scene-4', name: 'Riverside Village', project_id: 'proj-1', act_id: 'act-1', order: 4, description: 'A peaceful village by the river.', content: 'Smoke rises from cottage chimneys.' },
  { id: 'scene-5', name: 'The Hidden Chamber', project_id: 'proj-1', act_id: 'act-2', order: 1, description: 'A secret room within the fortress.', content: 'Behind the tapestry, you discover a hidden chamber.' },
  { id: 'scene-6', name: 'Forest Guardian', project_id: 'proj-1', act_id: 'act-2', order: 2, description: 'Meeting the ancient protector.', content: 'A towering figure of bark and moss steps from the shadows.' },
  { id: 'scene-7', name: 'Orphaned Scene', project_id: 'proj-1', act_id: 'act-2', order: 3, description: 'This scene has no incoming connections.', content: 'This is an orphaned scene.' },
];

const MOCK_CHOICES: SceneChoice[] = [
  { id: 'choice-1', scene_id: 'scene-1', target_scene_id: 'scene-2', label: 'Climb to the Mountain Fortress', order_index: 0 },
  { id: 'choice-2', scene_id: 'scene-1', target_scene_id: 'scene-3', label: 'Enter the Shadow Woods', order_index: 1 },
  { id: 'choice-3', scene_id: 'scene-1', target_scene_id: 'scene-4', label: 'Visit the Riverside Village', order_index: 2 },
  { id: 'choice-4', scene_id: 'scene-2', target_scene_id: 'scene-5', label: 'Search for hidden passages', order_index: 0 },
  { id: 'choice-5', scene_id: 'scene-2', target_scene_id: 'scene-1', label: 'Return to the crossroads', order_index: 1 },
  { id: 'choice-6', scene_id: 'scene-3', target_scene_id: 'scene-6', label: 'Follow the whispers deeper', order_index: 0 },
  { id: 'choice-7', scene_id: 'scene-3', target_scene_id: 'scene-1', label: 'Flee back to safety', order_index: 1 },
  { id: 'choice-8', scene_id: 'scene-4', target_scene_id: 'scene-1', label: 'Return to the crossroads', order_index: 0 },
  { id: 'choice-9', scene_id: 'scene-6', target_scene_id: 'scene-3', label: 'Bow and ask for passage', order_index: 0 },
];

interface LeftPanelProps {
  isHiding?: boolean;
}

// Loading state for lazy-loaded asset panel
const AssetPanelLoader = () => (
  <div className="h-full flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-cyan-500/40 border-t-transparent rounded-full animate-spin" />
  </div>
);

const LeftPanel: React.FC<LeftPanelProps> = ({ isHiding = false }) => {
  const { selectedProject, setSelectedProject, setShowLanding } = useProjectStore();
  const isAssetFeatureActive = useAssetManagerStore((s) => s.isAssetFeatureActive);
  const { activeFeature } = useAppShellStore();
  const isStoryFeatureActive = activeFeature === 'story';

  const contentVariants = {
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hidden: {
      opacity: 0,
      x: -60,
      scale: 0.8,
      transition: { duration: 0.3 },
    },
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setShowLanding(true);
  };

  return (
    <div className="bg-slate-950/95 h-full w-full text-slate-100 flex flex-col relative overflow-hidden border-r border-slate-900/70">
      <motion.div
        className="w-full h-full flex flex-col"
        initial="visible"
        animate={isHiding ? 'hidden' : 'visible'}
        variants={contentVariants}
      >
        {/* Conditional Content: Feature-specific panels or Project Overview */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            {isStoryFeatureActive ? (
              <motion.div
                key="story-panel"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <SceneEditorProvider
                  projectId={selectedProject?.id || 'proj-1'}
                  firstSceneId="scene-1"
                  initialScenes={MOCK_SCENES}
                  initialChoices={MOCK_CHOICES}
                >
                  <Suspense fallback={<AssetPanelLoader />}>
                    <StoryLeftPanel />
                  </Suspense>
                </SceneEditorProvider>
              </motion.div>
            ) : isAssetFeatureActive ? (
              <motion.div
                key="asset-nav"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <Suspense fallback={<AssetPanelLoader />}>
                  <AssetLeftPanel />
                </Suspense>
              </motion.div>
            ) : (
              <motion.div
                key="project-overview"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                <ProjectOverview />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back to Projects Button */}
        {selectedProject && (
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={handleBackToProjects}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-all cursor-pointer text-gray-300 hover:text-white"
            >
              <MoveLeft size={16} />
              Back to Projects
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeftPanel;
