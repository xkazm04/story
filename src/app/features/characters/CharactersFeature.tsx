'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useProjectStore } from '@/app/store/projectStore';
import { useCharacterStore } from '@/app/store/characterStore';
import { characterApi } from '@/app/api/characters';
import TabMenu from '@/app/components/UI/TabMenu';
import CharactersList from './components/CharactersList';
import CharacterDetails from './components/CharacterDetails';
import FactionsList from './sub_CharFactions/FactionsList';

// Dynamic import for RelationshipMap (better performance)
const RelationshipMap = dynamic(
  () => import('@/app/features/relationships/RelationshipMap'),
  { ssr: false, loading: () => <div className="h-full flex items-center justify-center text-gray-400">Loading Relationship Map...</div> }
);

const CharactersFeature: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const { selectedCharacter } = useCharacterStore();
  const { data: characters = [], refetch } = characterApi.useProjectCharacters(
    selectedProject?.id || '',
    !!selectedProject
  );

  useEffect(() => {
    if (selectedProject) {
      refetch();
    }
  }, [selectedProject, refetch]);

  const tabs = [
    {
      id: 'characters',
      label: 'Characters',
      content: <CharactersList characters={characters} />,
    },
    {
      id: 'factions',
      label: 'Factions',
      content: <FactionsList />,
    },
    {
      id: 'relationship-map',
      label: 'Relationship Map',
      content: selectedProject ? (
        <div className="h-[calc(100vh-200px)]">
          <RelationshipMap projectId={selectedProject.id} />
        </div>
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Select a project to view relationship map
        </div>
      ),
    },
    {
      id: 'details',
      label: 'Details',
      content: selectedCharacter ? (
        <CharacterDetails characterId={selectedCharacter} />
      ) : (
        <div className="flex items-center justify-center h-64 text-gray-500">
          Select a character to view details
        </div>
      ),
    },
  ];

  return (
    <div className="h-full w-full p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Characters</h1>
        <p className="text-gray-400">Manage your story characters and factions</p>
      </div>
      <TabMenu tabs={tabs} />
    </div>
  );
};

export default CharactersFeature;
