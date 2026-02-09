/**
 * Type definitions for useImageGeneration hook
 */

import { GeneratedImage, SavedPanelImage, PanelSlot } from '../../types';

// Re-export domain types used by consumers
export type { GeneratedImage, SavedPanelImage, PanelSlot };

export interface GenerationStartResponse {
  success: boolean;
  generations?: Array<{
    promptId: string;
    generationId: string;
    status: 'started' | 'failed';
    error?: string;
  }>;
  error?: string;
}

export interface GenerationCheckResponse {
  success: boolean;
  generationId: string;
  status: 'pending' | 'complete' | 'failed';
  images?: Array<{ url: string; id: string }>;
  error?: string;
}

export interface PanelSlotsData {
  leftSlots: PanelSlot[];
  rightSlots: PanelSlot[];
}

/** Info about a saved panel image - for database sync */
export interface SavedPanelImageInfo {
  id: string;
  side: 'left' | 'right';
  slotIndex: number;
  imageUrl: string;
  prompt: string;
  type?: 'gameplay' | 'trailer' | 'sketch' | 'poster' | 'realistic' | null;
}

export interface UseImageGenerationOptions {
  /** Current project ID - used for project-scoped panel image storage */
  projectId: string | null;
  /** Optional callback fired when an image is saved to panel - for database sync */
  onImageSaved?: (info: SavedPanelImageInfo) => void;
  /** Current output mode - saved with panel images for filtering */
  outputMode?: 'gameplay' | 'trailer' | 'sketch' | 'poster' | 'realistic';
}

export interface UseImageGenerationReturn {
  generatedImages: GeneratedImage[];
  isGeneratingImages: boolean;
  leftPanelSlots: PanelSlot[];
  rightPanelSlots: PanelSlot[];
  generateImagesFromPrompts: (prompts: Array<{ id: string; prompt: string }>) => Promise<void>;
  saveImageToPanel: (promptId: string, promptText: string) => boolean;
  /** Upload an external image URL to a specific panel slot */
  uploadImageToPanel: (side: 'left' | 'right', slotIndex: number, imageUrl: string, prompt?: string) => void;
  removePanelImage: (imageId: string) => void;
  updatePanelImage: (imageId: string, newUrl: string) => Promise<void>;
  updatePanelImageVideo: (imageId: string, videoUrl: string) => Promise<void>;
  /** Update a generated image's URL in-memory (for polish operations before save) */
  updateGeneratedImageUrl: (promptId: string, newUrl: string) => void;
  clearGeneratedImages: () => void;
  deleteAllGenerations: () => Promise<void>;
  /** Delete a single generated image by prompt ID */
  deleteGeneration: (promptId: string) => Promise<void>;
  clearPanelSlots: () => void;
  /** Rebuild savedPromptIdsRef from actual slot state -- call before new autoplay sessions */
  resetSaveTracking: () => void;
  /** Hydrate panel slots from database images (fills empty local slots with DB data) */
  hydratePanelImages: (dbImages: SavedPanelImage[]) => void;
}
