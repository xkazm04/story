/**
 * Preference Engine - Scoring Module
 *
 * Scoring and context: build learned context, score prompts,
 * explicit preference management, process feedback pipeline,
 * enhanced context, feedback analytics, learning status.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  UserPreference,
  PreferenceProfile,
  PromptFeedback,
  LearnedContext,
  DimensionType,
  GeneratedPrompt,
  Dimension,
  EnhancedLearnedContext,
  FeedbackAnalytics,
} from '../../types';
import {
  isClientSide,
  createDefaultProfile,
  getPreferenceProfile,
  savePreferenceProfile,
  storeFeedback,
  getAllFeedback,
  storePattern,
  getPatternsAboveConfidence,
  getSuccessfulSessions,
  getDimensionPatterns,
  getStylePreferences,
  openPreferenceDB,
  FEEDBACK_STORE,
  PATTERN_STORE,
} from './storage';
import { learnFromFeedback, learnPatterns, learnStylePreferences } from './learning';

// ============================================================================
// Preference Application
// ============================================================================

/**
 * Build learned context for prompt generation
 */
export function buildLearnedContext(profile: PreferenceProfile): LearnedContext {
  const preferences = profile.preferences.filter((p) => p.strength >= 20);
  const patterns = profile.patterns.filter((p) => p.confidence >= 0.6);

  // Extract avoid elements
  const avoidElements = preferences
    .filter((p) => p.category === 'avoid')
    .map((p) => p.value);

  // Extract elements to emphasize (high-strength preferences)
  const emphasizeElements = preferences
    .filter((p) => p.category !== 'avoid' && p.strength >= 60)
    .map((p) => p.value);

  // Build dimension adjustments from style preferences
  const dimensionAdjustments: LearnedContext['dimensionAdjustments'] = [];

  const stylePrefs = preferences.filter((p) => p.category === 'style' && p.strength >= 50);
  if (stylePrefs.length > 0) {
    dimensionAdjustments.push({
      type: 'artStyle' as DimensionType,
      adjustment: stylePrefs.map((p) => p.value).join(', '),
      reason: 'User prefers these style elements',
    });
  }

  const moodPrefs = preferences.filter((p) => p.category === 'mood' && p.strength >= 50);
  if (moodPrefs.length > 0) {
    dimensionAdjustments.push({
      type: 'mood' as DimensionType,
      adjustment: moodPrefs.map((p) => p.value).join(', '),
      reason: 'User prefers these mood elements',
    });
  }

  return {
    preferences,
    patterns,
    avoidElements,
    emphasizeElements,
    dimensionAdjustments,
  };
}

/**
 * Score a prompt based on learned preferences
 * Returns a score from 0-100 indicating how well the prompt matches user preferences
 */
export function scorePromptWithPreferences(
  prompt: GeneratedPrompt,
  profile: PreferenceProfile
): number {
  let score = 50; // Start neutral
  const preferences = profile.preferences;

  prompt.elements.forEach((element) => {
    const matchingPref = preferences.find(
      (p) => p.value.toLowerCase() === element.text.toLowerCase()
    );

    if (matchingPref) {
      if (matchingPref.category === 'avoid') {
        // Penalize for avoided elements
        score -= matchingPref.strength * 0.3;
      } else {
        // Reward for preferred elements
        score += matchingPref.strength * 0.2;
      }
    }
  });

  // Check patterns
  profile.patterns.forEach((pattern) => {
    if (pattern.type === 'element_combination') {
      const [, value] = pattern.value.split(':');
      const hasElement = prompt.elements.some(
        (e) => e.text.toLowerCase() === value
      );

      if (hasElement) {
        // High-confidence patterns influence score
        score += (pattern.confidence - 0.5) * 20;
      }
    }
  });

  return Math.max(0, Math.min(100, score));
}

// ============================================================================
// Explicit Preference Management
// ============================================================================

/**
 * Add explicit preference (from user action)
 */
export async function addExplicitPreference(
  category: UserPreference['category'],
  value: string,
  strength: number = 50
): Promise<void> {
  const profile = await getPreferenceProfile();
  const now = new Date().toISOString();

  const existingPref = profile.preferences.find(
    (p) => p.category === category && p.value.toLowerCase() === value.toLowerCase()
  );

  if (existingPref) {
    existingPref.strength = Math.min(100, existingPref.strength + strength);
    existingPref.reinforcements += 1;
    existingPref.source = 'explicit';
    existingPref.updatedAt = now;
  } else {
    profile.preferences.push({
      id: uuidv4(),
      category,
      value,
      strength,
      reinforcements: 1,
      source: 'explicit',
      createdAt: now,
      updatedAt: now,
    });
  }

  await savePreferenceProfile(profile);
}

