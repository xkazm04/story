'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, Loader2 } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import { negativePromptSuggestionPrompt } from '@/prompts';

interface NegativePromptGeneratorProps {
  mainPrompt: string;
  onGenerated: (negativePrompt: string) => void;
}

const NegativePromptGenerator: React.FC<NegativePromptGeneratorProps> = ({
  mainPrompt,
  onGenerated,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();

  const handleGenerate = async () => {
    if (!mainPrompt.trim()) {
      alert('Please fill in some prompt sections first');
      return;
    }

    try {
      const result = await generateFromTemplate(negativePromptSuggestionPrompt, {
        mainPrompt,
        imageType: 'general',
      });

      if (result && result.content) {
        onGenerated(result.content);
      }
    } catch (error) {
      console.error('Negative prompt generation error:', error);
      alert('Failed to generate negative prompt. Make sure LLM service is running.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <motion.button
        onClick={handleGenerate}
        disabled={isLoading || !mainPrompt.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
          transition-colors duration-200
          ${isLoading || !mainPrompt.trim()
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
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
            <Wand2 className="w-4 h-4" />
            Generate with AI
          </>
        )}
      </motion.button>

      <span className="text-xs text-gray-500">
        AI will suggest things to avoid
      </span>
    </div>
  );
};

export default NegativePromptGenerator;
