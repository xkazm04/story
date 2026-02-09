/**
 * DimensionsContext - Zustand store wrapping useDimensions hook
 *
 * Strategy: useDimensions() is a full React hook (useState, useCallback, etc.)
 * that cannot be called inside Zustand's create(). Instead, DimensionsProvider
 * calls useDimensions() and syncs the results into a Zustand store via useEffect.
 * Consumers read from the Zustand store, which supports selector-based
 * subscriptions for optimized re-renders.
 *
 * The DimensionsProvider must still wrap the component tree (it's the sync bridge),
 * and also manages persistence logic (auto-load/save to localStorage).
 *
 * Features:
 * - Dimension state management via useDimensions hook
 * - Auto-persistence to localStorage (debounced 500ms)
 * - Per-project storage keys
 * - SSR-safe initialization
 */

'use client';

import { ReactNode, useEffect, useRef, useCallback } from 'react';
import { create } from 'zustand';
import { useDimensions, DimensionsState, DimensionsActions } from './hooks/useDimensions';
import { createPersistenceManager, loadPersistedDimensions, clearPersistedDimensions } from './lib/dimensionPersistence';

// ---------------------------------------------------------------------------
// Store types
// ---------------------------------------------------------------------------

type DimensionsStateValue = DimensionsState & {
  /** Current project ID for persistence */
  currentProjectId: string | undefined;
};

type DimensionsActionsValue = DimensionsActions & {
  /** Set current project ID (triggers load from localStorage) */
  setCurrentProjectId: (projectId: string | undefined) => void;
  /** Clear persisted data for current project */
  clearPersistence: () => void;
};

type DimensionsContextValue = DimensionsStateValue & DimensionsActionsValue;

interface DimensionsStoreState extends DimensionsContextValue {
  /** Internal flag: true once the provider has synced at least once */
  _hydrated: boolean;
}

// ---------------------------------------------------------------------------
// Noop defaults for functions (used before the provider syncs)
// ---------------------------------------------------------------------------

const noop = () => {};

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

const useDimensionsStore = create<DimensionsStoreState>()(() => ({
  // State
  dimensions: [],
  pendingDimensionChange: null,
  canUndoDimension: false,
  undoStackSize: 0,
  currentProjectId: undefined,

  // Actions (will be replaced by provider sync)
  handleDimensionChange: noop as DimensionsActions['handleDimensionChange'],
  handleDimensionWeightChange: noop as DimensionsActions['handleDimensionWeightChange'],
  handleDimensionFilterModeChange: noop as DimensionsActions['handleDimensionFilterModeChange'],
  handleDimensionTransformModeChange: noop as DimensionsActions['handleDimensionTransformModeChange'],
  handleDimensionReferenceImageChange: noop as DimensionsActions['handleDimensionReferenceImageChange'],
  handleDimensionRemove: noop as DimensionsActions['handleDimensionRemove'],
  handleDimensionAdd: noop as DimensionsActions['handleDimensionAdd'],
  handleDimensionReorder: noop as DimensionsActions['handleDimensionReorder'],
  handleDropElementOnDimension: noop as DimensionsActions['handleDropElementOnDimension'],
  handleUndoDimensionChange: noop as DimensionsActions['handleUndoDimensionChange'],
  handleUndoDimensionChangeByTag: noop as DimensionsActions['handleUndoDimensionChangeByTag'],
  handleConvertElementsToDimensions: noop as DimensionsActions['handleConvertElementsToDimensions'],
  setDimensions: noop as DimensionsActions['setDimensions'],
  setDimensionsWithUndo: noop as DimensionsActions['setDimensionsWithUndo'],
  resetDimensions: noop as DimensionsActions['resetDimensions'],
  loadExampleDimensions: noop as DimensionsActions['loadExampleDimensions'],
  clearDimensionUndoStack: noop as DimensionsActions['clearDimensionUndoStack'],
  setCurrentProjectId: noop as DimensionsActionsValue['setCurrentProjectId'],
  clearPersistence: noop as DimensionsActionsValue['clearPersistence'],

  _hydrated: false,
}));

// ---------------------------------------------------------------------------
// Provider (sync bridge + persistence)
// ---------------------------------------------------------------------------

export interface DimensionsProviderProps {
  children: ReactNode;
  /** Initial project ID for persistence */
  initialProjectId?: string;
}