/**
 * Remove a preference
 */
export async function removePreference(preferenceId: string): Promise<void> {
  const profile = await getPreferenceProfile();
  profile.preferences = profile.preferences.filter((p) => p.id !== preferenceId);
  await savePreferenceProfile(profile);
}

/**
 * Clear all preferences and patterns (reset learning)
 */
export async function clearAllLearning(): Promise<void> {
  const profile = await getPreferenceProfile();
  profile.preferences = [];
  profile.patterns = [];
  profile.totalFeedbackCount = 0;
  profile.positiveCount = 0;
  profile.negativeCount = 0;
  await savePreferenceProfile(profile);

  // Clear feedback store
  const db = await openPreferenceDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([FEEDBACK_STORE, PATTERN_STORE], 'readwrite');
    transaction.objectStore(FEEDBACK_STORE).clear();
    transaction.objectStore(PATTERN_STORE).clear();
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(new Error('Failed to clear learning data'));
  });
}

// ============================================================================
// Feedback Processing Pipeline
// ============================================================================

/**
 * Process feedback and update all learning systems
 */
export async function processFeedback(
  feedback: PromptFeedback,
  prompt: GeneratedPrompt
): Promise<PreferenceProfile> {
  if (!isClientSide()) {
    return createDefaultProfile();
  }
  // Store the feedback
  await storeFeedback(feedback);

  // Get current profile
  const profile = await getPreferenceProfile();

  // Update counts
  profile.totalFeedbackCount += 1;
  if (feedback.rating === 'up') {
    profile.positiveCount += 1;
  } else if (feedback.rating === 'down') {
    profile.negativeCount += 1;
  }

  // Learn preferences from this feedback
  profile.preferences = learnFromFeedback(feedback, prompt, profile.preferences);

  // Get all feedback for pattern learning (limit to recent 50)
  const allFeedback = await getAllFeedback(50);

  // We need to reconstruct prompts for pattern learning
  // For now, just update patterns based on this single feedback
  if (allFeedback.length >= 5) {
    // We have enough data to potentially learn patterns
    // This is simplified - in production you'd want to store prompt data with feedback
    profile.patterns = learnPatterns(
      [{ feedback, prompt }],
      profile.patterns
    );
  }

  // Save patterns
  for (const pattern of profile.patterns) {
    await storePattern(pattern);
  }

  // Save updated profile
  await savePreferenceProfile(profile);

  return profile;
}

// ============================================================================
// Enhanced Learned Context
// ============================================================================

/**
 * Build enhanced learned context with all Phase 1-4 features
 */
export async function buildEnhancedLearnedContext(
  currentDimensions: Dimension[]
): Promise<EnhancedLearnedContext> {
  const profile = await getPreferenceProfile();
  const baseContext = buildLearnedContext(profile);
  const dimensionPatterns = await getDimensionPatterns(2);
  const stylePrefs = await getStylePreferences(50);
  const sessions = await getSuccessfulSessions(20);

  // Calculate recommended weights from successful patterns
  const recommendedWeights: Record<DimensionType, number> = {} as Record<DimensionType, number>;
  for (const dim of currentDimensions) {
    const relevantPatterns = dimensionPatterns.filter((p) =>
      p.dimensionTypes.includes(dim.type)
    );
    if (relevantPatterns.length > 0) {
      recommendedWeights[dim.type] =
        relevantPatterns.reduce((sum, p) => sum + (p.avgSuccessfulWeights[dim.type] || 50), 0) /
        relevantPatterns.length;
    }
  }

  // Identify elements to auto-lock based on high-strength preferences
  const autoLockElements = profile.preferences
    .filter((p) => p.category !== 'avoid' && p.strength >= 80)
    .map((p) => p.value);

  // Calculate confidence based on data availability
  const hasEnoughData = profile.totalFeedbackCount >= 5;
  const confidence = hasEnoughData
    ? Math.min(0.9, profile.totalFeedbackCount / 20 + dimensionPatterns.length / 10)
    : 0.3;

  return {
    ...baseContext,
    recommendedWeights,
    autoLockElements,
    confidence,
    hasEnoughData,
    successfulCombinations: dimensionPatterns,
    stylePreferences: stylePrefs,
  };
}

