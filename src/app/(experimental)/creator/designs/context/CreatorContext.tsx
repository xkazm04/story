/**
 * Creator Context - State management for character creator
 */

'use client';

import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import type { CategoryId, CategorySelection, CharacterState, UIState, Toast } from '../types';
import { CATEGORIES, PROMPT_ORDER, getCategoryById } from '../constants/categories';
import { getOptionsForCategory } from '../constants/options';

// Initial selections - all null (undefined in prompt)
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

interface State {
  character: CharacterState;
  ui: UIState;
  toasts: Toast[];
}

type Action =
  | { type: 'SET_CATEGORY_SELECTION'; categoryId: CategoryId; optionId: string | number | null }
  | { type: 'SET_CUSTOM_PROMPT'; categoryId: CategoryId; customPrompt: string }
  | { type: 'CLEAR_CUSTOM_PROMPT'; categoryId: CategoryId }
  | { type: 'SET_ACTIVE_CATEGORY'; categoryId: CategoryId | null }
  | { type: 'TOGGLE_LEFT_SIDEBAR' }
  | { type: 'TOGGLE_RIGHT_SIDEBAR' }
  | { type: 'TOGGLE_BOTTOM_PANEL' }
  | { type: 'TOGGLE_PROMPT_PREVIEW' }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'SET_CHARACTER_NAME'; name: string }
  | { type: 'START_GENERATION' }
  | { type: 'UPDATE_GENERATION'; step: number; progress: number }
  | { type: 'FINISH_GENERATION' }
  | { type: 'CANCEL_GENERATION' }
  | { type: 'ADD_TOAST'; toast: Toast }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'RESET_CHARACTER' };

const initialState: State = {
  character: {
    name: 'Unnamed Character',
    selections: createInitialSelections(),
  },
  ui: {
    activeCategory: 'hair',
    leftSidebarOpen: true,
    rightSidebarOpen: true,
    bottomPanelOpen: false,
    showPromptPreview: false,
    zoom: 100,
    isGenerating: false,
    generationStep: 0,
    generationProgress: 0,
  },
  toasts: [],
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_CATEGORY_SELECTION':
      return {
        ...state,
        character: {
          ...state.character,
          selections: {
            ...state.character.selections,
            [action.categoryId]: {
              ...state.character.selections[action.categoryId],
              optionId: action.optionId,
              isCustom: false,
            },
          },
        },
      };

    case 'SET_CUSTOM_PROMPT':
      return {
        ...state,
        character: {
          ...state.character,
          selections: {
            ...state.character.selections,
            [action.categoryId]: {
              ...state.character.selections[action.categoryId],
              customPrompt: action.customPrompt,
              isCustom: true,
            },
          },
        },
      };

    case 'CLEAR_CUSTOM_PROMPT':
      return {
        ...state,
        character: {
          ...state.character,
          selections: {
            ...state.character.selections,
            [action.categoryId]: {
              ...state.character.selections[action.categoryId],
              customPrompt: undefined,
              isCustom: false,
            },
          },
        },
      };

    case 'SET_ACTIVE_CATEGORY':
      return { ...state, ui: { ...state.ui, activeCategory: action.categoryId } };

    case 'TOGGLE_LEFT_SIDEBAR':
      return { ...state, ui: { ...state.ui, leftSidebarOpen: !state.ui.leftSidebarOpen } };

    case 'TOGGLE_RIGHT_SIDEBAR':
      return { ...state, ui: { ...state.ui, rightSidebarOpen: !state.ui.rightSidebarOpen } };

    case 'TOGGLE_BOTTOM_PANEL':
      return { ...state, ui: { ...state.ui, bottomPanelOpen: !state.ui.bottomPanelOpen } };

    case 'TOGGLE_PROMPT_PREVIEW':
      return { ...state, ui: { ...state.ui, showPromptPreview: !state.ui.showPromptPreview } };

    case 'SET_ZOOM':
      return { ...state, ui: { ...state.ui, zoom: action.zoom } };

    case 'SET_CHARACTER_NAME':
      return { ...state, character: { ...state.character, name: action.name } };

    case 'START_GENERATION':
      return { ...state, ui: { ...state.ui, isGenerating: true, generationStep: 0, generationProgress: 0 } };

    case 'UPDATE_GENERATION':
      return { ...state, ui: { ...state.ui, generationStep: action.step, generationProgress: action.progress } };

    case 'FINISH_GENERATION':
      return { ...state, ui: { ...state.ui, isGenerating: false, generationStep: 0, generationProgress: 0 } };

    case 'CANCEL_GENERATION':
      return { ...state, ui: { ...state.ui, isGenerating: false, generationStep: 0, generationProgress: 0 } };

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.toast] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case 'RESET_CHARACTER':
      return { ...state, character: { name: 'Unnamed Character', selections: createInitialSelections() } };

    default:
      return state;
  }
}

