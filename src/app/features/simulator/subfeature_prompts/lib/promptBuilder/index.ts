/**
 * Prompt Builder - Generates diverse prompts using the lens-based content-swap approach
 *
 * The lens-based content-swap approach:
 * 1. Start with the BASE FORMAT (visual structure to preserve)
 * 2. Apply LENS transformations from dimensions:
 *    - FILTER: What to preserve from the base
 *    - TRANSFORM: How to apply the reference content
 *    - WEIGHT: How strongly to apply (0-100, enables graduated blending)
 * 3. Add VARIETY through different angles, times, atmospheres
 *
 * Weight enables graduated transformations like "50% Star Wars, 50% Ghibli"
 *
 * IMPORTANT: Prompts must stay under 1500 characters for Leonardo API
 */

import { Dimension, PromptElement, OutputMode, LearnedContext } from '../../../types';

// Re-export everything from sub-modules
export { MAX_PROMPT_LENGTH, CAMERA_ANGLES, TIME_OF_DAY, ATMOSPHERIC_CONDITIONS, COMPOSITION_STYLES, SCENE_VARIATIONS, MODE_CONFIGS } from './config';
export type { ModeConfig } from './config';
export {
  buildModePromptParts,
  shouldUseDimension,
  getVarietyModifiers,
  truncatePrompt,
  getWeightPhrase,
  getFilterModeHint,
  getTransformModeInstruction,
  buildWeightedClause,
  getDimensionsWithReferenceImages,
  buildContentSwaps,
  buildFilterHints,
} from './utilities';
export { buildElements, applyLearnedContext, filterAvoidElements } from './elements';

// Import for use in this module
import { MODE_CONFIGS, SCENE_VARIATIONS } from './config';
import {
  getVarietyModifiers,
  shouldUseDimension,
  truncatePrompt,
  buildWeightedClause,
  buildContentSwaps,
  buildFilterHints,
} from './utilities';
import { buildElements, applyLearnedContext, filterAvoidElements } from './elements';

/**
 * Build a prompt with elements - optimized for 1500 char limit
 * Uses the lens model for graduated transformations based on weight
 * Now enhanced with learned context from user feedback
 *
 * OUTPUT MODES produce drastically different prompts:
 * - gameplay: Authentic game screenshot with HUD/UI elements visible
 * - sketch: Hand-drawn concept art with pencil strokes and loose linework
 * - trailer: Cinematic movie still with photorealistic Hollywood production quality
 * - poster: Official movie poster with dramatic composition
 */
