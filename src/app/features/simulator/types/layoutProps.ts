// ============================================================================
// LAYOUT TYPES - SimulatorLayoutProps and related component prop types
// ============================================================================

import type {
  Dimension,
  DimensionFilterMode,
  DimensionTransformMode,
  DimensionPreset,
  GeneratedPrompt,
  OutputMode,
  PromptElement,
} from './base';
import type { SavedPanelImage, GeneratedImage, PanelSlot, ProjectPoster } from './images';

export interface SimulatorLayoutProps {
  baseImage: string;
  setBaseImage: (val: string) => void;
  baseImageFile: string | null;
  setBaseImageFile: (val: string | null) => void;
  handleImageParse: (imageDataUrl: string) => void;
  isParsingImage: boolean;
  imageParseError: string | null;
  dimensions: Dimension[];
  handleDimensionChange: (id: string, reference: string) => void;
  handleDimensionWeightChange: (id: string, weight: number) => void;
  handleDimensionFilterModeChange: (id: string, filterMode: DimensionFilterMode) => void;
  handleDimensionTransformModeChange: (id: string, transformMode: DimensionTransformMode) => void;
  handleDimensionReferenceImageChange?: (id: string, imageDataUrl: string | null) => void;
  handleDimensionRemove: (id: string) => void;
  handleDimensionAdd: (preset: DimensionPreset) => void;
  handleDimensionReorder: (reorderedDimensions: Dimension[]) => void;
  generatedPrompts: GeneratedPrompt[];
  handlePromptRate: (id: string, rating: 'up' | 'down' | null) => void;
  handlePromptLock: (id: string) => void;
  handleElementLock: (promptId: string, elementId: string) => void;
  handleCopy: (id: string) => void;
  handleAcceptElement: (element: PromptElement) => void;
  acceptingElementId: string | null;
  // Concept-based bidirectional flow
  handleDropElementOnDimension?: (element: PromptElement, dimensionId: string) => void;
  feedback: { positive: string; negative: string };
  setFeedback: (val: { positive: string; negative: string }) => void;
  isGenerating: boolean;
  handleGenerate: () => void;
  canGenerate: boolean;
  outputMode: OutputMode;
  setOutputMode: (mode: OutputMode) => void;
  handleSmartBreakdownApply: (
    visionSentence: string,
    baseImage: string,
    dimensions: Dimension[],
    outputMode: OutputMode,
    breakdown: { baseImage: { format: string; keyElements: string[] }; reasoning: string }
  ) => void;
  pendingDimensionChange: any;
  handleUndoDimensionChange: () => void;
  onConvertElementsToDimensions: (dimensions: Dimension[]) => void;
  onViewPrompt: (prompt: GeneratedPrompt) => void;
  // Side panel props
  leftPanelSlots: PanelSlot[];
  rightPanelSlots: PanelSlot[];
  onRemovePanelImage?: (imageId: string) => void;
  onViewPanelImage?: (image: SavedPanelImage) => void;
  // Image generation props
  generatedImages: GeneratedImage[];
  isGeneratingImages: boolean;
  onStartImage?: (promptId: string) => void;  // Save generated image to panel
  savedPromptIds?: Set<string>;  // Track which prompts have been saved to panel
  // Poster props
  projectPoster?: ProjectPoster | null;
  showPosterOverlay?: boolean;
  onTogglePosterOverlay?: () => void;
  isGeneratingPoster?: boolean;
  // Delete generations
  onDeleteGenerations?: () => Promise<void>;
  // Comparison props
  onOpenComparison?: () => void;
  // Prompt history props
  promptHistory?: {
    canUndo: boolean;
    canRedo: boolean;
    historyLength: number;
    positionLabel: string;
  };
  onPromptUndo?: () => void;
  onPromptRedo?: () => void;
}
