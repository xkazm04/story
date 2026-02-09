/**
 * AutoplaySetup - LocalStorage helpers for persisting configuration
 */

import {
  ExtendedAutoplayConfig,
  AutoplayPreset,
  DEFAULT_CONFIG,
  STORAGE_KEY,
} from './types';
import { AUTOPLAY_PRESETS } from './FormComponents';

/**
 * Load previously saved autoplay config from localStorage
 */
export function loadSavedConfig(): ExtendedAutoplayConfig | null {
  try {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Validate shape
    if (typeof parsed.sketchCount === 'number' && typeof parsed.gameplayCount === 'number') {
      return { ...DEFAULT_CONFIG, ...parsed, promptIdea: '' };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save autoplay config to localStorage (without promptIdea, which is session-specific)
 */
export function saveConfigToStorage(config: ExtendedAutoplayConfig) {
  try {
    if (typeof window === 'undefined') return;
    // Save without promptIdea (it's session-specific)
    const { promptIdea, ...rest } = config;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Detect which preset matches the current config, if any
 */
export function detectActivePreset(config: ExtendedAutoplayConfig): string | null {
  for (const preset of AUTOPLAY_PRESETS) {
    const p = preset.config;
    if (
      config.sketchCount === p.sketchCount &&
      config.gameplayCount === p.gameplayCount &&
      config.posterEnabled === p.posterEnabled &&
      config.hudEnabled === p.hudEnabled &&
      config.maxIterationsPerImage === p.maxIterationsPerImage
    ) {
      return preset.id;
    }
  }
  return null;
}
