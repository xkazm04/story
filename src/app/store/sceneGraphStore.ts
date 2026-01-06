/**
 * SceneGraphStore - Zustand store for Scene Graph state
 * Manages sidebar visibility, scene filtering, and UI state
 */

import { create } from 'zustand';

type FilterMode = 'all' | 'connected' | 'orphaned' | 'deadends';

interface SceneGraphState {
  // Sidebar visibility
  showOutline: boolean;
  setShowOutline: (show: boolean) => void;
  toggleOutline: () => void;

  // Scene filtering
  filterMode: FilterMode;
  setFilterMode: (mode: FilterMode) => void;

  // Diagnostics panel
  showDiagnostics: boolean;
  setShowDiagnostics: (show: boolean) => void;
  toggleDiagnostics: () => void;

  // AI panel
  showAIPanel: boolean;
  setShowAIPanel: (show: boolean) => void;
  toggleAIPanel: () => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const useSceneGraphStore = create<SceneGraphState>((set) => ({
  // Sidebar visibility
  showOutline: true,
  setShowOutline: (show) => set({ showOutline: show }),
  toggleOutline: () => set((state) => ({ showOutline: !state.showOutline })),

  // Scene filtering
  filterMode: 'all',
  setFilterMode: (mode) => set({ filterMode: mode }),

  // Diagnostics panel
  showDiagnostics: false,
  setShowDiagnostics: (show) => set({ showDiagnostics: show }),
  toggleDiagnostics: () => set((state) => ({ showDiagnostics: !state.showDiagnostics })),

  // AI panel
  showAIPanel: false,
  setShowAIPanel: (show) => set({ showAIPanel: show }),
  toggleAIPanel: () => set((state) => ({ showAIPanel: !state.showAIPanel })),

  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
