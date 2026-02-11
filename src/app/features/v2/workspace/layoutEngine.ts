/**
 * Layout Engine — Size-aware CSS Grid layout system for workspace panels.
 *
 * Each layout defines CSS grid templates and slot specifications.
 * Slots declare which panel sizes they accept and which roles they prefer.
 * The engine uses permutation-based scoring to optimally assign panels to slots.
 */

import type { WorkspaceLayout, WorkspacePanelInstance, PanelRole, PanelSizeClass } from '../types';
import { PANEL_REGISTRY } from './panelRegistry';

// ─── Types ───────────────────────────────────────────────

export interface SlotSpec {
  /** CSS grid placement (gridRow / gridColumn) */
  style: React.CSSProperties;
  /** Panel size classes that fit this slot */
  acceptsSizes: PanelSizeClass[];
  /** Ideal role for panels in this slot */
  preferredRole: PanelRole;
  /** True if this slot is a narrow fixed-width column (<= 280px) */
  isNarrow: boolean;
}

export interface LayoutTemplate {
  id: WorkspaceLayout;
  label: string;
  gridTemplateRows: string;
  gridTemplateColumns: string;
  slots: SlotSpec[];
}

// ─── Helpers ─────────────────────────────────────────────

const ALL_SIZES: PanelSizeClass[] = ['compact', 'standard', 'wide'];

function slot(
  style: React.CSSProperties,
  acceptsSizes: PanelSizeClass[],
  preferredRole: PanelRole,
  isNarrow = false,
): SlotSpec {
  return { style, acceptsSizes, preferredRole, isNarrow };
}

// ─── Layout Templates ────────────────────────────────────

export const LAYOUT_TEMPLATES: Record<WorkspaceLayout, LayoutTemplate> = {
  single: {
    id: 'single',
    label: 'Single',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr',
    slots: [
      slot({ gridRow: '1', gridColumn: '1' }, ALL_SIZES, 'primary'),
    ],
  },
  'split-2': {
    id: 'split-2',
    label: 'Split',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '3fr 2fr',
    slots: [
      slot({ gridRow: '1', gridColumn: '1' }, ALL_SIZES, 'primary'),
      slot({ gridRow: '1', gridColumn: '2' }, ALL_SIZES, 'secondary'),
    ],
  },
  'split-3': {
    id: 'split-3',
    label: 'Triple',
    gridTemplateRows: '1fr 1fr',
    gridTemplateColumns: '3fr 2fr',
    slots: [
      slot({ gridRow: '1 / -1', gridColumn: '1' }, ALL_SIZES, 'primary'),
      slot({ gridRow: '1', gridColumn: '2' }, ALL_SIZES, 'secondary'),
      slot({ gridRow: '2', gridColumn: '2' }, ALL_SIZES, 'tertiary'),
    ],
  },
  'grid-4': {
    id: 'grid-4',
    label: 'Grid',
    gridTemplateRows: '1fr 1fr',
    gridTemplateColumns: '1fr 1fr',
    slots: [
      slot({ gridRow: '1', gridColumn: '1' }, ALL_SIZES, 'primary'),
      slot({ gridRow: '1', gridColumn: '2' }, ALL_SIZES, 'secondary'),
      slot({ gridRow: '2', gridColumn: '1' }, ALL_SIZES, 'tertiary'),
      slot({ gridRow: '2', gridColumn: '2' }, ALL_SIZES, 'sidebar'),
    ],
  },
  'primary-sidebar': {
    id: 'primary-sidebar',
    label: 'Sidebar',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '1fr 280px',
    slots: [
      slot({ gridRow: '1', gridColumn: '1' }, ALL_SIZES, 'primary'),
      slot({ gridRow: '1', gridColumn: '2' }, ['compact'], 'sidebar', true),
    ],
  },
  triptych: {
    id: 'triptych',
    label: 'Triptych',
    gridTemplateRows: '1fr',
    gridTemplateColumns: '250px 1fr 280px',
    slots: [
      slot({ gridRow: '1', gridColumn: '1' }, ['compact'], 'sidebar', true),
      slot({ gridRow: '1', gridColumn: '2' }, ALL_SIZES, 'primary'),
      slot({ gridRow: '1', gridColumn: '3' }, ['compact'], 'sidebar', true),
    ],
  },
};

