// ============================================================================
// IMAGE TYPES - Saved images, generated images, panel slots, posters,
//               comparison view types
// ============================================================================

import type { Dimension, GeneratedPrompt, PromptElement } from './base';

// Panel image saved to side panel slot
export interface SavedPanelImage {
  id: string;
  url: string;
  videoUrl?: string;  // Generated video URL from Seedance
  prompt: string;
  promptId?: string;  // Reference to the original generated prompt
  side: 'left' | 'right';
  slotIndex: number;
  createdAt: string;
}

// Generated image from Leonardo API
export interface GeneratedImage {
  id: string;
  promptId: string;  // Links to GeneratedPrompt
  url: string | null;
  status: 'pending' | 'generating' | 'complete' | 'failed';
  error?: string;
  generationId?: string;  // Leonardo generation ID for polling
}

// Panel slot state
export interface PanelSlot {
  index: number;
  image: SavedPanelImage | null;
}

// Project poster for key art
export interface ProjectPoster {
  id: string;
  projectId: string;
  imageUrl: string;
  prompt: string;
  dimensionsJson: string;
  createdAt: string;
}

// ============================================
// Comparison View Types
// ============================================

/**
 * ComparisonItem - A single item in a side-by-side comparison
 */
export interface ComparisonItem {
  prompt: GeneratedPrompt;
  image?: GeneratedImage;
  index: number;
}

/**
 * ElementDiff - Result of comparing elements between two prompts
 */
export interface ElementDiff {
  /** Elements only in the first prompt */
  onlyInFirst: PromptElement[];
  /** Elements only in the second prompt */
  onlyInSecond: PromptElement[];
  /** Elements common to both prompts */
  common: PromptElement[];
}

/**
 * ComparisonViewOptions - Options for controlling comparison display
 */
export interface ComparisonViewOptions {
  showDimensions: boolean;
  showElements: boolean;
  showImages: boolean;
  highlightDifferences: boolean;
}

/**
 * ComparisonModalProps - Props for the comparison modal
 */
export interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** All generated prompts available for comparison */
  allPrompts: GeneratedPrompt[];
  /** All generated images for finding matching images */
  allImages: GeneratedImage[];
  /** Initially selected prompt IDs for comparison */
  initialSelectedIds?: string[];
  /** Dimensions used in generation (for context) */
  dimensions: Dimension[];
}
