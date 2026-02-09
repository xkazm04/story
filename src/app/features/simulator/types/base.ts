// ============================================================================
// BASE TYPES - Core dimension, prompt element, concept, and output types
// ============================================================================

export type DimensionType =
  | 'environment'
  | 'characters'
  | 'artStyle'
  | 'mood'
  | 'action'
  | 'technology'
  | 'camera'
  | 'creatures'
  | 'gameUI'
  | 'era'
  | 'genre'
  | 'custom';

/**
 * Transformation type for example simulations
 * - universe_swap: Same visual format, different fictional universe
 * - medium_change: Same content, different rendering medium (anime -> CGI)
 */
export type TransformationType = 'universe_swap' | 'medium_change';

/**
 * Game UI genre for preset selection
 */
export type GameUIGenre =
  | 'none'
  | 'crpg'
  | 'fps'
  | 'mmo'
  | 'actionRpg'
  | 'fighting'
  | 'rts'
  | 'survival'
  | 'racing'
  | 'platformer'
  | 'moba'
  | 'simulation'
  | 'custom';

/**
 * DimensionFilterMode - Defines what content to PRESERVE from the base image
 * The filter selects what aspects should remain unchanged
 */
export type DimensionFilterMode =
  | 'preserve_structure'    // Keep spatial layout, composition, camera angle
  | 'preserve_subject'      // Keep main subjects/characters but allow style changes
  | 'preserve_mood'         // Keep emotional tone but allow visual changes
  | 'preserve_color_palette' // Keep color relationships but swap content
  | 'none';                 // No preservation - full transformation

/**
 * DimensionTransformMode - Defines HOW to transform the content
 * The transform defines the nature of the swap operation
 */
export type DimensionTransformMode =
  | 'replace'        // Complete replacement with reference content
  | 'blend'          // Blend original and reference (uses weight for ratio)
  | 'style_transfer' // Apply reference style to original content
  | 'semantic_swap'  // Swap semantic meaning while preserving structure
  | 'additive';      // Add reference elements without removing original

/**
 * Dimension - A LENS for viewing and transforming the base image
 *
 * Conceptually, a Dimension is not just a label but a transformation lens:
 * 1. FILTER: What to preserve from the base image
 * 2. TRANSFORM: How to apply the reference content
 * 3. WEIGHT: How strongly to apply (0-100, enables graduated transformations)
 *
 * This enables composable transformations like "50% Star Wars, 50% Ghibli"
 */
export interface Dimension {
  id: string;
  type: DimensionType;
  label: string;
  icon: string;
  placeholder: string;
  reference: string;

  /**
   * Optional reference image for visual style matching
   * Stored as data URL (base64 encoded)
   */
  referenceImage?: string;

  /**
   * Filter mode - what to preserve from the base image for this dimension
   * Default: 'preserve_structure'
   */
  filterMode: DimensionFilterMode;

  /**
   * Transform mode - how to apply the reference content
   * Default: 'replace'
   */
  transformMode: DimensionTransformMode;

  /**
   * Weight/intensity (0-100) - how strongly to apply this dimension
   * 0 = no effect (preserve original), 100 = full transformation
   * Enables graduated blending like "50% Star Wars style"
   * Default: 100
   */
  weight: number;
}

/**
 * Helper to create a Dimension with default lens settings
 */
export function createDimensionWithDefaults(
  base: Omit<Dimension, 'filterMode' | 'transformMode' | 'weight'>
): Dimension {
  return {
    ...base,
    filterMode: 'preserve_structure',
    transformMode: 'replace',
    weight: 100,
  };
}

export interface DimensionPreset {
  type: DimensionType;
  label: string;
  icon: string;
  placeholder: string;
}

export interface PromptElement {
  id: string;
  text: string;
  category: string;
  locked: boolean;
}

/**
 * Unified Concept Type - The Mathematical Dual of Dimension and PromptElement
 *
 * A Concept represents a creative idea that can exist in two forms:
 * - As INPUT (Dimension): A constraint that guides generation
 * - As OUTPUT (PromptElement): A generated element from a prompt
 *
 * The duality: Dimension generates from constraints -> PromptElement
 *              PromptElement constrains to create new -> Dimension
 *
 * This enables bidirectional creative flow where any generated element
 * can become an input constraint for future generations.
 */
