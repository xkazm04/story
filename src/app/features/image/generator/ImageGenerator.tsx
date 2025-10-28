'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import PromptBuilder from '../components/PromptBuilder';
import CameraSetup from './CameraSetup';
import GenerationControls from './GenerationControls';
import ImageGallery from '../components/ImageGallery';
import { useProjectStore } from '@/app/store/projectStore';
import { useCreateImage } from '@/app/hooks/useImages';
import type { PromptComponents } from '@/app/types/Image';

const ImageGenerator: React.FC = () => {
  const { activeProjectId } = useProjectStore();
  const createImage = useCreateImage();

  const [promptComponents, setPromptComponents] = useState<PromptComponents>({
    artstyle: '',
    scenery: '',
    actors: '',
    actions: '',
    camera: '',
  });

  const [negativePrompt, setNegativePrompt] = useState('');
  const [generationParams, setGenerationParams] = useState({
    width: 1024,
    height: 1024,
    steps: 30,
    cfg_scale: 7.5,
    num_images: 1,
    provider: 'leonardo' as const,
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // Combine all prompt components into final prompt
  const getFinalPrompt = () => {
    return Object.values(promptComponents)
      .filter(Boolean)
      .join(', ');
  };

  const handleGenerate = async () => {
    if (!activeProjectId) return;

    const finalPrompt = getFinalPrompt();
    if (!finalPrompt.trim()) {
      alert('Please add some prompt content before generating');
      return;
    }

    setIsGenerating(true);

    try {
      // TODO: Call actual image generation API
      // For now, we'll create a placeholder entry
      console.log('Generating image with:', {
        prompt: finalPrompt,
        negative_prompt: negativePrompt,
        ...generationParams,
      });

      // Placeholder: This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Once we have the actual image URL from the API, save it
      // await createImage.mutateAsync({
      //   project_id: activeProjectId,
      //   url: imageUrl,
      //   prompt: finalPrompt,
      //   negative_prompt: negativePrompt || null,
      //   provider: generationParams.provider,
      //   width: generationParams.width,
      //   height: generationParams.height,
      //   steps: generationParams.steps,
      //   cfg_scale: generationParams.cfg_scale,
      // });

      alert('Image generation API integration pending. Infrastructure ready!');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-2 gap-4 p-4 overflow-hidden">
      {/* Left Panel - Prompt & Settings */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* Prompt Builder */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <PromptBuilder
            promptComponents={promptComponents}
            setPromptComponents={setPromptComponents}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
          />
        </div>

        {/* Camera Setup */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Camera Setup</h3>
          <CameraSetup
            onCameraChange={(cameraPrompt) => {
              setPromptComponents((prev) => ({
                ...prev,
                camera: cameraPrompt,
              }));
            }}
          />
        </div>

        {/* Generation Controls */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Generation Settings</h3>
          <GenerationControls
            params={generationParams}
            onChange={setGenerationParams}
          />
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !activeProjectId}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full py-4 rounded-lg font-semibold text-lg
            transition-colors duration-200 flex items-center justify-center gap-2
            ${isGenerating || !activeProjectId
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Images'
          )}
        </motion.button>
      </div>

      {/* Right Panel - Gallery */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-4">Generated Images</h3>
        <ImageGallery />
      </div>
    </div>
  );
};

export default ImageGenerator;
