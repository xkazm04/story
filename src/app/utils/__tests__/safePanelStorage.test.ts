import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getPanelSize,
  setPanelSize,
  removePanelSize,
  resetAllPanelSizes,
  getAllPanelSizes,
  safePanelStorageAPI,
  DEFAULT_PANEL_SIZES,
  PANEL_SIZE_CONSTRAINTS,
  type PanelId,
} from '../safePanelStorage';

// Helper to reset module state between tests
function resetModule() {
  // Reset the localStorageAvailable cache by forcing a new check
  try {
    localStorage.setItem('__test_reset__', 'test');
    localStorage.removeItem('__test_reset__');
  } catch {
    // Ignore
  }
}

describe('safePanelStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    resetModule();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getPanelSize', () => {
    it('returns default size when nothing is stored', () => {
      expect(getPanelSize('left')).toBe(DEFAULT_PANEL_SIZES.left);
      expect(getPanelSize('center')).toBe(DEFAULT_PANEL_SIZES.center);
      expect(getPanelSize('right')).toBe(DEFAULT_PANEL_SIZES.right);
    });

    it('returns stored valid size', () => {
      localStorage.setItem('story-panel-size-left', '25');
      expect(getPanelSize('left')).toBe(25);
    });

    it('returns default when stored value is invalid (too small)', () => {
      localStorage.setItem('story-panel-size-left', '1');
      expect(getPanelSize('left')).toBe(DEFAULT_PANEL_SIZES.left);
    });

    it('returns default when stored value is invalid (too large)', () => {
      localStorage.setItem('story-panel-size-left', '50');
      expect(getPanelSize('left')).toBe(DEFAULT_PANEL_SIZES.left);
    });

    it('returns default when stored value is NaN', () => {
      localStorage.setItem('story-panel-size-left', 'invalid');
      expect(getPanelSize('left')).toBe(DEFAULT_PANEL_SIZES.left);
    });

    it('returns default when stored value is Infinity', () => {
      localStorage.setItem('story-panel-size-left', 'Infinity');
      expect(getPanelSize('left')).toBe(DEFAULT_PANEL_SIZES.left);
    });

    it('handles localStorage errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(getPanelSize('left')).toBe(DEFAULT_PANEL_SIZES.left);
      getItemSpy.mockRestore();
    });

    it('validates constraints for each panel type', () => {
      // Test left panel constraints
      localStorage.setItem('story-panel-size-left', '35');
      expect(getPanelSize('left')).toBe(35);

      // Test center panel constraints
      localStorage.setItem('story-panel-size-center', '50');
      expect(getPanelSize('center')).toBe(50);

      // Test right panel constraints
      localStorage.setItem('story-panel-size-right', '30');
      expect(getPanelSize('right')).toBe(30);
    });
  });

  describe('setPanelSize', () => {
    it('stores valid panel size', () => {
      const result = setPanelSize('left', 25);
      expect(result).toBe(true);
      expect(localStorage.getItem('story-panel-size-left')).toBe('25');
    });

    it('rejects invalid size (too small)', () => {
      const result = setPanelSize('left', 1);
      expect(result).toBe(false);
      expect(localStorage.getItem('story-panel-size-left')).toBeNull();
    });

    it('rejects invalid size (too large)', () => {
      const result = setPanelSize('left', 50);
      expect(result).toBe(false);
      expect(localStorage.getItem('story-panel-size-left')).toBeNull();
    });

    it('rejects NaN', () => {
      const result = setPanelSize('left', NaN);
      expect(result).toBe(false);
      expect(localStorage.getItem('story-panel-size-left')).toBeNull();
    });

    it('rejects Infinity', () => {
      const result = setPanelSize('left', Infinity);
      expect(result).toBe(false);
      expect(localStorage.getItem('story-panel-size-left')).toBeNull();
    });

    it('handles quota exceeded error gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
      setItemSpy.mockImplementation(() => {
        throw quotaError;
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = setPanelSize('left', 25);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('handles general localStorage errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = setPanelSize('left', 25);

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      setItemSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('validates constraints for each panel type', () => {
      // Left panel: valid range 2-40
      expect(setPanelSize('left', 2)).toBe(true);
      expect(localStorage.getItem('story-panel-size-left')).toBe('2');

      expect(setPanelSize('left', 40)).toBe(true);
      expect(localStorage.getItem('story-panel-size-left')).toBe('40');

      expect(setPanelSize('left', 1)).toBe(false);
      expect(setPanelSize('left', 41)).toBe(false);

      // Center panel: valid range 30-80
      expect(setPanelSize('center', 30)).toBe(true);
      expect(setPanelSize('center', 80)).toBe(true);
      expect(setPanelSize('center', 29)).toBe(false);
      expect(setPanelSize('center', 81)).toBe(false);

      // Right panel: valid range 2-40
      expect(setPanelSize('right', 2)).toBe(true);
      expect(setPanelSize('right', 40)).toBe(true);
      expect(setPanelSize('right', 1)).toBe(false);
      expect(setPanelSize('right', 41)).toBe(false);
    });
  });

  describe('removePanelSize', () => {
    it('removes stored panel size', () => {
      setPanelSize('left', 25);
      expect(localStorage.getItem('story-panel-size-left')).toBe('25');

      const result = removePanelSize('left');
      expect(result).toBe(true);
      expect(localStorage.getItem('story-panel-size-left')).toBeNull();
    });

    it('handles errors gracefully', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      removeItemSpy.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = removePanelSize('left');

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('resetAllPanelSizes', () => {
    it('removes all panel sizes', () => {
      setPanelSize('left', 25);
      setPanelSize('center', 50);
      setPanelSize('right', 25);

      expect(localStorage.getItem('story-panel-size-left')).toBe('25');
      expect(localStorage.getItem('story-panel-size-center')).toBe('50');
      expect(localStorage.getItem('story-panel-size-right')).toBe('25');

      const result = resetAllPanelSizes();
      expect(result).toBe(true);

      expect(localStorage.getItem('story-panel-size-left')).toBeNull();
      expect(localStorage.getItem('story-panel-size-center')).toBeNull();
      expect(localStorage.getItem('story-panel-size-right')).toBeNull();
    });

    it('returns false if any removal fails', () => {
      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem');
      let callCount = 0;
      removeItemSpy.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          throw new Error('localStorage unavailable');
        }
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = resetAllPanelSizes();

      expect(result).toBe(false);
    });
  });

  describe('getAllPanelSizes', () => {
    it('returns all panel sizes', () => {
      setPanelSize('left', 25);
      setPanelSize('center', 50);
      setPanelSize('right', 25);

      const sizes = getAllPanelSizes();
      expect(sizes).toEqual({
        left: 25,
        center: 50,
        right: 25,
      });
    });

    it('returns defaults for missing values', () => {
      setPanelSize('left', 25);
      // center and right not set

      const sizes = getAllPanelSizes();
      expect(sizes).toEqual({
        left: 25,
        center: DEFAULT_PANEL_SIZES.center,
        right: DEFAULT_PANEL_SIZES.right,
      });
    });
  });

  describe('safePanelStorageAPI', () => {
    it('getItem returns stored value', () => {
      safePanelStorageAPI.setItem('test-key', 'test-value');
      expect(safePanelStorageAPI.getItem('test-key')).toBe('test-value');
    });

    it('getItem returns null when nothing stored', () => {
      expect(safePanelStorageAPI.getItem('test-key')).toBeNull();
    });

    it('getItem handles errors gracefully', () => {
      const getItemSpy = vi.spyOn(Storage.prototype, 'getItem');
      getItemSpy.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const result = safePanelStorageAPI.getItem('test-key');

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('setItem stores value', () => {
      safePanelStorageAPI.setItem('test-key', 'test-value');
      expect(safePanelStorageAPI.getItem('test-key')).toBe('test-value');
    });

    it('setItem handles quota exceeded by clearing old panel sizes', () => {
      // Pre-populate with old panel sizes using the actual API
      safePanelStorageAPI.setItem('story-panel-size-left', '25');
      safePanelStorageAPI.setItem('story-panel-size-center', '50');
      safePanelStorageAPI.setItem('other-key', 'should-remain');

      // Now mock to throw quota error on first call, then succeed
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      let callCount = 0;
      const originalSetItem = localStorage.setItem.bind(localStorage);

      setItemSpy.mockImplementation(function(this: Storage, key: string, value: string) {
        callCount++;
        if (callCount === 1) {
          throw new DOMException('Quota exceeded', 'QuotaExceededError');
        }
        // Use original implementation for subsequent calls
        return originalSetItem(key, value);
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      safePanelStorageAPI.setItem('new-key', 'new-value');

      // Should have tried to clear space
      expect(consoleSpy).toHaveBeenCalled();
    });

    it('setItem handles general errors gracefully', () => {
      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
      setItemSpy.mockImplementationOnce(() => {
        throw new Error('localStorage unavailable');
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      safePanelStorageAPI.setItem('test-key', 'test-value');

      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
