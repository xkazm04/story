/**
 * Preference Engine - Sessions Module
 *
 * Session tracking: start/record/end sessions,
 * time-to-satisfaction metrics, smart suggestions.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  GenerationSession,
  Dimension,
  SmartSuggestion,
  OutputMode,
} from '../../types';
import {
  isClientSide,
  storeSession,
  getPreferenceProfile,
  getSuccessfulSessions,
  getDimensionPatterns,
  getStylePreferences,
} from './storage';

// ============================================================================
// Session Tracking
// ============================================================================

let activeSession: GenerationSession | null = null;

/**
 * Start a new generation session for tracking time-to-satisfaction
 */
export function startGenerationSession(
  dimensions: Dimension[],
  baseImage: string,
  outputMode: OutputMode
): GenerationSession {
  const session: GenerationSession = {
    id: uuidv4(),
    startedAt: new Date().toISOString(),
    iterationCount: 0,
    dimensionsSnapshot: dimensions.map((d) => ({
      type: d.type,
      reference: d.reference,
      weight: d.weight,
      filterMode: d.filterMode,
      transformMode: d.transformMode,
    })),
    baseImageSnapshot: baseImage,
    outputMode,
    successful: false,
    promptIds: [],
  };
  activeSession = session;
  return session;
}

/**
 * Record a generation iteration in the current session
 */
export function recordGenerationIteration(promptIds: string[]): void {
  if (activeSession) {
    activeSession.iterationCount += 1;
    activeSession.promptIds.push(...promptIds);
  }
}

/**
 * Mark the current session as satisfied (positive outcome)
 */
export async function markSessionSatisfied(
  feedback?: { positive: string; negative: string }
): Promise<GenerationSession | null> {
  if (!activeSession) return null;

  const now = new Date();
  activeSession.satisfiedAt = now.toISOString();
  activeSession.timeToSatisfaction =
    now.getTime() - new Date(activeSession.startedAt).getTime();
  activeSession.successful = true;
  activeSession.finalFeedback = feedback;

  await storeSession(activeSession);
  const completedSession = activeSession;
  activeSession = null;
  return completedSession;
}

/**
 * End session without satisfaction (abandoned or negative)
 */
export async function endSessionUnsuccessful(
  feedback?: { positive: string; negative: string }
): Promise<GenerationSession | null> {
  if (!activeSession) return null;

  activeSession.successful = false;
  activeSession.finalFeedback = feedback;

  await storeSession(activeSession);
  const completedSession = activeSession;
  activeSession = null;
  return completedSession;
}

/**
 * Get the current active session
 */
export function getActiveSession(): GenerationSession | null {
  return activeSession;
}

// ============================================================================
// Smart Suggestions
// ============================================================================

/**
 * Generate smart suggestions based on user history and current context
 */
export async function generateSmartSuggestions(
  currentDimensions: Dimension[],
  baseImageDescription: string
): Promise<SmartSuggestion[]> {
  // Return empty on server-side
  if (!isClientSide()) {
    return [];
  }

  const suggestions: SmartSuggestion[] = [];
  const profile = await getPreferenceProfile();
  const dimensionPatterns = await getDimensionPatterns(2);
  const stylePrefs = await getStylePreferences(60);
  const sessions = await getSuccessfulSessions(20);

  // Suggestion 1: Recommend dimension types based on successful patterns
  if (dimensionPatterns.length > 0) {
    const currentTypes = new Set(currentDimensions.map((d) => d.type));
    const successfulPatterns = dimensionPatterns.sort((a, b) => b.usageCount - a.usageCount);

    for (const pattern of successfulPatterns.slice(0, 3)) {
      for (const dimType of pattern.dimensionTypes) {
        if (!currentTypes.has(dimType)) {
          suggestions.push({
            id: uuidv4(),
            type: 'dimension',
            suggestion: `Add ${dimType} dimension`,
            reason: `This dimension type appears in ${pattern.usageCount} of your successful generations`,
            confidence: Math.min(0.9, pattern.usageCount / 10 + 0.5),
            data: {
              dimensionType: dimType,
              weight: pattern.avgSuccessfulWeights[dimType] || 50,
            },
            shown: false,
            createdAt: new Date().toISOString(),
          });
          break; // Only one suggestion per pattern
        }
      }
    }
  }

  // Suggestion 2: Recommend weights based on successful patterns
  for (const dim of currentDimensions) {
    const relevantPatterns = dimensionPatterns.filter((p) =>
      p.dimensionTypes.includes(dim.type)
    );

    if (relevantPatterns.length > 0) {
      const avgWeight =
        relevantPatterns.reduce((sum, p) => sum + (p.avgSuccessfulWeights[dim.type] || 50), 0) /
        relevantPatterns.length;

      if (Math.abs(dim.weight - avgWeight) > 15) {
        suggestions.push({
          id: uuidv4(),
          type: 'weight',
          suggestion: `Adjust ${dim.type} weight to ${Math.round(avgWeight)}%`,
          reason: `Your successful generations typically use this weight`,
          confidence: 0.7,
          data: {
            dimensionType: dim.type,
            weight: Math.round(avgWeight),
          },
          shown: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  // Suggestion 3: Output mode based on history
  if (sessions.length >= 5) {
    const modeCount: Record<string, number> = {};
    for (const session of sessions) {
      modeCount[session.outputMode] = (modeCount[session.outputMode] || 0) + 1;
    }

    const mostUsedMode = Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0];
    if (mostUsedMode && mostUsedMode[1] >= sessions.length * 0.6) {
      suggestions.push({
        id: uuidv4(),
        type: 'output_mode',
        suggestion: `Try ${mostUsedMode[0]} mode`,
        reason: `You've had success with this mode ${mostUsedMode[1]} times`,
        confidence: 0.6,
        data: {
          outputMode: mostUsedMode[0] as OutputMode,
        },
        shown: false,
        createdAt: new Date().toISOString(),
      });
    }
  }

  // Sort by confidence and return top suggestions
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Get smart suggestions for the current context (wrapper)
 */
export async function getSmartSuggestions(
  dimensions: Array<{ id: string; type: string; reference: string; weight: number; filterMode: string; transformMode: string }>,
  baseImageDescription: string
): Promise<SmartSuggestion[]> {
  // Convert to Dimension-like objects for the suggestion engine
  const dimensionLike = dimensions.map((d) => ({
    ...d,
    label: d.type,
    icon: d.type,
    placeholder: '',
  }));

  return generateSmartSuggestions(dimensionLike as Dimension[], baseImageDescription);
}
