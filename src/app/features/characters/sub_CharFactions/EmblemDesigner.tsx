'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Upload, Shield, Award, Zap, Image as ImageIcon } from 'lucide-react';
import { FactionBranding } from '@/app/types/Faction';

interface EmblemDesignerProps {
  currentBranding?: FactionBranding;
  onSave: (branding: Partial<FactionBranding>) => void;
  factionName: string;
  primaryColor: string;
}

type EmblemStyle = 'shield' | 'crest' | 'sigil' | 'custom';

const EMBLEM_STYLES: Array<{
  id: EmblemStyle;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
}> = [
  {
    id: 'shield',
    name: 'Shield',
    icon: Shield,
    description: 'Classic protective emblem for defensive factions',
  },
  {
    id: 'crest',
    name: 'Crest',
    icon: Award,
    description: 'Regal emblem for noble and prestigious factions',
  },
  {
    id: 'sigil',
    name: 'Sigil',
    icon: Zap,
    description: 'Mystical emblem for magical or arcane factions',
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: ImageIcon,
    description: 'Upload your own custom emblem image',
  },
];

const EmblemDesigner: React.FC<EmblemDesignerProps> = ({
  currentBranding,
  onSave,
  factionName,
  primaryColor,
}) => {
  const [selectedStyle, setSelectedStyle] = useState<EmblemStyle>(
    currentBranding?.emblem_style || 'shield'
  );
  const [customImage, setCustomImage] = useState<string | null>(
    currentBranding?.custom_logo_url || null
  );
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    if (currentBranding) {
      setSelectedStyle(currentBranding.emblem_style);
      setCustomImage(currentBranding.custom_logo_url || null);
    }
  }, [currentBranding]);

  const handleStyleSelect = (style: EmblemStyle) => {
    setSelectedStyle(style);
    setUploadError(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be smaller than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('File must be an image');
      return;
    }

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setCustomImage(e.target?.result as string);
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    onSave({
      emblem_style: selectedStyle,
      custom_logo_url: selectedStyle === 'custom' ? customImage || undefined : undefined,
    });
  };

  // Render emblem preview with SVG
  const renderEmblemPreview = () => {
    const initial = factionName.charAt(0).toUpperCase() || 'F';

    return (
      <motion.div
        key={selectedStyle}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="relative w-48 h-48 mx-auto"
      >
        {selectedStyle === 'custom' && customImage ? (
          <img
            src={customImage}
            alt="Custom emblem"
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))' }}
          >
            {selectedStyle === 'shield' && (
              <g>
                <path
                  d="M100 10 L170 40 L170 100 Q170 160 100 190 Q30 160 30 100 L30 40 Z"
                  fill={`${primaryColor}40`}
                  stroke={primaryColor}
                  strokeWidth="3"
                />
                <path
                  d="M100 30 L155 55 L155 100 Q155 145 100 170 Q45 145 45 100 L45 55 Z"
                  fill={`${primaryColor}20`}
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <text
                  x="100"
                  y="120"
                  fontSize="60"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill={primaryColor}
                >
                  {initial}
                </text>
              </g>
            )}
            {selectedStyle === 'crest' && (
              <g>
                <path
                  d="M100 15 L160 50 L150 130 L100 180 L50 130 L40 50 Z"
                  fill={`${primaryColor}40`}
                  stroke={primaryColor}
                  strokeWidth="3"
                />
                <circle cx="100" cy="90" r="50" fill={`${primaryColor}20`} stroke={primaryColor} strokeWidth="2" />
                <path
                  d="M70 70 L100 40 L130 70 L115 90 L85 90 Z"
                  fill={primaryColor}
                  opacity="0.3"
                />
                <text
                  x="100"
                  y="105"
                  fontSize="50"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill={primaryColor}
                >
                  {initial}
                </text>
              </g>
            )}
            {selectedStyle === 'sigil' && (
              <g>
                <circle cx="100" cy="100" r="80" fill={`${primaryColor}40`} stroke={primaryColor} strokeWidth="3" />
                <path
                  d="M100 30 L115 85 L170 85 L125 115 L145 170 L100 135 L55 170 L75 115 L30 85 L85 85 Z"
                  fill={`${primaryColor}20`}
                  stroke={primaryColor}
                  strokeWidth="2"
                />
                <circle cx="100" cy="100" r="35" fill={`${primaryColor}60`} />
                <text
                  x="100"
                  y="115"
                  fontSize="40"
                  fontWeight="bold"
                  textAnchor="middle"
                  fill="white"
                >
                  {initial}
                </text>
              </g>
            )}
          </svg>
        )}
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Emblem Style Selection */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-4">Select Emblem Style</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {EMBLEM_STYLES.map((style) => {
            const IconComponent = style.icon;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => handleStyleSelect(style.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${
                  selectedStyle === style.id
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center text-center space-y-2">
                  <IconComponent
                    size={32}
                    className={selectedStyle === style.id ? 'text-blue-400' : 'text-gray-400'}
                  />
                  <div>
                    <div className="font-medium text-white">{style.name}</div>
                    <div className="text-xs text-gray-400 mt-1">{style.description}</div>
                  </div>
                </div>
                {selectedStyle === style.id && (
                  <motion.div
                    layoutId="selected-style"
                    className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Custom Image Upload */}
      {selectedStyle === 'custom' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gray-800 rounded-lg p-4 border border-gray-700"
        >
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Upload Custom Emblem
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg cursor-pointer transition-colors">
              <Upload size={16} />
              Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-400">Max 5MB, PNG/JPG/SVG</span>
          </div>
          {uploadError && (
            <div className="mt-2 text-sm text-red-400">{uploadError}</div>
          )}
        </motion.div>
      )}

      {/* Live Preview */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Emblem Preview
        </h4>
        <AnimatePresence mode="wait">{renderEmblemPreview()}</AnimatePresence>
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            Emblem will be displayed on faction cards and member profiles
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Save size={16} />
          Save Emblem
        </button>
      </div>
    </div>
  );
};

export default EmblemDesigner;
