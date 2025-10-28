/**
 * Character Slice Integration Tests
 *
 * Tests character selection state management including:
 * - Selection persistence
 * - State clearing on project changes
 * - Filter management
 * - Selector performance
 *
 * NOTE: This test file requires a test runner setup.
 * To enable testing, install dependencies:
 *   npm install --save-dev @testing-library/react @testing-library/react-hooks jest @types/jest
 *
 * Then configure jest.config.js and run:
 *   npm test characterSlice.test.ts
 */

// @ts-nocheck - Disabled until test runner is configured
import { renderHook, act } from '@testing-library/react';
import { useCharacterStore, selectSelectedCharacterId, selectFilters } from '../characterSlice';
import { Character } from '@/app/types/Character';

// Mock character data
const mockCharacter1: Character = {
  id: 'char-1',
  name: 'John Doe',
  type: 'Key',
  project_id: 'project-1',
  faction_id: 'faction-1',
};

const mockCharacter2: Character = {
  id: 'char-2',
  name: 'Jane Smith',
  type: 'Major',
  project_id: 'project-1',
  faction_id: 'faction-2',
};

describe('Character Slice', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useCharacterStore());
    act(() => {
      result.current.clearCharacterState();
    });
  });

  describe('Character Selection', () => {
    it('should select and deselect a character', () => {
      const { result } = renderHook(() => useCharacterStore());

      // Initially no character selected
      expect(result.current.selectedCharacter).toBeNull();

      // Select character
      act(() => {
        result.current.setSelectedCharacter('char-1');
      });

      expect(result.current.selectedCharacter).toBe('char-1');

      // Deselect character
      act(() => {
        result.current.setSelectedCharacter(null);
      });

      expect(result.current.selectedCharacter).toBeNull();
    });

    it('should persist selection across component unmounts', () => {
      // First render - select character
      const { result: firstRender, unmount } = renderHook(() => useCharacterStore());

      act(() => {
        firstRender.current.setSelectedCharacter('char-1');
      });

      expect(firstRender.current.selectedCharacter).toBe('char-1');

      // Unmount component
      unmount();

      // Second render - should maintain selection
      const { result: secondRender } = renderHook(() => useCharacterStore());
      expect(secondRender.current.selectedCharacter).toBe('char-1');
    });

    it('should clear selection when clearCharacterState is called', () => {
      const { result } = renderHook(() => useCharacterStore());

      // Set up state
      act(() => {
        result.current.setSelectedCharacter('char-1');
        result.current.setProjectCharacters([mockCharacter1, mockCharacter2]);
        result.current.setActiveType('Key');
        result.current.setFactionId('faction-1');
      });

      expect(result.current.selectedCharacter).toBe('char-1');
      expect(result.current.projectCharacters).toHaveLength(2);
      expect(result.current.activeType).toBe('Key');
      expect(result.current.factionId).toBe('faction-1');

      // Clear all state
      act(() => {
        result.current.clearCharacterState();
      });

      expect(result.current.selectedCharacter).toBeNull();
      expect(result.current.projectCharacters).toHaveLength(0);
      expect(result.current.activeType).toBe('Main');
      expect(result.current.factionId).toBeUndefined();
    });
  });

  describe('Character Cache', () => {
    it('should store and update project characters', () => {
      const { result } = renderHook(() => useCharacterStore());

      // Set initial characters
      act(() => {
        result.current.setProjectCharacters([mockCharacter1]);
      });

      expect(result.current.projectCharacters).toHaveLength(1);
      expect(result.current.projectCharacters[0].id).toBe('char-1');

      // Update characters
      act(() => {
        result.current.setProjectCharacters([mockCharacter1, mockCharacter2]);
      });

      expect(result.current.projectCharacters).toHaveLength(2);
    });
  });

  describe('Filter Management', () => {
    it('should manage activeType filter', () => {
      const { result } = renderHook(() => useCharacterStore());

      expect(result.current.activeType).toBe('Main');

      act(() => {
        result.current.setActiveType('Key');
      });

      expect(result.current.activeType).toBe('Key');
    });

    it('should manage factionId filter', () => {
      const { result } = renderHook(() => useCharacterStore());

      expect(result.current.factionId).toBeUndefined();

      act(() => {
        result.current.setFactionId('faction-1');
      });

      expect(result.current.factionId).toBe('faction-1');
    });

    it('should reset filters independently', () => {
      const { result } = renderHook(() => useCharacterStore());

      // Set up state with selection and filters
      act(() => {
        result.current.setSelectedCharacter('char-1');
        result.current.setActiveType('Key');
        result.current.setFactionId('faction-1');
      });

      // Reset only filters
      act(() => {
        result.current.resetFilters();
      });

      // Selection should be preserved
      expect(result.current.selectedCharacter).toBe('char-1');
      // Filters should be reset
      expect(result.current.activeType).toBe('Main');
      expect(result.current.factionId).toBeUndefined();
    });
  });

  describe('Selectors', () => {
    it('should select only character ID', () => {
      const { result } = renderHook(() => useCharacterStore());

      act(() => {
        result.current.setSelectedCharacter('char-1');
      });

      const selectedId = selectSelectedCharacterId(result.current);
      expect(selectedId).toBe('char-1');
    });

    it('should select filters', () => {
      const { result } = renderHook(() => useCharacterStore());

      act(() => {
        result.current.setActiveType('Key');
        result.current.setFactionId('faction-1');
      });

      const filters = selectFilters(result.current);
      expect(filters).toEqual({
        activeType: 'Key',
        factionId: 'faction-1',
      });
    });
  });

  describe('Project Change Behavior', () => {
    it('should clear character state when project changes', () => {
      const { result } = renderHook(() => useCharacterStore());

      // Set up state for project 1
      act(() => {
        result.current.setSelectedCharacter('char-1');
        result.current.setProjectCharacters([mockCharacter1]);
        result.current.setActiveType('Key');
        result.current.setFactionId('faction-1');
      });

      // Simulate project change by clearing state
      act(() => {
        result.current.clearCharacterState();
      });

      // All state should be reset
      expect(result.current.selectedCharacter).toBeNull();
      expect(result.current.projectCharacters).toHaveLength(0);
      expect(result.current.activeType).toBe('Main');
      expect(result.current.factionId).toBeUndefined();
    });
  });

  describe('Immutability', () => {
    it('should not mutate original state', () => {
      const { result } = renderHook(() => useCharacterStore());

      const initialCharacters = [mockCharacter1];

      act(() => {
        result.current.setProjectCharacters(initialCharacters);
      });

      // Get reference to state
      const stateCharacters = result.current.projectCharacters;

      // Modify returned array (should not affect store)
      stateCharacters.push(mockCharacter2);

      // Store should not be affected by external mutation
      expect(result.current.projectCharacters).toHaveLength(1);
    });
  });
});
