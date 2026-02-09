/**
 * PromptsContext - Zustand store wrapping usePrompts hook
 *
 * Strategy: usePrompts() is a full React hook (useState, useRef, useCallback, etc.)
 * that cannot be called inside Zustand's create(). Instead, PromptsProvider calls
 * usePrompts() and syncs the results into a Zustand store via useEffect. Consumers
 * read from the Zustand store via usePromptsContext() / usePromptsState() /
 * usePromptsActions(), which support selector-based subscriptions for optimized
 * re-renders.
 *
 * The PromptsProvider must still wrap the component tree (it's the sync bridge),
 * but the two React Contexts are eliminated in favor of a single Zustand store.
 */

'use client';

import { ReactNode, useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { usePrompts, PromptsState, PromptsActions, UsePromptsOptions } from './hooks/usePrompts';
import { useProjectContext } from '../contexts';
import { useDimensionsContext } from '../subfeature_dimensions';
import { useBrainContext } from '../subfeature_brain';
import type { GeneratedPrompt, Dimension, OutputMode, PromptElement } from '../types';
import type { HistoryEntry } from './hooks/usePromptHistory';

// ---------------------------------------------------------------------------
// Store type (mirrors PromptsState & PromptsActions from usePrompts)
// ---------------------------------------------------------------------------

type PromptsContextValue = PromptsState & PromptsActions;

interface PromptsStoreState extends PromptsContextValue {
  /** Internal flag: true once the provider has synced at least once */
  _hydrated: boolean;
}

// ---------------------------------------------------------------------------
// Noop defaults for functions (used before the provider syncs)
// ---------------------------------------------------------------------------

const noop = () => {};
const noopAsync = async () => {};

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

const usePromptsStore = create<PromptsStoreState>()(() => ({
  // State
  generatedPrompts: [],
  lockedElements: [],
  hasLockedPrompts: false,
  acceptingElementId: null,
  promptHistory: {
    canUndo: false,
    canRedo: false,
    historyLength: 0,
    positionLabel: '',
  },

  // Actions (will be replaced by provider sync)
  handlePromptRate: noop as PromptsActions['handlePromptRate'],
  handlePromptLock: noop as PromptsActions['handlePromptLock'],
  handleElementLock: noop as PromptsActions['handleElementLock'],
  handleCopy: noop as PromptsActions['handleCopy'],
  handleAcceptElement: noopAsync as unknown as PromptsActions['handleAcceptElement'],
  setGeneratedPrompts: noop as PromptsActions['setGeneratedPrompts'],
  clearPrompts: noop as PromptsActions['clearPrompts'],
  handlePromptUndo: noop as PromptsActions['handlePromptUndo'],
  handlePromptRedo: noop as PromptsActions['handlePromptRedo'],
  pushToHistory: noop as PromptsActions['pushToHistory'],
  clearHistory: noop as PromptsActions['clearHistory'],
  setHistoryProjectId: noop as PromptsActions['setHistoryProjectId'],
  generateFallbackPrompts: (() => []) as PromptsActions['generateFallbackPrompts'],
  restorePrompts: noop as PromptsActions['restorePrompts'],

  _hydrated: false,
}));

// ---------------------------------------------------------------------------
// Provider (sync bridge)
// ---------------------------------------------------------------------------

export interface PromptsProviderProps {
  children: ReactNode;
}

export function PromptsProvider({ children }: PromptsProviderProps) {
  const project = useProjectContext();
  const dimensions = useDimensionsContext();
  const brain = useBrainContext();
  const projectIdRef = useRef<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Track project ID changes
  useEffect(() => {
    projectIdRef.current = project.currentProject?.id || null;
  }, [project.currentProject?.id]);

  // Persist prompts to API
  const onSavePrompts = useCallback(async (prompts: GeneratedPrompt[]) => {
    const projectId = projectIdRef.current;
    if (!projectId) return;

    try {
      await fetch(`/api/simulator-projects/${projectId}/prompts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompts: prompts.map(p => ({
          id: p.id,
          sceneNumber: p.sceneNumber,
          sceneType: p.sceneType,
          prompt: p.prompt,
          copied: p.copied,
          rating: p.rating,
          locked: p.locked,
          elements: p.elements,
        })) }),
      });
    } catch (err) {
      console.error('[PromptsProvider] Failed to save prompts:', err);
    }
  }, []);

  // Delete all prompts from API
  const onDeletePrompts = useCallback(async () => {
    const projectId = projectIdRef.current;
    if (!projectId) return;

    try {
      await fetch(`/api/simulator-projects/${projectId}/prompts`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
    } catch (err) {
      console.error('[PromptsProvider] Failed to delete prompts:', err);
    }
  }, []);

  // Restore callbacks for undo/redo
  const onRestoreDimensions = useCallback((dims: Dimension[]) => {
    dimensions.setDimensions(dims);
  }, [dimensions]);

  const onRestoreBaseImage = useCallback((baseImage: string) => {
    brain.setBaseImage(baseImage);
  }, [brain]);

  const options: UsePromptsOptions = {
    onSavePrompts,
    onDeletePrompts,
    onRestoreDimensions,
    onRestoreBaseImage,
  };

  const prompts = usePrompts(options);

  // Track project changes — clear history when project switches
  const currentProjectId = project.currentProject?.id || null;
  useEffect(() => {
    prompts.setHistoryProjectId(currentProjectId);
  }, [currentProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync all values from usePrompts into the Zustand store
  useEffect(() => {
    if (!isMounted.current) return;

    usePromptsStore.setState({
      // State
      generatedPrompts: prompts.generatedPrompts,
      lockedElements: prompts.lockedElements,
      hasLockedPrompts: prompts.hasLockedPrompts,
      acceptingElementId: prompts.acceptingElementId,
      promptHistory: prompts.promptHistory,

      // Actions
      handlePromptRate: prompts.handlePromptRate,
      handlePromptLock: prompts.handlePromptLock,
      handleElementLock: prompts.handleElementLock,
      handleCopy: prompts.handleCopy,
      handleAcceptElement: prompts.handleAcceptElement,
      setGeneratedPrompts: prompts.setGeneratedPrompts,
      clearPrompts: prompts.clearPrompts,
      handlePromptUndo: prompts.handlePromptUndo,
      handlePromptRedo: prompts.handlePromptRedo,
      pushToHistory: prompts.pushToHistory,
      clearHistory: prompts.clearHistory,
      setHistoryProjectId: prompts.setHistoryProjectId,
      generateFallbackPrompts: prompts.generateFallbackPrompts,
      restorePrompts: prompts.restorePrompts,

      _hydrated: true,
    });
  });

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Consumer hooks (drop-in replacements for the old context hooks)
// ---------------------------------------------------------------------------

/**
 * Access prompts state from the Zustand store.
 */
export function usePromptsState(): PromptsState {
  return usePromptsStore((state) => ({
    generatedPrompts: state.generatedPrompts,
    lockedElements: state.lockedElements,
    hasLockedPrompts: state.hasLockedPrompts,
    acceptingElementId: state.acceptingElementId,
    promptHistory: state.promptHistory,
  }));
}

/**
 * Access prompts actions from the Zustand store.
 */
export function usePromptsActions(): PromptsActions {
  return usePromptsStore((state) => ({
    handlePromptRate: state.handlePromptRate,
    handlePromptLock: state.handlePromptLock,
    handleElementLock: state.handleElementLock,
    handleCopy: state.handleCopy,
    handleAcceptElement: state.handleAcceptElement,
    setGeneratedPrompts: state.setGeneratedPrompts,
    clearPrompts: state.clearPrompts,
    handlePromptUndo: state.handlePromptUndo,
    handlePromptRedo: state.handlePromptRedo,
    pushToHistory: state.pushToHistory,
    clearHistory: state.clearHistory,
    setHistoryProjectId: state.setHistoryProjectId,
    generateFallbackPrompts: state.generateFallbackPrompts,
    restorePrompts: state.restorePrompts,
  }));
}

/**
 * Backward-compatible hook returning both state and actions.
 *
 * Returns the full prompts value by default (same shape as the old context).
 * Optionally accepts a selector for optimized subscriptions:
 *
 * ```ts
 * const generatedPrompts = usePromptsContext(s => s.generatedPrompts);
 * ```
 */
export function usePromptsContext(): PromptsState & PromptsActions;
export function usePromptsContext<T>(selector: (state: PromptsState & PromptsActions) => T): T;
export function usePromptsContext<T>(selector?: (state: PromptsState & PromptsActions) => T): T | (PromptsState & PromptsActions) {
  if (selector) {
    return usePromptsStore(selector);
  }

  // Full-object subscription (matches old context behavior)
  return usePromptsStore((state) => {
    const { _hydrated: _, ...rest } = state;
    return rest as PromptsState & PromptsActions;
  });
}
