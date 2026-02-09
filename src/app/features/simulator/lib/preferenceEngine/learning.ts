/**
 * Preference Engine - Learning Module
 *
 * Learning algorithms: learn from feedback, extract patterns,
 * learn dimension combinations, learn style preferences,
 * refinement suggestions, prompt explanations, A/B variants,
 * AI refinement, text feedback analysis.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  UserPreference,
  PreferenceProfile,
  PromptPattern,
  PromptFeedback,
  LearnedContext,
  DimensionType,
  GeneratedPrompt,
  DimensionCombinationPattern,
  StylePreference,
  RefinementSuggestion,
  PromptExplanation,
  ABVariant,
} from '../../types';
import {
  isClientSide,
  getSuccessfulSessions,
  storeDimensionPattern,
  getStylePreference,
  storeStylePreference,
} from './storage';
import { buildLearnedContext } from './scoring';

// ============================================================================
// Category Mappings
// ============================================================================

/**
 * Category mapping from element categories to preference categories
 */
const ELEMENT_TO_PREFERENCE_CATEGORY: Record<string, UserPreference['category']> = {
  composition: 'composition',
  setting: 'setting',
  subject: 'subject',
  style: 'style',
  mood: 'mood',
  lighting: 'mood',
  quality: 'quality',
};

// ============================================================================
// Preference Learning
// ============================================================================

/**
 * Learn preferences from a piece of feedback
 */
export function learnFromFeedback(
  feedback: PromptFeedback,
  prompt: GeneratedPrompt,
  existingPreferences: UserPreference[]
): UserPreference[] {
  const updatedPreferences = [...existingPreferences];
  const now = new Date().toISOString();

  // If positive rating, reinforce preferences for liked elements
  if (feedback.rating === 'up') {
    // Learn from liked elements or all elements if none specified
    const elementsToLearn = feedback.likedElements?.length
      ? prompt.elements.filter((e) => feedback.likedElements?.includes(e.id))
      : prompt.elements;

    elementsToLearn.forEach((element) => {
      const category = ELEMENT_TO_PREFERENCE_CATEGORY[element.category] || 'style';
      const existingPref = updatedPreferences.find(
        (p) => p.category === category && p.value.toLowerCase() === element.text.toLowerCase()
      );

      if (existingPref) {
        // Reinforce existing preference
        existingPref.strength = Math.min(100, existingPref.strength + 10);
        existingPref.reinforcements += 1;
        existingPref.updatedAt = now;
      } else {
        // Create new preference
        updatedPreferences.push({
          id: uuidv4(),
          category,
          value: element.text,
          strength: 30, // Start with moderate strength
          reinforcements: 1,
          source: 'inferred',
          createdAt: now,
          updatedAt: now,
        });
      }
    });
  }

  // If negative rating, learn what to avoid
  if (feedback.rating === 'down') {
    // Learn from disliked elements or create avoid preferences
    const elementsToAvoid = feedback.dislikedElements?.length
      ? prompt.elements.filter((e) => feedback.dislikedElements?.includes(e.id))
      : [];

    elementsToAvoid.forEach((element) => {
      const existingAvoid = updatedPreferences.find(
        (p) => p.category === 'avoid' && p.value.toLowerCase() === element.text.toLowerCase()
      );

      if (existingAvoid) {
        existingAvoid.strength = Math.min(100, existingAvoid.strength + 15);
        existingAvoid.reinforcements += 1;
        existingAvoid.updatedAt = now;
      } else {
        updatedPreferences.push({
          id: uuidv4(),
          category: 'avoid',
          value: element.text,
          strength: 40,
          reinforcements: 1,
          source: 'inferred',
          createdAt: now,
          updatedAt: now,
        });
      }
    });

    // Extract keywords from text feedback to add to avoid list
    if (feedback.textFeedback) {
      const avoidKeywords = extractAvoidKeywords(feedback.textFeedback);
      avoidKeywords.forEach((keyword) => {
        const existingAvoid = updatedPreferences.find(
          (p) => p.category === 'avoid' && p.value.toLowerCase() === keyword.toLowerCase()
        );

        if (!existingAvoid) {
          updatedPreferences.push({
            id: uuidv4(),
            category: 'avoid',
            value: keyword,
            strength: 25,
            reinforcements: 1,
            source: 'explicit',
            createdAt: now,
            updatedAt: now,
          });
        }
      });
    }
  }

  // Decay preferences that weren't reinforced (prevent stale preferences)
  return updatedPreferences.map((pref) => {
    if (pref.updatedAt !== now && pref.source === 'inferred') {
      return {
        ...pref,
        strength: Math.max(0, pref.strength - 1),
      };
    }
    return pref;
  }).filter((pref) => pref.strength > 0);
}

