/**
 * Skill Panel Configs — Default panel configurations for V2 workspace.
 *
 * Maps skill IDs to the panels that should appear when that skill runs.
 * Used by usePanelConfig hook to auto-populate the workspace.
 *
 * Coverage: All 32 skills across 7 domains.
 */

import type { SkillPanelConfig } from '@/app/components/cli/skills/types';

export const SKILL_PANEL_CONFIGS: Record<string, SkillPanelConfig> = {
  // ─── Scene Domain ──────────────────────────────────

  'scene-generation': {
    panels: [
      { type: 'audio-toolbar', role: 'tertiary' },
      { type: 'beats-sidebar', role: 'sidebar' },
      { type: 'scene-editor', role: 'primary' },
      { type: 'cast-sidebar', role: 'sidebar' },
      { type: 'scene-gallery', role: 'secondary' },
    ],
    preferredLayout: 'studio',
    clearExisting: true,
  },
  'scene-dialogue': {
    panels: [
      { type: 'writing-desk', role: 'primary' },
      { type: 'dialogue-view', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'scene-description': {
    panels: [
      { type: 'audio-toolbar', role: 'tertiary' },
      { type: 'beats-sidebar', role: 'sidebar' },
      { type: 'scene-editor', role: 'primary' },
      { type: 'cast-sidebar', role: 'sidebar' },
      { type: 'scene-gallery', role: 'secondary' },
    ],
    preferredLayout: 'studio',
    clearExisting: true,
  },
  'scene-compose': {
    panels: [
      { type: 'audio-toolbar', role: 'tertiary' },
      { type: 'beats-sidebar', role: 'sidebar' },
      { type: 'scene-editor', role: 'primary' },
      { type: 'cast-sidebar', role: 'sidebar' },
      { type: 'scene-gallery', role: 'secondary' },
    ],
    preferredLayout: 'studio',
    clearExisting: true,
  },
  'beat-scene-mapping': {
    panels: [
      { type: 'beats-manager', role: 'primary' },
      { type: 'story-map', role: 'secondary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },

  // ─── Character Domain ──────────────────────────────

  'character-backstory': {
    panels: [
      { type: 'character-detail', role: 'primary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'character-traits': {
    panels: [
      { type: 'character-detail', role: 'primary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'character-dialogue': {
    panels: [
      { type: 'character-detail', role: 'primary' },
      { type: 'dialogue-view', role: 'secondary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'character-names': {
    panels: [
      { type: 'character-cards', role: 'primary' },
    ],
    preferredLayout: 'single',
    clearExisting: false,
  },
  'personality-extraction': {
    panels: [
      { type: 'character-detail', role: 'primary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'character-appearance': {
    panels: [
      { type: 'character-creator', role: 'primary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },

  // ─── Faction Domain ────────────────────────────────

  'faction-creation': {
    panels: [
      { type: 'character-cards', role: 'primary' },
      { type: 'story-map', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'faction-lore': {
    panels: [
      { type: 'character-cards', role: 'primary' },
      { type: 'theme-manager', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'faction-description': {
    panels: [
      { type: 'character-cards', role: 'primary' },
    ],
    preferredLayout: 'single',
    clearExisting: false,
  },
  'faction-relationships': {
    panels: [
      { type: 'character-cards', role: 'primary' },
      { type: 'story-map', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },

  // ─── Story Domain ──────────────────────────────────

  'story-next-steps': {
    panels: [
      { type: 'story-evaluator', role: 'primary' },
      { type: 'beats-manager', role: 'secondary' },
      { type: 'scene-list', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'story-write-content': {
    panels: [
      { type: 'writing-desk', role: 'primary' },
      { type: 'scene-list', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'story-architect': {
    panels: [
      { type: 'story-graph', role: 'primary' },
      { type: 'beats-manager', role: 'secondary' },
      { type: 'story-evaluator', role: 'tertiary' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'story-brainstorm': {
    panels: [
      { type: 'story-map', role: 'primary' },
      { type: 'theme-manager', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'beat-suggestions': {
    panels: [
      { type: 'beats-manager', role: 'primary' },
      { type: 'story-map', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'beat-description': {
    panels: [
      { type: 'beats-manager', role: 'primary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'project-inspiration': {
    panels: [
      { type: 'story-map', role: 'primary' },
      { type: 'theme-manager', role: 'secondary' },
      { type: 'story-evaluator', role: 'tertiary' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },

  // ─── Image Domain ──────────────────────────────────

  'image-prompt-compose': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'image-canvas', role: 'secondary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'image-prompt-enhance': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'art-style', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'image-prompt-variations': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'image-canvas', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'cover-prompt': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'art-style', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'avatar-prompt': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },

  // ─── Simulator Domain ──────────────────────────────

  'simulator-vision-breakdown': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'image-canvas', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'simulator-prompt-generation': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'image-canvas', role: 'secondary' },
      { type: 'art-style', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'simulator-dimension-refinement': {
    panels: [
      { type: 'image-generator', role: 'primary' },
      { type: 'art-style', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },

  // ─── Utility Domain ────────────────────────────────

  'dataset-tagging': {
    panels: [
      { type: 'image-canvas', role: 'primary' },
    ],
    preferredLayout: 'single',
    clearExisting: false,
  },
  'voice-description': {
    panels: [
      { type: 'voice-manager', role: 'primary' },
      { type: 'voice-casting', role: 'secondary' },
      { type: 'voice-performance', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'voice-casting-workflow': {
    panels: [
      { type: 'voice-casting', role: 'primary' },
      { type: 'character-cards', role: 'secondary' },
      { type: 'voice-performance', role: 'tertiary' },
    ],
    preferredLayout: 'triptych',
    clearExisting: true,
  },
  'dialog-narration': {
    panels: [
      { type: 'narration', role: 'primary' },
      { type: 'character-cards', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'scene-voices': {
    panels: [
      { type: 'script-dialog', role: 'primary' },
      { type: 'voice-casting', role: 'secondary' },
      { type: 'scene-metadata', role: 'tertiary' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'deep-analysis': {
    panels: [
      { type: 'story-evaluator', role: 'primary' },
      { type: 'story-graph', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'storytelling': {
    panels: [
      { type: 'writing-desk', role: 'primary' },
      { type: 'story-map', role: 'secondary' },
      { type: 'scene-list', role: 'tertiary' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
};
