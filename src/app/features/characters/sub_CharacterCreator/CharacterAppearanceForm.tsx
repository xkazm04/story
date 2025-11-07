'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Check, Palette } from 'lucide-react';
import { characterApi } from '@/app/api/characters';
import { Appearance, defaultAppearance } from '@/app/types/Character';
import { SectionWrapper } from '@/app/components/UI';
import { 
  saveCharacterAppearance, 
  fetchCharacterAppearance 
} from '@/app/lib/services/characterAppearanceService';
import { CharacterImageExtraction } from './CharacterImageExtraction';
import { AppearanceBasicAttributes } from './AppearanceBasicAttributes';
import { AppearanceFacialFeatures } from './AppearanceFacialFeatures';
import { AppearanceClothing } from './AppearanceClothing';
import { AppearanceCustomFeatures } from './AppearanceCustomFeatures';
import { AppearancePreview } from './AppearancePreview';

interface CharacterAppearanceFormProps {
  characterId: string;
}

/**
 * Refactored Character Appearance Form
 * Modular structure with image extraction capability
 */
const CharacterAppearanceForm: React.FC<CharacterAppearanceFormProps> = ({
  characterId,
}) => {
  const { data: character } = characterApi.useGetCharacter(characterId);
  const [appearance, setAppearance] = useState<Appearance>(defaultAppearance);
  const [prompt, setPrompt] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load existing appearance data on mount
  React.useEffect(() => {
    const loadAppearance = async () => {
      if (!characterId) return;
      
      try {
        setIsLoading(true);
        const { appearance: loadedAppearance, prompt: loadedPrompt } = 
          await fetchCharacterAppearance(characterId);
        
        if (loadedAppearance && Object.keys(loadedAppearance).length > 0) {
          setAppearance({
            ...defaultAppearance,
            ...loadedAppearance,
            face: {
              ...defaultAppearance.face,
              ...loadedAppearance.face,
            },
            clothing: {
              ...defaultAppearance.clothing,
              ...loadedAppearance.clothing,
            },
          });
        }
        
        if (loadedPrompt) {
          setPrompt(loadedPrompt);
        }
      } catch (error) {
        console.error('Failed to load appearance:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAppearance();
  }, [characterId]);

  const handleChange = (field: string, value: string) => {
    // Handle nested fields (e.g., "face.eyeColor", "clothing.style")
    if (field.includes('.')) {
      const [category, subField] = field.split('.');
      setAppearance((prev) => ({
        ...prev,
        [category]: {
          ...(prev[category as keyof Appearance] as any),
          [subField]: value,
        },
      }));
    } else {
      setAppearance((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleExtractedAppearance = (extractedData: Partial<Appearance>, extractedPrompt: string) => {
    setAppearance((prev) => ({
      ...prev,
      ...extractedData,
      face: {
        ...prev.face,
        ...extractedData.face,
      },
      clothing: {
        ...prev.clothing,
        ...extractedData.clothing,
      },
    }));
    setPrompt(extractedPrompt);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveCharacterAppearance(characterId, appearance, prompt);

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save appearance:', error);
      alert('Failed to save appearance. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-sm text-gray-400">Loading appearance data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
          <Palette size={18} />
          Physical Appearance
        </h3>
        <p className="text-sm text-gray-400">
          Define physical traits manually or extract them from an image using AI
        </p>
      </div>

      {/* Image Extraction Section */}
      <SectionWrapper borderColor="purple" padding="md">
        <CharacterImageExtraction onExtracted={handleExtractedAppearance} />
      </SectionWrapper>

      {/* Manual Input Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AppearanceBasicAttributes appearance={appearance} onChange={handleChange} />
        <AppearanceFacialFeatures appearance={appearance} onChange={handleChange} />
        <AppearanceClothing appearance={appearance} onChange={handleChange} />
        <AppearanceCustomFeatures appearance={appearance} onChange={handleChange} />
      </div>

      {/* AI Generation Prompt */}
      <SectionWrapper borderColor="orange" padding="md">
        <h4 className="font-semibold text-white mb-2">AI Generation Prompt</h4>
        <p className="text-xs text-gray-400 mb-3">
          A prompt to regenerate this character in different styles (focuses on the character only, not background or image style)
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A tall athletic male adult with fair skin, short brown hair, blue eyes, clean-shaven, wearing black and silver armor..."
          className="w-full min-h-[100px] px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-sm"
        />
      </SectionWrapper>

      {/* Generated Description Preview */}
      <AppearancePreview appearance={appearance} />

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

export default CharacterAppearanceForm;
