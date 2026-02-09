/**
 * AutoplaySetup - Component-specific types and constants
 */

import React from 'react';
import {
  ExtendedAutoplayConfig,
  AutoplayPhase,
  PhaseProgress,
  AutoplayLogEntry,
  GeneratedPrompt,
  GeneratedImage,
  DEFAULT_POLISH_CONFIG,
} from '../../../types';

// Re-export types used by consumers
export type {
  ExtendedAutoplayConfig,
  AutoplayPhase,
  PhaseProgress,
  AutoplayLogEntry,
  GeneratedPrompt,
  GeneratedImage,
};

export type AutoplayModalMode = 'setup' | 'activity';

export interface AutoplaySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: ExtendedAutoplayConfig) => void;
  /** Whether we have content ready (baseImage or prompts) */
  hasContent: boolean;
  /** Callback to trigger Smart Breakdown with the prompt idea */
  onSmartBreakdown?: (visionSentence: string) => Promise<boolean>;
  /** Shared vision sentence from brain state */
  visionSentence?: string | null;
  /** Update the shared vision sentence in brain state */
  onVisionSentenceChange?: (value: string) => void;
  canStart: boolean;
  canStartReason: string | null;
  isRunning: boolean;

  // Activity mode props (optional - only needed when mode='activity')
  mode?: AutoplayModalMode;
  currentPhase?: AutoplayPhase;
  sketchProgress?: PhaseProgress;
  gameplayProgress?: PhaseProgress;
  posterSelected?: boolean;
  hudGenerated?: number;
  hudTarget?: number;
  error?: string;
  textEvents?: AutoplayLogEntry[];
  imageEvents?: AutoplayLogEntry[];
  onStop?: () => void;
  onReset?: () => void;
  /** Retry from the errored phase, preserving progress */
  onRetry?: () => void;
  /** Which phase errored (for retry display) */
  errorPhase?: string;

  // Iteration tracking (optional)
  /** Current iteration number (1-based) */
  currentIteration?: number;
  /** Max iterations configured */
  maxIterations?: number;

  // Live preview props (optional)
  /** Current prompts being worked on */
  activePrompts?: GeneratedPrompt[];
  /** Current image generation statuses */
  activeImages?: GeneratedImage[];

  // Step-level tracking (sequential mode)
  currentImageInPhase?: number;
  phaseTarget?: number;
  singlePhaseStatus?: string;
}

/**
 * Saved image data extracted from image events
 */
export interface SavedImageInfo {
  imageUrl: string;
  promptText?: string;
  promptId?: string;
  phase?: string;
  score?: number;
  isPolished: boolean;
}

/**
 * Image category filter tabs
 */
export type ImageCategory = 'all' | 'sketch' | 'gameplay' | 'polished' | 'rejected';

export interface AutoplayPreset {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  config: Omit<ExtendedAutoplayConfig, 'promptIdea'>;
}

export const DEFAULT_CONFIG: ExtendedAutoplayConfig = {
  sketchCount: 2,
  gameplayCount: 2,
  posterEnabled: false,
  hudEnabled: false,
  maxIterationsPerImage: 2,
  promptIdea: '',
  polish: {
    rescueEnabled: DEFAULT_POLISH_CONFIG.rescueEnabled,
    rescueFloor: DEFAULT_POLISH_CONFIG.rescueFloor,
  },
};

export const STORAGE_KEY = 'simulator-autoplay-last-config';
