/**
 * Prompt Builder Configuration and Constants
 *
 * Contains all configuration objects and constant arrays used by the prompt builder:
 * - MAX_PROMPT_LENGTH for Leonardo API limit
 * - Variety arrays (camera angles, time of day, atmospheric conditions, composition styles)
 * - Scene variation descriptions
 * - Mode-specific prompt configurations (gameplay, sketch, trailer, poster, realistic)
 */

import { OutputMode } from '../../../types';

// Maximum prompt length for Leonardo API
export const MAX_PROMPT_LENGTH = 1500;

/**
 * Variety modifiers - kept SHORT for prompt length efficiency
 */
export const CAMERA_ANGLES = [
  'low angle',
  'bird\'s eye view',
  'eye-level shot',
  'dutch angle',
  'wide shot',
  'medium shot',
  'close-up',
  'panoramic',
];

export const TIME_OF_DAY = [
  'golden hour',
  'blue hour',
  'midday light',
  'overcast',
  'dawn',
  'night',
  'morning mist',
  'neon night',
];

export const ATMOSPHERIC_CONDITIONS = [
  'fog',
  'dust particles',
  'rain',
  'snow',
  'heat haze',
  'smoke',
  'clear',
  'stormy',
];

export const COMPOSITION_STYLES = [
  'rule of thirds',
  'centered',
  'leading lines',
  'layered depth',
];

/**
 * Scene variation descriptions - SHORT for prompt efficiency
 */
export const SCENE_VARIATIONS: Record<string, {
  moment: string;
  focus: string;
}> = {
  'Cinematic Wide Shot': {
    moment: 'establishing shot',
    focus: 'epic scale',
  },
  'Hero Portrait': {
    moment: 'character portrait',
    focus: 'heroic pose',
  },
  'Action Sequence': {
    moment: 'action scene',
    focus: 'dynamic motion',
  },
  'Environmental Storytelling': {
    moment: 'environment detail',
    focus: 'world-building',
  },
};

// ============================================================================
// OUTPUT MODE CONFIGURATIONS - Drastically different prompt structures
// ============================================================================

/**
 * Mode-specific prompt configurations
 * Each mode produces fundamentally different visual outputs
 */
export interface ModeConfig {
  /** Primary style keywords that define the visual approach */
  styleKeywords: string[];
  /** Technical/quality keywords specific to this mode */
  technicalKeywords: string[];
  /** What to exclude for this mode */
  negativeKeywords: string[];
  /** Whether to heavily use dimension content or simplify */
  dimensionUsage: 'full' | 'simplified' | 'minimal';
  /** Scene variation override (optional) */
  sceneOverride?: Record<string, { moment: string; focus: string }>;
}

export const MODE_CONFIGS: Record<OutputMode, ModeConfig> = {
  gameplay: {
    styleKeywords: [
      'authentic gameplay screenshot',
      'in-game capture',
      'video game screen',
    ],
    technicalKeywords: [
      'HUD elements visible',
      'game UI overlay',
      'health bars',
      'minimap corner',
      'action RPG interface',
    ],
    negativeKeywords: [
      'concept art',
      'sketch',
      'painting',
      'drawing',
      'illustration',
      'movie still',
    ],
    dimensionUsage: 'full',
  },

  sketch: {
    styleKeywords: [
      'concept art sketch',
      'hand-drawn illustration',
      'pencil drawing',
      'rough sketch',
      'traditional art',
    ],
    technicalKeywords: [
      'visible pencil strokes',
      'graphite shading',
      'sketch paper texture',
      'loose linework',
      'artistic hatching',
      'charcoal accents',
      'construction lines visible',
      'artist workbook page',
    ],
    negativeKeywords: [
      'photorealistic',
      'photograph',
      'digital render',
      '3D rendering',
      'smooth gradients',
      'polished finish',
      'game screenshot',
      'HUD',
      'UI elements',
      'video game',
      'CGI',
      'hyperrealistic',
    ],
    dimensionUsage: 'simplified', // Focus on core concept, not all dimensions
    sceneOverride: {
      'Cinematic Wide Shot': { moment: 'composition study', focus: 'perspective sketch' },
      'Hero Portrait': { moment: 'character study', focus: 'figure drawing' },
      'Action Sequence': { moment: 'gesture drawing', focus: 'dynamic poses' },
      'Environmental Storytelling': { moment: 'environment sketch', focus: 'architectural study' },
    },
  },

  trailer: {
    styleKeywords: [
      'cinematic movie still',
      'blockbuster film scene',
      'Hollywood production',
      'photorealistic',
      'professional cinematography',
    ],
    technicalKeywords: [
      'anamorphic lens flare',
      'shallow depth of field',
      'dramatic rim lighting',
      'cinematic color grading',
      'film grain',
      'ultra high resolution',
      'IMAX quality',
      'theatrical release',
      'motion picture',
    ],
    negativeKeywords: [
      'cartoon',
      'anime',
      'illustration',
      'sketch',
      'drawing',
      'game screenshot',
      'HUD',
      'UI elements',
      'video game interface',
      'low budget',
      'amateur',
      'flat lighting',
    ],
    dimensionUsage: 'full',
    sceneOverride: {
      'Cinematic Wide Shot': { moment: 'epic establishing shot', focus: 'sweeping vista' },
      'Hero Portrait': { moment: 'dramatic close-up', focus: 'emotional intensity' },
      'Action Sequence': { moment: 'high-octane action', focus: 'explosive moment' },
      'Environmental Storytelling': { moment: 'atmospheric wide', focus: 'immersive world' },
    },
  },

  poster: {
    styleKeywords: [
      'official movie poster',
      'key art',
      'promotional artwork',
      'theatrical poster',
    ],
    technicalKeywords: [
      'poster composition',
      'dramatic lighting',
      'iconic pose',
      'title space',
      'marketing quality',
    ],
    negativeKeywords: [
      'screenshot',
      'sketch',
      'behind the scenes',
      'casual',
    ],
    dimensionUsage: 'full',
  },

  realistic: {
    styleKeywords: [
      'next-gen game engine',
      'photorealistic game graphics',
      'Unreal Engine 5 quality',
      'AAA game visuals',
      'hyperrealistic rendering',
    ],
    technicalKeywords: [
      'ray tracing',
      'global illumination',
      'ultra-detailed textures',
      'subsurface scattering',
      'realistic materials',
      'physically based rendering',
      '8K resolution',
      'nanite geometry',
    ],
    negativeKeywords: [
      'cartoon',
      'anime',
      'stylized',
      'low poly',
      'retro graphics',
      'pixel art',
      'hand-drawn',
      'sketch',
      'painting',
      'HUD',
      'UI elements',
    ],
    dimensionUsage: 'full',
    // Use same scene structure as gameplay, just with realistic rendering
  },
};
