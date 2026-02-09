/**
 * Panel operations as pure functions.
 * These are NOT hooks — they accept state setters, refs, and storage as parameters
 * so the main hook can orchestrate them.
 */

import { GeneratedImage, SavedPanelImage, PanelSlot, PanelSlotsData, SavedPanelImageInfo } from './types';
import { createEmptySlots, initialPanelData } from './constants';
import { UseLocalPersistedEntityReturn } from '../useLocalPersistedEntity';
import { SLOTS_PER_SIDE } from '../../subfeature_panels/components/SidePanel';
import { v4 as uuidv4 } from 'uuid';

/** Common refs and storage needed by panel operations */
export interface PanelOperationParams {
  panelStorage: UseLocalPersistedEntityReturn<PanelSlotsData>;
  savedPromptIdsRef: React.MutableRefObject<Set<string>>;
  pendingSlotsRef: React.MutableRefObject<{ left: Set<number>; right: Set<number> }>;
  currentSlotsRef: React.MutableRefObject<{ left: PanelSlot[]; right: PanelSlot[] }>;
  generatedImagesRef: React.MutableRefObject<GeneratedImage[]>;
}

/** Helper to normalize slots array to SLOTS_PER_SIDE length */
function normalizeSlots(slots: PanelSlot[]): PanelSlot[] {
  const result: PanelSlot[] = [];
  for (let i = 0; i < SLOTS_PER_SIDE; i++) {
    result.push(slots[i] || { index: i, image: null });
  }
  return result;
}

/**
 * Save a generated image to the next available panel slot.
 * Uses ref-based tracking to prevent duplicate saves and slot collisions.
 */
