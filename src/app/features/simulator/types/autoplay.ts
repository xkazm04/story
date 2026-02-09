// ============================================================================
// AUTOPLAY TYPES - Autoplay state machine, polish, multi-phase, event logging
// ============================================================================

// ============================================
// Autoplay Types
// ============================================

/**
 * AutoplayStatus - Current state of the autoplay state machine
 */
export type AutoplayStatus =
  | 'idle'           // Not running
  | 'generating'     // Waiting for image generation
  | 'evaluating'     // Sending image to Gemini for evaluation
  | 'polishing'      // Polishing near-approval images via Gemini
  | 'refining'       // Applying feedback, preparing next iteration
  | 'complete'       // Target met or max iterations reached
  | 'error'          // Error state
  | 'error';         // Failed state

/**
 * AutoplayConfig - Configuration for an autoplay session
 */
export interface AutoplayConfig {
  /** Target number of approved images to save (1-4) */
  targetSavedCount: number;
  /** Maximum iterations before stopping (hard cap: 3) */
  maxIterations: number;
}

/**
 * AutoplayIteration - Tracks a single iteration's results
 */
export interface AutoplayIteration {
  iterationNumber: number;
  /** Prompt IDs generated in this iteration */
  promptIds: string[];
  /** Evaluation results per prompt */
  evaluations: Array<{
    promptId: string;
    approved: boolean;
    feedback?: string;
    score?: number;
    improvements?: string[];
    strengths?: string[];
  }>;
  /** Count of images saved this iteration */
  savedCount: number;
  /** Timestamp when iteration started */
  startedAt: string;
  /** Timestamp when iteration completed */
  completedAt?: string;
  /** Polish candidates identified during evaluation (score 50-69) */
  polishCandidates?: Array<{
    promptId: string;
    imageUrl: string;
    originalScore: number;
    polishPrompt: string;
  }>;
  /** Results of polish operations */
  polishResults?: Array<{
    promptId: string;
    improved: boolean;
    newScore?: number;
    polishedUrl?: string;
  }>;
}

/**
 * AutoplayState - Complete state for autoplay state machine
 */
export interface AutoplayState {
  status: AutoplayStatus;
  config: AutoplayConfig;
  /** Current iteration number (1-indexed) */
  currentIteration: number;
  /** History of all iterations */
  iterations: AutoplayIteration[];
  /** Total images saved across all iterations */
  totalSaved: number;
  /** Error message if status is 'error' */
  error?: string;
  /** Whether abort was requested */
  abortRequested: boolean;
}

/**
 * AutoplayAction - Actions for autoplay reducer
 */
export type AutoplayAction =
  | { type: 'START'; config: AutoplayConfig }
  | { type: 'GENERATION_COMPLETE'; promptIds: string[] }
  | { type: 'EVALUATION_COMPLETE'; evaluations: AutoplayIteration['evaluations']; polishCandidates?: AutoplayIteration['polishCandidates'] }
  | { type: 'POLISH_COMPLETE'; results: NonNullable<AutoplayIteration['polishResults']> }
  | { type: 'IMAGES_SAVED'; count: number }
  | { type: 'REFINE_COMPLETE' }
  | { type: 'ITERATION_COMPLETE' }
  | { type: 'COMPLETE'; reason: 'target_met' | 'max_iterations' | 'aborted' }
  | { type: 'ERROR'; error: string }
  | { type: 'ABORT' }
  | { type: 'RESET' };

/**
 * ImageEvaluation - Result from Gemini evaluation of a generated image
 */
export interface ImageEvaluation {
  promptId: string;
  /** Whether the image meets quality/goal standards */
  approved: boolean;
  /** Score from 0-100 indicating quality */
  score: number;
  /** Feedback for refinement if not approved */
  feedback?: string;
  /** Specific aspects that need improvement */
  improvements?: string[];
  /** What worked well (for preserving in next iteration) */
  strengths?: string[];
  /** Granular score: technical quality (artifacts, blur, deformations) */
  technicalScore?: number;
  /** Granular score: how well image matches prompt/vision */
  goalFitScore?: number;
  /** Granular score: composition, lighting, color harmony */
  aestheticScore?: number;
  /** Whether image correctly includes/excludes UI based on mode */
  modeCompliance?: boolean;
}

