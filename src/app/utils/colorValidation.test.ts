/**
 * Color Validation Tests
 *
 * Tests for faction branding color validation utilities
 */

import {
  isValidHexFormat,
  hexToRgb,
  calculateBrightness,
  isWithinBrightnessRange,
  sanitizeHexColor,
  validateFactionColor,
  validateFactionBrandingColors,
  ensureValidColor,
  DEFAULT_FACTION_COLORS,
} from './colorValidation';

describe('Color Validation Utilities', () => {
  describe('isValidHexFormat', () => {
    test('validates correct hex colors', () => {
      expect(isValidHexFormat('#FF0000')).toBe(true);
      expect(isValidHexFormat('#00ff00')).toBe(true);
      expect(isValidHexFormat('#0000FF')).toBe(true);
      expect(isValidHexFormat('#3B82F6')).toBe(true);
    });

    test('rejects invalid hex colors', () => {
      expect(isValidHexFormat('#FFF')).toBe(false); // Too short
      expect(isValidHexFormat('#FFFFFFF')).toBe(false); // Too long
      expect(isValidHexFormat('FF0000')).toBe(false); // Missing #
      expect(isValidHexFormat('#GGGGGG')).toBe(false); // Invalid characters
      expect(isValidHexFormat('red')).toBe(false); // Named color
    });
  });

  describe('hexToRgb', () => {
    test('converts hex to RGB correctly', () => {
      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('#3B82F6')).toEqual({ r: 59, g: 130, b: 246 });
    });

    test('returns null for invalid hex', () => {
      expect(hexToRgb('#GGG')).toBeNull();
      expect(hexToRgb('invalid')).toBeNull();
    });
  });

  describe('calculateBrightness', () => {
    test('calculates brightness correctly', () => {
      const whiteBrightness = calculateBrightness('#FFFFFF');
      expect(whiteBrightness).toBeCloseTo(255, 0);

      const blackBrightness = calculateBrightness('#000000');
      expect(blackBrightness).toBe(0);

      const grayBrightness = calculateBrightness('#808080');
      expect(grayBrightness).toBeGreaterThan(0);
      expect(grayBrightness).toBeLessThan(255);
    });

    test('returns null for invalid colors', () => {
      expect(calculateBrightness('invalid')).toBeNull();
    });
  });

  describe('isWithinBrightnessRange', () => {
    test('validates colors within default range', () => {
      expect(isWithinBrightnessRange('#808080')).toBe(true); // Gray
      expect(isWithinBrightnessRange('#3B82F6')).toBe(true); // Blue
    });

    test('rejects colors outside default range', () => {
      expect(isWithinBrightnessRange('#000000')).toBe(false); // Too dark
      expect(isWithinBrightnessRange('#FFFFFF')).toBe(false); // Too bright
      expect(isWithinBrightnessRange('#050505')).toBe(false); // Very dark
      expect(isWithinBrightnessRange('#FAFAFA')).toBe(false); // Very bright
    });

    test('respects custom brightness ranges', () => {
      expect(isWithinBrightnessRange('#000000', { min: 0, max: 50 })).toBe(true);
      expect(isWithinBrightnessRange('#FFFFFF', { min: 200, max: 255 })).toBe(true);
    });
  });

  describe('sanitizeHexColor', () => {
    test('normalizes valid hex colors', () => {
      expect(sanitizeHexColor('#ff0000')).toBe('#FF0000');
      expect(sanitizeHexColor('FF0000')).toBe('#FF0000'); // Adds #
      expect(sanitizeHexColor(' #FF0000 ')).toBe('#FF0000'); // Trims
    });

    test('expands shorthand hex', () => {
      expect(sanitizeHexColor('#F00')).toBe('#FF0000');
      expect(sanitizeHexColor('#0F0')).toBe('#00FF00');
      expect(sanitizeHexColor('#00F')).toBe('#0000FF');
    });

    test('returns null for invalid colors', () => {
      expect(sanitizeHexColor('invalid')).toBeNull();
      expect(sanitizeHexColor('#GGGGGG')).toBeNull();
      expect(sanitizeHexColor('red')).toBeNull();
    });
  });

  describe('validateFactionColor', () => {
    test('validates correct colors', () => {
      const result = validateFactionColor('#3B82F6');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('#3B82F6');
      expect(result.error).toBeUndefined();
    });

    test('rejects invalid format', () => {
      const result = validateFactionColor('invalid');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('#RRGGBB format');
    });

    test('rejects too dark colors', () => {
      const result = validateFactionColor('#000000');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too dark');
    });

    test('rejects too bright colors', () => {
      const result = validateFactionColor('#FFFFFF');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('too bright');
    });

    test('handles optional colors', () => {
      const result = validateFactionColor(undefined, { required: false });
      expect(result.isValid).toBe(true);
    });

    test('requires colors when specified', () => {
      const result = validateFactionColor(undefined, { required: true });
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('sanitizes valid colors', () => {
      const result = validateFactionColor('#ff0000');
      expect(result.isValid).toBe(true);
      expect(result.sanitized).toBe('#FF0000');
    });
  });

  describe('validateFactionBrandingColors', () => {
    test('validates all valid colors', () => {
      const result = validateFactionBrandingColors({
        primary_color: '#3B82F6',
        secondary_color: '#10B981',
        accent_color: '#8B5CF6',
      });
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors).length).toBe(0);
    });

    test('collects multiple errors', () => {
      const result = validateFactionBrandingColors({
        primary_color: '#000000', // Too dark
        secondary_color: 'invalid', // Invalid format
        accent_color: '#FFFFFF', // Too bright
      });
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(3);
      expect(result.errors.primary_color).toContain('too dark');
      expect(result.errors.secondary_color).toContain('#RRGGBB format');
      expect(result.errors.accent_color).toContain('too bright');
    });

    test('provides defaults for missing colors', () => {
      const result = validateFactionBrandingColors({});
      expect(result.isValid).toBe(true);
      expect(result.sanitized.primary_color).toBe(DEFAULT_FACTION_COLORS.primary);
      expect(result.sanitized.secondary_color).toBe(DEFAULT_FACTION_COLORS.secondary);
      expect(result.sanitized.accent_color).toBe(DEFAULT_FACTION_COLORS.accent);
    });

    test('sanitizes valid colors', () => {
      const result = validateFactionBrandingColors({
        primary_color: '#3b82f6',
        secondary_color: '#10b981',
        accent_color: '#8b5cf6',
      });
      expect(result.isValid).toBe(true);
      expect(result.sanitized.primary_color).toBe('#3B82F6');
      expect(result.sanitized.secondary_color).toBe('#10B981');
      expect(result.sanitized.accent_color).toBe('#8B5CF6');
    });
  });

  describe('ensureValidColor', () => {
    test('returns valid color', () => {
      expect(ensureValidColor('#3B82F6', '#000000')).toBe('#3B82F6');
    });

    test('returns default for invalid color', () => {
      expect(ensureValidColor('invalid', '#3B82F6')).toBe('#3B82F6');
      expect(ensureValidColor(undefined, '#10B981')).toBe('#10B981');
    });
  });
});
