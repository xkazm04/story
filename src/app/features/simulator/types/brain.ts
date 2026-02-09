// ============================================================================
// BRAIN TYPES - Feedback learning, preference engine, smart suggestions
// ============================================================================

import type { DimensionType, OutputMode, PromptElement, DimensionFilterMode, DimensionTransformMode } from './base';

// ============================================
// Feedback Learning Types
// ============================================

/**
 * PromptFeedback - Detailed feedback for a single prompt
 */
export interface PromptFeedback {
  id: string;
  promptId: string;
  /** Thumbs up/down rating */
  rating: 'up' | 'down' | null;
  /** Optional text feedback explaining the rating */
  textFeedback?: string;
  /** Which elements the user liked (if any) */
  likedElements?: string[];
  /** Which elements the user disliked (if any) */
  dislikedElements?: string[];
  /** Timestamp of feedback */
  createdAt: string;
  /** Session ID for grouping */
  sessionId?: string;
}

/**
 * PromptPattern - A learned pattern from successful prompts
 */
export interface PromptPattern {
  id: string;
  /** The pattern type */
  type: 'element_combination' | 'dimension_value' | 'style_preference' | 'scene_type';
  /** The pattern value or combination */
  value: string;
  /** How often this pattern appears in positively-rated prompts */
  successCount: number;
  /** How often this pattern appears in negatively-rated prompts */
  failureCount: number;
  /** Confidence score (0-1) based on sample size */
  confidence: number;
  /** Associated dimension types */
  dimensionTypes?: DimensionType[];
  /** Last updated timestamp */
  updatedAt: string;
}

/**
 * UserPreference - A learned user preference
 */
export interface UserPreference {
  id: string;
  /** Category of preference */
  category: 'style' | 'mood' | 'composition' | 'subject' | 'setting' | 'quality' | 'avoid';
  /** The preference value */
  value: string;
  /** Strength of preference (0-100) */
  strength: number;
  /** Number of times this preference was reinforced */
  reinforcements: number;
  /** Source of the preference (explicit or inferred) */
  source: 'explicit' | 'inferred';
  /** Timestamp when learned */
  createdAt: string;
  /** Last reinforced timestamp */
  updatedAt: string;
}

/**
 * PreferenceProfile - Complete user preference profile
 */
export interface PreferenceProfile {
  /** Unique profile ID */
  id: string;
  /** User or session identifier */
  userId?: string;
  /** List of learned preferences */
  preferences: UserPreference[];
  /** Successful patterns */
  patterns: PromptPattern[];
  /** Total feedback count */
  totalFeedbackCount: number;
  /** Positive rating count */
  positiveCount: number;
  /** Negative rating count */
  negativeCount: number;
  /** Profile creation date */
  createdAt: string;
  /** Last update date */
  updatedAt: string;
}

/**
 * RefinementSuggestion - AI-powered suggestion for prompt improvement
 */
export interface RefinementSuggestion {
  id: string;
  /** Type of suggestion */
  type: 'add' | 'remove' | 'modify' | 'emphasize' | 'deemphasize';
  /** Target element or dimension */
  target: string;
  /** The suggested change */
  suggestion: string;
  /** Reason for the suggestion */
  reason: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Source: pattern-based or AI-inferred */
  source: 'pattern' | 'ai' | 'feedback_history';
}

/**
 * PromptExplanation - Explanation of why specific prompt choices were made
 */
