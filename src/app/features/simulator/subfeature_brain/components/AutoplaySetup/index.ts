/**
 * AutoplaySetup - Barrel export
 */

export { CompletionSummary } from './CompletionSummary';
export { ActivityModeContent } from './ActivityMode';
export { SetupModeContent } from './SetupMode';
export { Counter, Toggle, PresetSelector, AUTOPLAY_PRESETS } from './FormComponents';
export { loadSavedConfig, saveConfigToStorage, detectActivePreset } from './storage';
export { DEFAULT_CONFIG } from './types';
export type {
  AutoplayModalMode,
  AutoplaySetupModalProps,
  SavedImageInfo,
  ImageCategory,
  AutoplayPreset,
} from './types';
