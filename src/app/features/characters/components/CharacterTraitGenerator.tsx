'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Plus } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import { characterTraitPrompt } from '@/prompts';

interface CharacterTraitGeneratorProps {
  characterName: string;
  characterType?: string;
  existingTraits?: string[];
  role?: string;
  background?: string;
  onTraitGenerated: (trait: string) => void;
}

const CharacterTraitGenerator: React.FC<CharacterTraitGeneratorProps> = ({
  characterName,
  characterType,
  existingTraits = [],
  role,
  background,
  onTraitGenerated,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();
  const [traitCount, setTraitCount] = useState(3);

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
    </div>
  );
};

export default CharacterTraitGenerator;
