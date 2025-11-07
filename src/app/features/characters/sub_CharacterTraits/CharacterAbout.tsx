'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, AlertCircle } from 'lucide-react';
import { PROMPT_SECTIONS } from '@/app/constants/promptSections';
import { traitApi } from '@/app/api/traits';
import { Trait } from '@/app/types/Character';
import { Button } from '@/app/components/UI/Button';
import { SmartGenerateButton } from '@/app/components/UI/SmartGenerateButton';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacters } from '@/app/hooks/useCharacters';
import { useUnifiedTraitGeneration } from './useUnifiedTraitGeneration';
import TraitPromptSection from './TraitPromptSection';

interface CharacterAboutProps {
  characterId: string;
}

const CharacterAbout: React.FC<CharacterAboutProps> = ({ characterId }) => {
  const { data: traits = [], refetch } = traitApi.useCharacterTraits(characterId);
  const [activeSection, setActiveSection] = useState(0);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const { selectedProject } = useProjectStore();
  const { data: allCharacters = [] } = useCharacters(selectedProject?.id || '');
  
  const { generateAllTraits, isGenerating, error, saveTraits } = useUnifiedTraitGeneration(
    characterId,
    selectedProject?.id || '',
    allCharacters
  );

  // Create a map of trait types to their descriptions
  const traitsMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    traits.forEach((trait: Trait) => {
      map[trait.type] = trait.description;
    });
    return map;
  }, [traits]);

  const handleGenerateAllTraits = async () => {
    setGenerateSuccess(false);
    
    const result = await generateAllTraits();
    
    if (result) {
      // Save all traits to database
      await saveTraits(characterId, result);
      
      // Refetch to update UI
      await refetch();
      
      // Show success message
      setGenerateSuccess(true);
      setTimeout(() => setGenerateSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Generate All Button */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-white mb-1">Character Traits</h2>
          <p className="text-sm text-gray-400">
            Generate comprehensive traits or edit individual sections
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <SmartGenerateButton
            onClick={handleGenerateAllTraits}
            isLoading={isGenerating}
            disabled={isGenerating}
            label="Generate All Traits"
            size="md"
            variant="primary"
          />
          
          {/* Status messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1.5 text-sm text-red-400"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}
            
            {generateSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-1.5 text-sm text-green-400"
              >
                <Check size={14} />
                All traits generated successfully!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Section Selector */}
      <div className="flex flex-wrap gap-1.5 p-3 bg-gray-900/50 rounded-lg border border-gray-800">
        {PROMPT_SECTIONS.map((section, index) => (
          <Button
            key={section.id}
            size="sm"
            variant={activeSection === index ? 'primary' : 'secondary'}
            icon={section.icon}
            onClick={() => setActiveSection(index)}
          >
            {section.title}
          </Button>
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