// ============================================================================
// Feedback Analytics
// ============================================================================

/**
 * Generate feedback analytics from stored data
 */
export async function generateFeedbackAnalytics(): Promise<FeedbackAnalytics> {
  const profile = await getPreferenceProfile();
  const allFeedback = await getAllFeedback(500);
  const patterns = await getPatternsAboveConfidence(0.3);

  // Calculate positive rate
  const positiveRate = profile.totalFeedbackCount > 0
    ? profile.positiveCount / profile.totalFeedbackCount
    : 0;

  // Top patterns (sorted by confidence)
  const topPatterns = patterns
    .filter((p) => p.successCount + p.failureCount >= 3)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);

  // Top preferences (sorted by strength)
  const topPreferences = profile.preferences
    .filter((p) => p.category !== 'avoid')
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 5);

  // Elements to avoid
  const elementsToAvoid = profile.preferences
    .filter((p) => p.category === 'avoid')
    .sort((a, b) => b.strength - a.strength)
    .map((p) => ({ text: p.value, count: p.reinforcements }))
    .slice(0, 5);

  // Daily trend (last 7 days)
  const dailyTrend = calculateDailyTrend(allFeedback);

  // Scene type performance
  const sceneTypePerformance = calculateSceneTypePerformance(allFeedback);

  // Dimension effectiveness (placeholder - would need more data)
  const dimensionEffectiveness: FeedbackAnalytics['dimensionEffectiveness'] = [];

  return {
    totalPromptsGenerated: profile.totalFeedbackCount,
    totalFeedbackCollected: allFeedback.length,
    positiveRate,
    topPatterns,
    topPreferences,
    elementsToAvoid,
    dailyTrend,
    sceneTypePerformance,
    dimensionEffectiveness,
  };
}

/**
 * Calculate daily feedback trend
 */
function calculateDailyTrend(
  feedback: PromptFeedback[]
): FeedbackAnalytics['dailyTrend'] {
  const dayMs = 24 * 60 * 60 * 1000;
  const now = Date.now();
  const trend: FeedbackAnalytics['dailyTrend'] = [];

  for (let i = 6; i >= 0; i--) {
    const dayStart = now - (i + 1) * dayMs;
    const dayEnd = now - i * dayMs;
    const date = new Date(dayEnd).toISOString().split('T')[0];

    const dayFeedback = feedback.filter((f) => {
      const time = new Date(f.createdAt).getTime();
      return time >= dayStart && time < dayEnd;
    });

    trend.push({
      date,
      positive: dayFeedback.filter((f) => f.rating === 'up').length,
      negative: dayFeedback.filter((f) => f.rating === 'down').length,
      total: dayFeedback.length,
    });
  }

  return trend;
}

/**
 * Calculate scene type performance
 * Note: This requires storing scene type with feedback - simplified here
 */
function calculateSceneTypePerformance(
  feedback: PromptFeedback[]
): FeedbackAnalytics['sceneTypePerformance'] {
  // Placeholder - would need scene type stored with feedback
  const sceneTypes = [
    'Cinematic Wide Shot',
    'Hero Portrait',
    'Action Sequence',
    'Environmental Storytelling',
  ];

  return sceneTypes.map((sceneType) => ({
    sceneType,
    positiveRate: 0.5 + Math.random() * 0.3, // Placeholder
    totalCount: Math.floor(feedback.length / 4),
  }));
}

// ============================================================================
// Learning Status
// ============================================================================

/**
 * Check if learning is ready (enough feedback collected)
 */
export async function isLearningReady(): Promise<{
  ready: boolean;
  feedbackCount: number;
  requiredCount: number;
  progress: number;
}> {
  const profile = await getPreferenceProfile();
  const requiredCount = 5; // Minimum feedback for meaningful learning

  return {
    ready: profile.totalFeedbackCount >= requiredCount,
    feedbackCount: profile.totalFeedbackCount,
    requiredCount,
    progress: Math.min(1, profile.totalFeedbackCount / requiredCount),
  };
}

/**
 * Get learning status summary
 */
