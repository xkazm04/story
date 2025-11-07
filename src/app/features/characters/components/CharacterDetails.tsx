'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, BookOpen, Palette, Heart, Shield } from 'lucide-react';
import { characterApi } from '@/app/api/characters';
import ColoredBorder from '@/app/components/UI/ColoredBorder';
import CharacterAbout from '../sub_CharacterTraits/CharacterAbout';
import CharacterRelationships from './CharacterRelationships';
import CharacterAppearance from './CharacterAppearance';
import CharacterConsistencyPanel from './CharacterConsistencyPanel';

interface CharacterDetailsProps {
  characterId: string;
}

const CharacterDetails: React.FC<CharacterDetailsProps> = ({ characterId }) => {
  const { data: character, isLoading } = characterApi.useGetCharacter(characterId);
  const [activeTab, setActiveTab] = useState<'info' | 'about' | 'appearance' | 'relationships' | 'consistency'>('info');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Character not found
      </div>
    );
  }

  const tabs = [
    { id: 'info' as const, label: 'Info', icon: <User size={16} /> },
    { id: 'about' as const, label: 'About', icon: <BookOpen size={16} /> },
    { id: 'appearance' as const, label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'relationships' as const, label: 'Relationships', icon: <Heart size={16} /> },
    { id: 'consistency' as const, label: 'Consistency', icon: <Shield size={16} /> },
  ];

  return (
    <div className="space-y-4">
      {/* Character Header */}
      <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
        <ColoredBorder color="blue" />
        <div className="flex gap-6">
          {/* Avatar */}
          <div className="w-32 h-32 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
            {character.avatar_url ? (
              <Image
                src={character.avatar_url}
                alt={character.name}
                width={128}
                height={128}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 text-4xl font-bold">
                {character.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{character.name}</h2>
            {character.type && (
              <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm rounded-lg mb-4">
                {character.type}
              </span>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">ID:</span>
                <span className="ml-2 text-gray-200">{character.id.slice(0, 8)}...</span>
              </div>
              {character.faction_id && (
                <div>
                  <span className="text-gray-400">Faction:</span>
                  <span className="ml-2 text-gray-200">{character.faction_id.slice(0, 8)}...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 p-2 bg-gray-900/50 rounded-lg border border-gray-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500/20 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 rounded-full"
                layoutId="activeTabIndicator"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'info' && (
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
            <ColoredBorder color="blue" />
            <h3 className="text-lg font-semibold text-white mb-4">Character Information</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Name:</span>
                <span className="text-gray-200">{character.name}</span>
              </div>
              {character.type && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <span className="text-gray-200">{character.type}</span>
                </div>
              )}
              {character.voice && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Voice:</span>
                  <span className="text-gray-200">{character.voice}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
            <ColoredBorder color="purple" />
            <CharacterAbout characterId={characterId} />
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
            <ColoredBorder color="green" />
            <CharacterAppearance characterId={characterId} />
          </div>
        )}

        {activeTab === 'relationships' && (
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
            <ColoredBorder color="pink" />
            <CharacterRelationships characterId={characterId} />
          </div>
        )}

        {activeTab === 'consistency' && (
          <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-6">
            <ColoredBorder color="blue" />
            <CharacterConsistencyPanel characterId={characterId} characterName={character?.name || ''} />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CharacterDetails;
