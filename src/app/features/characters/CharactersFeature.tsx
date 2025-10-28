'use client';

import React, { useEffect } from 'react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacterStore } from '@/app/store/slices/characterSlice';
import { characterApi } from '@/app/hooks/integration/useCharacters';
import TabMenu from '@/app/components/UI/TabMenu';
import CharactersList from './components/CharactersList';
import DynamicComponentLoader from '@/app/components/UI/DynamicComponentLoader';
import SkeletonLoader from '@/app/components/UI/SkeletonLoader';

/**
 * Dynamic imports for heavy character/faction components
 * Benefits:
 * - Improved bundle size by lazy loading heavy visualization and detail components
 * - Preloads on hover for better perceived performance
 * - Consistent error handling and retry logic
 * - Performance monitoring for load times
 * - Skeleton loaders matching ColoredBorder design pattern
 */

const CharactersFeature: React.FC = () => {
  const { selectedProject } = useProjectStore();
  // Use selector to prevent unnecessary re-renders
  const selectedCharacter = useCharacterStore((state) => state.selectedCharacter);
  const { data: characters = [] } = characterApi.useProjectCharacters(
    selectedProject?.id || '',
    !!selectedProject
  );

  const tabs = [
    {
      id: 'characters',
      label: 'Characters',
      content: <CharactersList characters={characters} />,
    },
    {
      id: 'factions',
      label: 'Factions',
      content: (
        <DynamicComponentLoader
          importFn={() => import('./sub_CharFactions/FactionsList')}
          componentProps={{}}
          moduleName="FactionsList"
          preloadOnHover
          loadingComponent={
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              <SkeletonLoader variant="card" color="blue" count={6} />
            </div>
          }
        />
      ),
    },
    {
      id: 'relationship-map',
      label: 'Relationship Map',
      content: selectedProject ? (
        <div className="h-[calc(100vh-200px)]">
          <DynamicComponentLoader
            importFn={() => import('@/app/features/relationships/RelationshipMap')}
            componentProps={{ projectId: selectedProject.id }}
            moduleName="RelationshipMap"
            preloadOnHover
            loadingHeight="h-full"
            loadingComponent={
              <div className="h-full flex items-center justify-center text-gray-400">
                Loading Relationship Map...
              </div>
            }
          />
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
        <DynamicComponentLoader
          importFn={() => import('./components/CharacterDetails')}
          componentProps={{ characterId: selectedCharacter }}
          moduleName="CharacterDetails"
          preloadOnHover
          loadingComponent={<SkeletonLoader variant="details" color="blue" />}
        />
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
