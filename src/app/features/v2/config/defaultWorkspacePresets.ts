/**
 * Default Workspace Presets — Named panel configurations for common workflows.
 */

import type { PanelDirective, WorkspaceLayout } from '../types';

export interface WorkspacePreset {
  id: string;
  name: string;
  description: string;
  panels: PanelDirective[];
  layout: WorkspaceLayout;
}

export const DEFAULT_WORKSPACE_PRESETS: WorkspacePreset[] = [
  {
    id: 'scene-focus',
    name: 'Scene Focus',
    description: 'Scene editor with metadata sidebar',
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    layout: 'primary-sidebar',
  },
  {
    id: 'scene-full',
    name: 'Scene Full',
    description: 'Scene editor, characters, story map, and metadata',
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'character-cards', role: 'secondary' },
      { type: 'story-map', role: 'tertiary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    layout: 'grid-4',
  },
  {
    id: 'character-deep-dive',
    name: 'Character Deep Dive',
    description: 'Story map with character cards',
    panels: [
      { type: 'story-map', role: 'primary' },
      { type: 'character-cards', role: 'secondary' },
    ],
    layout: 'split-2',
  },
  {
    id: 'dialogue-review',
    name: 'Dialogue Review',
    description: 'Scene editor with dialogue viewer',
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'dialogue-view', role: 'secondary' },
    ],
    layout: 'split-2',
  },
  {
    id: 'visual-scene',
    name: 'Visual Scene',
    description: 'Image canvas with scene editor and metadata',
    panels: [
      { type: 'image-canvas', role: 'primary' },
      { type: 'scene-editor', role: 'secondary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    layout: 'split-3',
  },
];
