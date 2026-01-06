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

interface GenerationParams {
  width: number;
  height: number;
  steps: number;
  cfg_scale: number;
  num_images: number;
  provider: 'leonardo' | 'stability' | 'midjourney' | 'dalle' | 'local';
}

const ImageGenerator: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const activeProjectId = selectedProject?.id;
  const createImage = useCreateImage();

  const [promptComponents, setPromptComponents] = useState<PromptComponents>({
    artstyle: '',
    scenery: '',
    actors: '',
    actions: '',
    camera: '',
  });

  const [negativePrompt, setNegativePrompt] = useState('');
  const [generationParams, setGenerationParams] = useState<GenerationParams>({
    width: 1024,
    height: 1024,
    steps: 30,
    cfg_scale: 7.5,
    num_images: 1,
    provider: 'leonardo',
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
    <div className="h-full grid grid-cols-2 gap-4 p-4 overflow-hidden text-sm text-slate-200">
      {/* Left Panel - Prompt & Settings */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* Prompt Builder */}
        <div className="bg-slate-950/95 rounded-lg border border-slate-900/70">
          <PromptBuilder
            promptComponents={promptComponents}
            setPromptComponents={setPromptComponents}
            negativePrompt={negativePrompt}
            setNegativePrompt={setNegativePrompt}
          />
        </div>

        {/* Camera Setup */}
        <div className="bg-slate-950/95 rounded-lg border border-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-50 mb-3 tracking-tight">Camera Setup</h3>
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
        <div className="bg-slate-950/95 rounded-lg border border-slate-900/70 p-4">
          <h3 className="text-sm font-semibold text-slate-50 mb-3 tracking-tight">Generation Settings</h3>
          <GenerationControls
            params={generationParams}
            onChange={(params) => setGenerationParams(params)}
          />
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !activeProjectId}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className={`
            w-full py-3 rounded-lg font-semibold text-sm
            transition-colors duration-200 flex items-center justify-center gap-2
            ${isGenerating || !activeProjectId
              ? 'bg-slate-900/80 text-slate-500 cursor-not-allowed border border-slate-800'
              : 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/25'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Images'
          )}
        </motion.button>
      </div>

      {/* Right Panel - Gallery */}
      <div className="bg-slate-950/95 rounded-lg border border-slate-900/70 p-4 overflow-hidden">
        <h3 className="text-sm font-semibold text-slate-50 mb-3 tracking-tight">Generated Images</h3>
        <ImageGallery />
      </div>
    </div>
  );
};

export default ImageGenerator;
