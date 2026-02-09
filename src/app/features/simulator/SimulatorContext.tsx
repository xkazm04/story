/**
 * SimulatorContext - Root coordinator for cross-subfeature communication
 *
 * Strategy: SimulatorProvider calls subfeature hooks (useDimensionsContext,
 * useBrainContext, usePromptsContext) and orchestrates their interactions.
 * It syncs the computed state + callbacks into a Zustand store via useEffect.
 * Consumers read from the Zustand store via useSimulatorContext(), which
 * supports selector-based subscriptions for optimized re-renders.
 *
 * The SimulatorProvider must still wrap the component tree (it's the sync
 * bridge), but the React Context is eliminated in favor of Zustand.
 */

'use client';

import { ReactNode, useState, useCallback, useEffect, useRef } from 'react';
import { create } from 'zustand';
import { Dimension, DimensionType, GeneratedPrompt, PromptElement } from './types';
import { useDimensionsContext } from './subfeature_dimensions';
import { useBrainContext } from './subfeature_brain';
import { usePromptsContext } from './subfeature_prompts';
import { generateWithFeedback } from './subfeature_brain/lib/simulatorAI';
import { EXAMPLE_SIMULATIONS } from './subfeature_dimensions/lib/defaultDimensions';
import {
  startGenerationSession,
  recordGenerationIteration,
  getActiveSession,
  learnDimensionCombinations,
} from './lib/preferenceEngine';

// ---------------------------------------------------------------------------
// Exported types (backward compatible)
// ---------------------------------------------------------------------------

/**
 * Optional overrides for handleGenerate - used when refinement has just completed
 * and state hasn't updated yet (React state updates are async)
 */
export interface GenerateOverrides {
  baseImage?: string;
  dimensions?: Array<{ type: DimensionType; label: string; reference: string }>;
  feedback?: { positive: string; negative: string };
  /** Cumulative iteration history from autoplay (score trends, persistent issues) */
  iterationContext?: string;
  /** Callback fired immediately after prompts are generated, bypassing async state timing */
  onPromptsReady?: (prompts: GeneratedPrompt[]) => void;
}

export interface SimulatorContextValue {
  // Shared state
  isGenerating: boolean;
  canGenerate: boolean;

  // Cross-subfeature actions
  handleGenerate: (overrides?: GenerateOverrides) => Promise<void>;
  handleReset: () => void;
  handleLoadExample: (index: number) => void;

  // Bidirectional flow callbacks
  onConvertElementsToDimensions: (dimensions: Dimension[]) => void;
  onDropElementOnDimension: (element: PromptElement, dimensionId: string) => void;
  onAcceptElement: (element: PromptElement) => Promise<void>;
}

export interface SimulatorProviderProps {
  children: ReactNode;
}

// ---------------------------------------------------------------------------
// Noop defaults for functions (used before the provider syncs)
// ---------------------------------------------------------------------------

const noop = () => {};
const noopAsync = async () => {};

// ---------------------------------------------------------------------------
// Store type
// ---------------------------------------------------------------------------

interface SimulatorStoreState extends SimulatorContextValue {
  /** Internal flag: true once the provider has synced at least once */
  _hydrated: boolean;
}

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

const useSimulatorStore = create<SimulatorStoreState>()(() => ({
  // State
  isGenerating: false,
  canGenerate: false,

  // Actions (will be replaced by provider sync)
  handleGenerate: noopAsync as SimulatorContextValue['handleGenerate'],
  handleReset: noop,
  handleLoadExample: noop as SimulatorContextValue['handleLoadExample'],

  // Bidirectional flow callbacks
  onConvertElementsToDimensions: noop as SimulatorContextValue['onConvertElementsToDimensions'],
  onDropElementOnDimension: noop as SimulatorContextValue['onDropElementOnDimension'],
  onAcceptElement: noopAsync as SimulatorContextValue['onAcceptElement'],

  _hydrated: false,
}));

// ---------------------------------------------------------------------------
// Provider (sync bridge)
// ---------------------------------------------------------------------------

/**
 * SimulatorProvider - Must be nested inside all subfeature providers.
 * It reads from subfeature contexts and orchestrates their interactions,
 * then syncs the results into the Zustand store via useEffect.
 */
