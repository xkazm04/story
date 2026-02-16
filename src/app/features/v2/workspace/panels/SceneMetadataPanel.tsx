'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Info, Save } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { useQueryClient } from '@tanstack/react-query';
import PanelFrame from './PanelFrame';

interface SceneMetadataPanelProps {
  sceneId?: string;
  onClose?: () => void;
}

export default function SceneMetadataPanel({
  sceneId: propSceneId,
  onClose,
}: SceneMetadataPanelProps) {
  const { selectedScene } = useProjectStore();
  const resolvedSceneId = propSceneId || selectedScene?.id || '';
  const { data: scene } = sceneApi.useScene(resolvedSceneId, !!resolvedSceneId);
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync local state with scene data
  useEffect(() => {
    if (scene) {
      setName(scene.name || '');
    }
  }, [scene]);

  const isDirty = scene && name !== (scene.name || '');

  const handleSave = useCallback(async () => {
    if (!resolvedSceneId || !isDirty) return;
    setSaving(true);
    try {
      await sceneApi.updateScene(resolvedSceneId, { name });
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    } catch {
      // Minimal error handling
    } finally {
      setSaving(false);
    }
  }, [resolvedSceneId, name, isDirty, queryClient]);

  if (!resolvedSceneId) {
    return (
      <PanelFrame title="Scene Details" icon={Info} onClose={onClose} headerAccent="amber">
        <div className="flex items-center justify-center h-full text-slate-600 text-xs">
          Select a scene
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame
      title="Scene Details"
      icon={Info}
      onClose={onClose}
      headerAccent="amber"
      actions={
        isDirty ? (
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
            title="Save changes"
          >
            <Save className="w-3 h-3" />
          </button>
        ) : undefined
      }
    >
      <div className="p-3 space-y-3">
        {/* Name */}
        <div>
          <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-slate-900/60 border border-slate-800/50 text-xs text-slate-200 outline-none focus:border-slate-700"
          />
        </div>

        {/* Scene info */}
        {scene && (
          <div className="pt-2 border-t border-slate-800/50 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600">Order</span>
              <span className="text-[10px] text-slate-400 font-mono">{scene.order ?? 'N/A'}</span>
            </div>
            {scene.act_id && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Act</span>
                <span className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">{scene.act_id}</span>
              </div>
            )}
            {scene.created_at && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Created</span>
                <span className="text-[10px] text-slate-400">{new Date(scene.created_at).toLocaleDateString()}</span>
              </div>
            )}
            {scene.updated_at && (
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-600">Updated</span>
                <span className="text-[10px] text-slate-400">{new Date(scene.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </PanelFrame>
  );
}
