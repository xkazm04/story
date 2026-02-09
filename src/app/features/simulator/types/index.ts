// ============================================================================
// SIMULATOR TYPES - Barrel re-export for backward compatibility
//
// All consuming files can continue to import from '../types' or './types'
// which resolves to this index.ts file.
// ============================================================================

// Core dimension, concept, prompt element, and output types
export {
  // Types
  type DimensionType,
  type TransformationType,
  type GameUIGenre,
  type DimensionFilterMode,
  type DimensionTransformMode,
  type ConceptRole,
  type ElementCategoryType,
  type OutputMode,
  type DesignVariant,

  // Interfaces
  type Dimension,
  type DimensionPreset,
  type PromptElement,
  type Concept,
  type GeneratedPrompt,
  type ElementCategoryConfig,

  // Constants
  SCENE_TYPES,
  OUTPUT_MODES,

  // Functions
  createDimensionWithDefaults,
  elementToConcept,
  dimensionToConcept,
  conceptToElement,
  conceptToDimensionUpdate,
  categoryToDimensionType,
  canApplyConceptToDimension,
} from './base';

// State machine types
export {
  // Types
  type SimulatorState,
  type SimulatorAction,

  // Interfaces
  type StateTransition,
  type SmartBreakdownResult,
  type SmartBreakdownPersisted,

  // Constants
  SIMULATOR_TRANSITIONS,

  // Functions
  isValidTransition,
  getNextState,
  getValidActions,
  deriveSimulatorState,
} from './state';

// Feedback and generation API types
export {
  type SimulationFeedback,
  type DimensionAdjustment,
  type GenerateWithFeedbackRequest,
  type GenerateWithFeedbackResponse,
} from './feedback';

// Image, panel, poster, and comparison types
export {
  type SavedPanelImage,
  type GeneratedImage,
  type PanelSlot,
  type ProjectPoster,
  type ComparisonItem,
  type ElementDiff,
  type ComparisonViewOptions,
  type ComparisonModalProps,
} from './images';

// Feedback learning, preference engine, and smart suggestion types
export {
  type PromptFeedback,
  type PromptPattern,
  type UserPreference,
  type PreferenceProfile,
  type RefinementSuggestion,
  type PromptExplanation,
  type FeedbackSession,
  type ABVariant,
  type FeedbackAnalytics,
  type LearnedContext,
  type GenerationSession,
  type DimensionCombinationPattern,
  type StylePreference,
  type SmartSuggestion,
  type EnhancedLearnedContext,
  type FeedbackLearningConfig,
} from './brain';

// Autoplay, polish, multi-phase, and event logging types
export {
  // Types
  type AutoplayStatus,
  type AutoplayAction,
  type AutoplayPhase,
  type MultiPhaseAutoplayAction,
  type AutoplayEventType,

  // Interfaces
  type AutoplayConfig,
  type AutoplayIteration,
  type AutoplayState,
  type ImageEvaluation,
  type PolishConfig,
  type PolishDecision,
  type PolishResult,
  type ExtendedAutoplayConfig,
  type PhaseProgress,
  type MultiPhaseAutoplayState,
  type PosterSelectionCriteria,
  type PosterSelectionResult,
  type HudGenerationResult,
  type AutoplayLogEntry,

  // Constants
  DEFAULT_POLISH_CONFIG,
} from './autoplay';

// Layout prop types
export {
  type SimulatorLayoutProps,
} from './layoutProps';
