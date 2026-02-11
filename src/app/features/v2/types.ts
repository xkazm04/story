/**
 * V2 Dynamic Workspace — Type Definitions
 *
 * All types for the CLI-driven dynamic workspace system.
 */

import type { SkillDomain } from '@/app/components/cli/skills/types';

// ============ Panel Types ============

export type PanelRole = 'primary' | 'secondary' | 'tertiary' | 'sidebar';

export type WorkspaceLayout =
  | 'single'
  | 'split-2'
  | 'split-3'
  | 'grid-4'
  | 'primary-sidebar'
  | 'triptych';

export type WorkspacePanelType =
  | 'scene-editor'
  | 'character-cards'
  | 'story-map'
  | 'scene-metadata'
  | 'dialogue-view'
  | 'image-canvas'
  | 'empty-welcome';

// ============ Terminal Tab ============

export interface TerminalTab {
  id: string;
  label: string;
  sessionId: string; // CLISessionId in cliSessionStore
  domain: SkillDomain | 'general';
  contextLabel?: string;
  createdAt: number;
  isPinned: boolean;
}

// ============ Panel Instance ============

export interface WorkspacePanelInstance {
  id: string;
  type: WorkspacePanelType;
  role: PanelRole;
  props: Record<string, unknown>;
  slotIndex: number;
}

// ============ Panel Directive ============

export interface PanelDirective {
  type: WorkspacePanelType;
  role?: PanelRole;
  props?: Record<string, unknown>;
}

// ============ Domain Colors ============

export const DOMAIN_COLORS: Record<SkillDomain | 'general', string> = {
  scene: 'amber',
  character: 'purple',
  story: 'cyan',
  image: 'emerald',
  faction: 'rose',
  simulator: 'blue',
  utility: 'slate',
  general: 'slate',
};
