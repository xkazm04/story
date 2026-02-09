/**
 * BrainContext - Zustand store wrapping useBrain hook
 *
 * Strategy: useBrain() is a full React hook (useState, useCallback, useRef, etc.)
 * that cannot be called inside Zustand's create(). Instead, BrainProvider calls
 * useBrain() and syncs the results into a Zustand store via useEffect. Consumers
 * read from the Zustand store via useBrainState/useBrainActions/useBrainContext(),
 * which support selector-based subscriptions for optimized re-renders.
 *
 * The BrainProvider must still wrap the component tree (it's the sync bridge),
 * but the React Contexts are eliminated in favor of Zustand.
 */

'use client';

import { ReactNode, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { useBrain, BrainState, BrainActions } from './hooks/useBrain';

// ---------------------------------------------------------------------------
// Store type (mirrors BrainState & BrainActions from useBrain)
// ---------------------------------------------------------------------------

type BrainContextValue = BrainState & BrainActions;

interface BrainStoreState extends BrainContextValue {
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

const useBrainStore = create<BrainStoreState>()(() => ({
  // State defaults
  baseImage: '',
  baseImageFile: null,
  visionSentence: null,
  breakdown: null,
  feedback: { positive: '', negative: '' },
  outputMode: 'gameplay' as BrainState['outputMode'],
  isParsingImage: false,
  imageParseError: null,
  parsedImageDescription: null,
  preParseSnapshot: null,
  canUndoParse: false,

  // Action defaults (will be replaced by provider sync)
  setBaseImage: noop as BrainActions['setBaseImage'],
  setBaseImageFile: noop as BrainActions['setBaseImageFile'],
  setVisionSentence: noop as BrainActions['setVisionSentence'],
  setBreakdown: noop as BrainActions['setBreakdown'],
  setFeedback: noop as BrainActions['setFeedback'],
  setOutputMode: noop as BrainActions['setOutputMode'],
  handleImageParse: noopAsync as unknown as BrainActions['handleImageParse'],
  undoImageParse: noop as BrainActions['undoImageParse'],
  clearUndoSnapshot: noop as BrainActions['clearUndoSnapshot'],
  handleSmartBreakdownApply: noop as BrainActions['handleSmartBreakdownApply'],
  resetBrain: noop as BrainActions['resetBrain'],
  clearFeedback: noop as BrainActions['clearFeedback'],

  _hydrated: false,
}));

// ---------------------------------------------------------------------------
// Provider (sync bridge)
// ---------------------------------------------------------------------------

export interface BrainProviderProps {
  children: ReactNode;
}

export function BrainProvider({ children }: BrainProviderProps) {
  const brain = useBrain();
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Sync all values from useBrain into the Zustand store
  useEffect(() => {
    if (!isMounted.current) return;

    useBrainStore.setState({
      // State
      baseImage: brain.baseImage,
      baseImageFile: brain.baseImageFile,
      visionSentence: brain.visionSentence,
      breakdown: brain.breakdown,
      feedback: brain.feedback,
      outputMode: brain.outputMode,
      isParsingImage: brain.isParsingImage,
      imageParseError: brain.imageParseError,
      parsedImageDescription: brain.parsedImageDescription,
      preParseSnapshot: brain.preParseSnapshot,
      canUndoParse: brain.canUndoParse,
      // Actions
      setBaseImage: brain.setBaseImage,
      setBaseImageFile: brain.setBaseImageFile,
      setVisionSentence: brain.setVisionSentence,
      setBreakdown: brain.setBreakdown,
      setFeedback: brain.setFeedback,
      setOutputMode: brain.setOutputMode,
      handleImageParse: brain.handleImageParse,
      undoImageParse: brain.undoImageParse,
      clearUndoSnapshot: brain.clearUndoSnapshot,
      handleSmartBreakdownApply: brain.handleSmartBreakdownApply,
      resetBrain: brain.resetBrain,
      clearFeedback: brain.clearFeedback,
      _hydrated: true,
    });
  });

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Consumer hooks
// ---------------------------------------------------------------------------

/**
 * Access brain state from the Zustand store (state fields only).
 */
export function useBrainState(): BrainState {
  return useBrainStore((state): BrainState => ({
    baseImage: state.baseImage,
    baseImageFile: state.baseImageFile,
    visionSentence: state.visionSentence,
    breakdown: state.breakdown,
    feedback: state.feedback,
    outputMode: state.outputMode,
    isParsingImage: state.isParsingImage,
    imageParseError: state.imageParseError,
    parsedImageDescription: state.parsedImageDescription,
    preParseSnapshot: state.preParseSnapshot,
    canUndoParse: state.canUndoParse,
  }));
}

/**
 * Access brain actions from the Zustand store (action fields only).
 */
export function useBrainActions(): BrainActions {
  return useBrainStore((state): BrainActions => ({
    setBaseImage: state.setBaseImage,
    setBaseImageFile: state.setBaseImageFile,
    setVisionSentence: state.setVisionSentence,
    setBreakdown: state.setBreakdown,
    setFeedback: state.setFeedback,
    setOutputMode: state.setOutputMode,
    handleImageParse: state.handleImageParse,
    undoImageParse: state.undoImageParse,
    clearUndoSnapshot: state.clearUndoSnapshot,
    handleSmartBreakdownApply: state.handleSmartBreakdownApply,
    resetBrain: state.resetBrain,
    clearFeedback: state.clearFeedback,
  }));
}

/**
 * Backward-compatible hook returning both state and actions.
 *
 * Optionally accepts a selector for optimized subscriptions:
 * ```ts
 * const baseImage = useBrainContext(s => s.baseImage);
 * ```
 */
export function useBrainContext(): BrainState & BrainActions;
export function useBrainContext<T>(selector: (state: BrainState & BrainActions) => T): T;
export function useBrainContext<T>(
  selector?: (state: BrainState & BrainActions) => T
): T | (BrainState & BrainActions) {
  if (selector) {
    return useBrainStore((state) => {
      const { _hydrated: _, ...rest } = state;
      return selector(rest as BrainState & BrainActions);
    });
  }

  // Full-object subscription (matches old context behavior)
  return useBrainStore((state) => {
    const { _hydrated: _, ...rest } = state;
    return rest as BrainState & BrainActions;
  });
}
