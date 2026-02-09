/**
 * Prompt Builder Utilities
 *
 * Helper functions used by the prompt builder:
 * - buildModePromptParts: Build mode-specific prompt sections
 * - shouldUseDimension: Check if dimension should be used for a given mode
 * - getVarietyModifiers: Get variety modifiers for prompt index
 * - truncatePrompt: Truncate prompt to fit within character limit
 * - Weight/filter/transform helpers for the lens model
 * - buildWeightedClause: Build weighted dimension clause
 * - getDimensionsWithReferenceImages: Get dimensions with reference images
 * - buildContentSwaps: Build content swap clauses from dimensions
 * - buildFilterHints: Build filter preservation hints
 */

import { Dimension, DimensionFilterMode, DimensionTransformMode, OutputMode } from '../../../types';
import {
  MAX_PROMPT_LENGTH,
  CAMERA_ANGLES,
  TIME_OF_DAY,
  ATMOSPHERIC_CONDITIONS,
  COMPOSITION_STYLES,
  MODE_CONFIGS,
} from './config';

/**
 * Build mode-specific prompt section
 * Returns an array of prompt parts specific to the selected output mode
 */
export function buildModePromptParts(
  outputMode: OutputMode,
  sceneType: string,
  gameUIDim?: Dimension
): { styleParts: string[]; sceneOverride?: { moment: string; focus: string } } {
  const config = MODE_CONFIGS[outputMode];
  const styleParts: string[] = [];

  // Add primary style keywords (pick 2-3 for variety)
  styleParts.push(...config.styleKeywords.slice(0, 3));

  // Add technical keywords (pick 2-3 based on scene type)
  const techKeywords = config.technicalKeywords;
  if (sceneType.includes('Portrait') || sceneType.includes('Hero')) {
    styleParts.push(techKeywords[0], techKeywords[2]);
  } else if (sceneType.includes('Action')) {
    styleParts.push(techKeywords[1], techKeywords[3]);
  } else {
    styleParts.push(techKeywords[0], techKeywords[1]);
  }

  // For gameplay mode, add game UI dimension if available
  if (outputMode === 'gameplay' && gameUIDim?.reference) {
    styleParts.push(`${gameUIDim.reference} style UI`);
  }

  return {
    styleParts,
    sceneOverride: config.sceneOverride?.[sceneType],
  };
}

/**
 * Check if dimension should be used for this mode
 * Sketch mode simplifies by focusing on fewer dimensions
 */
export function shouldUseDimension(
  outputMode: OutputMode,
  dimensionType: string,
  dimensionIndex: number
): boolean {
  const config = MODE_CONFIGS[outputMode];

  if (config.dimensionUsage === 'full') return true;
  if (config.dimensionUsage === 'minimal') return dimensionIndex === 0;

  // 'simplified' mode - focus on core dimensions
  if (config.dimensionUsage === 'simplified') {
    // For sketch, prioritize: environment, characters (core subjects)
    // Skip: gameUI, technology, creatures (too detailed for sketches)
    const priorityDimensions = ['environment', 'characters', 'artStyle', 'mood'];
    return priorityDimensions.includes(dimensionType);
  }

  return true;
}

/**
 * Get variety modifiers for a specific prompt index (0-3)
 */
export function getVarietyModifiers(index: number): {
  camera: string;
  time: string;
  atmosphere: string;
  composition: string;
} {
  return {
    camera: CAMERA_ANGLES[index % CAMERA_ANGLES.length],
    time: TIME_OF_DAY[(index * 2) % TIME_OF_DAY.length],
    atmosphere: ATMOSPHERIC_CONDITIONS[(index * 3) % ATMOSPHERIC_CONDITIONS.length],
    composition: COMPOSITION_STYLES[index % COMPOSITION_STYLES.length],
  };
}

/**
 * Truncate prompt to fit within Leonardo's character limit
 */
export function truncatePrompt(prompt: string, maxLength: number = MAX_PROMPT_LENGTH): string {
  if (prompt.length <= maxLength) return prompt;

  // Find the last comma before the limit to avoid cutting mid-phrase
  const truncated = prompt.substring(0, maxLength);
  const lastComma = truncated.lastIndexOf(',');

  if (lastComma > maxLength * 0.7) {
    return truncated.substring(0, lastComma);
  }

  return truncated;
}

/**
 * Get weight phrase for graduated transformations
 * Returns intensity modifier based on weight (0-100)
 */