export interface PromptExplanation {
  promptId: string;
  /** Overall explanation */
  summary: string;
  /** Per-element explanations */
  elementExplanations: Array<{
    elementId: string;
    text: string;
    reason: string;
    /** Was this influenced by user preferences? */
    influencedByPreference: boolean;
    /** Which pattern(s) influenced this? */
    relatedPatterns?: string[];
  }>;
  /** Which preferences influenced this prompt */
  appliedPreferences: Array<{
    preferenceId: string;
    value: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

/**
 * FeedbackSession - A collection of feedback from a single generation session
 */
export interface FeedbackSession {
  id: string;
  /** Timestamp when session started */
  startedAt: string;
  /** All feedback collected in this session */
  feedbackItems: PromptFeedback[];
  /** Dimensions used in this session */
  dimensionsSnapshot: Array<{ type: DimensionType; reference: string }>;
  /** Base image description used */
  baseImageSnapshot: string;
  /** Output mode used */
  outputModeSnapshot: OutputMode;
}

/**
 * ABVariant - A/B test variant for prompts
 */
export interface ABVariant {
  id: string;
  /** Variant name (A, B, etc.) */
  variantName: string;
  /** The prompt text */
  prompt: string;
  /** Elements in this variant */
  elements: PromptElement[];
  /** Number of positive ratings */
  positiveRatings: number;
  /** Number of negative ratings */
  negativeRatings: number;
  /** Number of times shown */
  impressions: number;
  /** Conversion rate (positive / impressions) */
  conversionRate: number;
}

/**
 * FeedbackAnalytics - Analytics data for feedback dashboard
 */
export interface FeedbackAnalytics {
  /** Total prompts generated */
  totalPromptsGenerated: number;
  /** Total feedback collected */
  totalFeedbackCollected: number;
  /** Overall positive rate */
  positiveRate: number;
  /** Top performing patterns */
  topPatterns: PromptPattern[];
  /** Most common preferences */
  topPreferences: UserPreference[];
  /** Elements to avoid based on negative feedback */
  elementsToAvoid: Array<{ text: string; count: number }>;
  /** Trend over time (last 7 days) */
  dailyTrend: Array<{
    date: string;
    positive: number;
    negative: number;
    total: number;
  }>;
  /** Breakdown by scene type */
  sceneTypePerformance: Array<{
    sceneType: string;
    positiveRate: number;
    totalCount: number;
  }>;
  /** Dimension effectiveness */
  dimensionEffectiveness: Array<{
    dimensionType: DimensionType;
    averageRating: number;
    sampleSize: number;
  }>;
}

/**
 * LearnedContext - Context injected into prompt generation based on learning
 */
export interface LearnedContext {
  /** Preferences to apply */
  preferences: UserPreference[];
  /** Patterns to follow */
  patterns: PromptPattern[];
  /** Elements to avoid */
  avoidElements: string[];
  /** Elements to emphasize */
  emphasizeElements: string[];
  /** Suggested dimension adjustments */
  dimensionAdjustments: Array<{
    type: DimensionType;
    adjustment: string;
    reason: string;
  }>;
}

// ============================================
// Enhanced Feedback Learning Types (Phase 1-4)
// ============================================

/**
 * GenerationSession - Tracks a complete generation session for learning
 */
export interface GenerationSession {
  id: string;
  /** When the session started */
  startedAt: string;
  /** When user indicated satisfaction (rated positively or moved on) */
  satisfiedAt?: string;
  /** Number of generation iterations before satisfaction */
  iterationCount: number;
  /** Time from first generation to satisfaction (ms) */
  timeToSatisfaction?: number;
  /** Dimensions used in this session */
  dimensionsSnapshot: Array<{
    type: DimensionType;
    reference: string;
    weight: number;
    filterMode: DimensionFilterMode;
    transformMode: DimensionTransformMode;
  }>;
  /** Base image description */
  baseImageSnapshot: string;
  /** Output mode used */
  outputMode: OutputMode;
  /** Did the session end with a positive outcome? */
  successful: boolean;
  /** All prompt IDs generated in this session */
  promptIds: string[];
  /** Final feedback state */
  finalFeedback?: {
    positive: string;
    negative: string;
  };
}

/**
 * DimensionCombinationPattern - Learned pattern about dimension combinations
 */
export interface DimensionCombinationPattern {
  id: string;
  /** The combination of dimension types */
  dimensionTypes: DimensionType[];
  /** Example reference values that worked well */
  successfulReferences: string[];
  /** Success rate for this combination */
  successRate: number;
  /** Number of times this combination was used */
  usageCount: number;
  /** Average weight settings that worked */
  avgSuccessfulWeights: Record<DimensionType, number>;
  /** Last updated */
  updatedAt: string;
}

/**
 * StylePreference - Detailed artistic style preference
 */
export interface StylePreference {
  id: string;
  /** Style category (e.g., 'rendering', 'lighting', 'composition') */
  category: 'rendering' | 'lighting' | 'composition' | 'color' | 'texture' | 'detail';
  /** The preferred value (e.g., 'cinematic lighting', 'hand-painted') */
  value: string;
  /** Strength of preference (0-100) */
  strength: number;
  /** Number of positive associations */
  positiveAssociations: number;
  /** Number of negative associations */
  negativeAssociations: number;
  /** Source dimension types that led to this preference */
  sourceDimensions: DimensionType[];
  /** Last updated */
  updatedAt: string;
}

/**
 * SmartSuggestion - AI-powered suggestion for user
 */
export interface SmartSuggestion {
  id: string;
  /** Type of suggestion */
  type: 'dimension' | 'weight' | 'element_lock' | 'output_mode';
  /** What is being suggested */
  suggestion: string;
  /** Why this is being suggested */
  reason: string;
  /** Confidence score (0-1) */
  confidence: number;
  /** Data to apply if accepted */
  data: {
    dimensionType?: DimensionType;
    dimensionReference?: string;
    weight?: number;
    elementId?: string;
    outputMode?: OutputMode;
  };
  /** Was this suggestion shown to user? */
  shown: boolean;
  /** Was this suggestion accepted? */
  accepted?: boolean;
  /** When was this generated */
  createdAt: string;
}

/**
 * EnhancedLearnedContext - Extended context for adaptive generation
 */
export interface EnhancedLearnedContext extends LearnedContext {
  /** Recommended weights for dimensions */
  recommendedWeights: Record<DimensionType, number>;
  /** Elements that should be auto-locked */
  autoLockElements: string[];
  /** Confidence in these recommendations */
  confidence: number;
  /** Whether sufficient data exists for personalization */
  hasEnoughData: boolean;
  /** Dimension combinations that work well together */
  successfulCombinations: DimensionCombinationPattern[];
  /** Style preferences learned from history */
  stylePreferences: StylePreference[];
}

/**
 * FeedbackLearningConfig - Configuration for the learning system
 */
export interface FeedbackLearningConfig {
  /** Minimum feedback items before learning kicks in */
  minFeedbackForLearning: number;
  /** How quickly preferences decay (0-1, lower = slower decay) */
  preferenceDecayRate: number;
  /** Minimum confidence to show suggestions */
  minSuggestionConfidence: number;
  /** Maximum suggestions to show at once */
  maxSuggestionsToShow: number;
  /** Whether to track time-to-satisfaction */
  trackTimeMetrics: boolean;
}
