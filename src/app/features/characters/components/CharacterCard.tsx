'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Trash2, Edit } from 'lucide-react';
import { Character } from '@/app/types/Character';
import { useCharacterStore } from '@/app/store/slices/characterSlice';
import { characterApi } from '@/app/api/characters';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useOptimisticMutation } from '@/app/hooks/useOptimisticMutation';

interface CharacterCardProps {
  character: Character;
}

const CharacterCard: React.FC<CharacterCardProps> = ({ character }) => {
  // Use selectors for optimized rendering
  const selectedCharacter = useCharacterStore((state) => state.selectedCharacter);
  const setSelectedCharacter = useCharacterStore((state) => state.setSelectedCharacter);
  const { selectedProject } = useProjectStore();

  const isSelected = selectedCharacter === character.id;

  // Use optimistic mutation for character deletion
  const { mutate: deleteCharacter, isLoading: isDeleting, rollbackError } = useOptimisticMutation<
    void,
    string
  >({
    mutationFn: characterApi.deleteCharacter,
    affectedQueryKeys: [
      ['characters', 'project', selectedProject?.id],
      ['relationships', selectedProject?.id],
    ],
    toastMessage: `Deleting ${character.name}...`,
    enableUndo: true,
    onError: (error) => {
      console.error('Failed to delete character:', error);
    },
  });

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete ${character.name}?`)) return;

    await deleteCharacter(character.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{
        opacity: isDeleting ? 0.5 : 1,
        scale: isDeleting ? 0.95 : 1,
        y: 0,
      }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1],
      }}
      onClick={() => !isDeleting && setSelectedCharacter(character.id)}
      className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 bg-blue-500/10'
          : 'bg-gray-900 hover:bg-gray-800'
      } ${isDeleting ? 'pointer-events-none' : ''}`}
    >
      {/* Deleting overlay with pulse animation */}
      {isDeleting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="text-red-400 text-lg font-semibold"
          >
            Deleting...
          </motion.div>
        </motion.div>
      )}

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
          className="p-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          disabled={isDeleting}
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Error display for rollback failures */}
      {rollbackError && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-red-900/90 text-red-200 text-xs">
          {rollbackError}
        </div>
      )}
    </motion.div>
  );
};

export default CharacterCard;