export type ConceptRole = 'input' | 'output';

export interface Concept {
  id: string;
  /** The semantic content - the "what" of the concept */
  value: string;
  /** Category/type classification */
  category: string;
  /** Whether this concept is locked/preserved across generations */
  locked: boolean;
  /** The role determines how this concept is used */
  role: ConceptRole;
  /** Original source - tracks lineage for undo/history */
  source?: {
    type: 'dimension' | 'element' | 'user' | 'ai';
    originalId?: string;
  };
}

/**
 * Convert a PromptElement (output) to a Concept
 */
export function elementToConcept(element: PromptElement): Concept {
  return {
    id: element.id,
    value: element.text,
    category: element.category,
    locked: element.locked,
    role: 'output',
    source: { type: 'element', originalId: element.id },
  };
}

/**
 * Convert a Dimension (input) to a Concept
 */
export function dimensionToConcept(dimension: Dimension): Concept {
  return {
    id: dimension.id,
    value: dimension.reference,
    category: dimension.type,
    locked: false, // Dimensions don't have locked state
    role: 'input',
    source: { type: 'dimension', originalId: dimension.id },
  };
}

/**
 * Convert a Concept to a PromptElement (for output display)
 */
export function conceptToElement(concept: Concept): PromptElement {
  return {
    id: concept.id,
    text: concept.value,
    category: concept.category,
    locked: concept.locked,
  };
}

/**
 * Convert a Concept to a partial Dimension update
 * Returns the reference value to be applied to a dimension of matching type
 */
export function conceptToDimensionUpdate(concept: Concept): { type: string; reference: string } {
  return {
    type: concept.category,
    reference: concept.value,
  };
}

/**
 * Map element category to dimension type for bidirectional flow
 * Some categories map directly, others need semantic mapping
 */
export function categoryToDimensionType(category: string): DimensionType | null {
  const mapping: Record<string, DimensionType> = {
    // Direct mappings
    'environment': 'environment',
    'characters': 'characters',
    'mood': 'mood',
    'style': 'artStyle',
    'setting': 'environment',
    // Semantic mappings
    'composition': 'camera',
    'lighting': 'mood',
    'subject': 'characters',
    'quality': 'artStyle',
  };
  return mapping[category.toLowerCase()] || null;
}

/**
 * Check if a concept can be applied to a specific dimension
 */
export function canApplyConceptToDimension(concept: Concept, dimension: Dimension): boolean {
  const targetType = categoryToDimensionType(concept.category);
  return targetType === dimension.type || dimension.type === 'custom';
}

export interface GeneratedPrompt {
  id: string;
  sceneNumber: number;
  sceneType: string;
  prompt: string;
  copied: boolean;
  rating: 'up' | 'down' | null;
  locked: boolean;
  elements: PromptElement[];
}

// String union type for element categories
export type ElementCategoryType =
  | 'composition'
  | 'lighting'
  | 'style'
  | 'mood'
  | 'subject'
  | 'setting'
  | 'quality';

// Interface for category configuration (renamed to avoid conflict)
export interface ElementCategoryConfig {
  id: string;
  label: string;
  color: string;
}

export const SCENE_TYPES = [
  'Cinematic Wide Shot',
  'Hero Portrait',
  'Action Sequence',
  'Environmental Storytelling',
  'Dramatic Close-Up',
  'Group Composition',
  'Atmospheric Moment',
  'Key Art Poster',
];

export type OutputMode = 'gameplay' | 'sketch' | 'trailer' | 'poster' | 'realistic';

export const OUTPUT_MODES: Record<OutputMode, { label: string; description: string }> = {
  gameplay: {
    label: 'Gameplay',
    description: 'Authentic game screenshot with HUD/UI elements',
  },
  sketch: {
    label: 'Sketch',
    description: 'Artistic hand-drawn concept sketch, rough linework',
  },
  trailer: {
    label: 'Trailer',
    description: 'Cinematic scene optimized for video/animation',
  },
  poster: {
    label: 'Poster',
    description: 'Key art / game cover poster composition',
  },
  realistic: {
    label: 'Realistic',
    description: 'Next-gen photorealistic game graphics (UE5 quality)',
  },
};

export type DesignVariant = 'immersive' | 'onion';