/**
 * Extract keywords to avoid from text feedback
 */
function extractAvoidKeywords(text: string): string[] {
  const avoidPhrases = [
    'too much', 'don\'t like', 'remove', 'less', 'no more',
    'hate', 'dislike', 'avoid', 'not', 'without',
  ];

  const keywords: string[] = [];
  const lowerText = text.toLowerCase();

  avoidPhrases.forEach((phrase) => {
    const index = lowerText.indexOf(phrase);
    if (index !== -1) {
      // Extract the word(s) after the avoid phrase
      const afterPhrase = lowerText.slice(index + phrase.length).trim();
      const words = afterPhrase.split(/[,.\s]+/).slice(0, 3);
      keywords.push(...words.filter((w) => w.length > 2));
    }
  });

  return [...new Set(keywords)];
}

/**
 * Learn patterns from a collection of feedback
 */
export function learnPatterns(
  feedbackHistory: Array<{ feedback: PromptFeedback; prompt: GeneratedPrompt }>,
  existingPatterns: PromptPattern[]
): PromptPattern[] {
  const patternMap = new Map<string, PromptPattern>();

  // Initialize with existing patterns
  existingPatterns.forEach((p) => patternMap.set(p.id, p));

  // Count element occurrences in positive vs negative prompts
  const elementCounts = new Map<string, { success: number; failure: number }>();

  feedbackHistory.forEach(({ feedback, prompt }) => {
    if (!feedback.rating) return;

    prompt.elements.forEach((element) => {
      const key = `${element.category}:${element.text.toLowerCase()}`;
      const counts = elementCounts.get(key) || { success: 0, failure: 0 };

      if (feedback.rating === 'up') {
        counts.success += 1;
      } else {
        counts.failure += 1;
      }

      elementCounts.set(key, counts);
    });
  });

  // Convert counts to patterns
  elementCounts.forEach((counts, key) => {
    const total = counts.success + counts.failure;

    if (total >= 3) { // Only create patterns with enough data
      const confidence = counts.success / total;
      const existingPattern = [...patternMap.values()].find(
        (p) => p.type === 'element_combination' && p.value === key
      );

      if (existingPattern) {
        existingPattern.successCount = counts.success;
        existingPattern.failureCount = counts.failure;
        existingPattern.confidence = confidence;
        existingPattern.updatedAt = new Date().toISOString();
      } else {
        const newPattern: PromptPattern = {
          id: uuidv4(),
          type: 'element_combination',
          value: key,
          successCount: counts.success,
          failureCount: counts.failure,
          confidence,
          updatedAt: new Date().toISOString(),
        };
        patternMap.set(newPattern.id, newPattern);
      }
    }
  });

  return [...patternMap.values()];
}

// ============================================================================
// Dimension Combination Learning
// ============================================================================

/**
 * Learn dimension combination patterns from successful sessions
 */