export function getWeightPhrase(weight: number): string {
  if (weight >= 90) return ''; // Full transformation, no modifier needed
  if (weight >= 70) return 'strong influence of';
  if (weight >= 50) return 'balanced blend of';
  if (weight >= 30) return 'subtle hints of';
  if (weight >= 10) return 'traces of';
  return ''; // 0 weight means no transformation
}

/**
 * Get filter mode hint for preserving base image aspects
 */
export function getFilterModeHint(filterMode: DimensionFilterMode): string {
  switch (filterMode) {
    case 'preserve_structure': return 'maintaining composition and layout';
    case 'preserve_subject': return 'keeping main subjects';
    case 'preserve_mood': return 'preserving emotional tone';
    case 'preserve_color_palette': return 'keeping color palette';
    case 'none': return '';
    default: return '';
  }
}

/**
 * Get transform mode instruction
 */
export function getTransformModeInstruction(transformMode: DimensionTransformMode): string {
  switch (transformMode) {
    case 'replace': return ''; // Default behavior
    case 'blend': return 'blended with';
    case 'style_transfer': return 'style of';
    case 'semantic_swap': return 'semantic essence of';
    case 'additive': return 'layered with';
    default: return '';
  }
}

/**
 * Build a weighted dimension clause that incorporates the lens model
 * Optionally includes a visual reference indicator when a reference image is attached
 */
export function buildWeightedClause(dim: Dimension, maxLength: number = 60): string | null {
  if (!dim.reference?.trim()) return null;

  const weight = dim.weight ?? 100;
  if (weight === 0) return null; // Skip dimensions with 0 weight

  const ref = dim.reference.length > maxLength ? dim.reference.substring(0, maxLength) : dim.reference;
  const weightPhrase = getWeightPhrase(weight);
  const transformInstruction = getTransformModeInstruction(dim.transformMode ?? 'replace');

  // Build the base clause based on weight and transform mode
  let clause: string;
  if (weightPhrase && transformInstruction) {
    clause = `${weightPhrase} ${transformInstruction} ${ref}`;
  } else if (weightPhrase) {
    clause = `${weightPhrase} ${ref}`;
  } else if (transformInstruction) {
    clause = `${transformInstruction} ${ref}`;
  } else {
    clause = ref;
  }

  // Add visual reference indicator if reference image is attached
  if (dim.referenceImage) {
    clause = `(visual reference) ${clause}`;
  }

  return clause;
}

/**
 * Get dimensions that have reference images attached
 * Useful for API calls that support image-to-image or style reference
 */
export function getDimensionsWithReferenceImages(dimensions: Dimension[]): Array<{
  type: string;
  label: string;
  referenceImage: string;
}> {
  return dimensions
    .filter((d) => d.referenceImage)
    .map((d) => ({
      type: d.type,
      label: d.label,
      referenceImage: d.referenceImage!,
    }));
}

/**
 * Build content swap clauses from dimensions - uses lens model for graduated transformations
 */
export function buildContentSwaps(filledDimensions: Dimension[]): string[] {
  const swaps: string[] = [];

  // Core content dimensions
  const coreDims = ['environment', 'characters', 'creatures', 'technology', 'action'];
  coreDims.forEach(type => {
    const dim = filledDimensions.find(d => d.type === type);
    if (dim) {
      const clause = buildWeightedClause(dim, 60);
      if (clause) swaps.push(clause);
    }
  });

  // Era dimension - important for time period
  const eraDim = filledDimensions.find(d => d.type === 'era');
  if (eraDim) {
    const clause = buildWeightedClause(eraDim, 40);
    if (clause) swaps.push(`${clause} era`);
  }

  // Genre dimension - affects overall visual style
  const genreDim = filledDimensions.find(d => d.type === 'genre');
  if (genreDim) {
    const clause = buildWeightedClause(genreDim, 40);
    if (clause) swaps.push(`${clause} genre`);
  }

  // Custom dimension - user-defined additions
  const customDim = filledDimensions.find(d => d.type === 'custom');
  if (customDim) {
    const clause = buildWeightedClause(customDim, 50);
    if (clause) swaps.push(clause);
  }

  return swaps;
}

/**
 * Build filter preservation hints for the prompt based on active filter modes
 */
export function buildFilterHints(filledDimensions: Dimension[]): string[] {
  const hints: string[] = [];
  const seenModes = new Set<DimensionFilterMode>();

  filledDimensions.forEach(dim => {
    const filterMode = dim.filterMode ?? 'preserve_structure';
    if (filterMode !== 'none' && !seenModes.has(filterMode)) {
      const hint = getFilterModeHint(filterMode);
      if (hint) hints.push(hint);
      seenModes.add(filterMode);
    }
  });

  return hints;
}
