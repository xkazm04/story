'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useLLM } from '@/app/hooks/useLLM';
import { sceneDescriptionPrompt } from '@/prompts';

interface SceneDescriptionEnhancerProps {
  currentDescription: string;
  onEnhanced: (enhanced: string) => void;
  sceneContext?: {
    location?: string;
    timeOfDay?: string;
    mood?: string;
    characters?: string[];
  };
}

const SceneDescriptionEnhancer: React.FC<SceneDescriptionEnhancerProps> = ({
  currentDescription,
  onEnhanced,
  sceneContext,
}) => {
  const { generateFromTemplate, isLoading } = useLLM();
  const [showContext, setShowContext] = useState(false);

  const handleEnhance = async () => {
    if (!currentDescription.trim()) {
      alert('Please enter a scene description first');
      return;
    }

    try {
      const result = await generateFromTemplate(sceneDescriptionPrompt, {
        basicDescription: currentDescription,
        location: sceneContext?.location,
        timeOfDay: sceneContext?.timeOfDay,
        mood: sceneContext?.mood,
        characters: sceneContext?.characters || [],
      });

      if (result && result.content) {
        onEnhanced(result.content);
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('Failed to enhance scene description. Make sure LLM service is running.');
    }
  };

  return (
    <div className="space-y-3">
      {/* Context Toggle */}
      {sceneContext && (
        <button
          onClick={() => setShowContext(!showContext)}
          className="text-xs text-gray-500 hover:text-gray-300"
        >
          {showContext ? 'Hide' : 'Show'} Scene Context
        </button>
      )}

      {/* Scene Context Display */}
      {showContext && sceneContext && (
        <div className="bg-gray-800 rounded-lg p-3 text-xs space-y-1">
          {sceneContext.location && (
            <div>
              <span className="text-gray-500">Location:</span> {sceneContext.location}
            </div>
          )}
          {sceneContext.timeOfDay && (
            <div>
              <span className="text-gray-500">Time:</span> {sceneContext.timeOfDay}
            </div>
          )}
          {sceneContext.mood && (
            <div>
              <span className="text-gray-500">Mood:</span> {sceneContext.mood}
            </div>
          )}
          {sceneContext.characters && sceneContext.characters.length > 0 && (
            <div>
              <span className="text-gray-500">Characters:</span>{' '}
              {sceneContext.characters.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Enhance Button */}
      <motion.button
        onClick={handleEnhance}
        disabled={isLoading || !currentDescription.trim()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200',
          isLoading || !currentDescription.trim()
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700 text-white'
        )}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enhancing Scene...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Enhance with AI
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500">
        AI will add sensory details, atmosphere, and vivid descriptions
      </p>
    </div>
  );
};

export default SceneDescriptionEnhancer;
