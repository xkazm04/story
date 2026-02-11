/**
 * Layout Engine — CSS Grid preset templates for workspace layouts.
 *
 * Each layout defines a CSS grid template and slot assignments.
 * The engine auto-resolves the best layout based on panel count and roles.
 */

import type { WorkspaceLayout, WorkspacePanelInstance, PanelRole } from '../types';

export interface LayoutTemplate {
  id: WorkspaceLayout;
  label: string;
  gridTemplate: string;
  gridTemplateRows: string;
  gridTemplateColumns: string;
  /** Map slotIndex → CSS grid area or grid-row/grid-column shorthand */
  slotStyles: Record<number, React.CSSProperties>;
  maxSlots: number;
}

export const LAYOUT_TEMPLATES: Record<WorkspaceLayout, LayoutTemplate> = {
  single: {
    id: 'single',
    label: 'Single',
    gridTemplate: '"main" 1fr / 1fr',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr',
    slotStyles: {
      0: { gridRow: '1', gridColumn: '1' },
    },
    maxSlots: 1,
  },
  'split-2': {
    id: 'split-2',
    label: 'Split',
    gridTemplate: '"left right" 1fr / 3fr 2fr',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '3fr 2fr',
    slotStyles: {
      0: { gridRow: '1', gridColumn: '1' },
      1: { gridRow: '1', gridColumn: '2' },
    },
    maxSlots: 2,
  },
  'split-3': {
    id: 'split-3',
    label: 'Triple',
    gridTemplate: '"left top-right" 1fr "left bot-right" 1fr / 3fr 2fr',
    gridTemplateRows: '1fr 1fr',
    gridTemplateColumns: '3fr 2fr',
    slotStyles: {
      0: { gridRow: '1 / -1', gridColumn: '1' },
      1: { gridRow: '1', gridColumn: '2' },
      2: { gridRow: '2', gridColumn: '2' },
    },
    maxSlots: 3,
  },
  'grid-4': {
    id: 'grid-4',
    label: 'Grid',
    gridTemplate: '"tl tr" 1fr "bl br" 1fr / 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gridTemplateColumns: '1fr 1fr',
    slotStyles: {
      0: { gridRow: '1', gridColumn: '1' },
      1: { gridRow: '1', gridColumn: '2' },
      2: { gridRow: '2', gridColumn: '1' },
      3: { gridRow: '2', gridColumn: '2' },
    },
    maxSlots: 4,
  },
  'primary-sidebar': {
    id: 'primary-sidebar',
    label: 'Sidebar',
    gridTemplate: '"main side" 1fr / 1fr 280px',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr 280px',
    slotStyles: {
      0: { gridRow: '1', gridColumn: '1' },
      1: { gridRow: '1', gridColumn: '2' },
    },
    maxSlots: 2,
  },
  triptych: {
    id: 'triptych',
    label: 'Triptych',
    gridTemplate: '"left center right" 1fr / 250px 1fr 280px',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '250px 1fr 280px',
    slotStyles: {
      0: { gridRow: '1', gridColumn: '1' },
      1: { gridRow: '1', gridColumn: '2' },
      2: { gridRow: '1', gridColumn: '3' },
    },
    maxSlots: 3,
  },
};

/** Role priority for slot assignment */
const ROLE_PRIORITY: PanelRole[] = ['primary', 'secondary', 'tertiary', 'sidebar'];

/**
 * Sort panels by role priority for slot assignment.
 */
export function sortPanelsByRole(panels: WorkspacePanelInstance[]): WorkspacePanelInstance[] {
  return [...panels].sort((a, b) => {
    const aIdx = ROLE_PRIORITY.indexOf(a.role);
    const bIdx = ROLE_PRIORITY.indexOf(b.role);
    return aIdx - bIdx;
  });
}

/**
 * Auto-resolve the best layout based on panel count and roles.
 */
export function resolveLayout(panels: WorkspacePanelInstance[]): WorkspaceLayout {
  const count = panels.length;
  const hasSidebar = panels.some((p) => p.role === 'sidebar');

  if (count <= 1) return 'single';
  if (count === 2 && hasSidebar) return 'primary-sidebar';
  if (count === 2) return 'split-2';
  if (count === 3) return 'split-3';
  return 'grid-4';
}

/**
 * Get the layout template for a given layout type.
 */
export function getLayoutTemplate(layout: WorkspaceLayout): LayoutTemplate {
  return LAYOUT_TEMPLATES[layout];
}

/**
 * All available layouts for cycling through.
 */
export const LAYOUT_ORDER: WorkspaceLayout[] = [
  'single',
  'split-2',
  'split-3',
  'grid-4',
  'primary-sidebar',
  'triptych',
];

/**
 * Get the next layout in the cycle.
 */
export function getNextLayout(current: WorkspaceLayout): WorkspaceLayout {
  const idx = LAYOUT_ORDER.indexOf(current);
  return LAYOUT_ORDER[(idx + 1) % LAYOUT_ORDER.length];
}
