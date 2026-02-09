/**
 * Constants for useImageGeneration hook
 */

import { PanelSlot, PanelSlotsData } from './types';
import { SLOTS_PER_SIDE } from '../../subfeature_panels/components/SidePanel';

export const STORAGE_KEY_PREFIX = 'panel_images';

export const POLL_INTERVAL = 2000; // 2 seconds
export const MAX_POLL_ATTEMPTS = 60; // 2 minutes max

// Generate project-scoped storage key
export const getStorageKey = (projectId: string | null) =>
  projectId ? `${STORAGE_KEY_PREFIX}_${projectId}` : STORAGE_KEY_PREFIX;

export const createEmptySlots = (): PanelSlot[] =>
  Array.from({ length: SLOTS_PER_SIDE }, (_, i) => ({ index: i, image: null }));

export const initialPanelData: PanelSlotsData = {
  leftSlots: createEmptySlots(),
  rightSlots: createEmptySlots(),
};
