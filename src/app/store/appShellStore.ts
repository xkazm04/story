/**
 * AppShellStore - Zustand store for AppShell state
 * Manages active feature, story subtab, and panel context awareness
 */

import { create } from 'zustand';

export type FeatureTab = 'characters' | 'scenes' | 'story' | 'assets' | 'voice' | 'datasets' | 'images' | 'videos';
export type StorySubtab = 'art-style' | 'beats' | 'scene-editor' | 'act-evaluation' | 'scene-graph' | 'prompt-composer' | 'story-script' | 'story-setup';

interface AppShellState {
  // Active feature tab
  activeFeature: FeatureTab;
  setActiveFeature: (feature: FeatureTab) => void;

  // Story subtab (when story feature is active)
  storySubtab: StorySubtab;
  setStorySubtab: (subtab: StorySubtab) => void;

  // Helper selectors
  isStoryFeatureActive: () => boolean;
}

export const useAppShellStore = create<AppShellState>((set, get) => ({
  // Active feature tab - default to characters
  activeFeature: 'characters',
  setActiveFeature: (feature) => set({ activeFeature: feature }),

  // Story subtab - default to scene-editor (Content)
  storySubtab: 'scene-editor',
  setStorySubtab: (subtab) => set({ storySubtab: subtab }),

  // Helper selectors
  isStoryFeatureActive: () => get().activeFeature === 'story',
}));