export function saveImageToPanel(
  promptId: string,
  promptText: string,
  params: PanelOperationParams,
  options: {
    onImageSaved?: (info: SavedPanelImageInfo) => void;
    outputMode?: 'gameplay' | 'trailer' | 'sketch' | 'poster' | 'realistic';
    generatedImages: GeneratedImage[];
  }
): boolean {
  const { panelStorage, savedPromptIdsRef, pendingSlotsRef, currentSlotsRef, generatedImagesRef } = params;
  const { onImageSaved, outputMode } = options;

  console.log('[saveImageToPanel] Called:', { promptId, promptText: promptText?.substring(0, 50) });

  // Guard: Don't save while IndexedDB is still loading - slots would appear empty
  if (!panelStorage.isInitialized) {
    console.warn('[saveImageToPanel] BLOCKED: panel data not yet loaded from IndexedDB');
    return false;
  }

  // CRITICAL: Look up the generated image FIRST -- we need its URL for dedup
  // Use ref to get CURRENT generated images, not stale closure values
  const currentImages = generatedImagesRef.current;
  const image = currentImages.find((img) => img.promptId === promptId);
  if (!image || image.status !== 'complete' || !image.url) {
    console.warn('[saveImageToPanel] BLOCKED: image not found or not complete', {
      found: !!image,
      status: image?.status,
      hasUrl: !!image?.url,
      refImagesCount: currentImages.length,
      closureImagesCount: options.generatedImages.length,
    });
    return false;
  }

  // Check if this EXACT image (by URL) is already in a panel slot.
  // IMPORTANT: Match by URL, NOT by promptId -- deterministic promptIds like
  // 'sketch-portrait-002' are reused across autoplay iterations for different images.
  const allSlots = [...currentSlotsRef.current.left, ...currentSlotsRef.current.right];
  const alreadyInSlot = allSlots.some(slot => slot.image?.url === image.url);
  if (alreadyInSlot) {
    savedPromptIdsRef.current.add(promptId);
    console.warn('[saveImageToPanel] BLOCKED: exact image URL already in panel slot');
    return false;
  }

  // Check savedPromptIdsRef for rapid concurrent saves
  if (savedPromptIdsRef.current.has(promptId)) {
    // Ref says this promptId was saved, but the current image URL isn't in any slot.
    // This means it's a stale entry (e.g. different iteration reusing same promptId).
    // Clear it and proceed with the save.
    console.log('[saveImageToPanel] Clearing stale savedPromptIdsRef entry for', promptId, '(new URL, not in slots)');
    savedPromptIdsRef.current.delete(promptId);
  }

  // CRITICAL: Use ref to get CURRENT slot state, not stale closure values
  // This fixes the issue where memoized callbacks have outdated slot data
  const currentLeftSlots = currentSlotsRef.current.left;
  const currentRightSlots = currentSlotsRef.current.right;

  console.log('[saveImageToPanel] Slot state:', {
    leftCount: currentLeftSlots.length,
    rightCount: currentRightSlots.length,
    emptyLeft: currentLeftSlots.filter(s => !s.image).length,
    emptyRight: currentRightSlots.filter(s => !s.image).length,
    pendingLeft: pendingSlotsRef.current.left.size,
    pendingRight: pendingSlotsRef.current.right.size,
  });

  // Find AND claim first available slot atomically
  // This prevents race conditions when saving multiple images rapidly
  const findAndClaimSlot = (
    slots: PanelSlot[],
    pendingSet: Set<number>
  ): number => {
    for (let i = 0; i < slots.length; i++) {
      if (!slots[i].image && !pendingSet.has(i)) {
        // IMMEDIATELY claim this slot before returning
        pendingSet.add(i);
        return i;
      }
    }
    return -1;
  };

  // Mark as saved IMMEDIATELY (before any async operations)
  savedPromptIdsRef.current.add(promptId);

  // Try left panel first, then right - claiming slot atomically
  let targetPanel: 'left' | 'right';
  let targetIndex: number;

  const leftEmptyIndex = findAndClaimSlot(currentLeftSlots, pendingSlotsRef.current.left);
  if (leftEmptyIndex !== -1) {
    targetPanel = 'left';
    targetIndex = leftEmptyIndex;
  } else {
    const rightEmptyIndex = findAndClaimSlot(currentRightSlots, pendingSlotsRef.current.right);
    if (rightEmptyIndex !== -1) {
      targetPanel = 'right';
      targetIndex = rightEmptyIndex;
    } else {
      // No slots available - undo the savedPromptIds claim
      console.warn('[saveImageToPanel] BLOCKED: no empty slots available');
      savedPromptIdsRef.current.delete(promptId);
      return false;
    }
  }

  console.log('[saveImageToPanel] SUCCESS: saving to', targetPanel, 'slot', targetIndex);

  // Create the saved image object
  const newImage: SavedPanelImage = {
    id: uuidv4(),
    url: image.url,
    prompt: promptText,
    promptId: promptId,
    side: targetPanel,
    slotIndex: targetIndex,
    createdAt: new Date().toISOString(),
  };

  // Update panel storage using the local persistence hook
  // NOTE: We must ensure slots array has SLOTS_PER_SIDE elements to support indices 0-9
  // Old data from IndexedDB may only have 5 slots
  panelStorage.setData((prev) => {
    if (targetPanel === 'left') {
      const normalizedSlots = normalizeSlots(prev.leftSlots);
      return {
        ...prev,
        leftSlots: normalizedSlots.map((slot, i) =>
          i === targetIndex ? { ...slot, image: newImage } : slot
        ),
      };
    } else {
      const normalizedSlots = normalizeSlots(prev.rightSlots);
      return {
        ...prev,
        rightSlots: normalizedSlots.map((slot, i) =>
          i === targetIndex ? { ...slot, image: newImage } : slot
        ),
      };
    }
  });
  console.log('[saveImageToPanel] panelStorage.setData called for', targetPanel, 'slot', targetIndex);
  // NOTE: Don't clear pending here - it's cleared by useEffect after state updates

  // Call callback for database sync (if provided)
  if (onImageSaved) {
    onImageSaved({
      id: newImage.id,
      side: targetPanel,
      slotIndex: targetIndex,
      imageUrl: image.url,
      prompt: promptText,
      type: outputMode || null,
    });
  }

  return true;
}

/**
 * Upload an external image URL to a specific panel slot.
 * Unlike saveImageToPanel, this takes a specific slot rather than finding the next available.
 */
