// ============================================================================
// FEEDBACK TYPES - Simulation feedback, dimension adjustments, generate API
// ============================================================================

import type { DimensionType, OutputMode, PromptElement } from './base';

export interface SimulationFeedback {
  positive: string;
  negative: string;
}

// Unified generation API types
export interface DimensionAdjustment {
  type: DimensionType;
  originalValue: string;
  newValue: string;
  wasModified: boolean;
  changeReason: string;
}

export interface GenerateWithFeedbackRequest {
  baseImage: string;
  dimensions: Array<{ type: DimensionType; label: string; reference: string }>;
  feedback: SimulationFeedback;
  outputMode: OutputMode;
  lockedElements: PromptElement[];
}

export interface GenerateWithFeedbackResponse {
  success: boolean;
  adjustedDimensions: DimensionAdjustment[];
  prompts: Array<{
    id: string;
    sceneNumber: number;
    sceneType: string;
    prompt: string;
    elements: PromptElement[];
  }>;
  reasoning: string;
  error?: string;
}
