'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import VideoPromptBuilder from '../components/VideoPromptBuilder';
import VideoSettings, { VideoParams } from './VideoSettings';
import VideoGallery from '../components/VideoGallery';
import { useProjectStore } from '@/app/store/projectStore';
import { useCreateVideo } from '@/app/hooks/useVideos';

const VideoGenerator: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const createVideo = useCreateVideo();

  const [prompt, setPrompt] = useState('');
  const [videoParams, setVideoParams] = useState<VideoParams>({
    width: 1280,
    height: 720,
    duration: 4,
    fps: 30,
    motion_strength: 0.5,
    style: 'cinematic',
    provider: 'runway',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedProject?.id) return;

    if (!prompt.trim()) {
      alert('Please enter a video prompt');
      return;
    }

    setIsGenerating(true);

    try {
      // TODO: Call actual video generation API
      console.log('Generating video with:', {
        prompt,
        ...videoParams,
      });

      // Placeholder: This would be replaced with actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert('Video generation API integration pending. Infrastructure ready!');
    } catch (error) {
      console.error('Generation error:', error);
      alert('Failed to generate video');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full grid grid-cols-2 gap-4 p-4 overflow-hidden">
      {/* Left Panel - Prompt & Settings */}
      <div className="flex flex-col gap-4 overflow-y-auto">
        {/* Video Prompt Builder */}
        <div className="bg-gray-900 rounded-lg border border-gray-800">
          <VideoPromptBuilder
            prompt={prompt}
            setPrompt={setPrompt}
            duration={videoParams.duration}
            motionStrength={videoParams.motion_strength}
            style={videoParams.style}
          />
        </div>

        {/* Video Settings */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-4">
          <h3 className="text-lg font-semibold text-white mb-4">Video Settings</h3>
          <VideoSettings
            params={videoParams}
            onChange={(params) => setVideoParams(params)}
          />
        </div>

        {/* Generate Button */}
        <motion.button
          onClick={handleGenerate}
          disabled={isGenerating || !selectedProject?.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`
            w-full py-4 rounded-lg font-semibold text-lg
            transition-colors duration-200 flex items-center justify-center gap-2
            ${isGenerating || !selectedProject?.id
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700 text-white'
            }
          `}
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating Video...
            </>
          ) : (
            'Generate Video'
          )}
        </motion.button>
      </div>

      {/* Right Panel - Gallery */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-4 overflow-hidden">
        <h3 className="text-lg font-semibold text-white mb-4">Generated Videos</h3>
        <VideoGallery />
      </div>
    </div>
  );
};

export default VideoGenerator;
