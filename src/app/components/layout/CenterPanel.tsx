'use client';

import React, { Suspense, lazy, useEffect } from 'react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useAssetManagerStore } from '@/app/features/assets/store/assetManagerStore';
import { useAppShellStore, FeatureTab } from '@/app/store/appShellStore';
import { Users, Film, BookOpen, Image, Mic, Database, Sparkles, Video } from 'lucide-react';

// Lazy load all feature components
const CharactersFeature = lazy(() => import('@/app/features/characters/CharactersFeature'));
const StoryFeature = lazy(() => import('@/app/features/story/StoryFeature'));
const ScenesFeature = lazy(() => import('@/app/features/scenes/ScenesFeature'));
const AssetsFeature = lazy(() => import('@/app/features/assets/AssetsFeature'));
const VoiceFeature = lazy(() => import('@/app/features/voice/VoiceFeature'));
const DatasetsFeature = lazy(() => import('@/app/features/datasets/DatasetsFeature'));
const ImageFeature = lazy(() => import('@/app/features/image/ImageFeature'));
const VideoFeature = lazy(() => import('@/app/features/video/VideoFeature'));

// Loading fallback component
const FeatureLoadingFallback: React.FC = () => (
  <div className="h-full flex items-center justify-center" data-testid="feature-loading-fallback">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm">Loading feature...</p>
    </div>
  </div>
);

const CenterPanel: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const { activeFeature, setActiveFeature } = useAppShellStore();
  const setAssetFeatureActive = useAssetManagerStore((s) => s.setAssetFeatureActive);

  // Sync active tab with asset store for cross-panel communication
  useEffect(() => {
    setAssetFeatureActive(activeFeature === 'assets');
  }, [activeFeature, setAssetFeatureActive]);

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
    switch (activeFeature) {
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
    <div className="h-full w-full bg-slate-950 flex flex-col relative">
      {/* Paper-like background texture for storywriting */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(90deg,transparent_0%,transparent_calc(100%_-_1px),rgba(255,255,255,0.1)_calc(100%_-_1px)),linear-gradient(transparent_0%,transparent_calc(100%_-_1px),rgba(255,255,255,0.1)_calc(100%_-_1px))] bg-[length:20px_20px]"></div>
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(circle_at_50%_50%,rgba(139,92,46,0.1),transparent_50%)]"></div>

      {selectedProject ? (
        <>
          {/* Icon Navigation */}
          <div className="flex items-center gap-1 px-4 py-2 bg-slate-950/95 backdrop-blur-sm border-b border-slate-900/70 relative z-10">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFeature(tab.id as FeatureTab)}
                  className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all duration-150 min-w-[68px] text-[11px] ${
                    activeFeature === tab.id
                      ? 'bg-cyan-600/20 text-slate-50 border border-cyan-500/40 shadow-[0_0_0_1px_rgba(8,145,178,0.28)]'
                      : 'bg-slate-900/70 text-slate-400 border border-slate-800 hover:bg-slate-900 hover:text-slate-100'
                  }`}
                  title={tab.label}
                  data-testid={`feature-tab-${tab.id}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium leading-tight tracking-tight">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto relative z-0">
            <Suspense fallback={<FeatureLoadingFallback />}>
              {renderContent()}
            </Suspense>
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
