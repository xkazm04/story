'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, PlusIcon, Search } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { useCharacters } from '@/app/hooks/useCharacters';
import { useCharacterStore } from '@/app/store/characterStore';
import type { Character } from '@/app/types/Character';

const CharRightPanel: React.FC = () => {
  const { activeProjectId } = useProjectStore();
  const { data: characters, isLoading } = useCharacters(activeProjectId || '');
  const { selectedCharacterId, setSelectedCharacterId } = useCharacterStore();
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Loading characters...</div>
      </div>
    );
  }

  if (!characters || characters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <Users className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm text-center">No characters yet</p>
        <p className="text-xs text-center mt-1">Create characters in the Characters tab</p>
      </div>
    );
  }

  // Filter characters by search term
  const filteredCharacters = characters.filter((char) =>
    char.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCharacterClick = (characterId: string) => {
    setSelectedCharacterId(characterId);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="inline-block h-2 w-2 rounded-full animate-pulse bg-blue-500"></span>
            Characters ({filteredCharacters.length})
          </h2>
          <button className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white shadow-lg transition-colors">
            <PlusIcon size={16} />
          </button>
        </div>

        {/* Search */}
        {characters.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search characters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}
      </div>

      {/* Characters List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredCharacters.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-4">
            No characters found
          </div>
        ) : (
          <div className="space-y-1">
            {filteredCharacters.map((character) => {
              const isSelected = character.id === selectedCharacterId;

              return (
                <motion.button
                  key={character.id}
                  onClick={() => handleCharacterClick(character.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    w-full p-3 rounded-lg text-left transition-all
                    ${isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                        ${isSelected ? 'bg-blue-700' : 'bg-gray-700'}
                      `}
                    >
                      {character.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Character Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {character.name}
                      </div>
                      {character.role && (
                        <div
                          className={`text-xs truncate ${
                            isSelected ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          {character.role}
                        </div>
                      )}
                    </div>

                    {/* Type Badge */}
                    {character.type && (
                      <div
                        className={`
                          text-xs px-2 py-1 rounded
                          ${isSelected
                            ? 'bg-blue-700 text-blue-200'
                            : 'bg-gray-700 text-gray-400'
                          }
                        `}
                      >
                        {character.type}
                      </div>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CharRightPanel;
