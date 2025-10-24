'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Trash2, Edit } from 'lucide-react';
import { Character } from '@/app/types/Character';
import { useCharacterStore } from '@/app/store/characterStore';
import { characterApi } from '@/app/api/characters';
import { useProjectStore } from '@/app/store/projectStore';

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  const { selectedCharacter, setSelectedCharacter } = useCharacterStore();
  const { selectedProject } = useProjectStore();
  const [isDeleting, setIsDeleting] = useState(false);
  const { refetch } = characterApi.useProjectCharacters(selectedProject?.id || '');

  const isSelected = selectedCharacter === character.id;

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${character.name}?`)) return;

    setIsDeleting(true);
    try {
      await characterApi.deleteCharacter(character.id);
      refetch();
    } catch (error) {
      console.error('Failed to delete character:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={() => setSelectedCharacter(character.id)}
      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-500/10'
          : 'bg-gray-900 hover:bg-gray-800'
      } ${isDeleting ? 'opacity-50' : ''}`}
    >
      {/* Character Avatar */}
      <div className="aspect-square relative bg-gray-800">
        {character.avatar_url ? (
          <Image
            src={character.avatar_url}
            alt={character.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600">
            <div className="text-4xl font-bold">
              {character.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {/* Character Info */}
      <div className="p-4">
        <h3 className="font-semibold text-white mb-1 truncate">{character.name}</h3>
        {character.type && (
          <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
            {character.type}
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <button
          onClick={handleDelete}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          disabled={isDeleting}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default CharacterCard;