interface CreatorContextValue {
  state: State;
  // Actions
  setSelection: (categoryId: CategoryId, optionId: string | number | null) => void;
  setCustomPrompt: (categoryId: CategoryId, prompt: string) => void;
  clearCustomPrompt: (categoryId: CategoryId) => void;
  setActiveCategory: (categoryId: CategoryId | null) => void;
  toggleLeftSidebar: () => void;
  toggleRightSidebar: () => void;
  toggleBottomPanel: () => void;
  togglePromptPreview: () => void;
  setZoom: (zoom: number) => void;
  setCharacterName: (name: string) => void;
  startGeneration: () => void;
  updateGeneration: (step: number, progress: number) => void;
  finishGeneration: () => void;
  cancelGeneration: () => void;
  addToast: (message: string, type: Toast['type']) => void;
  removeToast: (id: string) => void;
  resetCharacter: () => void;
  // Computed
  composedPrompt: string;
  activeSelectionCount: number;
}

const CreatorContext = createContext<CreatorContextValue | null>(null);

export function CreatorProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Compose prompt from selections
  const composedPrompt = useMemo(() => {
    const parts: string[] = ['A character portrait of'];

    PROMPT_ORDER.forEach((categoryId) => {
      const selection = state.character.selections[categoryId];
      if (!selection) return;

      // Use custom prompt if set
      if (selection.isCustom && selection.customPrompt) {
        parts.push(selection.customPrompt);
        return;
      }

      // Use selected option
      if (selection.optionId !== null) {
        const options = getOptionsForCategory(categoryId);
        const option = options.find((o) => o.id === selection.optionId);
        if (option && option.promptValue) {
          const category = getCategoryById(categoryId);
          if (category) {
            const filled = category.promptTemplate.replace('{value}', option.promptValue);
            parts.push(filled);
          }
        }
      }
    });

    return parts.join(', ') + '.';
  }, [state.character.selections]);

  const activeSelectionCount = useMemo(() => {
    return Object.values(state.character.selections).filter(
      (s) => s.optionId !== null || s.isCustom
    ).length;
  }, [state.character.selections]);

  // Action creators
  const setSelection = useCallback((categoryId: CategoryId, optionId: string | number | null) => {
    dispatch({ type: 'SET_CATEGORY_SELECTION', categoryId, optionId });
  }, []);

  const setCustomPrompt = useCallback((categoryId: CategoryId, prompt: string) => {
    dispatch({ type: 'SET_CUSTOM_PROMPT', categoryId, customPrompt: prompt });
  }, []);

  const clearCustomPrompt = useCallback((categoryId: CategoryId) => {
    dispatch({ type: 'CLEAR_CUSTOM_PROMPT', categoryId });
  }, []);

  const setActiveCategory = useCallback((categoryId: CategoryId | null) => {
    dispatch({ type: 'SET_ACTIVE_CATEGORY', categoryId });
  }, []);

  const toggleLeftSidebar = useCallback(() => dispatch({ type: 'TOGGLE_LEFT_SIDEBAR' }), []);
  const toggleRightSidebar = useCallback(() => dispatch({ type: 'TOGGLE_RIGHT_SIDEBAR' }), []);
  const toggleBottomPanel = useCallback(() => dispatch({ type: 'TOGGLE_BOTTOM_PANEL' }), []);
  const togglePromptPreview = useCallback(() => dispatch({ type: 'TOGGLE_PROMPT_PREVIEW' }), []);

  const setZoom = useCallback((zoom: number) => dispatch({ type: 'SET_ZOOM', zoom }), []);
  const setCharacterName = useCallback((name: string) => dispatch({ type: 'SET_CHARACTER_NAME', name }), []);

  const startGeneration = useCallback(() => dispatch({ type: 'START_GENERATION' }), []);
  const updateGeneration = useCallback((step: number, progress: number) => {
    dispatch({ type: 'UPDATE_GENERATION', step, progress });
  }, []);
  const finishGeneration = useCallback(() => dispatch({ type: 'FINISH_GENERATION' }), []);
  const cancelGeneration = useCallback(() => dispatch({ type: 'CANCEL_GENERATION' }), []);

  const addToast = useCallback((message: string, type: Toast['type']) => {
    const id = `toast-${Date.now()}`;
    dispatch({ type: 'ADD_TOAST', toast: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', id }), 4000);
  }, []);

  const removeToast = useCallback((id: string) => dispatch({ type: 'REMOVE_TOAST', id }), []);
  const resetCharacter = useCallback(() => dispatch({ type: 'RESET_CHARACTER' }), []);

  const value: CreatorContextValue = {
    state,
    setSelection,
    setCustomPrompt,
    clearCustomPrompt,
    setActiveCategory,
    toggleLeftSidebar,
    toggleRightSidebar,
    toggleBottomPanel,
    togglePromptPreview,
    setZoom,
    setCharacterName,
    startGeneration,
    updateGeneration,
    finishGeneration,
    cancelGeneration,
    addToast,
    removeToast,
    resetCharacter,
    composedPrompt,
    activeSelectionCount,
  };

  return <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>;
}

export function useCreator() {
  const context = useContext(CreatorContext);
  if (!context) {
    throw new Error('useCreator must be used within a CreatorProvider');
  }
  return context;
}
