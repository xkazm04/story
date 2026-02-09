/**
 * View Mode Store - Zustand-based state management for view mode
 *
 * Manages global view mode state:
 * - 'cmd' (default) - Main prompt generation workflow
 * - 'whatif' - Before/After image comparison
 * - 'poster' - Project poster management
 */

'use client';

import { create } from 'zustand';
import { ReactNode } from 'react';

export type ViewMode = 'cmd' | 'whatif' | 'poster';

interface ViewModeState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewModeStore = create<ViewModeState>((set) => ({
  viewMode: 'cmd',
  setViewMode: (mode) => set({ viewMode: mode }),
}));

/**
 * No-op provider kept for backwards compatibility.
 * State is now managed by the Zustand store above.
 */
export function ViewModeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
