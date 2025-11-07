/**
 * SafePanelSizeStorage - Resilient localStorage wrapper for panel sizes
 *
 * Handles localStorage errors gracefully:
 * - Quota exceeded errors
 * - Unavailable localStorage (private browsing, etc.)
 * - Corrupted data
 * - Invalid numeric ranges
 *
 * Ensures UI remains functional even when storage fails.
 */

// Default panel sizes (percentage-based)
export const DEFAULT_PANEL_SIZES = {
  left: 20,
  center: 60,
  right: 20,
} as const;

// Valid range constraints for panel sizes (percentages)
export const PANEL_SIZE_CONSTRAINTS = {
  left: { min: 2, max: 40 },
  center: { min: 30, max: 80 },
  right: { min: 2, max: 40 },
} as const;

// Storage key prefix
const STORAGE_KEY_PREFIX = 'story-panel-size-';

/**
 * Type for panel identifiers
 */
export type PanelId = 'left' | 'center' | 'right';

/**
 * Cache for localStorage availability status
 * Reset when we encounter errors
 */
let localStorageAvailable: boolean | null = null;

/**
 * Check if localStorage is available and functional
 */
function isLocalStorageAvailable(): boolean {
  // Use cached value if available
  if (localStorageAvailable !== null) {
    return localStorageAvailable;
  }

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    localStorageAvailable = true;
    return true;
  } catch {
    localStorageAvailable = false;
    return false;
  }
}

/**
 * Reset the localStorage availability cache
 * Called when we encounter errors to force a recheck
 */
function resetAvailabilityCache(): void {
  localStorageAvailable = null;
}

/**
 * Validate that a value is a valid panel size (number within constraints)
 */
function isValidPanelSize(value: unknown, panelId: PanelId): value is number {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return false;
  }

  const constraints = PANEL_SIZE_CONSTRAINTS[panelId];
  return value >= constraints.min && value <= constraints.max;
}

/**
 * Safely get a panel size from localStorage
 * Returns default value if storage is unavailable, corrupted, or invalid
 */
export function getPanelSize(panelId: PanelId): number {
  const defaultSize = DEFAULT_PANEL_SIZES[panelId];

  // Check if localStorage is available
  if (!isLocalStorageAvailable()) {
    console.warn('[SafePanelStorage] localStorage not available, using default size');
    return defaultSize;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${panelId}`;
    const stored = localStorage.getItem(key);

    if (stored === null) {
      // No stored value, use default
      return defaultSize;
    }

    // Parse the stored value
    const parsed = parseFloat(stored);

    // Validate the parsed value
    if (!isValidPanelSize(parsed, panelId)) {
      console.warn(
        `[SafePanelStorage] Invalid stored size for ${panelId}: ${stored}, using default`
      );
      return defaultSize;
    }

    return parsed;
  } catch (error) {
    console.error('[SafePanelStorage] Error reading panel size:', error);
    return defaultSize;
  }
}

/**
 * Safely set a panel size to localStorage
 * Handles quota exceeded and other storage errors gracefully
 */
export function setPanelSize(panelId: PanelId, size: number): boolean {
  // Validate the size before attempting to store
  if (!isValidPanelSize(size, panelId)) {
    console.warn(
      `[SafePanelStorage] Attempted to store invalid size for ${panelId}: ${size}`
    );
    return false;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${panelId}`;
    localStorage.setItem(key, size.toString());
    return true;
  } catch (error) {
    // Reset availability cache on error
    resetAvailabilityCache();

    // Handle quota exceeded and other errors
    if (error instanceof DOMException) {
      if (error.name === 'QuotaExceededError') {
        console.error('[SafePanelStorage] localStorage quota exceeded');
      } else {
        console.error('[SafePanelStorage] localStorage error:', error.message);
      }
    } else {
      console.error('[SafePanelStorage] Unexpected error storing panel size:', error);
    }
    return false;
  }
}

/**
 * Safely remove a panel size from localStorage
 */
export function removePanelSize(panelId: PanelId): boolean {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const key = `${STORAGE_KEY_PREFIX}${panelId}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('[SafePanelStorage] Error removing panel size:', error);
    return false;
  }
}

/**
 * Reset all panel sizes to defaults
 */
export function resetAllPanelSizes(): boolean {
  let success = true;

  const panelIds: PanelId[] = ['left', 'center', 'right'];
  for (const panelId of panelIds) {
    if (!removePanelSize(panelId)) {
      success = false;
    }
  }

  return success;
}

/**
 * Get all panel sizes at once
 */
export function getAllPanelSizes(): Record<PanelId, number> {
  return {
    left: getPanelSize('left'),
    center: getPanelSize('center'),
    right: getPanelSize('right'),
  };
}

/**
 * Custom storage API for react-resizable-panels
 * This can be passed to PanelGroup's storage prop
 */
export const safePanelStorageAPI = {
  getItem: (key: string): string | null => {
    if (!isLocalStorageAvailable()) {
      return null;
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('[SafePanelStorage] Error in getItem:', error);
      return null;
    }
  },

  setItem: (key: string, value: string): void => {
    if (!isLocalStorageAvailable()) {
      return;
    }

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('[SafePanelStorage] localStorage quota exceeded');
        // Try to make space by clearing old panel sizes
        try {
          const panelKeys = Object.keys(localStorage).filter(k =>
            k.startsWith(STORAGE_KEY_PREFIX)
          );
          panelKeys.forEach(k => localStorage.removeItem(k));
          // Retry the set operation
          localStorage.setItem(key, value);
        } catch {
          console.error('[SafePanelStorage] Could not recover from quota error');
        }
      } else {
        console.error('[SafePanelStorage] Error in setItem:', error);
      }
    }
  },
};
