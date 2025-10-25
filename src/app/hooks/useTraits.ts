import { Trait } from '../types/Character';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockTraits, simulateApiCall } from '../../../db/mockData';

const TRAITS_URL = `${API_BASE_URL}/traits`;

export const traitApi = {
  // Get all traits for a character
  useCharacterTraits: (characterId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Trait[]>({
        queryKey: ['traits', 'character', characterId],
        queryFn: async () => {
          const filtered = mockTraits.filter(t => t.character_id === characterId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!characterId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${TRAITS_URL}?characterId=${characterId}`;
    return useApiGet<Trait[]>(url, enabled && !!characterId);
  },

  // Get a single trait
  useTrait: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Trait>({
        queryKey: ['traits', id],
        queryFn: async () => {
          const trait = mockTraits.find(t => t.id === id);
          if (!trait) throw new Error('Trait not found');
          return simulateApiCall(trait);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${TRAITS_URL}/${id}`;
    return useApiGet<Trait>(url, enabled && !!id);
  },

  // Create trait
  createTrait: async (data: {
    character_id: string;
    type: string;
    description: string;
  }) => {
    return apiFetch<Trait>({
      url: TRAITS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update trait
  updateTrait: async (id: string, data: Partial<Trait>) => {
    return apiFetch<Trait>({
      url: `${TRAITS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete trait
  deleteTrait: async (id: string) => {
    return apiFetch<void>({
      url: `${TRAITS_URL}/${id}`,
      method: 'DELETE',
    });
  },
};

