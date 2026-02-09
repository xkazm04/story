'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useLLM } from '@/app/hooks/useLLM';
import { dialogueImprovementPrompt } from '@/prompts';

interface DialogueImproverProps {
  dialogue: string;
  onImproved: (improved: string) => void;
  context?: {
    characterName?: string;
    characterTraits?: string[];
    sceneContext?: string;
    emotionalState?: string;
  };
}

const DialogueImprover: React.FC<DialogueImproverProps> = ({
  dialogue,
  onImproved,
  context,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();

  const handleImprove = async () => {
    if (!dialogue.trim()) {
      alert('Please enter dialogue text first');
      return;
    }

    try {
      const result = await generateFromTemplate(dialogueImprovementPrompt, {
        dialogue,
        characterName: context?.characterName,
        characterTraits: context?.characterTraits || [],
        sceneContext: context?.sceneContext,
        emotionalState: context?.emotionalState,
      });

      if (result && result.content) {
        onImproved(result.content);
      }
    } catch (error) {
      console.error('Improvement error:', error);
      alert('Failed to improve dialogue. Make sure LLM service is running.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Context Display */}
      {context && (
        <div className="bg-gray-800 rounded-lg p-3 text-xs space-y-1">
          {context.characterName && (
            <div>
              <span className="text-gray-500">Character:</span> {context.characterName}
            </div>
          )}
          {context.emotionalState && (
            <div>
              <span className="text-gray-500">Emotional State:</span> {context.emotionalState}
            </div>
          )}
          {context.characterTraits && context.characterTraits.length > 0 && (
            <div>
              <span className="text-gray-500">Traits:</span>{' '}
              {context.characterTraits.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Improve Button */}
      <motion.button
        onClick={handleImprove}
        disabled={isLoading || !dialogue.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
          isLoading || !dialogue.trim()
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Improving Dialogue...
          </>
        ) : (
          <>
            <MessageSquare className="w-4 h-4" />
            Improve Dialogue with AI
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500">
        AI will make dialogue more natural, character-appropriate, and engaging
      </p>
    </div>
  );
};

export default DialogueImprover;
