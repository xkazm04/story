'use client';

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import PanelFrame from './PanelFrame';
import PerformanceControls from '@/app/features/voice/components/PerformanceControls';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useVoicesByProject } from '@/app/hooks/useVoices';
import type { VoiceSettings } from '@/app/features/voice/types';

interface VoicePerformancePanelProps {
  onClose?: () => void;
}

const DEFAULT_SETTINGS: VoiceSettings = {
  stability: 50,
  similarity_boost: 75,
  style: 30,
  speed: 100,
};

export default function VoicePerformancePanel({ onClose }: VoicePerformancePanelProps) {
  const { selectedProject } = useProjectStore();
  const projectId = selectedProject?.id;
  const { data: voices = [] } = useVoicesByProject(projectId ?? '');
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(DEFAULT_SETTINGS);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>();

  if (!projectId) {
    return (
      <PanelFrame title="Voice Performance" icon={SlidersHorizontal} onClose={onClose} headerAccent="emerald">
        <div className="flex items-center justify-center h-full text-xs text-slate-500">
          Select a project first
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame title="Voice Performance" icon={SlidersHorizontal} onClose={onClose} headerAccent="emerald">
      <div className="flex flex-col h-full overflow-auto">
        {/* Voice selector */}
        {voices.length > 0 && (
          <div className="p-2 border-b border-slate-800/50 shrink-0">
            <label className="text-[10px] text-slate-500 mb-1 block">Active Voice</label>
            <select
              value={selectedVoiceId ?? ''}
              onChange={(e) => setSelectedVoiceId(e.target.value || undefined)}
              className="w-full px-2 py-1 bg-slate-900/80 border border-slate-700/50 rounded text-xs text-slate-300"
            >
              <option value="">None selected</option>
              {voices.map((v) => (
                <option key={v.id} value={v.voice_id ?? v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Performance controls */}
        <div className="flex-1 p-2">
          <PerformanceControls
            voiceSettings={voiceSettings}
            onSettingsChange={setVoiceSettings}
            selectedVoiceId={selectedVoiceId}
            previewText="The quick brown fox jumps over the lazy dog."
          />
        </div>
      </div>
    </PanelFrame>
  );
}
