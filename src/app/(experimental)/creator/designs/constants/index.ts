export * from './categories';
export * from './options';

// Color palette
export const COLOR_PALETTE = [
  { id: 1, type: 'solid' as const, value: '#1a1a1a', name: 'Obsidian' },
  { id: 2, type: 'solid' as const, value: '#5b21b6', name: 'Violet' },
  { id: 3, type: 'solid' as const, value: '#4ade80', name: 'Emerald' },
  { id: 4, type: 'solid' as const, value: '#db2777', name: 'Rose' },
  { id: 5, type: 'solid' as const, value: '#e2e8f0', name: 'Silver' },
  { id: 6, type: 'solid' as const, value: '#9333ea', name: 'Purple' },
  { id: 7, type: 'gradient' as const, value: 'linear-gradient(135deg, #a855f7, #ec4899)', name: 'Aurora' },
  { id: 8, type: 'solid' as const, value: '#22c55e', name: 'Forest' },
  { id: 9, type: 'solid' as const, value: '#3f1810', name: 'Mahogany' },
  { id: 10, type: 'solid' as const, value: '#57534e', name: 'Stone' },
  { id: 11, type: 'solid' as const, value: '#f97316', name: 'Amber' },
  { id: 12, type: 'conic' as const, value: 'conic-gradient(from 180deg, red, yellow, lime, cyan, blue, magenta, red)', name: 'Spectrum' },
];

// Presets (icon values are registry keys)
export const PRESETS = [
  { id: 1, name: 'Warrior', gradient: 'from-amber-900 to-amber-700', icon: 'preset-warrior' },
  { id: 2, name: 'Mage', gradient: 'from-violet-900 to-violet-700', icon: 'preset-mage' },
  { id: 3, name: 'Ranger', gradient: 'from-emerald-900 to-emerald-700', icon: 'preset-ranger' },
  { id: 4, name: 'Rogue', gradient: 'from-rose-900 to-rose-700', icon: 'preset-rogue' },
  { id: 5, name: 'Cleric', gradient: 'from-cyan-900 to-cyan-700', icon: 'preset-cleric' },
  { id: 6, name: 'Bard', gradient: 'from-orange-900 to-orange-700', icon: 'preset-bard' },
  { id: 7, name: 'Paladin', gradient: 'from-yellow-900 to-yellow-700', icon: 'preset-paladin' },
  { id: 8, name: 'Warlock', gradient: 'from-purple-900 to-purple-800', icon: 'preset-warlock' },
  { id: 9, name: 'Monk', gradient: 'from-teal-900 to-teal-700', icon: 'preset-monk' },
];

// Generation steps
export const GENERATION_STEPS = [
  { id: 1, label: 'Analyzing features', duration: 1500 },
  { id: 2, label: 'Composing prompt', duration: 1000 },
  { id: 3, label: 'Generating base', duration: 3000 },
  { id: 4, label: 'Adding details', duration: 2000 },
  { id: 5, label: 'Final polish', duration: 1500 },
];
