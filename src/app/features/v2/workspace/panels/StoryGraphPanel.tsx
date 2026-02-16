'use client';

import React, { Suspense, lazy } from 'react';
import { GitBranch, Loader2 } from 'lucide-react';
import PanelFrame from './PanelFrame';
import { SceneEditorProvider } from '@/contexts/SceneEditorContext';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { sceneChoiceApi } from '@/app/hooks/integration/useSceneChoices';

const SceneGraph = lazy(
  () => import('@/app/features/story/sub_SceneGraph/SceneGraph')
);

interface StoryGraphPanelProps {
  onClose?: () => void;
}

export default function StoryGraphPanel({ onClose }: StoryGraphPanelProps) {
  const { selectedProject } = useProjectStore();
  const projectId = selectedProject?.id ?? '';

  const { data: scenes = [] } = sceneApi.useProjectScenes(projectId, !!projectId);
  const { data: choices = [] } = sceneChoiceApi.useProjectChoices(projectId, !!projectId);

  const firstSceneId = scenes.length > 0 ? scenes[0].id : null;

  return (
    <PanelFrame title="Story Graph" icon={GitBranch} onClose={onClose} headerAccent="violet">
      <SceneEditorProvider
        projectId={projectId || 'preview'}
        firstSceneId={firstSceneId}
        initialScenes={scenes}
        initialChoices={choices}
      >
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
            </div>
          }
        >
          <SceneGraph />
        </Suspense>
      </SceneEditorProvider>
    </PanelFrame>
  );
}
