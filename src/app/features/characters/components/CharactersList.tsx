'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '@/app/types/Character';
import { useCharacterStore } from '@/app/store/slices/characterSlice';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { factionApi } from '@/app/api/factions';
import CharacterCard from './CharacterCard';
import CharacterCreateForm from './CharacterCreateForm';
import ColoredBorder from '@/app/components/UI/ColoredBorder';

interface CharactersListProps {
  characters: Character[];
}

const CharactersList: React.FC<CharactersListProps> = ({ characters }) => {
  const { selectedProject } = useProjectStore();
  const [selectedFaction, setSelectedFaction] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { data: factions = [] } = factionApi.useFactions(
    selectedProject?.id || '',
    !!selectedProject
  );

  // Group characters by faction
  const organizedCharacters = React.useMemo(() => {
    const grouped: Record<string, Character[]> = { independent: [] };

    factions.forEach((faction) => {
      grouped[faction.id] = [];
    });

    characters.forEach((char) => {
      if (char.faction_id && grouped[char.faction_id]) {
        grouped[char.faction_id].push(char);
      } else {
        grouped.independent.push(char);
      }
    });

    return grouped;
  }, [characters, factions]);

  const displayedCharacters = selectedFaction
    ? organizedCharacters[selectedFaction] || []
    : characters;

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedFaction(null)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFaction === null
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            All ({characters.length})
          </button>
          {factions.map((faction) => (
            <button
              key={faction.id}
              onClick={() => setSelectedFaction(faction.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFaction === faction.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {faction.name} ({organizedCharacters[faction.id]?.length || 0})
            </button>
          ))}
          <button
            onClick={() => setSelectedFaction('independent')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFaction === 'independent'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Independent ({organizedCharacters.independent?.length || 0})
          </button>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          + New Character
        </button>
      </div>

      {/* Create Character Form */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative bg-gray-900 rounded-lg border border-gray-800 p-6"
          >
            <ColoredBorder color="blue" />
            <CharacterCreateForm onClose={() => setIsCreating(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Characters Grid with staggered animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {displayedCharacters.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05, // Staggered animation
                ease: [0.4, 0, 0.2, 1],
              }}
              whileHover={{
                y: -4,
                transition: { duration: 0.2 },
              }}
              style={{
                transformStyle: 'preserve-3d',
              }}
            >
              <CharacterCard character={character} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {displayedCharacters.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No characters found. Create your first character!
        </div>
      )}
    </div>
  );
};

export default CharactersList;