export async function learnDimensionCombinations(): Promise<DimensionCombinationPattern[]> {
  if (!isClientSide()) return [];
  const sessions = await getSuccessfulSessions(100);
  const patternMap = new Map<string, DimensionCombinationPattern>();

  for (const session of sessions) {
    // Create a key from sorted dimension types
    const dimTypes = session.dimensionsSnapshot
      .map((d) => d.type)
      .sort()
      .join('|');

    const existing = patternMap.get(dimTypes);

    if (existing) {
      existing.usageCount += 1;
      existing.successfulReferences.push(
        ...session.dimensionsSnapshot.map((d) => d.reference).filter((r) => r)
      );
      // Update average weights
      for (const dim of session.dimensionsSnapshot) {
        if (existing.avgSuccessfulWeights[dim.type] != null) {
          existing.avgSuccessfulWeights[dim.type] =
            (existing.avgSuccessfulWeights[dim.type] + dim.weight) / 2;
        } else {
          existing.avgSuccessfulWeights[dim.type] = dim.weight;
        }
      }
      existing.updatedAt = new Date().toISOString();
    } else {
      const avgWeights: Record<DimensionType, number> = {} as Record<DimensionType, number>;
      for (const dim of session.dimensionsSnapshot) {
        avgWeights[dim.type] = dim.weight;
      }

      patternMap.set(dimTypes, {
        id: uuidv4(),
        dimensionTypes: session.dimensionsSnapshot.map((d) => d.type),
        successfulReferences: session.dimensionsSnapshot.map((d) => d.reference).filter((r) => r),
        successRate: 1, // Will be calculated when we have failure data
        usageCount: 1,
        avgSuccessfulWeights: avgWeights,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // Store patterns
  const patterns = [...patternMap.values()];
  for (const pattern of patterns) {
    await storeDimensionPattern(pattern);
  }

  return patterns;
}

// ============================================================================
// Style Preference Learning
// ============================================================================

/**
 * Learn style preferences from prompt elements
 */
export async function learnStylePreferences(
  prompt: GeneratedPrompt,
  rating: 'up' | 'down'
): Promise<void> {
  const styleCategories: Record<string, StylePreference['category']> = {
    lighting: 'lighting',
    cinematic: 'lighting',
    dramatic: 'lighting',
    soft: 'lighting',
    render: 'rendering',
    realistic: 'rendering',
    stylized: 'rendering',
    'hand-painted': 'rendering',
    composition: 'composition',
    'wide shot': 'composition',
    'close-up': 'composition',
    portrait: 'composition',
    color: 'color',
    vibrant: 'color',
    muted: 'color',
    monochrome: 'color',
    texture: 'texture',
    detailed: 'detail',
    intricate: 'detail',
  };

  for (const element of prompt.elements) {
    const lowerText = element.text.toLowerCase();

    for (const [keyword, category] of Object.entries(styleCategories)) {
      if (lowerText.includes(keyword)) {
        // Check if we already have this style preference
        const existing = await getStylePreference(category, element.text);

        if (existing) {
          if (rating === 'up') {
            existing.positiveAssociations += 1;
          } else {
            existing.negativeAssociations += 1;
          }
          existing.strength = Math.round(
            (existing.positiveAssociations /
              (existing.positiveAssociations + existing.negativeAssociations)) *
              100
          );
          existing.updatedAt = new Date().toISOString();
          await storeStylePreference(existing);
        } else {
          const newPref: StylePreference = {
            id: uuidv4(),
            category,
            value: element.text,
            strength: rating === 'up' ? 60 : 40,
            positiveAssociations: rating === 'up' ? 1 : 0,
            negativeAssociations: rating === 'down' ? 1 : 0,
            sourceDimensions: [],
            updatedAt: new Date().toISOString(),
          };
          await storeStylePreference(newPref);
        }
        break; // Only categorize once per element
      }
    }
  }
}

// ============================================================================
// Refinement Suggestions
// ============================================================================

/**
 * Generate refinement suggestions based on feedback history and patterns
 */
export async function generateRefinementSuggestions(
  currentPrompt: GeneratedPrompt,
  recentFeedback: PromptFeedback[],
  profile: PreferenceProfile
): Promise<RefinementSuggestion[]> {
  const suggestions: RefinementSuggestion[] = [];
  const context = buildLearnedContext(profile);

  // Suggestion 1: Based on avoid list
  context.avoidElements.forEach((avoid) => {
    const hasElement = currentPrompt.elements.some(
      (e) => e.text.toLowerCase().includes(avoid.toLowerCase())
    );
    if (hasElement) {
      suggestions.push({
        id: uuidv4(),
        type: 'remove',
        target: avoid,
        suggestion: `Consider removing "${avoid}" - this has received negative feedback`,
        reason: 'Based on your feedback history, this element tends to produce unwanted results',
        confidence: 0.8,
        source: 'feedback_history',
      });
    }
  });

  // Suggestion 2: Based on emphasize list
  context.emphasizeElements.forEach((emphasize) => {
    const hasElement = currentPrompt.elements.some(
      (e) => e.text.toLowerCase().includes(emphasize.toLowerCase())
    );
    if (!hasElement) {
      suggestions.push({
        id: uuidv4(),
        type: 'add',
        target: emphasize,
        suggestion: `Consider adding "${emphasize}" - this often produces results you like`,
        reason: 'This element frequently appears in prompts you rated positively',
        confidence: 0.7,
        source: 'pattern',
      });
    }
  });

  // Suggestion 3: Based on high-confidence patterns
  context.patterns
    .filter((p) => p.confidence >= 0.7 && p.type === 'element_combination')
    .forEach((pattern) => {
      const [category, value] = pattern.value.split(':');
      const hasPattern = currentPrompt.elements.some(
        (e) => e.text.toLowerCase() === value && e.category === category
      );

      if (!hasPattern && pattern.successCount > pattern.failureCount) {
        suggestions.push({
          id: uuidv4(),
          type: 'add',
          target: value,
          suggestion: `Try adding "${value}" (${category}) - ${Math.round(pattern.confidence * 100)}% success rate`,
          reason: `This ${category} element has worked well in ${pattern.successCount} prompts`,
          confidence: pattern.confidence,
          source: 'pattern',
        });
      }
    });

  // Suggestion 4: Based on recent negative feedback
  const recentNegative = recentFeedback.filter((f) => f.rating === 'down').slice(0, 3);
  recentNegative.forEach((feedback) => {
    if (feedback.textFeedback) {
      const extractedSuggestion = extractSuggestionFromText(feedback.textFeedback);
      if (extractedSuggestion) {
        suggestions.push(extractedSuggestion);
      }
    }
  });

  // Suggestion 5: Dimension adjustments
  context.dimensionAdjustments.forEach((adjustment) => {
    suggestions.push({
      id: uuidv4(),
      type: 'modify',
      target: adjustment.type,
      suggestion: `Adjust ${adjustment.type}: ${adjustment.adjustment}`,
      reason: adjustment.reason,
      confidence: 0.6,
      source: 'pattern',
    });
  });

  // Sort by confidence and limit
  return suggestions
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

/**
 * Extract suggestion from text feedback using heuristics
 */
function extractSuggestionFromText(text: string): RefinementSuggestion | null {
  const lowerText = text.toLowerCase();

  // Pattern: "too much X" -> reduce X
  const tooMuchMatch = lowerText.match(/too much\s+(\w+)/);
  if (tooMuchMatch) {
    return {
      id: uuidv4(),
      type: 'deemphasize',
      target: tooMuchMatch[1],
      suggestion: `Reduce "${tooMuchMatch[1]}" - user felt there was too much`,
      reason: 'Direct feedback about element intensity',
      confidence: 0.9,
      source: 'feedback_history',
    };
  }

  // Pattern: "more X" -> add/emphasize X
  const moreMatch = lowerText.match(/(?:need|want|add)\s+more\s+(\w+)/);
  if (moreMatch) {
    return {
      id: uuidv4(),
      type: 'emphasize',
      target: moreMatch[1],
      suggestion: `Emphasize "${moreMatch[1]}" - user wants more of this`,
      reason: 'Direct feedback requesting more of this element',
      confidence: 0.9,
      source: 'feedback_history',
    };
  }

  // Pattern: "remove X" or "no X"
  const removeMatch = lowerText.match(/(?:remove|no|without)\s+(\w+)/);
  if (removeMatch) {
    return {
      id: uuidv4(),
      type: 'remove',
      target: removeMatch[1],
      suggestion: `Remove "${removeMatch[1]}" - explicitly requested`,
      reason: 'Direct feedback to remove this element',
      confidence: 0.95,
      source: 'feedback_history',
    };
  }

  return null;
}

// ============================================================================
// Prompt Explanations
// ============================================================================

/**
 * Generate explanation for why prompt elements were chosen
 */
export async function generatePromptExplanation(
  prompt: GeneratedPrompt,
  profile: PreferenceProfile
): Promise<PromptExplanation> {
  const context = buildLearnedContext(profile);
  const elementExplanations: PromptExplanation['elementExplanations'] = [];
  const appliedPreferences: PromptExplanation['appliedPreferences'] = [];

  prompt.elements.forEach((element) => {
    let reason = `Standard ${element.category} element for ${prompt.sceneType}`;
    let influencedByPreference = false;
    const relatedPatterns: string[] = [];

    // Check if influenced by preferences
    const matchingPref = context.preferences.find(
      (p) => p.value.toLowerCase() === element.text.toLowerCase()
    );

    if (matchingPref) {
      influencedByPreference = true;
      reason = `Included because you've ${matchingPref.source === 'explicit' ? 'explicitly preferred' : 'previously liked'} this ${matchingPref.category} element`;

      appliedPreferences.push({
        preferenceId: matchingPref.id,
        value: matchingPref.value,
        impact: matchingPref.strength >= 70 ? 'high' : matchingPref.strength >= 40 ? 'medium' : 'low',
      });
    }

    // Check for related patterns
    context.patterns.forEach((pattern) => {
      if (pattern.value.includes(element.text.toLowerCase())) {
        relatedPatterns.push(
          `${Math.round(pattern.confidence * 100)}% success rate in similar prompts`
        );
      }
    });

    if (relatedPatterns.length > 0) {
      reason += `. Pattern data: ${relatedPatterns.join('; ')}`;
    }

    elementExplanations.push({
      elementId: element.id,
      text: element.text,
      reason,
      influencedByPreference,
      relatedPatterns: relatedPatterns.length > 0 ? relatedPatterns : undefined,
    });
  });

  // Generate summary
  const preferenceCount = appliedPreferences.length;
  const highImpactCount = appliedPreferences.filter((p) => p.impact === 'high').length;

  let summary = `This prompt was generated based on your ${prompt.sceneType} request`;
  if (preferenceCount > 0) {
    summary += `, personalized with ${preferenceCount} of your preferences`;
    if (highImpactCount > 0) {
      summary += ` (${highImpactCount} high-impact)`;
    }
  }
  summary += '.';

  return {
    promptId: prompt.id,
    summary,
    elementExplanations,
    appliedPreferences,
  };
}

// ============================================================================
// A/B Variants
// ============================================================================

/**
 * Generate A/B variants for a prompt
 * Creates variations to test different approaches
 */
export function generateABVariants(
  basePrompt: GeneratedPrompt,
  profile: PreferenceProfile
): ABVariant[] {
  const context = buildLearnedContext(profile);
  const variants: ABVariant[] = [];

  // Variant A: Base prompt (control)
  variants.push({
    id: uuidv4(),
    variantName: 'A',
    prompt: basePrompt.prompt,
    elements: basePrompt.elements,
    positiveRatings: 0,
    negativeRatings: 0,
    impressions: 1,
    conversionRate: 0,
  });

  // Variant B: With emphasis on preferred elements
  if (context.emphasizeElements.length > 0) {
    const emphasizedPrompt = `${basePrompt.prompt}, with emphasis on ${context.emphasizeElements.slice(0, 2).join(' and ')}`;
    variants.push({
      id: uuidv4(),
      variantName: 'B',
      prompt: emphasizedPrompt,
      elements: basePrompt.elements,
      positiveRatings: 0,
      negativeRatings: 0,
      impressions: 0,
      conversionRate: 0,
    });
  }

  // Variant C: Without avoided elements
  if (context.avoidElements.length > 0) {
    let cleanedPrompt = basePrompt.prompt;
    context.avoidElements.forEach((avoid) => {
      cleanedPrompt = cleanedPrompt.replace(new RegExp(avoid, 'gi'), '');
    });
    cleanedPrompt = cleanedPrompt.replace(/,\s*,/g, ',').replace(/^\s*,\s*/, '').replace(/\s*,\s*$/, '');

    if (cleanedPrompt !== basePrompt.prompt) {
      variants.push({
        id: uuidv4(),
        variantName: 'C',
        prompt: cleanedPrompt,
        elements: basePrompt.elements.filter(
          (e) => !context.avoidElements.some((a) => e.text.toLowerCase().includes(a.toLowerCase()))
        ),
        positiveRatings: 0,
        negativeRatings: 0,
        impressions: 0,
        conversionRate: 0,
      });
    }
  }

  return variants;
}

/**
 * Record variant impression and rating
 */
export function recordVariantResult(
  variant: ABVariant,
  rating: 'up' | 'down' | null
): ABVariant {
  const updated = { ...variant };
  updated.impressions += 1;

  if (rating === 'up') {
    updated.positiveRatings += 1;
  } else if (rating === 'down') {
    updated.negativeRatings += 1;
  }

  updated.conversionRate = updated.positiveRatings / updated.impressions;
  return updated;
}

// ============================================================================
// AI Refinement
// ============================================================================

/**
 * Call AI API for intelligent refinement suggestions
 * Falls back to local heuristics if API unavailable
 */
export async function getAIRefinementSuggestions(
  prompt: GeneratedPrompt,
  feedbackHistory: PromptFeedback[],
  profile: PreferenceProfile
): Promise<RefinementSuggestion[]> {
  // First, generate local suggestions
  const localSuggestions = await generateRefinementSuggestions(
    prompt,
    feedbackHistory,
    profile
  );

  // Try AI enhancement
  try {
    const response = await fetch('/api/ai/simulator?action=analyze-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.prompt,
        elements: prompt.elements,
        feedbackHistory: feedbackHistory.slice(0, 10).map((f) => ({
          rating: f.rating,
          text: f.textFeedback,
        })),
        preferences: profile.preferences.slice(0, 10).map((p) => ({
          category: p.category,
          value: p.value,
          strength: p.strength,
        })),
      }),
    });

    if (response.ok) {
      const aiResult = await response.json();
      if (aiResult.suggestions) {
        // Merge AI suggestions with local ones
        interface AISuggestionResponse {
          type?: RefinementSuggestion['type'];
          target: string;
          suggestion: string;
          reason: string;
          confidence?: number;
        }
        const aiSuggestions: RefinementSuggestion[] = aiResult.suggestions.map(
          (s: AISuggestionResponse) => ({
            id: uuidv4(),
            type: s.type || 'modify',
            target: s.target,
            suggestion: s.suggestion,
            reason: s.reason,
            confidence: s.confidence || 0.7,
            source: 'ai' as const,
          })
        );

        // Combine and deduplicate
        const combined = [...aiSuggestions, ...localSuggestions];
        const seen = new Set<string>();
        return combined.filter((s) => {
          const key = `${s.type}:${s.target}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 5);
      }
    }
  } catch (error) {
    console.error('AI refinement suggestion failed, using local:', error);
  }

  return localSuggestions;
}

// ============================================================================
// Text Feedback Analysis
// ============================================================================

/**
 * Analyze feedback text with AI to extract insights
 */
export async function analyzeTextFeedback(
  textFeedback: string
): Promise<{
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords: string[];
  suggestedActions: string[];
}> {
  // Default local analysis
  const lowerText = textFeedback.toLowerCase();

  const positiveWords = ['love', 'great', 'perfect', 'amazing', 'good', 'nice', 'excellent'];
  const negativeWords = ['hate', 'bad', 'wrong', 'ugly', 'terrible', 'poor', 'remove'];

  const positiveCount = positiveWords.filter((w) => lowerText.includes(w)).length;
  const negativeCount = negativeWords.filter((w) => lowerText.includes(w)).length;

  let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (positiveCount > negativeCount) sentiment = 'positive';
  else if (negativeCount > positiveCount) sentiment = 'negative';

  // Extract keywords (simple word frequency)
  const words = textFeedback
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const wordCounts = new Map<string, number>();
  words.forEach((w) => wordCounts.set(w, (wordCounts.get(w) || 0) + 1));

  const keywords = [...wordCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  const suggestedActions: string[] = [];
  if (lowerText.includes('more')) suggestedActions.push('Increase intensity of mentioned elements');
  if (lowerText.includes('less') || lowerText.includes('too much')) {
    suggestedActions.push('Reduce intensity of mentioned elements');
  }
  if (lowerText.includes('remove') || lowerText.includes('without')) {
    suggestedActions.push('Remove mentioned elements');
  }

  return { sentiment, keywords, suggestedActions };
}
