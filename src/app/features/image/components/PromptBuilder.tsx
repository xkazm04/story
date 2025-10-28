'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import PromptEnhancer from './PromptEnhancer';
import NegativePromptGenerator from './NegativePromptGenerator';
import type { PromptComponents } from '@/app/types/Image';

interface PromptBuilderProps {
  promptComponents: PromptComponents;
  setPromptComponents: React.Dispatch<React.SetStateAction<PromptComponents>>;
  negativePrompt: string;
  setNegativePrompt: (value: string) => void;
}

interface PromptSection {
  key: keyof PromptComponents;
  label: string;
  placeholder: string;
  description: string;
}

const sections: PromptSection[] = [
  {
    key: 'artstyle',
    label: 'Art Style',
    placeholder: 'e.g., digital art, oil painting, concept art, photorealistic...',
    description: 'Define the artistic style and medium',
  },
  {
    key: 'scenery',
    label: 'Scenery & Setting',
    placeholder: 'e.g., ancient forest, futuristic city, medieval castle...',
    description: 'Describe the environment and location',
  },
  {
    key: 'actors',
    label: 'Characters & Subjects',
    placeholder: 'e.g., warrior in armor, young woman, dragon...',
    description: 'Describe the main subjects in the scene',
  },
  {
    key: 'actions',
    label: 'Actions & Mood',
    placeholder: 'e.g., standing heroically, fighting, looking at sunset...',
    description: 'Describe what is happening and the emotional tone',
  },
];

const PromptBuilder: React.FC<PromptBuilderProps> = ({
  promptComponents,
  setPromptComponents,
  negativePrompt,
  setNegativePrompt,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['artstyle'])
  );

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handlePromptChange = (key: keyof PromptComponents, value: string) => {
    setPromptComponents((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Get combined prompt for preview
  const getCombinedPrompt = () => {
    return Object.values(promptComponents).filter(Boolean).join(', ');
  };

  return (
    <div className="p-4 space-y-4">
      {/* Final Prompt Preview */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Combined Prompt Preview
        </label>
        <div className="bg-gray-800 rounded-lg p-3 min-h-[60px] text-gray-300 text-sm">
          {getCombinedPrompt() || (
            <span className="text-gray-500">Your prompt will appear here...</span>
          )}
        </div>
      </div>

      {/* Prompt Sections */}
      {sections.map((section) => {
        const isExpanded = expandedSections.has(section.key);
        const Icon = isExpanded ? ChevronDown : ChevronRight;

        return (
          <div
            key={section.key}
            className="border border-gray-800 rounded-lg overflow-hidden"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.key)}
              className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-white">{section.label}</span>
                <span className="text-xs text-gray-500">{section.description}</span>
              </div>
              {promptComponents[section.key] && (
                <span className="text-xs text-green-500">✓ Filled</span>
              )}
            </button>

            {/* Section Content */}
            {isExpanded && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="bg-gray-850"
              >
                <div className="p-3 space-y-3">
                  <textarea
                    value={promptComponents[section.key]}
                    onChange={(e) => handlePromptChange(section.key, e.target.value)}
                    placeholder={section.placeholder}
                    rows={3}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* AI Enhancement */}
                  <PromptEnhancer
                    currentPrompt={promptComponents[section.key]}
                    promptType={section.key}
                    onEnhanced={(enhanced) => handlePromptChange(section.key, enhanced)}
                  />
                </div>
              </motion.div>
            )}
          </div>
        );
      })}

      {/* Negative Prompt Section */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('negative')}
          className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors"
        >
          <div className="flex items-center gap-2">
            {expandedSections.has('negative') ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
            <span className="font-medium text-white">Negative Prompt</span>
            <span className="text-xs text-gray-500">Things to avoid</span>
          </div>
          {negativePrompt && <span className="text-xs text-green-500">✓ Filled</span>}
        </button>

        {expandedSections.has('negative') && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="bg-gray-850"
          >
            <div className="p-3 space-y-3">
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="e.g., blurry, low quality, watermark, deformed..."
                rows={3}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <NegativePromptGenerator
                mainPrompt={getCombinedPrompt()}
                onGenerated={setNegativePrompt}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PromptBuilder;
