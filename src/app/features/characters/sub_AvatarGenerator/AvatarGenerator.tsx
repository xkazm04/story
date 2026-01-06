/**
 * AvatarGenerator - Main orchestrator for character avatar generation
 * Design: Clean Manuscript style with cyan accents
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, XCircle, Sparkles, RefreshCw } from 'lucide-react';
import { Appearance } from '@/app/types/Character';
import { useAvatarGenerator, GeneratedAvatar } from '../hooks/useAvatarGenerator';
import StyleSelector from './components/StyleSelector';
import ReferenceSelector from './components/ReferenceSelector';
import AvatarGrid from './components/AvatarGrid';
import CurrentAvatar from './components/CurrentAvatar';

interface AvatarGeneratorProps {
  characterId: string;
  characterName: string;
  appearance: Appearance;
  artStyle?: string;
  currentAvatarUrl?: string;
  onAvatarUpdated?: (avatar: GeneratedAvatar) => Promise<void>;
}

const AvatarGenerator: React.FC<AvatarGeneratorProps> = ({
  characterId,
  characterName,
  appearance,
  artStyle,
  currentAvatarUrl,
  onAvatarUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    selectedStyle,
    referenceImage,
    composedPrompt,
    avatars,
    selectedAvatar,
    isComposing,
    isGenerating,
    error,
    setSelectedStyle,
    setReferenceImage,
    generateAvatars,
    selectAvatar,
    setAsCharacterAvatar,
    reset,
    cancel,
  } = useAvatarGenerator({
    characterId,
    appearance,
    artStyle,
    currentAvatarUrl,
    onAvatarSelected: async (avatar) => {
      if (onAvatarUpdated) {
        setIsUpdating(true);
        try {
          await onAvatarUpdated(avatar);
        } finally {
          setIsUpdating(false);
        }
      }
    },
  });

  const isLoading = isComposing || isGenerating;

  const handleSetAsAvatar = async () => {
    setAsCharacterAvatar();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-wide text-slate-300">
            // avatar_generator
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            create stylized avatars for {characterName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isLoading && (
            <button
              onClick={cancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wide
                         bg-red-600/80 hover:bg-red-600 text-white transition-all"
            >
              <XCircle className="w-3.5 h-3.5" />
              cancel
            </button>
          )}
          <button
            onClick={reset}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md font-mono text-xs uppercase tracking-wide
                       bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            reset
          </button>
        </div>
      </div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="font-mono text-xs text-red-400">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Avatar Display */}
      <CurrentAvatar
        currentAvatarUrl={currentAvatarUrl}
        selectedAvatar={selectedAvatar}
        onSetAsAvatar={handleSetAsAvatar}
        isUpdating={isUpdating}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Column: Style & Reference */}
        <div className="space-y-4">
          <StyleSelector
            selectedStyle={selectedStyle}
            onSelectStyle={setSelectedStyle}
            disabled={isLoading}
          />

          <ReferenceSelector
            referenceImage={referenceImage}
            onSetReference={setReferenceImage}
            currentAvatarUrl={currentAvatarUrl}
            disabled={isLoading}
          />

          {/* Prompt Preview (collapsed) */}
          {composedPrompt && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-3 bg-slate-800/40 rounded-lg border border-slate-700/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono text-[10px] text-slate-500 uppercase">
                  composed_prompt
                </span>
              </div>
              <p className="font-mono text-[10px] text-slate-400 line-clamp-3">
                {composedPrompt}
              </p>
            </motion.div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateAvatars}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-mono text-sm uppercase tracking-wide
                       bg-cyan-600 hover:bg-cyan-500 text-white
                       transition-all duration-200 shadow-lg hover:shadow-cyan-500/20
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? 'generating_avatars...' : 'generate_avatars'}
          </button>
        </div>

        {/* Right Column: Avatar Grid */}
        <AvatarGrid
          avatars={avatars}
          selectedAvatar={selectedAvatar}
          onSelectAvatar={selectAvatar}
          isLoading={isGenerating}
        />
      </div>

      {/* Art Style Badge */}
      {artStyle && (
        <div className="flex items-center gap-2 p-3 bg-amber-500/5 rounded-lg border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-mono text-[10px] text-amber-400/80 uppercase">
            project_art_style:
          </span>
          <span className="font-mono text-xs text-slate-300">
            {artStyle.length > 80 ? artStyle.substring(0, 80) + '...' : artStyle}
          </span>
        </div>
      )}
    </div>
  );
};

export default AvatarGenerator;
