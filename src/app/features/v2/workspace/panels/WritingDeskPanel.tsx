'use client';

import React, { useState, Suspense, lazy, useCallback } from 'react';
import { PenTool, FileText, Blocks, ImageIcon, Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import PanelFrame from './PanelFrame';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { SceneEditorProvider } from '@/contexts/SceneEditorContext';
import { sceneChoiceApi } from '@/app/hooks/integration/useSceneChoices';
import { useQueryClient } from '@tanstack/react-query';

// Lazy load the heavy editors
const SceneEditor = lazy(
  () => import('@/app/features/story/sub_SceneEditor/SceneEditor')
);
const StoryScript = lazy(
  () => import('@/app/features/story/sub_StoryScript/StoryScript')
);

type WritingTab = 'content' | 'blocks' | 'image';

const TABS: { id: WritingTab; label: string; icon: React.ElementType }[] = [
  { id: 'content', label: 'Content', icon: FileText },
  { id: 'blocks', label: 'Blocks', icon: Blocks },
  { id: 'image', label: 'Image', icon: ImageIcon },
];

interface WritingDeskPanelProps {
  onClose?: () => void;
  onTriggerSkill?: (skillId: string, params?: Record<string, unknown>) => void;
}

function LazyFallback() {
  return (
    <div className="flex items-center justify-center h-full">
      <Loader2 className="w-5 h-5 text-slate-600 animate-spin" />
    </div>
  );
}

/** Image generation tab — generates from scene description & dialogue */
function SceneImageTab({
  sceneId,
  onTriggerSkill,
}: {
  sceneId: string;
  onTriggerSkill?: (skillId: string, params?: Record<string, unknown>) => void;
}) {
  const { data: scene } = sceneApi.useScene(sceneId, !!sceneId);
  const imageUrl = scene?.image_url;

  return (
    <div className="flex flex-col h-full">
      {/* Image preview */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={scene?.name || 'Scene image'}
            className="max-w-full max-h-full rounded-lg border border-slate-800/60 object-contain"
          />
        ) : (
          <div className="flex flex-col items-center text-center p-6">
            <div className="w-16 h-16 rounded-xl bg-slate-900/60 border border-slate-800/40 flex items-center justify-center mb-4">
              <ImageIcon className="w-7 h-7 text-slate-600" />
            </div>
            <p className="text-xs text-slate-400 mb-1">No image generated yet</p>
            <p className="text-[10px] text-slate-600 max-w-[220px]">
              Generate a scene image from your script content and dialogue
            </p>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="shrink-0 p-3 border-t border-slate-800/40 flex items-center gap-2">
        {onTriggerSkill && (
          <>
            <button
              onClick={() => onTriggerSkill('image-prompt-compose', { sceneId })}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600/15 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-600/25 transition-colors"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              Generate from Scene
            </button>
            <button
              onClick={() => onTriggerSkill('cover-prompt', { sceneId })}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 border border-slate-700/50 hover:bg-slate-800/40 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Cover
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function WritingDeskPanel({ onClose, onTriggerSkill }: WritingDeskPanelProps) {
  const [activeTab, setActiveTab] = useState<WritingTab>('content');
  const { selectedProject, selectedSceneId } = useProjectStore();
  const projectId = selectedProject?.id ?? '';

  // Fetch project scenes + choices for the SceneEditorProvider (needed by Content tab)
  const { data: scenes = [] } = sceneApi.useProjectScenes(projectId, !!projectId);
  const { data: choices = [] } = sceneChoiceApi.useProjectChoices(projectId, !!projectId);
  const firstSceneId = scenes.length > 0 ? scenes[0].id : null;

  const queryClient = useQueryClient();

  const handleSave = useCallback(async (sceneId: string, content: string) => {
    try {
      await sceneApi.updateScene(sceneId, { content });
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    } catch {
      // Error handling minimal
    }
  }, [queryClient]);

  return (
    <PanelFrame
      title="Writing Desk"
      icon={PenTool}
      onClose={onClose}
      headerAccent="amber"
      actions={
        onTriggerSkill ? (
          <button
            onClick={() => onTriggerSkill('scene-generation', { sceneId: selectedSceneId })}
            className="text-[9px] px-1.5 py-0.5 text-amber-400 hover:bg-amber-500/10 rounded transition-colors"
          >
            Generate
          </button>
        ) : undefined
      }
    >
      {/* Tab bar */}
      <div className="flex items-center gap-0.5 px-2 py-1 border-b border-slate-800/40 bg-slate-900/40 shrink-0">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-medium transition-colors',
                isActive
                  ? 'bg-slate-800/60 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
              )}
            >
              <Icon className="w-3 h-3" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {activeTab === 'content' && (
          <SceneEditorProvider
            projectId={projectId || 'preview'}
            firstSceneId={selectedSceneId || firstSceneId}
            initialScenes={scenes}
            initialChoices={choices}
          >
            <Suspense fallback={<LazyFallback />}>
              <SceneEditor />
            </Suspense>
          </SceneEditorProvider>
        )}

        {activeTab === 'blocks' && (
          <Suspense fallback={<LazyFallback />}>
            <StoryScript />
          </Suspense>
        )}

        {activeTab === 'image' && selectedSceneId ? (
          <SceneImageTab
            sceneId={selectedSceneId}
            onTriggerSkill={onTriggerSkill}
          />
        ) : activeTab === 'image' ? (
          <div className="flex items-center justify-center h-full text-xs text-slate-500">
            Select a scene to generate images
          </div>
        ) : null}
      </div>
    </PanelFrame>
  );
}