export function SimulatorProvider({ children }: SimulatorProviderProps) {
  const dimensions = useDimensionsContext();
  const brain = useBrainContext();
  const prompts = usePromptsContext();

  const [isGenerating, setIsGenerating] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Derived state - can generate if base image exists
  const canGenerate = brain.baseImage.trim().length > 0;

  // Main generation handler - orchestrates all subfeatures
  // Accepts optional overrides for when refinement just completed (state not yet updated)
  const handleGenerate = useCallback(async (overrides?: GenerateOverrides) => {
    if (!canGenerate) return;

    setIsGenerating(true);

    // Use overrides if provided, otherwise use current state
    const effectiveBaseImage = overrides?.baseImage ?? brain.baseImage;
    const effectiveDimensions = overrides?.dimensions ?? dimensions.dimensions.map((d) => ({
      type: d.type,
      label: d.label,
      reference: d.reference,
    }));
    const effectiveFeedback = overrides?.feedback ?? brain.feedback;

    // Start or continue a generation session for learning
    const existingSession = getActiveSession();
    if (!existingSession) {
      startGenerationSession(dimensions.dimensions, effectiveBaseImage, brain.outputMode);
    }

    try {
      // Single atomic API call: feedback -> dimension adjustment -> prompt generation
      const result = await generateWithFeedback(
        effectiveBaseImage,
        effectiveDimensions,
        effectiveFeedback,
        brain.outputMode,
        prompts.lockedElements,
        overrides?.iterationContext
      );

      if (result.success) {
        // Apply adjusted dimensions to state
        if (result.adjustedDimensions.length > 0) {
          dimensions.setDimensions(
            dimensions.dimensions.map((dim) => {
              const adjustment = result.adjustedDimensions.find((a) => a.type === dim.type);
              return adjustment && adjustment.wasModified
                ? { ...dim, reference: adjustment.newValue }
                : dim;
            })
          );
        }

        // Set generated prompts
        const generatedPrompts: GeneratedPrompt[] = result.prompts.map((p) => ({
          id: p.id,
          sceneNumber: p.sceneNumber,
          sceneType: p.sceneType,
          prompt: p.prompt,
          copied: false,
          rating: null,
          locked: false,
          elements: p.elements,
        }));
        prompts.setGeneratedPrompts(generatedPrompts);
        prompts.pushToHistory({ prompts: generatedPrompts, dimensions: dimensions.dimensions, baseImage: effectiveBaseImage });

        // Fire callback with fresh prompts (bypasses async state timing)
        overrides?.onPromptsReady?.(generatedPrompts);

        // Record this generation iteration for learning
        recordGenerationIteration(generatedPrompts.map((p) => p.id));

        // Learn dimension combinations asynchronously
        learnDimensionCombinations().catch(console.error);

        // Clear feedback after successful generation
        brain.clearFeedback();
      } else {
        console.error('Generation failed:', result.error);
        // Fallback to client-side generation
        const fallbackPrompts = prompts.generateFallbackPrompts(
          brain.baseImage,
          dimensions.dimensions,
          brain.outputMode
        );
        prompts.setGeneratedPrompts(fallbackPrompts);
        prompts.pushToHistory({ prompts: fallbackPrompts, dimensions: dimensions.dimensions, baseImage: brain.baseImage });

        // Fire callback with fallback prompts (bypasses async state timing)
        overrides?.onPromptsReady?.(fallbackPrompts);

        brain.clearFeedback();
      }
    } catch (err) {
      console.error('Generation error:', err);
      // Fallback to client-side generation on error
      const fallbackPrompts = prompts.generateFallbackPrompts(
        brain.baseImage,
        dimensions.dimensions,
        brain.outputMode
      );
      prompts.setGeneratedPrompts(fallbackPrompts);
      prompts.pushToHistory({ prompts: fallbackPrompts, dimensions: dimensions.dimensions, baseImage: brain.baseImage });

      // Fire callback with fallback prompts (bypasses async state timing)
      overrides?.onPromptsReady?.(fallbackPrompts);

      brain.clearFeedback();
    } finally {
      setIsGenerating(false);
    }
  }, [canGenerate, brain, dimensions, prompts]);

  // Reset all subfeatures
  const handleReset = useCallback(() => {
    dimensions.resetDimensions();
    brain.resetBrain();
    prompts.clearPrompts();
  }, [dimensions, brain, prompts]);

  // Load example simulation
  const handleLoadExample = useCallback((index: number) => {
    const example = EXAMPLE_SIMULATIONS[index];
    if (!example) return;

    // Set base image
    brain.setBaseImage(example.baseImage);
    brain.setBaseImageFile(null);

    // Load dimensions
    dimensions.loadExampleDimensions(index);

    // Clear prompts
    prompts.clearPrompts();

    // Clear feedback
    brain.clearFeedback();
  }, [brain, dimensions, prompts]);

  // Bidirectional flow: Convert locked elements to dimensions
  const onConvertElementsToDimensions = useCallback((newDimensions: Dimension[]) => {
    dimensions.handleConvertElementsToDimensions(newDimensions);
  }, [dimensions]);

  // Bidirectional flow: Drop element on dimension
  const onDropElementOnDimension = useCallback((element: PromptElement, dimensionId: string) => {
    dimensions.handleDropElementOnDimension(element, dimensionId);
  }, [dimensions]);

  // Bidirectional flow: Accept element (refine dimensions via AI)
  const onAcceptElement = useCallback(async (element: PromptElement) => {
    await prompts.handleAcceptElement(
      element,
      dimensions.dimensions,
      (updater) => {
        const newDimensions = updater(dimensions.dimensions);
        dimensions.setDimensions(newDimensions);
      },
      () => {
        // This would need to be wired to dimensions.setPendingDimensionChange
        // For now, the dimensions context handles this internally
      }
    );
  }, [prompts, dimensions]);

  // Sync all values into the Zustand store
  useEffect(() => {
    if (!isMounted.current) return;

    useSimulatorStore.setState({
      isGenerating,
      canGenerate,
      handleGenerate,
      handleReset,
      handleLoadExample,
      onConvertElementsToDimensions,
      onDropElementOnDimension,
      onAcceptElement,
      _hydrated: true,
    });
  });

  return <>{children}</>;
}

// ---------------------------------------------------------------------------
// Consumer hook (drop-in replacement for the old useSimulatorContext)
// ---------------------------------------------------------------------------

/**
 * Access simulator state from the Zustand store.
 *
 * Returns the full simulator value by default (same shape as the old context).
 * Optionally accepts a selector for optimized subscriptions:
 *
 * ```ts
 * const isGenerating = useSimulatorContext(s => s.isGenerating);
 * ```
 */
export function useSimulatorContext(): SimulatorContextValue;
export function useSimulatorContext<T>(selector: (state: SimulatorContextValue) => T): T;
export function useSimulatorContext<T>(selector?: (state: SimulatorContextValue) => T): T | SimulatorContextValue {
  if (selector) {
    return useSimulatorStore(selector);
  }

  // Full-object subscription (matches old context behavior)
  return useSimulatorStore((state) => {
    // Destructure to omit the internal _hydrated flag
    const { _hydrated: _, ...rest } = state;
    return rest as SimulatorContextValue;
  });
}
