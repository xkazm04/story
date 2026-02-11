/**
 * Skill Panel Configs — Default panel configurations for V2 workspace.
 *
 * Maps skill IDs to the panels that should appear when that skill runs.
 * Used by usePanelConfig hook to auto-populate the workspace.
 */

import type { SkillPanelConfig } from '@/app/components/cli/skills/types';

export const SKILL_PANEL_CONFIGS: Record<string, SkillPanelConfig> = {
  'scene-generation': {
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'character-cards', role: 'secondary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  'scene-dialogue': {
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'dialogue-view', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'scene-description': {
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  'beat-scene-mapping': {
    panels: [
      { type: 'story-map', role: 'primary' },
      { type: 'scene-metadata', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  'character-backstory': {
    panels: [
      { type: 'character-cards', role: 'primary' },
    ],
    preferredLayout: 'single',
    clearExisting: false,
  },
  'image-prompt-compose': {
    panels: [
      { type: 'image-canvas', role: 'primary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
};
