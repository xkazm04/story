/**
 * Panel Registry — Maps panel types to their component imports and metadata.
 *
 * All panel imports are lazy for code-splitting.
 */

import type { LucideIcon } from 'lucide-react';
import {
  FileText,
  Users,
  Map,
  Info,
  MessageCircle,
  Image,
  Sparkles,
} from 'lucide-react';
import type { WorkspacePanelType, PanelRole } from '../types';
import type { SkillDomain } from '@/app/components/cli/skills/types';

export interface PanelRegistryEntry {
  type: WorkspacePanelType;
  label: string;
  icon: LucideIcon;
  importFn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
  defaultRole: PanelRole;
  minWidth?: number;
  domains: SkillDomain[];
}

export const PANEL_REGISTRY: Record<WorkspacePanelType, PanelRegistryEntry> = {
  'scene-editor': {
    type: 'scene-editor',
    label: 'Scene Editor',
    icon: FileText,
    importFn: () => import('./panels/SceneEditorPanel'),
    defaultRole: 'primary',
    minWidth: 400,
    domains: ['scene'],
  },
  'character-cards': {
    type: 'character-cards',
    label: 'Characters',
    icon: Users,
    importFn: () => import('./panels/CharacterCardsPanel'),
    defaultRole: 'secondary',
    minWidth: 280,
    domains: ['character'],
  },
  'story-map': {
    type: 'story-map',
    label: 'Story Map',
    icon: Map,
    importFn: () => import('./panels/StoryMapPanel'),
    defaultRole: 'secondary',
    minWidth: 300,
    domains: ['story'],
  },
  'scene-metadata': {
    type: 'scene-metadata',
    label: 'Scene Details',
    icon: Info,
    importFn: () => import('./panels/SceneMetadataPanel'),
    defaultRole: 'sidebar',
    minWidth: 240,
    domains: ['scene'],
  },
  'dialogue-view': {
    type: 'dialogue-view',
    label: 'Dialogue',
    icon: MessageCircle,
    importFn: () => import('./panels/DialogueViewPanel'),
    defaultRole: 'secondary',
    minWidth: 300,
    domains: ['scene'],
  },
  'image-canvas': {
    type: 'image-canvas',
    label: 'Image Canvas',
    icon: Image,
    importFn: () => import('./panels/ImageCanvasPanel'),
    defaultRole: 'secondary',
    minWidth: 300,
    domains: ['image'],
  },
  'empty-welcome': {
    type: 'empty-welcome',
    label: 'Welcome',
    icon: Sparkles,
    importFn: () => import('./panels/EmptyWelcomePanel'),
    defaultRole: 'primary',
    domains: [],
  },
};

export function getPanelEntry(type: WorkspacePanelType): PanelRegistryEntry | undefined {
  return PANEL_REGISTRY[type];
}
