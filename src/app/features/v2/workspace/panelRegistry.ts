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
  User,
  ListChecks,
  BarChart3,
  GitBranch,
  Palette,
  Mic,
  ImagePlus,
  Paintbrush,
  BookOpen,
  AudioLines,
  SlidersHorizontal,
  Film,
} from 'lucide-react';
import type { WorkspacePanelType, PanelRole, PanelSizeClass } from '../types';
import type { SkillDomain } from '@/app/components/cli/skills/types';

export interface PanelRegistryEntry {
  type: WorkspacePanelType;
  label: string;
  icon: LucideIcon;
  importFn: () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>;
  defaultRole: PanelRole;
  sizeClass: PanelSizeClass;
  minWidth?: number;
  domains: SkillDomain[];
}

export const PANEL_REGISTRY: Record<WorkspacePanelType, PanelRegistryEntry> = {
  // ─── Scene ───────────────────────────────────────
  'scene-editor': {
    type: 'scene-editor',
    label: 'Scene Editor',
    icon: FileText,
    importFn: () => import('./panels/SceneEditorPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 400,
    domains: ['scene'],
  },
  'scene-metadata': {
    type: 'scene-metadata',
    label: 'Scene Details',
    icon: Info,
    importFn: () => import('./panels/SceneMetadataPanel'),
    defaultRole: 'sidebar',
    sizeClass: 'compact',
    minWidth: 240,
    domains: ['scene'],
  },
  'dialogue-view': {
    type: 'dialogue-view',
    label: 'Dialogue',
    icon: MessageCircle,
    importFn: () => import('./panels/DialogueViewPanel'),
    defaultRole: 'secondary',
    sizeClass: 'standard',
    minWidth: 300,
    domains: ['scene'],
  },

  // ─── Character ───────────────────────────────────
  'character-cards': {
    type: 'character-cards',
    label: 'Characters',
    icon: Users,
    importFn: () => import('./panels/CharacterCardsPanel'),
    defaultRole: 'secondary',
    sizeClass: 'compact',
    minWidth: 280,
    domains: ['character'],
  },
  'character-detail': {
    type: 'character-detail',
    label: 'Character Detail',
    icon: User,
    importFn: () => import('./panels/CharacterDetailPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 400,
    domains: ['character'],
  },

  // ─── Story ───────────────────────────────────────
  'story-map': {
    type: 'story-map',
    label: 'Story Map',
    icon: Map,
    importFn: () => import('./panels/StoryMapPanel'),
    defaultRole: 'secondary',
    sizeClass: 'standard',
    minWidth: 300,
    domains: ['story'],
  },
  'beats-manager': {
    type: 'beats-manager',
    label: 'Beats',
    icon: ListChecks,
    importFn: () => import('./panels/BeatsManagerPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 400,
    domains: ['story'],
  },
  'story-evaluator': {
    type: 'story-evaluator',
    label: 'Evaluator',
    icon: BarChart3,
    importFn: () => import('./panels/StoryEvaluatorPanel'),
    defaultRole: 'secondary',
    sizeClass: 'standard',
    minWidth: 350,
    domains: ['story'],
  },
  'story-graph': {
    type: 'story-graph',
    label: 'Story Graph',
    icon: GitBranch,
    importFn: () => import('./panels/StoryGraphPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 400,
    domains: ['story'],
  },
  'script-editor': {
    type: 'script-editor',
    label: 'Script',
    icon: FileText,
    importFn: () => import('./panels/ScriptEditorPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 400,
    domains: ['scene', 'story'],
  },
  'theme-manager': {
    type: 'theme-manager',
    label: 'Themes',
    icon: Sparkles,
    importFn: () => import('./panels/ThemeManagerPanel'),
    defaultRole: 'secondary',
    sizeClass: 'compact',
    minWidth: 280,
    domains: ['story'],
  },

  // ─── Art & Image ─────────────────────────────────
  'art-style': {
    type: 'art-style',
    label: 'Art Style',
    icon: Palette,
    importFn: () => import('./panels/ArtStylePanel'),
    defaultRole: 'secondary',
    sizeClass: 'standard',
    minWidth: 300,
    domains: ['image'],
  },
  'image-canvas': {
    type: 'image-canvas',
    label: 'Image Canvas',
    icon: Image,
    importFn: () => import('./panels/ImageCanvasPanel'),
    defaultRole: 'secondary',
    sizeClass: 'standard',
    minWidth: 300,
    domains: ['image'],
  },
  'image-generator': {
    type: 'image-generator',
    label: 'Image Generator',
    icon: ImagePlus,
    importFn: () => import('./panels/ImageGeneratorPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 400,
    domains: ['image'],
  },

  // ─── Voice ───────────────────────────────────────
  'voice-manager': {
    type: 'voice-manager',
    label: 'Voices',
    icon: Mic,
    importFn: () => import('./panels/VoiceManagerPanel'),
    defaultRole: 'primary',
    sizeClass: 'standard',
    minWidth: 300,
    domains: ['utility'],
  },
  'voice-casting': {
    type: 'voice-casting',
    label: 'Voice Casting',
    icon: Users,
    importFn: () => import('./panels/VoiceCastingPanel'),
    defaultRole: 'secondary',
    sizeClass: 'standard',
    minWidth: 350,
    domains: ['utility'],
  },
  'script-dialog': {
    type: 'script-dialog',
    label: 'Script & Dialog',
    icon: BookOpen,
    importFn: () => import('./panels/ScriptDialogPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 450,
    domains: ['utility', 'scene'],
  },
  'narration': {
    type: 'narration',
    label: 'Narration',
    icon: AudioLines,
    importFn: () => import('./panels/NarrationPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 500,
    domains: ['utility'],
  },
  'voice-performance': {
    type: 'voice-performance',
    label: 'Voice Performance',
    icon: SlidersHorizontal,
    importFn: () => import('./panels/VoicePerformancePanel'),
    defaultRole: 'sidebar',
    sizeClass: 'compact',
    minWidth: 260,
    domains: ['utility'],
  },

  // ─── Combined / Composite ──────────────────────────
  'scene-list': {
    type: 'scene-list',
    label: 'Scene List',
    icon: FileText,
    importFn: () => import('./panels/SceneListPanel'),
    defaultRole: 'sidebar',
    sizeClass: 'compact',
    minWidth: 220,
    domains: ['scene'],
  },
  'writing-desk': {
    type: 'writing-desk',
    label: 'Writing Desk',
    icon: FileText,
    importFn: () => import('./panels/WritingDeskPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 500,
    domains: ['scene', 'story'],
  },
  'character-creator': {
    type: 'character-creator',
    label: 'Character Creator',
    icon: Paintbrush,
    importFn: () => import('./panels/CharacterCreatorPanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    minWidth: 560,
    domains: ['character'],
  },

  // ─── Studio ──────────────────────────────────────
  'beats-sidebar': {
    type: 'beats-sidebar',
    label: 'Beats',
    icon: ListChecks,
    importFn: () => import('./panels/BeatsSidebarPanel'),
    defaultRole: 'sidebar',
    sizeClass: 'compact',
    minWidth: 200,
    domains: ['story', 'scene'],
  },
  'cast-sidebar': {
    type: 'cast-sidebar',
    label: 'Cast',
    icon: Users,
    importFn: () => import('./panels/CastSidebarPanel'),
    defaultRole: 'sidebar',
    sizeClass: 'compact',
    minWidth: 200,
    domains: ['character', 'scene'],
  },
  'scene-gallery': {
    type: 'scene-gallery',
    label: 'Scene Gallery',
    icon: Film,
    importFn: () => import('./panels/SceneGalleryPanel'),
    defaultRole: 'secondary',
    sizeClass: 'compact',
    minWidth: 400,
    domains: ['scene'],
  },
  'audio-toolbar': {
    type: 'audio-toolbar',
    label: 'Audio',
    icon: AudioLines,
    importFn: () => import('./panels/AudioToolbarPanel'),
    defaultRole: 'tertiary',
    sizeClass: 'compact',
    minWidth: 400,
    domains: ['sound'],
  },

  // ─── System ──────────────────────────────────────
  'empty-welcome': {
    type: 'empty-welcome',
    label: 'Welcome',
    icon: Sparkles,
    importFn: () => import('./panels/EmptyWelcomePanel'),
    defaultRole: 'primary',
    sizeClass: 'wide',
    domains: [],
  },
};

export function getPanelEntry(type: WorkspacePanelType): PanelRegistryEntry | undefined {
  return PANEL_REGISTRY[type];
}
