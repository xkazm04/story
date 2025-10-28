'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Image as ImageIcon, FileText, Shield, Camera, Trash2, X } from 'lucide-react';
import { FactionMedia } from '@/app/types/Faction';
import ColoredBorder from '@/app/components/UI/ColoredBorder';

interface FactionMediaGalleryProps {
  media: FactionMedia[];
  factionId: string;
  isLeader: boolean;
  onUploadClick: () => void;
  onDeleteMedia: (mediaId: string) => void;
}

type MediaTypeFilter = 'all' | 'logo' | 'banner' | 'emblem' | 'screenshot' | 'lore';

const MEDIA_TYPE_ICONS = {
  logo: Shield,
  banner: ImageIcon,
  emblem: Shield,
  screenshot: Camera,
  lore: FileText,
};

const MEDIA_TYPE_LABELS = {
  logo: 'Logos',
  banner: 'Banners',
  emblem: 'Emblems',
  screenshot: 'Screenshots',
  lore: 'Lore Documents',
};

const FactionMediaGallery: React.FC<FactionMediaGalleryProps> = ({
  media,
  factionId,
  isLeader,
  onUploadClick,
  onDeleteMedia,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<MediaTypeFilter>('all');
  const [selectedMedia, setSelectedMedia] = useState<FactionMedia | null>(null);

  // Filter media by type
  const filteredMedia = selectedFilter === 'all'
    ? media
    : media.filter(m => m.type === selectedFilter);

  // Get featured media (first logo or banner)
  const featuredMedia = media.find(m => m.type === 'logo') || media.find(m => m.type === 'banner');

  // Count by type
  const mediaTypeCount = media.reduce((acc, m) => {
    acc[m.type] = (acc[m.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleDeleteClick = (e: React.MouseEvent, mediaId: string) => {
    e.stopPropagation();
    if (confirm('Delete this media? This cannot be undone.')) {
      onDeleteMedia(mediaId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Featured Media Section */}
      {featuredMedia && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gray-900 rounded-lg border border-gray-800 overflow-hidden"
        >
          <ColoredBorder color="purple" />
          <div className="relative h-48 bg-gradient-to-br from-purple-900/20 to-blue-900/20">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              {featuredMedia.url ? (
                <img
                  src={featuredMedia.url}
                  alt={featuredMedia.description || 'Featured media'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-600 text-6xl font-bold">
                  {featuredMedia.type.charAt(0).toUpperCase()}
                </div>
              )}
            </motion.div>
            {/* Glass-morphism overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/40 backdrop-blur-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold">Featured {featuredMedia.type}</p>
                  {featuredMedia.description && (
                    <p className="text-gray-300 text-sm">{featuredMedia.description}</p>
                  )}
                </div>
                <div className="text-gray-400 text-xs">
                  {new Date(featuredMedia.uploaded_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Header with Upload Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <ImageIcon size={18} />
          Media Gallery ({media.length})
        </h3>
        {isLeader && (
          <button
            onClick={onUploadClick}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Upload size={16} />
            Upload Media
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-4 py-2 rounded-lg transition-all ${
            selectedFilter === 'all'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
          }`}
        >
          All ({media.length})
        </button>
        {Object.entries(MEDIA_TYPE_LABELS).map(([type, label]) => {
          const count = mediaTypeCount[type] || 0;
          const Icon = MEDIA_TYPE_ICONS[type as keyof typeof MEDIA_TYPE_ICONS];
          return (
            <button
              key={type}
              onClick={() => setSelectedFilter(type as MediaTypeFilter)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedFilter === type
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Icon size={14} />
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Media Grid */}
      {filteredMedia.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          layout
        >
          <AnimatePresence mode="popLayout">
            {filteredMedia.map((mediaItem, index) => {
              const Icon = MEDIA_TYPE_ICONS[mediaItem.type];
              return (
                <motion.div
                  key={mediaItem.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedMedia(mediaItem)}
                  className="relative group cursor-pointer"
                >
                  <div className="relative bg-gray-900 rounded-lg border border-gray-800 overflow-hidden aspect-square hover:border-purple-500 transition-colors">
                    {/* Skeleton/Placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      {mediaItem.url ? (
                        <img
                          src={mediaItem.url}
                          alt={mediaItem.description || mediaItem.type}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Icon size={48} className="text-gray-600" />
                      )}
                    </div>

                    {/* Glass-morphism hover overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm p-4 flex flex-col justify-between"
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-xs px-2 py-1 bg-purple-600 text-white rounded-full">
                          {mediaItem.type}
                        </span>
                        {isLeader && (
                          <button
                            onClick={(e) => handleDeleteClick(e, mediaItem.id)}
                            className="p-1 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <div>
                        {mediaItem.description && (
                          <p className="text-white text-sm font-medium mb-1 line-clamp-2">
                            {mediaItem.description}
                          </p>
                        )}
                        <p className="text-gray-300 text-xs">
                          {new Date(mediaItem.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-12">
          <ColoredBorder color="gray" />
          <div className="text-center text-gray-400">
            <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
            <p>No {selectedFilter === 'all' ? '' : selectedFilter} media uploaded yet</p>
            {isLeader && (
              <button
                onClick={onUploadClick}
                className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
              >
                Upload your first media
              </button>
            )}
          </div>
        </div>
      )}

      {/* Media Detail Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 rounded-lg border border-gray-800 max-w-4xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="relative p-6">
                <ColoredBorder color="purple" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      {selectedMedia.description || `${selectedMedia.type} media`}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        {React.createElement(MEDIA_TYPE_ICONS[selectedMedia.type], { size: 14 })}
                        {selectedMedia.type}
                      </span>
                      <span>{new Date(selectedMedia.uploaded_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedMedia(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                <div className="bg-gray-800 rounded-lg overflow-hidden">
                  {selectedMedia.url ? (
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.description || selectedMedia.type}
                      className="w-full max-h-[60vh] object-contain"
                    />
                  ) : (
                    <div className="h-96 flex items-center justify-center">
                      {React.createElement(MEDIA_TYPE_ICONS[selectedMedia.type], {
                        size: 96,
                        className: 'text-gray-600',
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactionMediaGallery;
