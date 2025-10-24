'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/app/store/projectStore';
import CharactersFeature from '@/app/features/characters/CharactersFeature';
import StoryFeature from '@/app/features/story/StoryFeature';
import ScenesFeature from '@/app/features/scenes/ScenesFeature';
import { Users, Film, BookOpen } from 'lucide-react';

type TabType = 'characters' | 'scenes' | 'story';

const CenterPanel: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<TabType>('characters');

  const tabs = [
    { id: 'characters' as const, label: 'Characters', icon: Users },
    { id: 'scenes' as const, label: 'Scenes', icon: Film },
    { id: 'story' as const, label: 'Story', icon: BookOpen },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'characters':
        return <CharactersFeature />;
      case 'scenes':
        return <ScenesFeature />;
      case 'story':
        return <StoryFeature />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-gray-950 flex flex-col">
      {selectedProject ? (
        <>
          {/* Icon Navigation */}
          <div className="flex items-center gap-1 px-4 py-3 bg-gray-900 border-b border-gray-800">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto">
            {renderContent()}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-300 mb-2">Welcome to Story</h1>
            <p className="text-gray-500">Select or create a project to get started</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CenterPanel;
