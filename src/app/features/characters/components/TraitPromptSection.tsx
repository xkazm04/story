'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, Check } from 'lucide-react';
import { PromptSection } from '@/app/constants/promptSections';
import { traitApi } from '@/app/api/traits';
import ColoredBorder from '@/app/components/UI/ColoredBorder';

interface TraitPromptSectionProps {
  section: PromptSection;
  characterId: string;
  initialValue?: string;
  onSave?: () => void;
}

const TraitPromptSection: React.FC<TraitPromptSectionProps> = ({
  section,
  characterId,
  initialValue = '',
  onSave,
}) => {
  const [value, setValue] = useState(initialValue);
  const [originalValue, setOriginalValue] = useState(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const hasChanges = value !== originalValue;
  const maxLength = 2500;
  const isOverLimit = value.length > maxLength;

  useEffect(() => {
    if (initialValue !== originalValue) {
      setOriginalValue(initialValue);
      setValue(initialValue);
    }
  }, [initialValue, originalValue]);

  const handleSave = async () => {
    if (!hasChanges || isOverLimit) return;

    setIsSaving(true);
    setError('');

    try {
      await traitApi.createTrait({
        character_id: characterId,
        type: section.id,
        description: value,
      });

      setOriginalValue(value);
      setSaved(true);
      if (onSave) onSave();

      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError('Failed to save');
      console.error('Error saving trait:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-1">
          {section.icon}
          {section.title}
        </h3>
        <p className="text-sm text-gray-400">{section.description}</p>
      </div>

      {/* Text Area */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <ColoredBorder color="blue" />
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={section.placeholder}
          className="w-full min-h-[200px] p-4 bg-transparent text-white placeholder-gray-500 focus:outline-none resize-none"
        />
      </div>

      {/* Save Button and Character Count */}
      <div className="flex items-center justify-between">
        <span
          className={`text-sm ${
            isOverLimit ? 'text-red-500 font-semibold' : 'text-gray-400'
          }`}
        >
          {value.length} / {maxLength} characters
          {isOverLimit && <span className="ml-2">Too long!</span>}
        </span>

        {error && <span className="text-sm text-red-500">{error}</span>}

        <AnimatePresence mode="wait">
          {hasChanges && !saved && (
            <motion.button
              key="save-btn"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={handleSave}
              disabled={isSaving || isOverLimit}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              <Save size={16} />
              {isSaving ? 'Saving...' : 'Save'}
            </motion.button>
          )}

          {saved && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              <Check size={16} />
              Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TraitPromptSection;

