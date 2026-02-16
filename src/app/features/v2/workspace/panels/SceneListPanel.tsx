'use client';

import React from 'react';
import { List, Plus, Clapperboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import PanelFrame from './PanelFrame';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';

interface SceneListPanelProps {
  onClose?: () => void;
  onTriggerSkill?: (skillId: string, params?: Record<string, unknown>) => void;
}

export default function SceneListPanel({ onClose, onTriggerSkill }: SceneListPanelProps) {
  const { selectedProject, selectedAct, selectedSceneId, setSelectedSceneId } = useProjectStore();
  const { data: scenes = [], isLoading } = sceneApi.useScenesByProjectAndAct(
    selectedProject?.id || '',
    selectedAct?.id || '',
    !!selectedProject && !!selectedAct
  );

  return (
    <PanelFrame
      title={selectedAct?.name ? `Scenes — ${selectedAct.name}` : 'Scenes'}
      icon={List}
      onClose={onClose}
      headerAccent="amber"
      actions={
        onTriggerSkill ? (
          <button
            onClick={() => onTriggerSkill('scene-generation')}
            className="text-slate-500 hover:text-amber-400 transition-colors"
            title="Generate new scene"
          >
            <Plus className="w-3 h-3" />
          </button>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="p-3 space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-800/40 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : scenes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
          <Clapperboard className="w-8 h-8 text-slate-700 mb-3" />
          <p className="text-xs text-slate-500 mb-1">No scenes yet</p>
          <p className="text-[10px] text-slate-600">Select an act or create your first scene</p>
        </div>
      ) : (
        <div className="p-2 space-y-1">
          <AnimatePresence mode="popLayout">
            {scenes.map((scene, idx) => (
              <motion.button
                key={scene.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => setSelectedSceneId(scene.id)}
                className={cn(
                  'w-full flex items-start gap-2.5 px-3 py-2.5 rounded-lg text-left transition-all group',
                  selectedSceneId === scene.id
                    ? 'bg-amber-500/10 border border-amber-500/30'
                    : 'hover:bg-slate-800/40 border border-transparent'
                )}
              >
                <span className={cn(
                  'shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold mt-0.5',
                  selectedSceneId === scene.id
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-800/60 text-slate-500'
                )}>
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn(
                    'text-xs font-medium truncate',
                    selectedSceneId === scene.id ? 'text-amber-200' : 'text-slate-300'
                  )}>
                    {scene.name || 'Untitled Scene'}
                  </p>
                  {scene.description && (
                    <p className="text-[10px] text-slate-600 line-clamp-2 mt-0.5 leading-relaxed">
                      {scene.description}
                    </p>
                  )}
                </div>
              </motion.button>
            ))}
          </AnimatePresence>
        </div>
      )}
    </PanelFrame>
  );
}
