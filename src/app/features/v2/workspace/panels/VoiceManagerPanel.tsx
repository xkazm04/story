'use client';

import React from 'react';
import { Mic } from 'lucide-react';
import PanelFrame from './PanelFrame';
import VoiceList from '@/app/features/voice/components/VoiceList';
import { useProjectStore } from '@/app/store/slices/projectSlice';

interface VoiceManagerPanelProps {
  onClose?: () => void;
}

export default function VoiceManagerPanel({ onClose }: VoiceManagerPanelProps) {
  const { selectedProject } = useProjectStore();

  return (
    <PanelFrame title="Voices" icon={Mic} onClose={onClose} headerAccent="emerald">
      {selectedProject?.id ? (
        <VoiceList projectId={selectedProject.id} />
      ) : (
        <div className="flex items-center justify-center h-full text-xs text-slate-500">
          Select a project first
        </div>
      )}
    </PanelFrame>
  );
}
