/**
 * ProjectContext - Zustand store wrapping useProject hook
 *
 * Strategy: useProject() is a full React hook (useState, useRef, useEffect, etc.)
 * that cannot be called inside Zustand's create(). Instead, ProjectProvider calls
 * useProject() and syncs the results into a Zustand store via useEffect. Consumers
 * read from the Zustand store via useProjectContext(), which supports selector-based
 * subscriptions for optimized re-renders.
 *
 * The ProjectProvider must still wrap the component tree (it's the sync bridge),
 * but the React Context is eliminated in favor of Zustand.
 */

'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useProject } from '../hooks/useProject';
import type { SaveStatus } from '../hooks/usePersistedEntity';

// ---------------------------------------------------------------------------
// Store type (mirrors UseProjectReturn from useProject)
// ---------------------------------------------------------------------------

type ProjectContextValue = ReturnType<typeof useProject>;

interface ProjectStoreState extends ProjectContextValue {
  /** Internal flag: true once the provider has synced at least once */
  _hydrated: boolean;
}

// ---------------------------------------------------------------------------
// Noop defaults for functions (used before the provider syncs)
// ---------------------------------------------------------------------------

const noop = () => {};
const noopAsync = async () => {};
const noopAsyncNull = async () => null;
const noopAsyncBool = async () => false;

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

const useProjectStore = create<ProjectStoreState>()(() => ({
  // Data
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
  saveStatus: 'idle' as SaveStatus,
  lastSavedAt: null,
  isRestoring: false,

  // Functions (will be replaced by provider sync)
  setIsRestoring: noop as (value: boolean) => void,
  loadProjects: noopAsync as () => Promise<void>,
  createProject: noopAsyncNull as (name: string) => Promise<ReturnType<ProjectContextValue['createProject']> extends Promise<infer R> ? R : never>,
  selectProject: noopAsyncNull as (id: string) => Promise<ReturnType<ProjectContextValue['selectProject']> extends Promise<infer R> ? R : never>,
  deleteProject: noopAsyncBool as (id: string) => Promise<boolean>,
  renameProject: noopAsyncBool as (id: string, newName: string) => Promise<boolean>,
  duplicateProject: noopAsyncNull as (id: string) => Promise<ReturnType<ProjectContextValue['duplicateProject']> extends Promise<infer R> ? R : never>,
  saveState: noop as ProjectContextValue['saveState'],
  savePanelImage: noopAsync as ProjectContextValue['savePanelImage'],
  removePanelImage: noopAsync as ProjectContextValue['removePanelImage'],
  saveGeneratedPrompts: noopAsync as ProjectContextValue['saveGeneratedPrompts'],
  updateGeneratedPrompt: noopAsync as ProjectContextValue['updateGeneratedPrompt'],
  deleteGeneratedPrompts: noopAsync as ProjectContextValue['deleteGeneratedPrompts'],

  _hydrated: false,
}));

// ---------------------------------------------------------------------------
// Provider (sync bridge)
// ---------------------------------------------------------------------------

export interface ProjectProviderProps {
  children: ReactNode;
}

export function ProjectProvider({ children }: ProjectProviderProps) {
  const project = useProject();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync all values from useProject into the Zustand store
  useEffect(() => {
    if (!isMounted.current) return;

    useProjectStore.setState({
      projects: project.projects,
      currentProject: project.currentProject,
      isLoading: project.isLoading,
      error: project.error,
      saveStatus: project.saveStatus,
      lastSavedAt: project.lastSavedAt,
      isRestoring: project.isRestoring,
      setIsRestoring: project.setIsRestoring,
      loadProjects: project.loadProjects,
      createProject: project.createProject,
      selectProject: project.selectProject,
      deleteProject: project.deleteProject,
      renameProject: project.renameProject,
      duplicateProject: project.duplicateProject,
      saveState: project.saveState,
      savePanelImage: project.savePanelImage,
      removePanelImage: project.removePanelImage,
      saveGeneratedPrompts: project.saveGeneratedPrompts,
      updateGeneratedPrompt: project.updateGeneratedPrompt,
      deleteGeneratedPrompts: project.deleteGeneratedPrompts,
      _hydrated: true,
    });
  });

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Consumer hook (drop-in replacement for the old useProjectContext)
// ---------------------------------------------------------------------------

/**
 * Access project state from the Zustand store.
 *
 * Returns the full project value by default (same shape as the old context).
 * Optionally accepts a selector for optimized subscriptions:
 *
 * ```ts
 * const currentProject = useProjectContext(s => s.currentProject);
 * ```
 */
export function useProjectContext(): ProjectContextValue;
export function useProjectContext<T>(selector: (state: ProjectContextValue) => T): T;
export function useProjectContext<T>(selector?: (state: ProjectContextValue) => T): T | ProjectContextValue {
  if (selector) {
    return useProjectStore(selector);
  }

  // Full-object subscription (matches old context behavior)
  return useProjectStore((state) => {
    // Destructure to omit the internal _hydrated flag
    const { _hydrated: _, ...rest } = state;
    return rest as ProjectContextValue;
  });
}
