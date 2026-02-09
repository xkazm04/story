// Category system
export type CategoryId =
  | 'hair' | 'eyes' | 'nose' | 'mouth' | 'expression'
  | 'makeup' | 'markings' | 'accessories' | 'facialHair'
  | 'skinTone' | 'age' | 'bodyType' | 'lighting' | 'background';

export interface Category {
  id: CategoryId;
  label: string;
  icon: string; // Lucide icon name
  promptTemplate: string; // e.g., "with {value} hair"
  group: 'face' | 'features' | 'body' | 'environment';
}

// Option for each category
export interface CategoryOption {
  id: string | number;
  name: string;
  /** Icon registry key rendered by CreatorIcon (e.g. 'hair-longWavy') */
  preview?: string;
  description?: string;
  promptValue: string; // The value used in prompt composition
  metadata?: Record<string, unknown>;
}

// Selection state
export interface CategorySelection {
  categoryId: CategoryId;
  optionId: string | number | null;
  customPrompt?: string; // User override
  isCustom: boolean;
}

// Prompt unit - only exists if defined
export interface PromptUnit {
  categoryId: CategoryId;
  value: string;
  order: number;
}

// Complete character state
export interface CharacterState {
  name: string;
  selections: Record<CategoryId, CategorySelection>;
}

// UI State
export interface UIState {
  activeCategory: CategoryId | null;
  leftSidebarOpen: boolean;
  rightSidebarOpen: boolean;
  showPromptPreview: boolean;
  zoom: number;
  isGenerating: boolean;
  generationStep: number;
  generationProgress: number;
}

// Toast notification
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Preset character template
export interface Preset {
  id: number;
  name: string;
  icon: string;
  gradient: string;
  selections: Partial<Record<CategoryId, string | number>>;
}