export function DimensionsProvider({ children, initialProjectId }: DimensionsProviderProps) {
  const dims = useDimensions();
  const projectIdRef = useRef<string | undefined>(initialProjectId);
  const persistenceManager = useRef(createPersistenceManager(500));
  const isInitializedRef = useRef(false);
  const isMounted = useRef(true);

  // Load persisted dimensions on mount (client-side only)
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const persisted = loadPersistedDimensions(projectIdRef.current);
    if (persisted && persisted.length > 0) {
      dims.setDimensions(persisted);
    }
  }, [dims.setDimensions]);

  // Auto-save dimensions on change (debounced)
  useEffect(() => {
    // Skip initial render
    if (!isInitializedRef.current) return;

    persistenceManager.current.save(dims.dimensions, projectIdRef.current);
  }, [dims.dimensions]);

  // Cleanup on unmount
  useEffect(() => {
    isMounted.current = true;
    const manager = persistenceManager.current;
    return () => {
      isMounted.current = false;
      manager.flush(); // Save any pending changes
      manager.cancel();
    };
  }, []);

  // Set project ID and load persisted dimensions for that project
  const setCurrentProjectId = useCallback((projectId: string | undefined) => {
    // Flush any pending saves for current project
    persistenceManager.current.flush();

    // Update project ID
    projectIdRef.current = projectId;

    // Load persisted dimensions for new project
    const persisted = loadPersistedDimensions(projectId);
    if (persisted && persisted.length > 0) {
      dims.setDimensions(persisted);
    } else {
      // Reset to defaults if no persisted data
      dims.resetDimensions();
    }
  }, [dims.setDimensions, dims.resetDimensions]);

  // Clear persistence for current project
  const clearPersistence = useCallback(() => {
    persistenceManager.current.cancel();
    clearPersistedDimensions(projectIdRef.current);
  }, []);

  // Sync all values from useDimensions + persistence into the Zustand store
  useEffect(() => {
    if (!isMounted.current) return;

    useDimensionsStore.setState({
      // State
      dimensions: dims.dimensions,
      pendingDimensionChange: dims.pendingDimensionChange,
      canUndoDimension: dims.canUndoDimension,
      undoStackSize: dims.undoStackSize,
      currentProjectId: projectIdRef.current,

      // Actions from useDimensions
      handleDimensionChange: dims.handleDimensionChange,
      handleDimensionWeightChange: dims.handleDimensionWeightChange,
      handleDimensionFilterModeChange: dims.handleDimensionFilterModeChange,
      handleDimensionTransformModeChange: dims.handleDimensionTransformModeChange,
      handleDimensionReferenceImageChange: dims.handleDimensionReferenceImageChange,
      handleDimensionRemove: dims.handleDimensionRemove,
      handleDimensionAdd: dims.handleDimensionAdd,
      handleDimensionReorder: dims.handleDimensionReorder,
      handleDropElementOnDimension: dims.handleDropElementOnDimension,
      handleUndoDimensionChange: dims.handleUndoDimensionChange,
      handleUndoDimensionChangeByTag: dims.handleUndoDimensionChangeByTag,
      handleConvertElementsToDimensions: dims.handleConvertElementsToDimensions,
      setDimensions: dims.setDimensions,
      setDimensionsWithUndo: dims.setDimensionsWithUndo,
      resetDimensions: dims.resetDimensions,
      loadExampleDimensions: dims.loadExampleDimensions,
      clearDimensionUndoStack: dims.clearDimensionUndoStack,

      // Persistence actions
      setCurrentProjectId,
      clearPersistence,

      _hydrated: true,
    });
  });

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Consumer hooks (drop-in replacements for the old context hooks)
// ---------------------------------------------------------------------------

/** Read dimension state from the Zustand store */
export function useDimensionsState(): DimensionsStateValue {
  return useDimensionsStore((state) => ({
    dimensions: state.dimensions,
    pendingDimensionChange: state.pendingDimensionChange,
    canUndoDimension: state.canUndoDimension,
    undoStackSize: state.undoStackSize,
    currentProjectId: state.currentProjectId,
  }));
}

/** Read dimension actions from the Zustand store */
export function useDimensionsActions(): DimensionsActionsValue {
  return useDimensionsStore((state) => ({
    handleDimensionChange: state.handleDimensionChange,
    handleDimensionWeightChange: state.handleDimensionWeightChange,
    handleDimensionFilterModeChange: state.handleDimensionFilterModeChange,
    handleDimensionTransformModeChange: state.handleDimensionTransformModeChange,
    handleDimensionReferenceImageChange: state.handleDimensionReferenceImageChange,
    handleDimensionRemove: state.handleDimensionRemove,
    handleDimensionAdd: state.handleDimensionAdd,
    handleDimensionReorder: state.handleDimensionReorder,
    handleDropElementOnDimension: state.handleDropElementOnDimension,
    handleUndoDimensionChange: state.handleUndoDimensionChange,
    handleUndoDimensionChangeByTag: state.handleUndoDimensionChangeByTag,
    handleConvertElementsToDimensions: state.handleConvertElementsToDimensions,
    setDimensions: state.setDimensions,
    setDimensionsWithUndo: state.setDimensionsWithUndo,
    resetDimensions: state.resetDimensions,
    loadExampleDimensions: state.loadExampleDimensions,
    clearDimensionUndoStack: state.clearDimensionUndoStack,
    setCurrentProjectId: state.setCurrentProjectId,
    clearPersistence: state.clearPersistence,
  }));
}

/** Backward-compatible hook returning both state and actions */
export function useDimensionsContext(): DimensionsContextValue {
  return useDimensionsStore((state) => {
    const { _hydrated: _, ...rest } = state;
    return rest as DimensionsContextValue;
  });
}
