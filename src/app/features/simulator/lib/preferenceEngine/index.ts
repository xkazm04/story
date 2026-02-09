/**
 * Preference Engine - Index
 *
 * Re-exports all public functions from all modules.
 * This file ensures that existing imports from './preferenceEngine'
 * or '../lib/preferenceEngine' continue to work without modification.
 */

// Storage: DB setup, profile CRUD, feedback CRUD, pattern CRUD,
// session storage, dimension pattern storage, style preference storage,
// suggestion storage, import/export
export {
  isClientSide,
  openPreferenceDB,
  getPreferenceProfile,
  savePreferenceProfile,
  storeFeedback,
  getFeedbackForPrompt,
  getAllFeedback,
  getFeedbackByRating,
  storePattern,
  getPatternsAboveConfidence,
  getPatternsByType,
  getSuccessfulSessions,
  getDimensionPatterns,
  getStylePreferences,
  recordSuggestionResponse,
  storeSuggestion,
  exportPreferences,
  importPreferences,
} from './storage';

// Learning: learn from feedback, extract patterns, dimension combinations,
// style preferences, refinement suggestions, prompt explanations,
// A/B variants, AI refinement, text feedback analysis
export {
  learnFromFeedback,
  learnPatterns,
  learnDimensionCombinations,
  learnStylePreferences,
  generateRefinementSuggestions,
  generatePromptExplanation,
  generateABVariants,
  recordVariantResult,
  getAIRefinementSuggestions,
  analyzeTextFeedback,
} from './learning';

// Scoring: build learned context, score prompts, explicit preference management,
// process feedback pipeline, enhanced context, feedback analytics, learning status
export {
  buildLearnedContext,
  scorePromptWithPreferences,
  addExplicitPreference,
  removePreference,
  clearAllLearning,
  processFeedback,
  buildEnhancedLearnedContext,
  generateFeedbackAnalytics,
  isLearningReady,
  getLearningStatus,
  getEnhancedLearningStatus,
  getAverageTimeToSatisfaction,
  processEnhancedFeedback,
  generateEnhancedFeedbackAnalytics,
} from './scoring';

// Sessions: session tracking, smart suggestions
export {
  startGenerationSession,
  recordGenerationIteration,
  markSessionSatisfied,
  endSessionUnsuccessful,
  getActiveSession,
  generateSmartSuggestions,
  getSmartSuggestions,
} from './sessions';
