'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Download, Trash2, Copy, MoreVertical, X } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { useImagesByProject, useDeleteImage } from '@/app/hooks/useImages';
import type { GeneratedImage } from '@/app/types/Image';
import { ConfirmationModal } from '@/app/components/UI/ConfirmationModal';

const ImageGallery: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const { data: images, isLoading } = useImagesByProject(selectedProject?.id || '');
  const deleteImage = useDeleteImage();

  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
  };

  const handleDelete = async () => {
    if (!selectedProject?.id || !imageToDelete) return;

    setIsDeleting(true);
    try {
      await deleteImage.mutateAsync({ id: imageToDelete, projectId: selectedProject.id });
      setImageToDelete(null);
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyPrompt = (prompt: string) => {
    navigator.clipboard.writeText(prompt);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading images...</div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg font-medium">No images generated yet</p>
        <p className="text-sm">Create your first image to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        {images.map((image) => (
          <motion.div
            key={image.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
            onClick={() => setSelectedImage(image)}
          >
            {/* Image Preview */}
            <div className="aspect-square bg-gray-900 flex items-center justify-center">
              {image.url ? (
                <img
                  src={image.thumbnail_url || image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-600" />
              )}
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyPrompt(image.prompt);
                }}
                className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(image.id);
                }}
                className="p-2 bg-gray-800 rounded-lg hover:bg-red-600"
                data-testid="image-delete-btn"
                aria-label="Delete image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Provider Badge */}
            <div className="absolute top-2 right-2 px-2 py-1 bg-black bg-opacity-70 rounded text-xs text-white">
              {image.provider}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-5xl w-full bg-gray-900 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-2 gap-4">
                {/* Image */}
                <div className="bg-gray-950 flex items-center justify-center p-4">
                  {selectedImage.url ? (
                    <img
                      src={selectedImage.url}
                      alt={selectedImage.prompt}
                      className="max-w-full max-h-[80vh] object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-24 h-24 text-gray-600" />
                  )}
                </div>

                {/* Details */}
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                  <h3 className="text-xl font-semibold text-white mb-4">Image Details</h3>

                  {/* Prompt */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Prompt
                    </label>
                    <p className="text-white text-sm bg-gray-800 p-3 rounded-lg">
                      {selectedImage.prompt}
                    </p>
                  </div>

                  {/* Negative Prompt */}
                  {selectedImage.negative_prompt && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Negative Prompt
                      </label>
                      <p className="text-white text-sm bg-gray-800 p-3 rounded-lg">
                        {selectedImage.negative_prompt}
                      </p>
                    </div>
                  )}

                  {/* Parameters */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Size</label>
                      <p className="text-white">
                        {selectedImage.width}x{selectedImage.height}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Provider</label>
                      <p className="text-white">{selectedImage.provider}</p>
                    </div>
                    {selectedImage.steps && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Steps</label>
                        <p className="text-white">{selectedImage.steps}</p>
                      </div>
                    )}
                    {selectedImage.cfg_scale && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">
                          CFG Scale
                        </label>
                        <p className="text-white">{selectedImage.cfg_scale}</p>
                      </div>
                    )}
                    {selectedImage.seed && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Seed</label>
                        <p className="text-white">{selectedImage.seed}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyPrompt(selectedImage.prompt)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Prompt
                    </button>
                    <button
                      onClick={() => handleDeleteClick(selectedImage.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
                      data-testid="image-detail-delete-btn"
                      aria-label="Delete image"
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!imageToDelete}
        onClose={() => setImageToDelete(null)}
        onConfirm={handleDelete}
        type="danger"
        title="Delete Image"
        message="Are you sure you want to delete this image? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
};

export default ImageGallery;
