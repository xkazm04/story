'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clapperboard, Loader2 } from 'lucide-react';
import { useLLM } from '@/app/hooks/useLLM';
import { storyboardGenerationPrompt } from '@/prompts';
import { useCreateStoryboard, useCreateStoryboardFrame } from '@/app/hooks/useVideos';
import { useProjectStore } from '@/app/store/slices/projectSlice';

interface SceneToStoryboardProps {
  sceneId: string;
  sceneDescription: string;
  dialogue?: string;
  onStoryboardCreated?: (storyboardId: string) => void;
}

const SceneToStoryboard: React.FC<SceneToStoryboardProps> = ({
  sceneId,
  sceneDescription,
  dialogue,
  onStoryboardCreated,
}) => {
  const { generateFromTemplate, isLoading: llmLoading } = useLLM();
  const { selectedProject } = useProjectStore();
  const createStoryboard = useCreateStoryboard();
  const createFrame = useCreateStoryboardFrame();

  const [shotCount, setShotCount] = useState(4);
  const [totalDuration, setTotalDuration] = useState(20);
  const [style, setStyle] = useState('cinematic');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedProject?.id || !sceneDescription.trim()) {
      alert('Please provide a scene description');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate storyboard shots with LLM
      const result = await generateFromTemplate(storyboardGenerationPrompt, {
        sceneDescription,
        dialogue,
        duration: totalDuration,
        shotCount,
        style,
      });

      if (!result || !result.content) {
        throw new Error('No storyboard generated');
      }

      // Parse the JSON response
      const shots = JSON.parse(result.content);

      // Create storyboard in database
      const storyboard = await createStoryboard.mutateAsync({
        project_id: selectedProject.id,
        name: `Storyboard for Scene`,
        description: sceneDescription,
        total_duration: totalDuration,
      });

      // Create frames for each shot
      for (const shot of shots) {
        await createFrame.mutateAsync({
          storyboard_id: storyboard.id,
          order: shot.shot - 1,
          prompt: shot.prompt,
          duration: shot.duration,
          transition: shot.transition || 'cut',
          notes: `${shot.shotType}, ${shot.cameraMovement}, ${shot.action}`,
        });
      }

      alert(`Storyboard created with ${shots.length} shots!`);
      onStoryboardCreated?.(storyboard.id);
    } catch (error) {
      console.error('Storyboard generation error:', error);
      alert('Failed to generate storyboard. Make sure LLM service is running.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isLoading = llmLoading || isGenerating;

  return (
    <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Clapperboard className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-semibold text-white">Generate Video Storyboard</h3>
      </div>

      <p className="text-sm text-gray-400">
        Convert this scene into a shot-by-shot storyboard for video generation
      </p>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Number of Shots
          </label>
          <input
            type="number"
            min="2"
            max="10"
            value={shotCount}
            onChange={(e) => setShotCount(parseInt(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Total Duration (seconds)
          </label>
          <input
            type="number"
            min="5"
            max="60"
            value={totalDuration}
            onChange={(e) => setTotalDuration(parseInt(e.target.value))}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Visual Style
        </label>
        <select
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="cinematic">Cinematic</option>
          <option value="realistic">Realistic</option>
          <option value="anime">Anime</option>
          <option value="3d-animation">3D Animation</option>
          <option value="artistic">Artistic</option>
        </select>
      </div>

      {/* Generate Button */}
      <motion.button
        onClick={handleGenerate}
        disabled={isLoading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold
          transition-colors duration-200
          ${isLoading
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
            : 'bg-purple-600 hover:bg-purple-700 text-white'
          }
        `}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generating Storyboard...
          </>
        ) : (
          <>
            <Clapperboard className="w-5 h-5" />
            Generate Storyboard
          </>
        )}
      </motion.button>

      <p className="text-xs text-gray-500">
        AI will break down the scene into cinematic shots with camera angles and motion
      </p>
    </div>
  );
};

export default SceneToStoryboard;
