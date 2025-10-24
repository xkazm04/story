'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PROMPT_SECTIONS } from '@/app/constants/promptSections';
import { traitApi } from '@/app/api/traits';
import TraitPromptSection from './TraitPromptSection';

interface CharacterAboutProps {
  characterId: string;
}

const CharacterAbout: React.FC<CharacterAboutProps> = ({ characterId }) => {
  const { data: traits = [], refetch } = traitApi.useCharacterTraits(characterId);
  const [activeSection, setActiveSection] = useState(0);

  // Create a map of trait types to their descriptions
  const traitsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    traits.forEach((trait) => {
      map[trait.type] = trait.description;
    });
    return map;
  }, [traits]);

  return (
    <div className="space-y-6">
      {/* Section Selector */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
        {PROMPT_SECTIONS.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeSection === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-300'
            }`}
          >
            {section.icon}
            {section.title}
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <motion.div
        key={activeSection}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <TraitPromptSection
          section={PROMPT_SECTIONS[activeSection]}
          characterId={characterId}
          initialValue={traitsMap[PROMPT_SECTIONS[activeSection].id] || ''}
          onSave={refetch}
        />
      </motion.div>
    </div>
  );
};

export default CharacterAbout;

