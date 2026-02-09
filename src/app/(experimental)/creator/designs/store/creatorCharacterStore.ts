'use client';

import { create } from 'zustand';
import type { CategoryId, CategorySelection } from '../types';
import { CATEGORIES, PROMPT_ORDER, getCategoryById } from '../constants/categories';
import { getOptionsForCategory } from '../constants/options';

const createInitialSelections = (): Record<CategoryId, CategorySelection> => {
  const selections = {} as Record<CategoryId, CategorySelection>;
  CATEGORIES.forEach((cat) => {
    selections[cat.id] = {
      categoryId: cat.id,
      optionId: null,
      customPrompt: undefined,
      isCustom: false,
    };
  });
  return selections;
};

interface CreatorCharacterState {
  name: string;
  selections: Record<CategoryId, CategorySelection>;

  setSelection: (categoryId: CategoryId, optionId: string | number | null) => void;
  setCustomPrompt: (categoryId: CategoryId, customPrompt: string) => void;
  clearCustomPrompt: (categoryId: CategoryId) => void;
  setCharacterName: (name: string) => void;
  resetCharacter: () => void;
}

export const useCreatorCharacterStore = create<CreatorCharacterState>((set) => ({
  name: 'Unnamed Character',
  selections: createInitialSelections(),

  setSelection: (categoryId, optionId) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [categoryId]: {
          ...state.selections[categoryId],
          optionId,
          isCustom: false,
        },
      },
    })),

  setCustomPrompt: (categoryId, customPrompt) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [categoryId]: {
          ...state.selections[categoryId],
          customPrompt,
          isCustom: true,
        },
      },
    })),

  clearCustomPrompt: (categoryId) =>
    set((state) => ({
      selections: {
        ...state.selections,
        [categoryId]: {
          ...state.selections[categoryId],
          customPrompt: undefined,
          isCustom: false,
        },
      },
    })),

  setCharacterName: (name) => set({ name }),

  resetCharacter: () =>
    set({ name: 'Unnamed Character', selections: createInitialSelections() }),
}));

// Derived selectors
export const selectComposedPrompt = (state: CreatorCharacterState): string => {
  const parts: string[] = ['A character portrait of'];

  PROMPT_ORDER.forEach((categoryId) => {
    const selection = state.selections[categoryId];
    if (!selection) return;

    if (selection.isCustom && selection.customPrompt) {
      parts.push(selection.customPrompt);
      return;
    }

    if (selection.optionId !== null) {
      const options = getOptionsForCategory(categoryId);
      const option = options.find((o) => o.id === selection.optionId);
      if (option && option.promptValue) {
        const category = getCategoryById(categoryId);
        if (category) {
          parts.push(category.promptTemplate.replace('{value}', option.promptValue));
        }
      }
    }
  });

  return parts.join(', ') + '.';
};

export const selectActiveSelectionCount = (state: CreatorCharacterState): number =>
  Object.values(state.selections).filter(
    (s) => s.optionId !== null || s.isCustom
  ).length;
