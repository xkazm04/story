'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import {
  imagePromptEnhancementPrompt,
  smartImageGenerationPrompt,
  gatherProjectContext,
  gatherVisualStyleContext,
  gatherCharacterContext
} from '@/prompts';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacterStore } from '@/app/store/slices/characterSlice';
import { SmartGenerateButton } from '@/app/components/UI/SmartGenerateButton';

interface PromptEnhancerProps {
  currentPrompt: string;
  promptType: string;
  onEnhanced: (enhancedPrompt: string) => void;
}

const PromptEnhancer: React.FC<PromptEnhancerProps> = ({
  currentPrompt,
  promptType,
  onEnhanced,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();
  const { selectedProject } = useProjectStore();
  const { selectedCharacterId } = useCharacterStore();
  const [error, setError] = useState('');

  const handleEnhance = async () => {
    if (!currentPrompt.trim()) {
      alert('Please enter some text to enhance');
      return;
    }

    setError('');

    try {
      const result = await generateFromTemplate(imagePromptEnhancementPrompt, {
        currentPrompt,
        promptType,
        style: 'detailed and descriptive',
      });

      if (result && result.content) {
        onEnhanced(result.content);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      setError('Failed to enhance prompt. Make sure LLM service is running.');
    }
  };

  const handleSmartGenerate = async () => {
    if (!selectedProject) {
      setError('No active project. Smart generation requires project context.');
      return;
    }

    setError('');

    try {
      // Gather rich context
      const [projectCtx, visualCtx] = await Promise.all([
        gatherProjectContext(selectedProject.id),
        gatherVisualStyleContext(selectedProject.id),
      ]);

      // If a character is selected, get character context
      let characterCtx = null;
      if (selectedCharacterId) {
        characterCtx = await gatherCharacterContext(selectedCharacterId);
      }

      // Determine image type based on prompt type and context
      const imageTypeMap: Record<string, string> = {
        actors: 'character',
        scenery: 'scene',
        artstyle: 'concept',
        actions: 'scene',
      };

      const imageType = imageTypeMap[promptType] || 'general';

      // Generate smart prompt
      const result = await generateFromTemplate(smartImageGenerationPrompt, {
        basicPrompt: currentPrompt || `Generate ${promptType} based on project context`,
        imageType,
        projectContext: projectCtx,
        visualStyleContext: visualCtx,
        characters: characterCtx ? [characterCtx] : [],
      });

      if (result && result.content) {
        // Clean up markdown formatting
        const cleanedContent = result.content
          .replace(/\*\*/g, '')
          .replace(/^#+\s/gm, '')
          .trim();

        onEnhanced(cleanedContent);
      }
    } catch (error) {
      console.error('Smart generation error:', error);
      setError('Failed to generate smart prompt. Make sure LLM service is running.');
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {/* Basic Enhancement */}
        <motion.button
          onClick={handleEnhance}
          disabled={isLoading || !currentPrompt.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
            transition-colors duration-200
            ${isLoading || !currentPrompt.trim()
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Enhancing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Enhance
            </>
          )}
        </motion.button>

        {/* Smart Generation Button */}
        {selectedProject && (
          <SmartGenerateButton
            onClick={handleSmartGenerate}
            isLoading={isLoading}
            disabled={isLoading}
            label="Context-Aware"
            size="sm"
            variant="ghost"
          />
        )}

        <span className="text-xs text-gray-500">
          {selectedProject
            ? 'Use project context for consistency'
            : 'Basic enhancement'}
        </span>
      </div>

      {error && (
        <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default PromptEnhancer;
