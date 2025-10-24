import { create } from 'zustand';
import { Character } from '../types/Character';

export const CHARACTER_TYPES = ["Key", "Major", "Minor", "Other"] as const;

interface CharacterState {
  selectedCharacter: string | null;
  setSelectedCharacter: (id: string | null) => void;
  projectCharacters: Character[];
  setProjectCharacters: (characters: Character[]) => void;
  activeType: string;
  setActiveType: (type: string) => void;
  factionId: string | undefined;
  setFactionId: (id: string | undefined) => void;
}

export const useCharacterStore = create<CharacterState>((set) => ({
  selectedCharacter: null,
  setSelectedCharacter: (id) => set({ selectedCharacter: id }),
  projectCharacters: [],
  setProjectCharacters: (characters) => set({ projectCharacters: characters }),
  activeType: "Main",
  setActiveType: (type) => set({ activeType: type }),
  factionId: undefined,
  setFactionId: (id) => set({ factionId: id }),
}));
