'use client';

import React from 'react';
import { Film } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import PanelFrame from './PanelFrame';

interface SceneGalleryPanelProps {
  onClose?: () => void;
}

export default function SceneGalleryPanel({ onClose }: SceneGalleryPanelProps) {
  const { selectedProject, selectedAct, selectedScene, setSelectedScene } = useProjectStore();
  const projectId = selectedProject?.id || '';
  const actId = selectedAct?.id || '';
  const { data: scenes = [] } = sceneApi.useScenesByProjectAndAct(
    projectId,
    actId,
    !!projectId && !!actId,
  );

  if (!projectId || !actId) {
    return (
      <PanelFrame title="Scenes" icon={Film} onClose={onClose} headerAccent="amber">
        <div className="flex items-center justify-center h-full text-xs text-slate-500">
          Select a project and act
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame title="Scenes" icon={Film} onClose={onClose} headerAccent="amber">
      <div className="flex items-stretch gap-2 p-2 overflow-x-auto h-full">
        {scenes.length === 0 ? (
          <div className="flex items-center justify-center w-full text-[10px] text-slate-600">
            No scenes in this act
          </div>
        ) : (
          scenes.map((scene) => {
            const isActive = selectedScene?.id === scene.id;
            return (
              <button
                key={scene.id}
                onClick={() => setSelectedScene(scene)}
                className={cn(
                  'shrink-0 w-36 rounded-lg border p-2 text-left transition-colors',
                  'flex flex-col gap-1',
                  isActive
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-slate-900/50 border-slate-800/40 hover:border-slate-700/50',
                )}
              >
                {/* Image thumbnail */}
                {scene.image_url ? (
                  <div className="w-full h-16 rounded overflow-hidden bg-slate-800/50">
                    <img
                      src={scene.image_url}
                      alt={scene.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-16 rounded bg-slate-800/30 flex items-center justify-center">
                    <Film className="w-4 h-4 text-slate-700" />
                  </div>
                )}
                <p className={cn(
                  'text-[10px] font-medium truncate',
                  isActive ? 'text-amber-300' : 'text-slate-300',
                )}>
                  {scene.name}
                </p>
                {scene.description && (
                  <p className="text-[9px] text-slate-500 line-clamp-2">
                    {scene.description.replace(/@\w+(\[[^\]]*\])?\s*/g, '').slice(0, 80)}
                  </p>
                )}
              </button>
            );
          })
        )}
      </div>
    </PanelFrame>
  );
}
