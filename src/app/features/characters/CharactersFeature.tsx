/**
 * CharactersFeature - Main character management module
 * Design: Clean Manuscript style - monospace accents with cyan theme
 */

'use client';

import React, { useState } from 'react';
import { Users, Shield, Network, FileText } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacterStore } from '@/app/store/slices/characterSlice';
import { characterApi } from '@/app/hooks/integration/useCharacters';
import CharactersList from './components/CharactersList';
import DynamicComponentLoader from '@/app/components/UI/DynamicComponentLoader';
import SkeletonLoader from '@/app/components/UI/SkeletonLoader';
import { CharacterCardSkeletonGrid } from './components/CharacterCardSkeleton';
import { motion } from 'framer-motion';

const CharactersFeature: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const selectedCharacter = useCharacterStore((state) => state.selectedCharacter);
  const [activeTab, setActiveTab] = useState(0);
  const { data: characters = [], isLoading: charactersLoading } = characterApi.useProjectCharacters(
    selectedProject?.id || '',
    !!selectedProject
  );

  const tabs = [
    {
      id: 'characters',
      label: 'characters',
      icon: Users,
      content: charactersLoading ? (
        <CharacterCardSkeletonGrid count={8} />
      ) : (
        <CharactersList characters={characters} isLoading={charactersLoading} />
      ),
    },
    {
      id: 'factions',
      label: 'factions',
      icon: Shield,
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
      label: 'relationships',
      icon: Network,
      content: selectedProject ? (
        <div className="h-[calc(100vh-200px)]">
          <DynamicComponentLoader
            importFn={() => import('@/app/features/relationships/RelationshipMap')}
            componentProps={{ projectId: selectedProject.id }}
            moduleName="RelationshipMap"
            preloadOnHover
            loadingHeight="h-full"
            loadingComponent={
              <div className="h-full flex items-center justify-center font-mono text-xs text-slate-500">
                loading_relationship_map...
              </div>
            }
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <Network className="w-8 h-8 text-slate-600" />
          <span className="font-mono text-xs text-slate-500">// select_project_to_view</span>
        </div>
      ),
    },
    {
      id: 'details',
      label: 'details',
      icon: FileText,
      content: selectedCharacter ? (
        <DynamicComponentLoader
          importFn={() => import('./components/CharacterDetails')}
          componentProps={{ characterId: selectedCharacter }}
          moduleName="CharacterDetails"
          preloadOnHover
          loadingComponent={<SkeletonLoader variant="details" color="blue" />}
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-64 gap-2">
          <FileText className="w-8 h-8 text-slate-600" />
          <span className="font-mono text-xs text-slate-500">// select_character_to_view</span>
          <p className="text-xs text-slate-600 text-center max-w-xs">
            select a character to view details, generate images, or create avatars
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="h-full w-full flex flex-col ms-surface">
      {/* Tab Navigation - Clean Manuscript style */}
      <div className="flex items-center gap-2 px-4 pt-3 pb-2 border-b border-slate-800/50 bg-slate-950/80">
        <span className="font-mono text-[10px] uppercase tracking-wider text-slate-600 mr-2">
          // module
        </span>
        {tabs.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(index)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md transition-all duration-200 font-mono text-xs ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-400 border border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
              data-testid={`character-tab-${tab.id}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : ''}`} />
              <span className="uppercase tracking-wide">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-4 py-4 text-sm text-slate-200 ms-scrollbar">
        {tabs.length > 0 && (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          >
            {tabs[activeTab]?.content || (
              <div className="font-mono text-xs text-slate-500 italic">// no_content_available</div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CharactersFeature;
