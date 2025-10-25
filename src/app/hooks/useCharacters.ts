import { Character } from '../types/Character';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockCharacters, simulateApiCall } from '../../../db/mockData';

const CHARACTERS_URL = `${API_BASE_URL}/characters`;

export const characterApi = {
  // Get all characters for a project
  useProjectCharacters: (projectId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Character[]>({
        queryKey: ['characters', 'project', projectId],
        queryFn: async () => {
          const filtered = mockCharacters.filter(c => c.project_id === projectId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!projectId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${CHARACTERS_URL}?projectId=${projectId}`;
    return useApiGet<Character[]>(url, enabled && !!projectId);
  },

  // Get a single character
  useGetCharacter: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Character>({
        queryKey: ['characters', id],
        queryFn: async () => {
          const character = mockCharacters.find(c => c.id === id);
          if (!character) throw new Error('Character not found');
          return simulateApiCall(character);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${CHARACTERS_URL}/${id}`;
    return useApiGet<Character>(url, enabled && !!id);
  },

  // Get characters by faction
  useCharactersByFaction: (factionId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Character[]>({
        queryKey: ['characters', 'faction', factionId],
        queryFn: async () => {
          const filtered = mockCharacters.filter(c => c.faction_id === factionId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!factionId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${CHARACTERS_URL}/faction/${factionId}`;
    return useApiGet<Character[]>(url, enabled && !!factionId);
  },

  // Create character
  createCharacter: async (data: {
    name: string;
    project_id: string;
    type?: string;
    faction_id?: string;
  }) => {
    return apiFetch<Character>({
      url: CHARACTERS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update character
  updateCharacter: async (id: string, data: Partial<Character>) => {
    return apiFetch<Character>({
      url: `${CHARACTERS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Update character avatar
  updateAvatar: async (id: string, avatar_url: string) => {
    return apiFetch<Character>({
      url: `${CHARACTERS_URL}/${id}/avatar`,
      method: 'PUT',
      body: { avatar_url },
    });
  },

  // Delete character
  deleteCharacter: async (id: string) => {
    return apiFetch<void>({
      url: `${CHARACTERS_URL}/${id}`,
      method: 'DELETE',
    });
  },
};