export function uploadImageToPanel(
  side: 'left' | 'right',
  slotIndex: number,
  imageUrl: string,
  prompt: string = 'Uploaded image',
  params: Pick<PanelOperationParams, 'panelStorage'>,
  options: {
    leftPanelSlots: PanelSlot[];
    rightPanelSlots: PanelSlot[];
    onImageSaved?: (info: SavedPanelImageInfo) => void;
  }
): void {
  const { panelStorage } = params;
  const { leftPanelSlots, rightPanelSlots, onImageSaved } = options;

  // Guard: Don't save while IndexedDB is still loading - slots would appear empty
  if (!panelStorage.isInitialized) {
    console.warn('[uploadImageToPanel] Skipping upload - panel data not yet loaded from IndexedDB');
    return;
  }

  // Validate slot index
  if (slotIndex < 0 || slotIndex >= SLOTS_PER_SIDE) {
    console.warn('[uploadImageToPanel] Invalid slot index:', slotIndex);
    return;
  }

  // Check if slot is already occupied
  const slots = side === 'left' ? leftPanelSlots : rightPanelSlots;
  if (slots[slotIndex]?.image) {
    console.warn('[uploadImageToPanel] Slot is already occupied:', side, slotIndex);
    return;
  }

  // Create the saved image object (no promptId since this is an external upload)
  const newImage: SavedPanelImage = {
    id: uuidv4(),
    url: imageUrl,
    prompt,
    promptId: undefined, // External upload, no associated prompt
    side,
    slotIndex,
    createdAt: new Date().toISOString(),
  };

  // Update panel storage
  // NOTE: Normalize slots to SLOTS_PER_SIDE to handle old data with only 5 slots
  panelStorage.setData((prev) => {
    if (side === 'left') {
      const normalizedSlots = normalizeSlots(prev.leftSlots);
      return {
        ...prev,
        leftSlots: normalizedSlots.map((slot, i) =>
          i === slotIndex ? { ...slot, image: newImage } : slot
        ),
      };
    } else {
      const normalizedSlots = normalizeSlots(prev.rightSlots);
      return {
        ...prev,
        rightSlots: normalizedSlots.map((slot, i) =>
          i === slotIndex ? { ...slot, image: newImage } : slot
        ),
      };
    }
  });

  // Call callback for database sync (if provided)
  if (onImageSaved) {
    onImageSaved({
      id: newImage.id,
      side,
      slotIndex,
      imageUrl,
      prompt,
    });
  }
}

/**
 * Remove an image from a panel slot.
 */
export function removePanelImage(
  imageId: string,
  params: Pick<PanelOperationParams, 'panelStorage' | 'savedPromptIdsRef'>
): void {
  const { panelStorage, savedPromptIdsRef } = params;

  panelStorage.setData((prev) => ({
    leftSlots: prev.leftSlots.map((slot) => {
      if (slot.image?.id === imageId) {
        // Clean up ref tracking
        if (slot.image.promptId) {
          savedPromptIdsRef.current.delete(slot.image.promptId);
        }
        return { ...slot, image: null };
      }
      return slot;
    }),
    rightSlots: prev.rightSlots.map((slot) => {
      if (slot.image?.id === imageId) {
        // Clean up ref tracking
        if (slot.image.promptId) {
          savedPromptIdsRef.current.delete(slot.image.promptId);
        }
        return { ...slot, image: null };
      }
      return slot;
    }),
  }));
}

/**
 * Update an image's URL (for Gemini regeneration).
 * Updates both local state and persists to database.
 */
