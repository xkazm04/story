'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Plus, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import { characterTraitPrompt } from '@/prompts';
import { cn } from '@/app/lib/utils';
import type { PsychologyProfile } from '@/lib/psychology/PsychologyEngine';

interface CharacterTraitGeneratorProps {
  characterName: string;
  characterType?: string;
  existingTraits?: string[];
  role?: string;
  background?: string;
  onTraitGenerated: (trait: string) => void;
  psychologyProfile?: PsychologyProfile | null;
  onOpenPsychology?: () => void;
}

const CharacterTraitGenerator: React.FC<CharacterTraitGeneratorProps> = ({
  characterName,
  characterType,
  existingTraits = [],
  role,
  background,
  onTraitGenerated,
  psychologyProfile,
  onOpenPsychology,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();
  const [traitCount, setTraitCount] = useState(3);
  const [showPsychologyHint, setShowPsychologyHint] = useState(true);

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      alert('Character name is required');
      return;
    }

    try {
      const result = await generateFromTemplate(characterTraitPrompt, {
        characterName,
        characterType,
        existingTraits,
        role,
        background,
        count: traitCount,
      });

      if (result && result.content) {
        // Parse the traits (assuming comma or newline separated)
        const traits = result.content
          .split(/[,\n]/)
          .map((t) => t.trim())
          .filter(Boolean);

        traits.forEach((trait) => onTraitGenerated(trait));
      }
    } catch (error) {
      console.error('Trait generation error:', error);
      alert('Failed to generate traits. Make sure LLM service is running.');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-yellow-500" />
        <h4 className="text-sm font-semibold text-white">AI Trait Generator</h4>
      </div>

      {/* Trait Count */}
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1">
          Number of Traits to Generate
        </label>
        <input
          type="number"
          min="1"
          max="10"
          value={traitCount}
          onChange={(e) => setTraitCount(parseInt(e.target.value))}
          className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Context Display */}
      {(role || background) && (
        <div className="text-xs text-gray-500 space-y-1">
          {role && (
            <div>
              <span className="text-gray-600">Role:</span> {role}
            </div>
          )}
          {background && (
            <div>
              <span className="text-gray-600">Background:</span> {background}
            </div>
          )}
        </div>
      )}

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Generate Traits with AI
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500">
        AI will suggest traits based on character type, role, and background
      </p>

      {/* Psychology Profile Integration */}
      {onOpenPsychology && showPsychologyHint && (
        <div className="mt-3 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2">
              <Brain className="w-4 h-4 text-purple-400 mt-0.5" />
              <div>
                <p className="text-xs text-purple-300 font-medium">
                  Deep Psychology Available
                </p>
                <p className="text-[10px] text-purple-400/70 mt-0.5">
                  {psychologyProfile
                    ? `Profile active with ${psychologyProfile.motivationTree.totalMotivations} motivations`
                    : 'Generate a psychology profile for deeper character insights'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPsychologyHint(false)}
              className="p-0.5 text-purple-400/50 hover:text-purple-400"
            >
              <ChevronUp size={12} />
            </button>
          </div>
          <button
            onClick={onOpenPsychology}
            className={cn(
              'mt-2 w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded text-xs font-medium transition-colors',
              'bg-purple-500/20 hover:bg-purple-500/30 text-purple-300'
            )}
          >
            <Brain size={12} />
            {psychologyProfile ? 'View Psychology Profile' : 'Generate Psychology Profile'}
          </button>
        </div>
      )}

      {/* Collapsed psychology hint */}
      {onOpenPsychology && !showPsychologyHint && (
        <button
          onClick={() => setShowPsychologyHint(true)}
          className="mt-2 w-full flex items-center justify-center gap-1 py-1 text-[10px] text-purple-400/50 hover:text-purple-400"
        >
          <Brain size={10} />
          <span>Psychology tools</span>
          <ChevronDown size={10} />
        </button>
      )}

      {/* Psychology-informed traits summary */}
      {psychologyProfile && psychologyProfile.motivationTree.rootMotivations.length > 0 && (
        <div className="mt-3 p-2 bg-slate-800/50 rounded border border-slate-700/30">
          <p className="text-[10px] text-slate-500 uppercase mb-1">Psychology-Driven Traits</p>
          <div className="flex flex-wrap gap-1">
            {psychologyProfile.motivationTree.rootMotivations.slice(0, 3).map((m) => (
              <span
                key={m.id}
                className="px-1.5 py-0.5 bg-cyan-500/10 border border-cyan-500/20 rounded text-[10px] text-cyan-400"
              >
                {m.label}
              </span>
            ))}
            {psychologyProfile.internalConflicts.slice(0, 2).map((c) => (
              <span
                key={c.id}
                className="px-1.5 py-0.5 bg-orange-500/10 border border-orange-500/20 rounded text-[10px] text-orange-400"
              >
                {c.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CharacterTraitGenerator;
