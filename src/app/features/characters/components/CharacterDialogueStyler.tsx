'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useLLM } from '@/app/hooks/useLLM';
import { characterDialoguePrompt } from '@/prompts';

interface CharacterDialogueStylerProps {
  characterName: string;
  traits?: string[];
  background?: string;
  personality?: string;
  onStyleGenerated: (dialogueStyle: string) => void;
}

const CharacterDialogueStyler: React.FC<CharacterDialogueStylerProps> = ({
  characterName,
  traits = [],
  background,
  personality,
  onStyleGenerated,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();

  const handleGenerate = async () => {
    if (!characterName.trim()) {
      alert('Character name is required');
      return;
    }

    try {
      const result = await generateFromTemplate(characterDialoguePrompt, {
        characterName,
        traits,
        background,
        personality,
      });

      if (result && result.content) {
        onStyleGenerated(result.content);
      }
    } catch (error) {
      console.error('Dialogue style generation error:', error);
      alert('Failed to generate dialogue style. Make sure LLM service is running.');
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-cyan-500" />
        <h4 className="text-sm font-semibold text-white">AI Dialogue Style Generator</h4>
      </div>

      <p className="text-xs text-gray-400">
        Generate a unique dialogue style and speaking patterns for this character
      </p>

      {/* Character Context */}
      {(traits.length > 0 || personality) && (
        <div className="text-xs text-gray-500 space-y-1">
          {personality && (
            <div>
              <span className="text-gray-600">Personality:</span> {personality}
            </div>
          )}
          {traits.length > 0 && (
            <div>
              <span className="text-gray-600">Key Traits:</span> {traits.slice(0, 3).join(', ')}
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
        className={cn(
          'w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
          isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-cyan-600 hover:bg-cyan-700 text-white'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating Style...
          </>
        ) : (
          <>
            <MessageCircle className="w-4 h-4" />
            Generate Dialogue Style
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500">
        AI will suggest speech patterns, vocabulary, tone, and unique verbal quirks
      </p>
    </div>
  );
};

export default CharacterDialogueStyler;
