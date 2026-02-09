/**
 * useImageGeneration - Hook for managing Leonardo AI image generation
 *
 * Composes useLocalPersistedEntity with generation-specific logic:
 * - Starting parallel generations for multiple prompts
 * - Polling for completion
 * - Tracking generation status
 * - Saving completed images to panel slots
 * - Persisting saved images to IndexedDB (for large base64 images)
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GeneratedImage, PanelSlotsData, UseImageGenerationOptions, UseImageGenerationReturn } from './types';
import { getStorageKey, initialPanelData } from './constants';
import { useLocalPersistedEntity } from '../useLocalPersistedEntity';
import { SLOTS_PER_SIDE } from '../../subfeature_panels/components/SidePanel';
import {
  pollGeneration as pollGenerationFn,
  generateImagesFromPrompts as generateImagesFromPromptsFn,
  type PollGenerationParams,
} from './generation';
import {
  saveImageToPanel as saveImageToPanelFn,
  uploadImageToPanel as uploadImageToPanelFn,
  removePanelImage as removePanelImageFn,
  updatePanelImage as updatePanelImageFn,
  updatePanelImageVideo as updatePanelImageVideoFn,
  updateGeneratedImageUrl as updateGeneratedImageUrlFn,
  resetSaveTracking as resetSaveTrackingFn,
  clearPanelSlots as clearPanelSlotsFn,
  hydratePanelImages as hydratePanelImagesFn,
  type PanelOperationParams,
} from './panel';

// Re-export all types for consumers
export type {
  SavedPanelImageInfo,
  UseImageGenerationOptions,
  UseImageGenerationReturn,
  GenerationStartResponse,
  GenerationCheckResponse,
  PanelSlotsData,
} from './types';

export function useImageGeneration(options: UseImageGenerationOptions): UseImageGenerationReturn {
  const { projectId, onImageSaved, outputMode } = options;
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);

  // Track active polling
  const pollingRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const pollAttemptsRef = useRef<Map<string, number>>(new Map());

  // Track saved prompt IDs to prevent duplicates (ref for synchronous check)
  const savedPromptIdsRef = useRef<Set<string>>(new Set());

  // Track pending slot allocations to prevent race conditions when saving multiple images
  const pendingSlotsRef = useRef<{ left: Set<number>; right: Set<number> }>({
    left: new Set(),
    right: new Set(),
  });

  // Ref to always access current slot state (avoids stale closure issues with memoized callbacks)
  const currentSlotsRef = useRef<{ left: import('./types').PanelSlot[]; right: import('./types').PanelSlot[] }>({
    left: [],
    right: [],
  });

  // Ref to always access current generated images (avoids stale closure in saveImageToPanel)
  const generatedImagesRef = useRef<GeneratedImage[]>([]);

  // Use local persistence hook for panel slots (IndexedDB)
  // Storage key is project-scoped so each project has separate panel images
  const storageKey = getStorageKey(projectId);
  const panelStorage = useLocalPersistedEntity<PanelSlotsData>({
    storageKey,
    initialValue: initialPanelData,
    onLoaded: (data) => {
      // Rebuild saved prompt IDs ref when loaded
      savedPromptIdsRef.current.clear();
      data.leftSlots.forEach((slot) => {
        if (slot.image?.promptId) {
          savedPromptIdsRef.current.add(slot.image.promptId);
        }
      });
      data.rightSlots.forEach((slot) => {
        if (slot.image?.promptId) {
          savedPromptIdsRef.current.add(slot.image.promptId);
        }
      });
    },
  });

  // Extract panel slots with proper padding
  const leftPanelSlots = useMemo(() => {
    const slots = panelStorage.data.leftSlots.slice(0, SLOTS_PER_SIDE);
    while (slots.length < SLOTS_PER_SIDE) {
      slots.push({ index: slots.length, image: null });
    }
    return slots;
  }, [panelStorage.data.leftSlots]);

  const rightPanelSlots = useMemo(() => {
    const slots = panelStorage.data.rightSlots.slice(0, SLOTS_PER_SIDE);
    while (slots.length < SLOTS_PER_SIDE) {
      slots.push({ index: slots.length, image: null });
    }
    return slots;
  }, [panelStorage.data.rightSlots]);

  // Keep refs in sync with current state (for use in callbacks that might be stale)
  useEffect(() => {
    currentSlotsRef.current = { left: leftPanelSlots, right: rightPanelSlots };
  }, [leftPanelSlots, rightPanelSlots]);

  useEffect(() => {
    generatedImagesRef.current = generatedImages;
  }, [generatedImages]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      pollingRef.current.forEach((timeout) => clearTimeout(timeout));
      pollingRef.current.clear();
    };
  }, []);

  // Clear pending slots AFTER React state updates are processed
  // Only clear slots that are ACTUALLY filled in state - keeps pending for in-flight saves
  useEffect(() => {
    // Clear pending for slots that now have images in state
    panelStorage.data.leftSlots.forEach((slot, i) => {
      if (slot.image) {
        pendingSlotsRef.current.left.delete(i);
      }
    });
    panelStorage.data.rightSlots.forEach((slot, i) => {
      if (slot.image) {
        pendingSlotsRef.current.right.delete(i);
      }
    });
  }, [panelStorage.data]);

  // Shared params objects for helper functions
  const pollParams: PollGenerationParams = useMemo(() => ({
    pollingRef,
    pollAttemptsRef,
    setGeneratedImages,
  }), []);

  const panelParams: PanelOperationParams = useMemo(() => ({
    panelStorage,
    savedPromptIdsRef,
    pendingSlotsRef,
    currentSlotsRef,
    generatedImagesRef,
  }), [panelStorage]);

  // --- Generation operations ---

  const generateImagesFromPrompts = useCallback(
    async (prompts: Array<{ id: string; prompt: string }>) => {
      await generateImagesFromPromptsFn(prompts, {
        ...pollParams,
        currentGeneratedImages: generatedImages,
        setIsGeneratingImages,
      });
    },
    [pollParams, generatedImages]
  );

  // --- Panel operations ---

  const saveImageToPanel = useCallback((promptId: string, promptText: string): boolean => {
    return saveImageToPanelFn(promptId, promptText, panelParams, {
      onImageSaved,
      outputMode,
      generatedImages,
    });
  }, [generatedImages, panelParams, onImageSaved, outputMode]);
  // Note: leftPanelSlots/rightPanelSlots removed - we use currentSlotsRef to avoid stale closures

  const uploadImageToPanel = useCallback((
    side: 'left' | 'right',
    slotIndex: number,
    imageUrl: string,
    prompt: string = 'Uploaded image'
  ) => {
    uploadImageToPanelFn(side, slotIndex, imageUrl, prompt, { panelStorage }, {
      leftPanelSlots,
      rightPanelSlots,
      onImageSaved,
    });
  }, [leftPanelSlots, rightPanelSlots, panelStorage, onImageSaved]);

  const removePanelImage = useCallback((imageId: string) => {
    removePanelImageFn(imageId, { panelStorage, savedPromptIdsRef });
  }, [panelStorage]);

  const updatePanelImage = useCallback(async (imageId: string, newUrl: string) => {
    await updatePanelImageFn(imageId, newUrl, { panelStorage }, projectId);
  }, [panelStorage, projectId]);

  const updatePanelImageVideo = useCallback(async (imageId: string, videoUrl: string) => {
    await updatePanelImageVideoFn(imageId, videoUrl, { panelStorage }, projectId);
  }, [panelStorage, projectId]);

  const updateGeneratedImageUrl = useCallback((promptId: string, newUrl: string) => {
    updateGeneratedImageUrlFn(promptId, newUrl, setGeneratedImages);
  }, []);

  const clearGeneratedImages = useCallback(() => {
    // Stop all polling
    pollingRef.current.forEach((timeout) => clearTimeout(timeout));
    pollingRef.current.clear();
    pollAttemptsRef.current.clear();

    setGeneratedImages([]);
    setIsGeneratingImages(false);
  }, []);

  /**
   * Delete all generations from Leonardo and clear local state.
   * Does NOT affect panel slots - only clears generated images.
   */
  const deleteAllGenerations = useCallback(async () => {
    // Stop all polling first
    pollingRef.current.forEach((timeout) => clearTimeout(timeout));
    pollingRef.current.clear();
    pollAttemptsRef.current.clear();

    // Get generation IDs to delete from Leonardo
    const generationIds = generatedImages
      .filter((img) => img.generationId)
      .map((img) => img.generationId!);

    // Clear local state immediately for responsive UI
    setGeneratedImages([]);
    setIsGeneratingImages(false);

    // Delete from Leonardo in background (don't block UI)
    if (generationIds.length > 0) {
      try {
        await fetch('/api/ai/generate-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generationIds }),
        });
      } catch (error) {
        console.error('Failed to delete generations from Leonardo:', error);
        // Continue even if deletion fails - local state is already cleared
      }
    }
  }, [generatedImages]);

  /**
   * Delete a single generated image by prompt ID.
   * Removes from local state and deletes from Leonardo API.
   */
  const deleteGeneration = useCallback(async (promptId: string) => {
    // Find the image to delete
    const imageToDelete = generatedImages.find((img) => img.promptId === promptId);
    if (!imageToDelete) return;

    // Stop polling for this image if active
    const pollTimeout = pollingRef.current.get(promptId);
    if (pollTimeout) {
      clearTimeout(pollTimeout);
      pollingRef.current.delete(promptId);
    }
    pollAttemptsRef.current.delete(promptId);

    // Remove from local state immediately for responsive UI
    setGeneratedImages((prev) => prev.filter((img) => img.promptId !== promptId));

    // Delete from Leonardo in background (don't block UI)
    if (imageToDelete.generationId) {
      try {
        await fetch('/api/ai/generate-images', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ generationIds: [imageToDelete.generationId] }),
        });
      } catch (error) {
        console.error('Failed to delete generation from Leonardo:', error);
        // Continue even if deletion fails - local state is already cleared
      }
    }
  }, [generatedImages]);

  const resetSaveTracking = useCallback(() => {
    resetSaveTrackingFn({ savedPromptIdsRef, pendingSlotsRef, currentSlotsRef });
  }, []);

  const clearPanelSlots = useCallback(() => {
    clearPanelSlotsFn({ panelStorage, savedPromptIdsRef, pendingSlotsRef });
  }, [panelStorage]);

  const hydratePanelImages = useCallback((dbImages: import('./types').SavedPanelImage[]) => {
    hydratePanelImagesFn(dbImages, { panelStorage, savedPromptIdsRef, pendingSlotsRef });
  }, [panelStorage]);

  // Update isGeneratingImages when all images are done
  useEffect(() => {
    if (generatedImages.length > 0) {
      const allDone = generatedImages.every(
        (img) => img.status === 'complete' || img.status === 'failed'
      );
      if (allDone) {
        setIsGeneratingImages(false);
      }
    }
  }, [generatedImages]);

  return {
    generatedImages,
    isGeneratingImages,
    leftPanelSlots,
    rightPanelSlots,
    generateImagesFromPrompts,
    saveImageToPanel,
    uploadImageToPanel,
    removePanelImage,
    updatePanelImage,
    updatePanelImageVideo,
    updateGeneratedImageUrl,
    clearGeneratedImages,
    deleteAllGenerations,
    deleteGeneration,
    clearPanelSlots,
    resetSaveTracking,
    hydratePanelImages,
  };
}