export async function updatePanelImage(
  imageId: string,
  newUrl: string,
  params: Pick<PanelOperationParams, 'panelStorage'>,
  projectId: string | null
): Promise<void> {
  const { panelStorage } = params;

  // Update local state immediately for responsive UI
  panelStorage.setData((prev) => ({
    leftSlots: prev.leftSlots.map((slot) =>
      slot.image?.id === imageId
        ? { ...slot, image: { ...slot.image, url: newUrl } }
        : slot
    ),
    rightSlots: prev.rightSlots.map((slot) =>
      slot.image?.id === imageId
        ? { ...slot, image: { ...slot.image, url: newUrl } }
        : slot
    ),
  }));

  // Persist to database if we have a project ID
  if (projectId) {
    try {
      await fetch(`/api/simulator-projects/${projectId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, imageUrl: newUrl }),
      });
    } catch (err) {
      console.error('[useImageGeneration] Failed to persist image update:', err);
    }
  }
}

/**
 * Update an image's video URL (for Seedance video generation).
 * Updates both local state and persists to database.
 */
export async function updatePanelImageVideo(
  imageId: string,
  videoUrl: string,
  params: Pick<PanelOperationParams, 'panelStorage'>,
  projectId: string | null
): Promise<void> {
  const { panelStorage } = params;

  console.log('[useImageGeneration] updatePanelImageVideo called:', { imageId, videoUrl: videoUrl?.substring(0, 50), projectId });

  // Update local state immediately for responsive UI
  panelStorage.setData((prev) => ({
    leftSlots: prev.leftSlots.map((slot) =>
      slot.image?.id === imageId
        ? { ...slot, image: { ...slot.image, videoUrl } }
        : slot
    ),
    rightSlots: prev.rightSlots.map((slot) =>
      slot.image?.id === imageId
        ? { ...slot, image: { ...slot.image, videoUrl } }
        : slot
    ),
  }));

  // Persist to database if we have a project ID
  if (projectId) {
    try {
      console.log('[useImageGeneration] Saving video URL to database...');
      const response = await fetch(`/api/simulator-projects/${projectId}/images`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageId, videoUrl }),
      });
      const result = await response.json();
      console.log('[useImageGeneration] Video URL save result:', result);
      if (!result.success) {
        console.error('[useImageGeneration] Video URL save failed:', result.error);
      }
    } catch (err) {
      console.error('[useImageGeneration] Failed to persist video URL update:', err);
    }
  } else {
    console.warn('[useImageGeneration] No projectId - video URL not saved to database');
  }
}

/**
 * Update a generated image's URL in-memory (for polish operations).
 * Called before saveImageToPanel so the polished URL gets saved instead of the original.
 */
export function updateGeneratedImageUrl(
  promptId: string,
  newUrl: string,
  setGeneratedImages: React.Dispatch<React.SetStateAction<GeneratedImage[]>>
): void {
  setGeneratedImages(prev =>
    prev.map(img => img.promptId === promptId ? { ...img, url: newUrl } : img)
  );
}

/**
 * Rebuild savedPromptIdsRef from actual panel slot state.
 * Call this before starting a new autoplay session to clear stale entries
 * where the ref thinks an image is saved but it's not actually in any slot.
 */
export function resetSaveTracking(
  params: Pick<PanelOperationParams, 'savedPromptIdsRef' | 'pendingSlotsRef' | 'currentSlotsRef'>
): void {
  const { savedPromptIdsRef, pendingSlotsRef, currentSlotsRef } = params;
  const left = currentSlotsRef.current.left;
  const right = currentSlotsRef.current.right;
  savedPromptIdsRef.current.clear();
  pendingSlotsRef.current.left.clear();
  pendingSlotsRef.current.right.clear();
  [...left, ...right].forEach(slot => {
    if (slot.image?.promptId) {
      savedPromptIdsRef.current.add(slot.image.promptId);
    }
  });
  console.log('[resetSaveTracking] Rebuilt savedPromptIdsRef with', savedPromptIdsRef.current.size, 'entries from', left.length + right.length, 'slots');
}

/**
 * Clear all panel slots (reset to empty).
 */
export function clearPanelSlots(
  params: Pick<PanelOperationParams, 'panelStorage' | 'savedPromptIdsRef' | 'pendingSlotsRef'>
): void {
  const { panelStorage, savedPromptIdsRef, pendingSlotsRef } = params;
  savedPromptIdsRef.current.clear();
  pendingSlotsRef.current.left.clear();
  pendingSlotsRef.current.right.clear();
  panelStorage.setData(initialPanelData);
}

/**
 * Hydrate panel slots from database images.
 * Fully replaces local slot data with DB data (DB is source of truth).
 * Uses overrideNextLoad to survive storage key changes (project switch).
 */
export function hydratePanelImages(
  dbImages: SavedPanelImage[],
  params: Pick<PanelOperationParams, 'panelStorage' | 'savedPromptIdsRef' | 'pendingSlotsRef'>
): void {
  const { panelStorage, savedPromptIdsRef, pendingSlotsRef } = params;
  savedPromptIdsRef.current.clear();
  pendingSlotsRef.current.left.clear();
  pendingSlotsRef.current.right.clear();

  const newLeft = createEmptySlots();
  const newRight = createEmptySlots();

  if (dbImages && dbImages.length > 0) {
    for (const dbImg of dbImages) {
      const targetSlots = dbImg.side === 'left' ? newLeft : newRight;
      const idx = dbImg.slotIndex;
      if (idx < 0 || idx >= SLOTS_PER_SIDE) continue;

      targetSlots[idx] = { index: idx, image: dbImg };
      if (dbImg.promptId) {
        savedPromptIdsRef.current.add(dbImg.promptId);
      }
    }
  }

  const newData = { leftSlots: newLeft, rightSlots: newRight };

  // Use overrideNextLoad so the data survives the storageKey change
  // that happens when onProjectChange fires after hydration.
  // When loadFromStorage fires for the new key, it uses this data
  // instead of reading (potentially stale) IndexedDB data.
  panelStorage.overrideNextLoad(newData);
}