export async function getLearningStatus(): Promise<{
  totalFeedback: number;
  preferences: number;
  patterns: number;
  positiveRate: number;
  lastUpdated: string | null;
}> {
  const profile = await getPreferenceProfile();

  return {
    totalFeedback: profile.totalFeedbackCount,
    preferences: profile.preferences.length,
    patterns: profile.patterns.length,
    positiveRate: profile.totalFeedbackCount > 0
      ? profile.positiveCount / profile.totalFeedbackCount
      : 0,
    lastUpdated: profile.updatedAt || null,
  };
}

/**
 * Get enhanced learning status with time metrics
 */
export async function getEnhancedLearningStatus(): Promise<{
  totalFeedback: number;
  preferences: number;
  patterns: number;
  positiveRate: number;
  lastUpdated: string | null;
  avgTimeToSatisfaction: number | null;
  avgIterations: number | null;
  sessionCount: number;
  dimensionPatterns: number;
  stylePreferences: number;
}> {
  const basicStatus = await getLearningStatus();
  const timeMetrics = await getAverageTimeToSatisfaction();
  const dimensionPatterns = await getDimensionPatterns(1);
  const stylePrefs = await getStylePreferences(30);

  return {
    ...basicStatus,
    avgTimeToSatisfaction: timeMetrics.avgTime,
    avgIterations: timeMetrics.avgIterations,
    sessionCount: timeMetrics.sampleSize,
    dimensionPatterns: dimensionPatterns.length,
    stylePreferences: stylePrefs.length,
  };
}

/**
 * Calculate average time-to-satisfaction
 */
export async function getAverageTimeToSatisfaction(): Promise<{
  avgTime: number | null;
  avgIterations: number | null;
  sampleSize: number;
}> {
  const sessions = await getSuccessfulSessions(100);

  if (sessions.length === 0) {
    return { avgTime: null, avgIterations: null, sampleSize: 0 };
  }

  const timeSessions = sessions.filter((s) => s.timeToSatisfaction != null);
  const avgTime =
    timeSessions.length > 0
      ? timeSessions.reduce((sum, s) => sum + (s.timeToSatisfaction || 0), 0) / timeSessions.length
      : null;

  const avgIterations =
    sessions.reduce((sum, s) => sum + s.iterationCount, 0) / sessions.length;

  return {
    avgTime,
    avgIterations,
    sampleSize: sessions.length,
  };
}

// ============================================================================
// Enhanced Feedback Processing
// ============================================================================

/**
 * Enhanced feedback processing that includes style learning
 */
export async function processEnhancedFeedback(
  feedback: PromptFeedback,
  prompt: GeneratedPrompt
): Promise<void> {
  // Learn style preferences from rated prompts
  if (feedback.rating) {
    await learnStylePreferences(prompt, feedback.rating);
  }
}

// ============================================================================
// Enhanced Analytics
// ============================================================================

/**
 * Generate enhanced analytics with all new metrics
 */
export async function generateEnhancedFeedbackAnalytics(): Promise<FeedbackAnalytics & {
  avgTimeToSatisfaction: number | null;
  avgIterations: number | null;
  sessionCount: number;
  dimensionPatternCount: number;
  stylePreferenceCount: number;
  topDimensionCombinations: Array<{
    dimensions: string[];
    usageCount: number;
    successRate: number;
  }>;
  topStylePreferences: Array<{
    category: string;
    value: string;
    strength: number;
  }>;
}> {
  const baseAnalytics = await generateFeedbackAnalytics();
  const timeMetrics = await getAverageTimeToSatisfaction();
  const dimensionPatterns = await getDimensionPatterns(1);
  const stylePrefs = await getStylePreferences(30);

  return {
    ...baseAnalytics,
    avgTimeToSatisfaction: timeMetrics.avgTime,
    avgIterations: timeMetrics.avgIterations,
    sessionCount: timeMetrics.sampleSize,
    dimensionPatternCount: dimensionPatterns.length,
    stylePreferenceCount: stylePrefs.length,
    topDimensionCombinations: dimensionPatterns
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)
      .map((p) => ({
        dimensions: p.dimensionTypes,
        usageCount: p.usageCount,
        successRate: p.successRate,
      })),
    topStylePreferences: stylePrefs
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 5)
      .map((p) => ({
        category: p.category,
        value: p.value,
        strength: p.strength,
      })),
  };
}
