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
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving] = useState(false);

  // Sync local state with scene data
  useEffect(() => {
    if (scene) {
      setName(scene.name || '');
      setDescription(scene.description || '');
      setLocation(scene.location || '');
    }
  }, [scene]);

  const handleSave = useCallback(async () => {
    if (!resolvedSceneId) return;
    setSaving(true);
    try {
      await sceneApi.updateScene(resolvedSceneId, { name, description });
      queryClient.invalidateQueries({ queryKey: ['scenes'] });
    } catch {
      // Minimal error handling
    } finally {
      setSaving(false);
    }
  }, [resolvedSceneId, name, description, queryClient]);

  if (!resolvedSceneId) {
    return (
      <PanelFrame title="Scene Details" icon={Info} onClose={onClose}>
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
      actions={
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
          title="Save changes"
        >
          <Save className="w-3 h-3" />
        </button>
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

        {/* Description */}
        <div>
          <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-2 py-1.5 rounded bg-slate-900/60 border border-slate-800/50 text-xs text-slate-200 outline-none focus:border-slate-700 resize-none"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-2 py-1.5 rounded bg-slate-900/60 border border-slate-800/50 text-xs text-slate-200 outline-none focus:border-slate-700"
            placeholder="Where does this scene take place?"
          />
        </div>

        {/* Scene info */}
        {scene && (
          <div className="pt-2 border-t border-slate-800/50 space-y-1">
            <p className="text-[10px] text-slate-600">
              Order: {scene.order ?? 'N/A'}
            </p>
            {scene.updated_at && (
              <p className="text-[10px] text-slate-600">
                Updated: {new Date(scene.updated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </div>
    </PanelFrame>
  );
}
