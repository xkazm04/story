'use client';

import React, { useState, useCallback } from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { useQueryClient } from '@tanstack/react-query';
import PanelFrame from './PanelFrame';

interface SceneEditorPanelProps {
  sceneId?: string;
  onTriggerSkill?: (skillId: string, params?: Record<string, unknown>) => void;
  onClose?: () => void;
}

export default function SceneEditorPanel({
  sceneId: propSceneId,
  onTriggerSkill,
  onClose,
}: SceneEditorPanelProps) {
  const { selectedScene } = useProjectStore();
  const resolvedSceneId = propSceneId || selectedScene?.id || '';
  const { data: scene } = sceneApi.useScene(resolvedSceneId, !!resolvedSceneId);
  const queryClient = useQueryClient();

  const [localScript, setLocalScript] = useState<string | null>(null);
  const script = localScript ?? scene?.script ?? scene?.content ?? '';

  const handleSave = useCallback(async () => {
    if (!resolvedSceneId || localScript === null) return;
    try {
      await sceneApi.updateScene(resolvedSceneId, { script: localScript });
      queryClient.invalidateQueries({ queryKey: ['scenes', resolvedSceneId] });
      setLocalScript(null);
    } catch {
      // Error handling left minimal
    }
  }, [resolvedSceneId, localScript, queryClient]);

  const handleRegenerate = useCallback(() => {
    if (onTriggerSkill) {
      onTriggerSkill('scene-generation', { sceneId: resolvedSceneId });
    }
  }, [onTriggerSkill, resolvedSceneId]);

  const isDirty = localScript !== null && localScript !== (scene?.script ?? scene?.content ?? '');

  return (
    <PanelFrame
      title={scene?.name || 'Scene Editor'}
      icon={FileText}
      onClose={onClose}
      actions={
        <div className="flex items-center gap-1">
          {isDirty && (
            <button
              onClick={handleSave}
              className="px-2 py-0.5 rounded text-[10px] font-medium bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 transition-colors"
            >
              Save
            </button>
          )}
          {onTriggerSkill && (
            <button
              onClick={handleRegenerate}
              className="text-slate-500 hover:text-slate-300 transition-colors"
              title="Regenerate scene"
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </div>
      }
    >
      {!resolvedSceneId ? (
        <div className="flex items-center justify-center h-full text-slate-600 text-xs">
          Select a scene to edit
        </div>
      ) : (
        <textarea
          value={script}
          onChange={(e) => setLocalScript(e.target.value)}
          className="w-full h-full p-4 bg-transparent text-slate-200 text-sm leading-relaxed resize-none outline-none font-mono placeholder-slate-600"
          placeholder="Scene script will appear here..."
          spellCheck={false}
        />
      )}
    </PanelFrame>
  );
}
