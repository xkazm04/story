'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video as VideoIcon, Download, Trash2, Copy, X, Play } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { useVideosByProject, useDeleteVideo } from '@/app/hooks/useVideos';
import type { GeneratedVideo } from '@/app/types/Video';

const VideoGallery: React.FC = () => {
  const { activeProjectId } = useProjectStore();
  const { data: videos, isLoading } = useVideosByProject(activeProjectId || '');
  const deleteVideo = useDeleteVideo();

  const [selectedVideo, setSelectedVideo] = useState<GeneratedVideo | null>(null);

  const handleDelete = async (videoId: string) => {
    if (!activeProjectId) return;

    const confirmed = confirm('Are you sure you want to delete this video?');
    if (!confirmed) return;

    try {
      await deleteVideo.mutateAsync({ id: videoId, projectId: activeProjectId });
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete video');
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    alert('Prompt copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading videos...</div>
      </div>
    );
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <VideoIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No videos generated yet</p>
        <p className="text-sm">Create your first video to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        {videos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
            onClick={() => setSelectedVideo(video)}
          >
            {/* Video Preview */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
              {video.thumbnail_url ? (
                <img
                  src={video.thumbnail_url}
                  alt={video.prompt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <VideoIcon className="w-12 h-12 text-gray-600" />
              )}

              {/* Play Icon Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                <Play className="w-12 h-12 text-white" fill="white" />
              </div>
            </div>

            {/* Overlay Actions */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPrompt(video.prompt);
                }}
                className="p-2 bg-gray-900 bg-opacity-80 rounded-lg hover:bg-gray-800"
              >
                <Copy className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(video.id);
                }}
                className="p-2 bg-gray-900 bg-opacity-80 rounded-lg hover:bg-red-600"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Info Badge */}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between">
              <span className="px-2 py-1 bg-black bg-opacity-70 rounded text-xs text-white">
                {video.duration}s
              </span>
              <span className="px-2 py-1 bg-black bg-opacity-70 rounded text-xs text-white">
                {video.provider}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedVideo(null)}
          >
            <div
              className="relative max-w-6xl w-full bg-gray-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedVideo(null)}
                className="absolute top-4 right-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                {/* Video Player */}
                <div className="bg-gray-950 flex items-center justify-center p-4">
                  {selectedVideo.url ? (
                    <video
                      src={selectedVideo.url}
                      controls
                      autoPlay
                      loop
                      className="max-w-full max-h-[80vh] rounded"
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <VideoIcon className="w-24 h-24 text-gray-600" />
                  )}
                </div>

                {/* Details */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                  <h3 className="text-xl font-semibold text-white mb-4">Video Details</h3>

                  {/* Prompt */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Prompt
                    </label>
                    <p className="text-white text-sm bg-gray-800 p-3 rounded-lg">
                      {selectedVideo.prompt}
                    </p>
                  </div>

                  {/* Parameters */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Resolution</label>
                      <p className="text-white">
                        {selectedVideo.width}x{selectedVideo.height}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Provider</label>
                      <p className="text-white">{selectedVideo.provider}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Duration</label>
                      <p className="text-white">{selectedVideo.duration}s</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">FPS</label>
                      <p className="text-white">{selectedVideo.fps}</p>
                    </div>
                    {selectedVideo.style && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Style</label>
                        <p className="text-white">{selectedVideo.style}</p>
                      </div>
                    )}
                    {selectedVideo.motion_strength && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Motion</label>
                        <p className="text-white">{selectedVideo.motion_strength.toFixed(1)}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyPrompt(selectedVideo.prompt)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Prompt
                    </button>
                    <button
                      onClick={() => handleDelete(selectedVideo.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default VideoGallery;
