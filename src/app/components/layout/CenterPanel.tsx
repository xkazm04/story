'use client';

import React, { useState } from 'react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import CharactersFeature from '@/app/features/characters/CharactersFeature';
import StoryFeature from '@/app/features/story/StoryFeature';
import ScenesFeature from '@/app/features/scenes/ScenesFeature';
import AssetsFeature from '@/app/features/assets/AssetsFeature';
import VoiceFeature from '@/app/features/voice/VoiceFeature';
import DatasetsFeature from '@/app/features/datasets/DatasetsFeature';
import ImageFeature from '@/app/features/image/ImageFeature';
import VideoFeature from '@/app/features/video/VideoFeature';
import { Users, Film, BookOpen, Image, Mic, Database, Sparkles, Video } from 'lucide-react';

type TabType = 'characters' | 'scenes' | 'story' | 'assets' | 'voice' | 'datasets' | 'images' | 'videos';

const CenterPanel: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [activeTab, setActiveTab] = useState<TabType>('characters');

  const tabs = [
    { id: 'characters' as const, label: 'Characters', icon: Users },
    { id: 'scenes' as const, label: 'Scenes', icon: Film },
    { id: 'story' as const, label: 'Story', icon: BookOpen },
    { id: 'voice' as const, label: 'Voice', icon: Mic },
    { id: 'datasets' as const, label: 'Datasets', icon: Database },
    { id: 'images' as const, label: 'Images', icon: Sparkles },
    { id: 'videos' as const, label: 'Videos', icon: Video },
    { id: 'assets' as const, label: 'Assets', icon: Image },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'characters':
        return <CharactersFeature />;
      case 'scenes':
        return <ScenesFeature />;
      case 'story':
        return <StoryFeature />;
      case 'voice':
        return <VoiceFeature />;
      case 'datasets':
        return <DatasetsFeature />;
      case 'images':
        return <ImageFeature />;
      case 'videos':
        return <VideoFeature />;
      case 'assets':
        return <AssetsFeature />;
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full bg-gray-950 flex flex-col relative">
      {/* Paper-like background texture for storywriting */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(90deg,transparent_0%,transparent_calc(100%_-_1px),rgba(255,255,255,0.1)_calc(100%_-_1px)),linear-gradient(transparent_0%,transparent_calc(100%_-_1px),rgba(255,255,255,0.1)_calc(100%_-_1px))] bg-[length:20px_20px]"></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,46,0.1),transparent_50%)]"></div>

      {selectedProject ? (
        <>
          {/* Icon Navigation */}
          <div className="flex items-center gap-1 px-4 py-3 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 relative z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-900 text-white shadow-lg shadow-blue-500/30'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200'
                  }`}
                  title={tab.label}
                >
                  <Icon className="w-5 h-5" />
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto relative z-0">
            {renderContent()}
          </div>
        </>
      ) : (
        <div className="h-full flex items-center justify-center relative z-10">
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
