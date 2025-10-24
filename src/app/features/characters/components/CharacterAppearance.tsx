'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, Eye, Palette } from 'lucide-react';
import { characterApi } from '@/app/api/characters';
import { Appearance, defaultAppearance } from '@/app/types/Character';
import ColoredBorder from '@/app/components/UI/ColoredBorder';

interface CharacterAppearanceProps {
  characterId: string;
}

const CharacterAppearance: React.FC<CharacterAppearanceProps> = ({
  characterId,
}) => {
  const { data: character } = characterApi.useGetCharacter(characterId);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');

  // Initialize appearance from character data (if available)
  useEffect(() => {
    // In a real app, you'd fetch appearance data from the backend
    // For now, we'll use the default
    if (character) {
      // If character has appearance data stored, load it here
    }
  }, [character]);

  // Generate description from appearance
  useEffect(() => {
    const parts = [];
    
    if (appearance.gender) parts.push(appearance.gender);
    if (appearance.age) parts.push(appearance.age);
    if (appearance.skinColor) parts.push(`${appearance.skinColor} skin`);
    if (appearance.height) parts.push(`${appearance.height} height`);
    if (appearance.bodyType) parts.push(`${appearance.bodyType} build`);
    
    if (appearance.face.hairColor && appearance.face.hairStyle) {
      parts.push(`${appearance.face.hairColor} ${appearance.face.hairStyle} hair`);
    }
    if (appearance.face.eyeColor) parts.push(`${appearance.face.eyeColor} eyes`);
    if (appearance.face.facialHair) parts.push(appearance.face.facialHair);
    
    if (appearance.clothing.style) {
      parts.push(`wearing ${appearance.clothing.style}`);
      if (appearance.clothing.color) {
        parts.push(`in ${appearance.clothing.color}`);
      }
    }
    
    if (appearance.customFeatures) parts.push(appearance.customFeatures);
    
    setGeneratedDescription(parts.join(', '));
  }, [appearance]);

  const handleChange = (category: keyof Appearance | null, field: string, value: string) => {
    if (category === 'face' || category === 'clothing') {
      setAppearance((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    } else {
      setAppearance((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, save appearance data to backend
      // await characterApi.updateCharacter(characterId, { appearance });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save appearance:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
          <Palette size={18} />
          Physical Appearance
        </h3>
        <p className="text-sm text-gray-400">
          Define physical traits to generate a detailed description for AI image generation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Attributes */}
        <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          <ColoredBorder color="blue" />
          <h4 className="font-semibold text-white mb-4">Basic Attributes</h4>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
            <input
              type="text"
              value={appearance.gender}
              onChange={(e) => handleChange(null, 'gender', e.target.value)}
              placeholder="e.g., Male, Female, Non-binary"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
            <input
              type="text"
              value={appearance.age}
              onChange={(e) => handleChange(null, 'age', e.target.value)}
              placeholder="e.g., Young, Adult, Elderly"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Skin Color</label>
            <input
              type="text"
              value={appearance.skinColor}
              onChange={(e) => handleChange(null, 'skinColor', e.target.value)}
              placeholder="e.g., Fair, Tan, Dark"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Body Type</label>
            <input
              type="text"
              value={appearance.bodyType}
              onChange={(e) => handleChange(null, 'bodyType', e.target.value)}
              placeholder="e.g., Athletic, Slim, Muscular"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Height</label>
            <input
              type="text"
              value={appearance.height}
              onChange={(e) => handleChange(null, 'height', e.target.value)}
              placeholder="e.g., Short, Average, Tall"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Facial Features */}
        <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          <ColoredBorder color="purple" />
          <h4 className="font-semibold text-white mb-4">Facial Features</h4>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Face Shape</label>
            <input
              type="text"
              value={appearance.face.shape}
              onChange={(e) => handleChange('face', 'shape', e.target.value)}
              placeholder="e.g., Oval, Round, Square"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Eye Color</label>
            <input
              type="text"
              value={appearance.face.eyeColor}
              onChange={(e) => handleChange('face', 'eyeColor', e.target.value)}
              placeholder="e.g., Blue, Brown, Green"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hair Color</label>
            <input
              type="text"
              value={appearance.face.hairColor}
              onChange={(e) => handleChange('face', 'hairColor', e.target.value)}
              placeholder="e.g., Black, Blonde, Red"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Hair Style</label>
            <input
              type="text"
              value={appearance.face.hairStyle}
              onChange={(e) => handleChange('face', 'hairStyle', e.target.value)}
              placeholder="e.g., Short, Long, Curly"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Facial Hair</label>
            <input
              type="text"
              value={appearance.face.facialHair}
              onChange={(e) => handleChange('face', 'facialHair', e.target.value)}
              placeholder="e.g., Beard, Mustache, Clean-shaven"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Special Features
            </label>
            <input
              type="text"
              value={appearance.face.features}
              onChange={(e) => handleChange('face', 'features', e.target.value)}
              placeholder="e.g., Scar, Tattoo, Freckles"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Clothing */}
        <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          <ColoredBorder color="green" />
          <h4 className="font-semibold text-white mb-4">Clothing & Style</h4>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Clothing Style</label>
            <input
              type="text"
              value={appearance.clothing.style}
              onChange={(e) => handleChange('clothing', 'style', e.target.value)}
              placeholder="e.g., Casual, Formal, Armor"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Primary Colors</label>
            <input
              type="text"
              value={appearance.clothing.color}
              onChange={(e) => handleChange('clothing', 'color', e.target.value)}
              placeholder="e.g., Black, Blue, Red"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Accessories</label>
            <input
              type="text"
              value={appearance.clothing.accessories}
              onChange={(e) => handleChange('clothing', 'accessories', e.target.value)}
              placeholder="e.g., Hat, Jewelry, Glasses"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Custom Features */}
        <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6 space-y-4">
          <ColoredBorder color="yellow" />
          <h4 className="font-semibold text-white mb-4">Additional Details</h4>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Features
            </label>
            <textarea
              value={appearance.customFeatures}
              onChange={(e) => handleChange(null, 'customFeatures', e.target.value)}
              placeholder="Any other distinctive features or characteristics..."
              className="w-full min-h-[120px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Generated Description Preview */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
        <ColoredBorder color="pink" />
        <div className="flex items-center gap-2 mb-4">
          <Eye size={18} className="text-gray-400" />
          <h4 className="font-semibold text-white">Generated Description</h4>
        </div>
        <p className="text-gray-300 italic">
          {generatedDescription || 'Fill in the fields above to generate a description...'}
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        {saved ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg"
          >
            <Check size={16} />
            Saved
          </motion.div>
        ) : (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg font-medium transition-colors"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Appearance'}
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterAppearance;