// ============================================
// Gemini Polish Types
// ============================================

/**
 * PolishConfig - Configuration for Gemini polish optimization
 */
export interface PolishConfig {
  /** Enable rescue polish for near-approval images (50-69 range) */
  rescueEnabled: boolean;
  /** Minimum score to attempt rescue polish (below = reject outright) */
  rescueFloor: number;
  /** Enable excellence polish for approved images (70-89 range) */
  excellenceEnabled: boolean;
  /** Minimum score for excellence polish (must be >= approval threshold) */
  excellenceFloor: number;
  /** Maximum score for excellence polish (above = already excellent) */
  excellenceCeiling: number;
  /** Intensity of excellence polish: 'subtle' preserves more, 'creative' transforms more */
  excellenceIntensity: 'subtle' | 'creative';
  /** Maximum polish attempts per image (prevents infinite loops) */
  maxPolishAttempts: number;
  /** Timeout for polish operation in milliseconds */
  polishTimeoutMs: number;
  /** Minimum score improvement required to use polished result */
  minScoreImprovement: number;
}

/**
 * Default polish configuration
 */
export const DEFAULT_POLISH_CONFIG: PolishConfig = {
  rescueEnabled: true,
  rescueFloor: 50,
  excellenceEnabled: true,
  excellenceFloor: 70,
  excellenceCeiling: 90,
  excellenceIntensity: 'creative',
  maxPolishAttempts: 1,
  polishTimeoutMs: 30000,
  minScoreImprovement: 5,
};

/**
 * PolishDecision - Result of polish decision logic
 */
export interface PolishDecision {
  /** Action to take: save, polish, or reject */
  action: 'save' | 'polish' | 'reject';
  /** Human-readable reason for the decision */
  reason: string;
  /** Polish prompt (only if action === 'polish') */
  polishPrompt?: string;
  /** Type of polish: rescue (50-69) or excellence (70-89) */
  polishType?: 'rescue' | 'excellence';
}

/**
 * PolishResult - Result from a polish operation
 */
export interface PolishResult {
  /** Whether polish was successful */
  success: boolean;
  /** Polished image URL (base64 data URL) */
  polishedUrl?: string;
  /** Re-evaluation of polished image */
  reEvaluation?: ImageEvaluation;
  /** Whether polish improved the score */
  improved: boolean;
  /** Score change (positive = improvement) */
  scoreDelta?: number;
  /** Error message if polish failed */
  error?: string;
}

// ============================================
// Multi-Phase Autoplay Types
// ============================================

/**
 * ExtendedAutoplayConfig - Configuration for multi-phase autoplay
 */
export interface ExtendedAutoplayConfig {
  /** Number of sketch images to generate (1-4) */
  sketchCount: number;
  /** Number of gameplay images to generate (1-4) */
  gameplayCount: number;
  /** Whether to generate poster variations and auto-select best */
  posterEnabled: boolean;
  /** Whether to auto-generate HUD overlays for gameplay images */
  hudEnabled: boolean;
  /** Maximum iterations per image before moving to next (1-3) */
  maxIterationsPerImage: number;
  /** Optional starting prompt idea */
  promptIdea?: string;
  /** Optional Gemini polish configuration (uses defaults if not specified) */
  polish?: Partial<PolishConfig>;
}

/**
 * AutoplayPhase - Current phase of multi-phase autoplay
 */
export type AutoplayPhase =
  | 'idle'
  | 'sketch'
  | 'gameplay'
  | 'poster'
  | 'hud'
  | 'complete'
  | 'error';

/**
 * PhaseProgress - Progress tracking for a single phase
 */
