/**
 * Prompt Builder Element Extraction
 *
 * Functions for building and managing prompt elements for the UI feedback system:
 * - buildElements: Build elements array from dimensions and base image
 * - applyLearnedContext: Enhance prompt parts with user preferences
 * - filterAvoidElements: Remove prompt parts matching avoid patterns
 */

import { v4 as uuidv4 } from 'uuid';
import { Dimension, PromptElement, OutputMode, LearnedContext } from '../../../types';

/**
 * Build elements array for UI feedback system
 */
export function buildElements(
  baseImage: string,
  filledDimensions: Dimension[],
  outputMode: OutputMode,
  qualityTag: string,
  lockedElements: PromptElement[]
): PromptElement[] {
  const elements: PromptElement[] = [];

  // Format element (from base)
  const formatShort = baseImage.split(' - ')[0] || baseImage.slice(0, 35);
  elements.push({ id: uuidv4(), text: formatShort, category: 'composition', locked: false });

  // Content swap elements
  const environmentDim = filledDimensions.find((d) => d.type === 'environment');
  const charactersDim = filledDimensions.find((d) => d.type === 'characters');
  const creaturesDim = filledDimensions.find((d) => d.type === 'creatures');
  const techDim = filledDimensions.find((d) => d.type === 'technology');
  const styleDim = filledDimensions.find((d) => d.type === 'artStyle');
  const moodDim = filledDimensions.find((d) => d.type === 'mood');

  if (environmentDim?.reference) {
    const envShort = environmentDim.reference.split(' - ')[0] || environmentDim.reference.slice(0, 30);
    elements.push({ id: uuidv4(), text: envShort, category: 'setting', locked: false });
  }

  if (charactersDim?.reference || creaturesDim?.reference) {
    const subject = charactersDim?.reference || creaturesDim?.reference || '';
    const subjectShort = subject.split(' - ')[0] || subject.slice(0, 30);
    elements.push({ id: uuidv4(), text: subjectShort, category: 'subject', locked: false });
  }

  if (techDim?.reference) {
    const techShort = techDim.reference.split(' - ')[0] || techDim.reference.slice(0, 30);
    elements.push({ id: uuidv4(), text: techShort, category: 'style', locked: false });
  }

  if (styleDim?.reference) {
    const styleShort = styleDim.reference.split(' - ')[0] || styleDim.reference.slice(0, 30);
    elements.push({ id: uuidv4(), text: styleShort, category: 'lighting', locked: false });
  }

  if (moodDim?.reference) {
    const moodShort = moodDim.reference.split(' - ')[0] || moodDim.reference.slice(0, 25);
    elements.push({ id: uuidv4(), text: moodShort, category: 'mood', locked: false });
  }

  // Era dimension
  const eraDim = filledDimensions.find((d) => d.type === 'era');
  if (eraDim?.reference) {
    const eraShort = eraDim.reference.split(' - ')[0] || eraDim.reference.slice(0, 25);
    elements.push({ id: uuidv4(), text: eraShort, category: 'setting', locked: false });
  }

  // Genre dimension
  const genreDim = filledDimensions.find((d) => d.type === 'genre');
  if (genreDim?.reference) {
    const genreShort = genreDim.reference.split(' - ')[0] || genreDim.reference.slice(0, 25);
    elements.push({ id: uuidv4(), text: genreShort, category: 'style', locked: false });
  }

  // Custom dimension
  const customDim = filledDimensions.find((d) => d.type === 'custom');
  if (customDim?.reference) {
    const customShort = customDim.reference.split(' - ')[0] || customDim.reference.slice(0, 30);
    elements.push({ id: uuidv4(), text: customShort, category: 'style', locked: false });
  }

  // Output mode element - different text for each mode
  const modeElementText = (() => {
    switch (outputMode) {
      case 'gameplay': return 'game UI visible';
      case 'sketch': return 'hand-drawn sketch';
      case 'trailer': return 'cinematic film still';
      case 'poster': return 'poster composition';
      case 'realistic': return 'photorealistic';
      default: return 'concept art';
    }
  })();
  elements.push({
    id: uuidv4(),
    text: modeElementText,
    category: 'composition',
    locked: false,
  });

  // Quality tag
  elements.push({ id: uuidv4(), text: qualityTag, category: 'quality', locked: false });

  // Apply locked elements from previous iterations
  lockedElements.forEach((el) => {
    const existingIndex = elements.findIndex((e) => e.category === el.category);
    if (existingIndex >= 0) {
      elements[existingIndex] = { ...el, id: uuidv4(), locked: true };
    } else {
      elements.push({ ...el, id: uuidv4(), locked: true });
    }
  });

  return elements;
}

/**
 * Apply learned context to enhance prompt parts
 * Injects user preferences and avoids learned negatives
 */
export function applyLearnedContext(
  promptParts: string[],
  learnedContext?: LearnedContext
): string[] {
  if (!learnedContext) return promptParts;

  const enhancedParts = [...promptParts];

  // Add emphasized elements (user preferences) near the beginning for higher weight
  if (learnedContext.emphasizeElements.length > 0) {
    const emphasisPhrase = learnedContext.emphasizeElements
      .slice(0, 3) // Limit to avoid prompt bloat
      .join(', ');
    // Insert after base description (index 1 typically)
    enhancedParts.splice(2, 0, `with emphasis on ${emphasisPhrase}`);
  }

  // Apply dimension adjustments from preferences
  learnedContext.dimensionAdjustments.forEach((adjustment) => {
    // Find if we already have content for this dimension and enhance it
    const existingIndex = enhancedParts.findIndex(
      (part) => part.toLowerCase().includes(adjustment.type.toLowerCase())
    );
    if (existingIndex === -1) {
      // Add as new content
      enhancedParts.push(adjustment.adjustment);
    }
  });

  return enhancedParts;
}

/**
 * Filter elements to avoid based on learned negatives
 * Removes or modifies prompt parts that match avoid patterns
 */
export function filterAvoidElements(
  promptParts: string[],
  avoidElements: string[]
): string[] {
  if (avoidElements.length === 0) return promptParts;

  return promptParts.filter((part) => {
    const lowerPart = part.toLowerCase();
    // Check if any avoid element is in this part
    return !avoidElements.some((avoid) =>
      lowerPart.includes(avoid.toLowerCase())
    );
  });
}
