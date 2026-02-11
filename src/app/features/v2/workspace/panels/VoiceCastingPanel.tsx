'use client';

import React, { useState, useCallback } from 'react';
import { Users } from 'lucide-react';
import PanelFrame from './PanelFrame';
import AuditionPanel from '@/app/features/voice/components/AuditionPanel';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { characterApi } from '@/app/hooks/integration/useCharacters';
import { useVoicesByProject } from '@/app/hooks/useVoices';

interface VoiceCastingPanelProps {
  onClose?: () => void;
}

export default function VoiceCastingPanel({ onClose }: VoiceCastingPanelProps) {
  const { selectedProject } = useProjectStore();
  const projectId = selectedProject?.id;
  const { data: characters = [] } = characterApi.useProjectCharacters(projectId ?? '', !!projectId);
  const { data: voices = [] } = useVoicesByProject(projectId ?? '');
  const [selectedCharId, setSelectedCharId] = useState<string | undefined>();

  const handleCast = useCallback((characterId: string, voiceId: string) => {
    // TODO: persist casting via API
    console.log('Cast voice', voiceId, 'for character', characterId);
  }, []);

  if (!projectId) {
    return (
      <PanelFrame title="Voice Casting" icon={Users} onClose={onClose}>
        <div className="flex items-center justify-center h-full text-xs text-slate-500">
          Select a project first
        </div>
      </PanelFrame>
    );
  }

  return (
    <PanelFrame title="Voice Casting" icon={Users} onClose={onClose}>
      <AuditionPanel
        characters={characters}
        voices={voices}
        selectedCharacterId={selectedCharId}
        onSelectCharacter={setSelectedCharId}
        onCastVoice={handleCast}
      />
    </PanelFrame>
  );
}