export interface PhaseProgress {
  /** Number of images saved in this phase */
  saved: number;
  /** Target number of images for this phase */
  target: number;
}

/**
 * MultiPhaseAutoplayState - Complete state for multi-phase autoplay
 */
export interface MultiPhaseAutoplayState {
  /** Current phase of the multi-phase flow */
  phase: AutoplayPhase;
  /** Configuration for this autoplay session */
  config: ExtendedAutoplayConfig;
  /** Progress for sketch phase */
  sketchProgress: PhaseProgress;
  /** Progress for gameplay phase */
  gameplayProgress: PhaseProgress;
  /** Whether poster has been auto-selected */
  posterSelected: boolean;
  /** Number of HUD overlays generated */
  hudGenerated: number;
  /** Error message if phase is 'error' */
  error?: string;
  /** Which phase was active when error occurred (for retry) */
  errorPhase?: AutoplayPhase;
}

/**
 * MultiPhaseAutoplayAction - Actions for multi-phase autoplay reducer
 */
export type MultiPhaseAutoplayAction =
  | { type: 'START'; config: ExtendedAutoplayConfig }
  | { type: 'PHASE_COMPLETE'; phase: AutoplayPhase }
  | { type: 'IMAGE_SAVED'; phase: 'sketch' | 'gameplay' }
  | { type: 'POSTER_SELECTED' }
  | { type: 'HUD_GENERATED' }
  | { type: 'ADVANCE_PHASE' }
  | { type: 'ERROR'; error: string; phase?: AutoplayPhase }
  | { type: 'ABORT' }
  | { type: 'RESET' }
  | { type: 'RETRY' };

/**
 * PosterSelectionCriteria - Criteria for LLM poster selection
 */
export interface PosterSelectionCriteria {
  /** Project name for context */
  projectName: string;
  /** Vision/concept of the project */
  projectVision: string;
  /** Key themes/dimensions to consider */
  themes: string[];
}

/**
 * PosterSelectionResult - Result from LLM poster selection
 */
export interface PosterSelectionResult {
  /** Index of the selected poster (0-3) */
  selectedIndex: number;
  /** Reasoning for the selection */
  reasoning: string;
  /** Confidence score (0-100) */
  confidence: number;
}

/**
 * HudGenerationResult - Result from HUD overlay generation
 */
export interface HudGenerationResult {
  /** Original image URL */
  originalUrl: string;
  /** URL of image with HUD overlay */
  hudUrl?: string;
  /** Whether generation succeeded */
  success: boolean;
  /** Error message if failed */
  error?: string;
}

// ============================================
// Autoplay Event Logging Types
// ============================================

/**
 * AutoplayEventType - Types of events that can occur during autoplay
 */
export type AutoplayEventType =
  | 'phase_started'
  | 'phase_completed'
  | 'prompt_generated'
  | 'dimension_adjusted'
  | 'image_generating'
  | 'image_complete'
  | 'image_failed'
  | 'image_approved'
  | 'image_rejected'
  | 'image_saved'
  | 'feedback_applied'
  | 'iteration_complete'
  | 'poster_generating'
  | 'poster_selected'
  | 'hud_generating'
  | 'hud_complete'
  | 'polish_started'
  | 'image_polished'
  | 'polish_no_improvement'
  | 'polish_error'
  | 'polish_skipped'
  | 'error'
  | 'timeout';

/**
 * AutoplayLogEntry - A single event in the autoplay activity log
 */
export interface AutoplayLogEntry {
  id: string;
  timestamp: Date;
  type: AutoplayEventType;
  /** Category determines which sidebar the event appears in */
  category: 'text' | 'image';
  message: string;
  details?: {
    phase?: AutoplayPhase;
    promptId?: string;
    imageUrl?: string;
    promptText?: string;
    score?: number;
    approved?: boolean;
    feedback?: string;
    dimension?: {
      type: string;
      oldValue: string;
      newValue: string;
    };
  };
}
