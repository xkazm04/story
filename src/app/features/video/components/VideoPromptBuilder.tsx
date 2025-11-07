'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Wand2 } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import {
  videoPromptEnhancementPrompt,
  motionDescriptionPrompt,
  smartVideoGenerationPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherSceneContext,
  gatherVisualStyleContext,
  gatherSceneCharacters
} from '@/prompts';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { SmartGenerateButton } from '@/app/components/UI/SmartGenerateButton';

interface VideoPromptBuilderProps {
  prompt: string;
  setPrompt: (value: string) => void;
  duration: number;
  motionStrength: number;
  style: string;
}

const VideoPromptBuilder: React.FC<VideoPromptBuilderProps> = ({
  prompt,
  setPrompt,
  duration,
  motionStrength,
  style,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();
  const { selectedProject, selectedScene } = useProjectStore();
  const [error, setError] = useState('');

  const handleEnhance = async () => {
    if (!prompt.trim()) {
      alert('Please enter a basic prompt first');
      return;
    }

    setError('');

    try {
      const result = await generateFromTemplate(videoPromptEnhancementPrompt, {
        currentPrompt: prompt,
        duration,
        motionStrength,
        style,
      });

      if (result && result.content) {
        setPrompt(result.content);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      setError('Failed to enhance prompt. Make sure LLM service is running.');
    }
  };

  const handleGenerateMotion = async () => {
    if (!prompt.trim()) {
      alert('Please enter an image description first');
      return;
    }

    setError('');

    try {
      const result = await generateFromTemplate(motionDescriptionPrompt, {
        imageDescription: prompt,
        motionStrength,
        duration,
        style,
      });

      if (result && result.content) {
        setPrompt(`${prompt}\n\n${result.content}`);
      }
    } catch (error) {
      console.error('Motion generation error:', error);
      setError('Failed to generate motion. Make sure LLM service is running.');
    }
  };

  const handleSmartGenerate = async () => {
    if (!selectedProject) {
      setError('No active project. Smart generation requires project context.');
      return;
    }

    if (!selectedScene) {
      setError('No scene selected. Please select a scene for context-aware generation.');
      return;
    }

    setError('');

    try {
      // Gather rich context
      const [projectCtx, storyCtx, sceneCtx, visualCtx, characters] = await Promise.all([
        gatherProjectContext(selectedProject.id),
        gatherStoryContext(selectedProject.id),
        gatherSceneContext(selectedScene.id),
        gatherVisualStyleContext(selectedProject.id),
        gatherSceneCharacters(selectedScene.id)
      ]);

      // Generate smart video prompt
      const result = await generateFromTemplate(smartVideoGenerationPrompt, {
        basicPrompt: prompt || 'Generate video based on scene context',
        projectContext: projectCtx,
        sceneContext: sceneCtx,
        characters: characters,
        visualStyleContext: visualCtx,
        duration,
        previousShots: [] // Could be enhanced to track previous shots
      });

      if (result && result.content) {
        // Clean up markdown formatting
        const cleanedContent = result.content
          .replace(/\*\*/g, '')
          .replace(/^#+\s/gm, '')
          .trim();

        setPrompt(cleanedContent);
      }
    } catch (error) {
      console.error('Smart generation error:', error);
      setError('Failed to generate smart video prompt. Make sure LLM service is running.');
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Video Prompt
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the video scene, action, and motion... e.g., 'A warrior walking through a misty forest, camera slowly panning left to right, sunlight breaking through the trees'"
          rows={6}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* AI Enhancement Buttons */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <motion.button
            onClick={handleEnhance}
            disabled={isLoading || !prompt.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${isLoading || !prompt.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-purple-600 hover:bg-purple-700 text-white'
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

          <motion.button
            onClick={handleGenerateMotion}
            disabled={isLoading || !prompt.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
              flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium
              transition-colors duration-200
              ${isLoading || !prompt.trim()
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }
            `}
          >
            <Wand2 className="w-4 h-4" />
            Add Motion
          </motion.button>
        </div>

        {/* Smart Generation Button */}
        {selectedProject && selectedScene && (
          <div className="flex justify-center">
            <SmartGenerateButton
              onClick={handleSmartGenerate}
              isLoading={isLoading}
              disabled={isLoading}
              label="Context-Aware Video Generation"
              size="md"
              variant="primary"
            />
          </div>
        )}

        {error && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded p-2">
            {error}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>
          <strong>Enhance:</strong> Adds camera movement, motion details, and temporal progression
        </p>
        <p>
          <strong>Add Motion:</strong> Generates natural motion for a static scene description
        </p>
        {selectedProject && selectedScene && (
          <p>
            <strong>Context-Aware:</strong> Uses project, scene, and character context for cinematic continuity
          </p>
        )}
      </div>
    </div>
  );
};

export default VideoPromptBuilder;