export function buildMockPromptWithElements(
  baseImage: string,
  filledDimensions: Dimension[],
  sceneType: string,
  index: number,
  lockedElements: PromptElement[],
  outputMode: OutputMode,
  learnedContext?: LearnedContext
): { prompt: string; elements: PromptElement[] } {
  const modeConfig = MODE_CONFIGS[outputMode];
  const variety = getVarietyModifiers(index);

  // Get mode-specific scene variation (or default)
  const defaultVariation = SCENE_VARIATIONS[sceneType] || SCENE_VARIATIONS['Cinematic Wide Shot'];
  const variation = modeConfig.sceneOverride?.[sceneType] || defaultVariation;

  const styleDim = filledDimensions.find((d) => d.type === 'artStyle');
  const moodDim = filledDimensions.find((d) => d.type === 'mood');
  const cameraDim = filledDimensions.find((d) => d.type === 'camera');
  const gameUIDim = filledDimensions.find((d) => d.type === 'gameUI');

  // Filter dimensions based on mode's dimensionUsage setting
  const activeDimensions = filledDimensions.filter((dim, idx) =>
    shouldUseDimension(outputMode, dim.type, idx)
  );

  // Build prompt parts - structure varies dramatically by mode
  const promptParts: string[] = [];

  // ====================================================================
  // MODE-SPECIFIC PROMPT STRUCTURE
  // ====================================================================

  if (outputMode === 'sketch') {
    // SKETCH MODE: Lead with artistic medium, minimize technical game details
    // Structure: [artistic style] + [subject from base] + [simplified dimensions] + [artistic technique]

    // 1. Primary artistic style (this is the MOST important for sketch mode)
    promptParts.push(...modeConfig.styleKeywords.slice(0, 2));
    promptParts.push(...modeConfig.technicalKeywords.slice(0, 3));

    // 2. Subject extracted from base (simplified, no game-specific UI language)
    const baseSubject = baseImage.length > 120 ? baseImage.substring(0, 120) : baseImage;
    promptParts.push(`of ${baseSubject}`);

    // 3. Scene context (use artistic terminology)
    promptParts.push(variation.moment);
    promptParts.push(variation.focus);

    // 4. Simplified dimensions (only core subjects, not game UI or tech details)
    const sketchSwaps = buildContentSwaps(activeDimensions);
    if (sketchSwaps.length > 0) {
      promptParts.push(sketchSwaps.slice(0, 2).join(', ')); // Limit to avoid over-detailing
    }

    // 5. Mood if present (sketches can convey mood through stroke weight)
    if (moodDim?.reference) {
      promptParts.push(`${moodDim.reference} atmosphere`);
    }

    // 6. Additional artistic technique
    promptParts.push('artist workbook page');
    promptParts.push('raw and expressive');

  } else if (outputMode === 'trailer') {
    // TRAILER MODE: Lead with cinematic production quality
    // Structure: [cinematic style] + [film techniques] + [dramatic scene] + [full dimensions]

    // 1. Cinematic production keywords (CRITICAL for photorealistic output)
    promptParts.push(...modeConfig.styleKeywords);

    // 2. Camera work (cinematic angle)
    const cameraClause = cameraDim ? buildWeightedClause(cameraDim, 30) : null;
    promptParts.push(cameraClause || 'sweeping cinematic shot');

    // 3. Scene from base with dramatic framing
    const baseDesc = baseImage.length > 180 ? baseImage.substring(0, 180) : baseImage;
    promptParts.push(baseDesc);

    // 4. Cinematic moment (use trailer-specific scene descriptions)
    promptParts.push(variation.moment);
    promptParts.push(variation.focus);

    // 5. Full dimension content (trailer mode uses all dimensions)
    const trailerSwaps = buildContentSwaps(activeDimensions);
    if (trailerSwaps.length > 0) {
      promptParts.push(trailerSwaps.join(', '));
    }

    // 6. Art style and mood for visual coherence
    if (styleDim?.reference) {
      const styleClause = buildWeightedClause(styleDim, 50);
      if (styleClause) promptParts.push(styleClause);
    }
    if (moodDim?.reference) {
      promptParts.push(`${moodDim.reference} mood`);
    }

    // 7. Technical film quality keywords (CRITICAL for photorealism)
    promptParts.push(...modeConfig.technicalKeywords.slice(0, 4));

    // 8. Lighting (cinematic lighting is essential)
    promptParts.push(variety.time);
    promptParts.push('dramatic volumetric lighting');

  } else if (outputMode === 'poster') {
    // POSTER MODE: Marketing composition with dramatic character focus
    promptParts.push(...modeConfig.styleKeywords);

    const baseDesc = baseImage.length > 150 ? baseImage.substring(0, 150) : baseImage;
    promptParts.push(baseDesc);

    promptParts.push(variation.moment);

    const posterSwaps = buildContentSwaps(activeDimensions);
    if (posterSwaps.length > 0) {
      promptParts.push(posterSwaps.join(', '));
    }

    if (styleDim?.reference) {
      promptParts.push(styleDim.reference);
    }

    promptParts.push(...modeConfig.technicalKeywords.slice(0, 3));
    promptParts.push(variation.focus);

  } else if (outputMode === 'realistic') {
    // REALISTIC MODE: Same structure as GAMEPLAY but with photorealistic rendering
    // Uses EXACT same scene/camera/dimensions as gameplay, just different rendering style
    // Structure: [camera] + [base] + [scene] + [dimensions] + [style] + [REALISTIC RENDERING] + [quality]

    // 1. Camera angle (SAME as gameplay)
    const cameraClause = cameraDim ? buildWeightedClause(cameraDim, 30) : null;
    promptParts.push(cameraClause || variety.camera);

    // 2. Base description (SAME as gameplay)
    const baseDesc = baseImage.length > 200 ? baseImage.substring(0, 200) : baseImage;
    promptParts.push(baseDesc);

    // 3. Filter preservation hints (SAME as gameplay)
    const filterHints = buildFilterHints(activeDimensions);
    if (filterHints.length > 0) {
      promptParts.push(filterHints.join(' and '));
    }

    // 4. Scene type (SAME as gameplay - uses defaultVariation, not mode override)
    promptParts.push(defaultVariation.moment);

    // 5. Content swaps (SAME as gameplay)
    const swaps = buildContentSwaps(activeDimensions);
    if (swaps.length > 0) {
      promptParts.push(swaps.join(', '));
    }

    // 6. Style and mood (SAME as gameplay)
    if (styleDim?.reference) {
      const styleClause = buildWeightedClause(styleDim, 50);
      if (styleClause) promptParts.push(styleClause);
    }
    if (moodDim?.reference) {
      const moodClause = buildWeightedClause(moodDim, 30);
      if (moodClause) promptParts.push(moodClause);
    }

    // 7. Variety modifiers (SAME as gameplay)
    promptParts.push(variety.time);
    promptParts.push(variety.atmosphere);

    // 8. REALISTIC RENDERING (INSTEAD of game UI - this is the ONLY difference from gameplay)
    promptParts.push(...modeConfig.styleKeywords.slice(0, 2));
    promptParts.push(...modeConfig.technicalKeywords.slice(0, 4));

    // 9. Quality (SAME as gameplay)
    promptParts.push(defaultVariation.focus);
    promptParts.push('detailed');

  } else {
    // GAMEPLAY MODE (default): Authentic game screenshot with visible UI
    // Structure: [camera] + [base] + [scene] + [dimensions] + [style] + [game UI] + [quality]

    // 1. Camera angle
    const cameraClause = cameraDim ? buildWeightedClause(cameraDim, 30) : null;
    promptParts.push(cameraClause || variety.camera);

    // 2. Base description
    const baseDesc = baseImage.length > 200 ? baseImage.substring(0, 200) : baseImage;
    promptParts.push(baseDesc);

    // 3. Filter preservation hints
    const filterHints = buildFilterHints(activeDimensions);
    if (filterHints.length > 0) {
      promptParts.push(filterHints.join(' and '));
    }

    // 4. Scene type
    promptParts.push(defaultVariation.moment);

    // 5. Content swaps
    const swaps = buildContentSwaps(activeDimensions);
    if (swaps.length > 0) {
      promptParts.push(swaps.join(', '));
    }

    // 6. Style and mood
    if (styleDim?.reference) {
      const styleClause = buildWeightedClause(styleDim, 50);
      if (styleClause) promptParts.push(styleClause);
    }
    if (moodDim?.reference) {
      const moodClause = buildWeightedClause(moodDim, 30);
      if (moodClause) promptParts.push(moodClause);
    }

    // 7. Variety modifiers
    promptParts.push(variety.time);
    promptParts.push(variety.atmosphere);

    // 8. Game UI (CRITICAL for gameplay mode)
    const gameUIClause = gameUIDim ? buildWeightedClause(gameUIDim, 50) : null;
    promptParts.push(...modeConfig.styleKeywords.slice(0, 2));
    promptParts.push(gameUIClause || 'game UI overlay');
    promptParts.push(...modeConfig.technicalKeywords.slice(0, 3));

    // 9. Quality
    promptParts.push(defaultVariation.focus);
    promptParts.push('detailed');
  }

  // Apply learned context - enhance with preferences and filter avoid elements
  let enhancedParts = applyLearnedContext(promptParts, learnedContext);
  if (learnedContext?.avoidElements) {
    enhancedParts = filterAvoidElements(enhancedParts, learnedContext.avoidElements);
  }

  // Join and truncate to ensure we're under the limit
  const rawPrompt = enhancedParts.filter(p => p).join(', ');
  const finalPrompt = truncatePrompt(rawPrompt);

  // Build elements for UI
  const elements = buildElements(baseImage, activeDimensions, outputMode, 'detailed', lockedElements);

  return { prompt: finalPrompt, elements };
}

/**
 * Build a prompt with learned context integration
 * This is the main entry point that fetches learned context and applies it
 */
export async function buildPromptWithLearning(
  baseImage: string,
  filledDimensions: Dimension[],
  sceneType: string,
  index: number,
  lockedElements: PromptElement[],
  outputMode: OutputMode
): Promise<{ prompt: string; elements: PromptElement[] }> {
  // Dynamically import to avoid circular dependencies and keep server-side safe
  let learnedContext: LearnedContext | undefined;

  try {
    // Only load learning context on client side
    if (typeof window !== 'undefined') {
      const { getPreferenceProfile, buildLearnedContext } = await import('../../../lib/preferenceEngine');
      const profile = await getPreferenceProfile();
      learnedContext = buildLearnedContext(profile);
    }
  } catch (error) {
    console.warn('Failed to load learned context:', error);
  }

  return buildMockPromptWithElements(
    baseImage,
    filledDimensions,
    sceneType,
    index,
    lockedElements,
    outputMode,
    learnedContext
  );
}