// ─── Role Priority ───────────────────────────────────────

const ROLE_PRIORITY: PanelRole[] = ['primary', 'secondary', 'tertiary', 'sidebar'];

/**
 * Sort panels by role priority for slot pre-filtering.
 */
export function sortPanelsByRole(panels: WorkspacePanelInstance[]): WorkspacePanelInstance[] {
  return [...panels].sort((a, b) => {
    const aIdx = ROLE_PRIORITY.indexOf(a.role);
    const bIdx = ROLE_PRIORITY.indexOf(b.role);
    return aIdx - bIdx;
  });
}

// ─── Permutation Helper ──────────────────────────────────

function getPermutations<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr];
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of getPermutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

// ─── Scoring ─────────────────────────────────────────────

function scoreAssignment(perm: WorkspacePanelInstance[], slots: SlotSpec[]): number {
  let score = 0;
  for (let i = 0; i < perm.length; i++) {
    const s = slots[i];
    const entry = PANEL_REGISTRY[perm[i].type];
    // Size fit: +15 if compatible, -25 if not
    score += s.acceptsSizes.includes(entry.sizeClass) ? 15 : -25;
    // Role match: +5
    score += perm[i].role === s.preferredRole ? 5 : 0;
    // Tight fit bonus: compact panel in narrow slot
    score += (entry.sizeClass === 'compact' && s.isNarrow) ? 3 : 0;
  }
  return score;
}

// ─── Panel-to-Slot Assignment ────────────────────────────

/**
 * Assign panels to layout slots optimally based on size compatibility and role matching.
 * Uses brute-force permutation scoring (max 4! = 24 permutations).
 *
 * Returns panels ordered by their assigned slot index.
 */
export function assignPanelsToSlots(
  panels: WorkspacePanelInstance[],
  layout: WorkspaceLayout,
): WorkspacePanelInstance[] {
  const template = LAYOUT_TEMPLATES[layout];
  const slotCount = template.slots.length;

  if (panels.length === 0) return [];

  // More panels than slots: pre-filter by role priority
  const candidates = panels.length > slotCount
    ? sortPanelsByRole(panels).slice(0, slotCount)
    : [...panels];

  if (candidates.length <= 1) return candidates;

  // Try all permutations, score each, pick best
  const perms = getPermutations(candidates);
  let bestPerm = perms[0];
  let bestScore = -Infinity;

  for (const perm of perms) {
    const score = scoreAssignment(perm, template.slots);
    if (score > bestScore) {
      bestScore = score;
      bestPerm = perm;
    }
  }

  return bestPerm;
}

// ─── Layout Fitness ──────────────────────────────────────

/**
 * Score how well a set of panels fits a given layout.
 * Higher scores = better fit. Negative = poor fit.
 */
export function computeLayoutFitness(
  layout: WorkspaceLayout,
  panels: WorkspacePanelInstance[],
): number {
  const template = LAYOUT_TEMPLATES[layout];
  const slotCount = template.slots.length;
  if (panels.length === 0) return layout === 'single' ? 0 : -100;

  let score = 0;

  // Panel count vs slot count
  const diff = panels.length - slotCount;
  if (diff === 0) score += 40;
  else if (diff > 0) score -= diff * 25;
  else score -= Math.abs(diff) * 15;

  // Optimal assignment score
  const assigned = assignPanelsToSlots(panels, layout);
  score += scoreAssignment(assigned, template.slots);

  return score;
}

/**
 * Compute fitness scores for all layouts given current panels.
 */
export function getLayoutFitnesses(
  panels: WorkspacePanelInstance[],
): Record<WorkspaceLayout, number> {
  const result = {} as Record<WorkspaceLayout, number>;
  for (const layout of LAYOUT_ORDER) {
    result[layout] = computeLayoutFitness(layout, panels);
  }
  return result;
}

// ─── Layout Resolution ───────────────────────────────────

/**
 * Auto-resolve the best layout based on panel sizes, roles, and count.
 */
export function resolveLayout(panels: WorkspacePanelInstance[]): WorkspaceLayout {
  if (panels.length === 0) return 'single';

  return LAYOUT_ORDER
    .map(layout => ({ layout, score: computeLayoutFitness(layout, panels) }))
    .sort((a, b) => b.score - a.score)[0].layout;
}

// ─── Utilities ───────────────────────────────────────────

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
