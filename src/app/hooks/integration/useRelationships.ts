import { CharRelationship } from '../../types/Character';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockCharRelationships, simulateApiCall } from '../../../../db/mockData';

const RELATIONSHIPS_URL = `${API_BASE_URL}/relationships`;

export const relationshipApi = {
  // Get all relationships for a character
  useCharacterRelationships: (characterId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<CharRelationship[]>({
        queryKey: ['relationships', 'character', characterId],
        queryFn: async () => {
          const filtered = mockCharRelationships.filter(
            r => r.character_a_id === characterId || r.character_b_id === characterId
          );
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!characterId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${RELATIONSHIPS_URL}?characterId=${characterId}`;
    return useApiGet<CharRelationship[]>(url, enabled && !!characterId);
  },

  // Get a single relationship
  useRelationship: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<CharRelationship>({
        queryKey: ['relationships', id],
        queryFn: async () => {
          const relationship = mockCharRelationships.find(r => r.id === id);
          if (!relationship) throw new Error('Relationship not found');
          return simulateApiCall(relationship);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${RELATIONSHIPS_URL}/${id}`;
    return useApiGet<CharRelationship>(url, enabled && !!id);
  },

  // Create relationship
  createRelationship: async (data: {
    character_a_id: string;
    character_b_id: string;
    description: string;
    event_date?: string;
    relationship_type?: string;
  }) => {
    return apiFetch<CharRelationship>({
      url: RELATIONSHIPS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update relationship
  updateRelationship: async (id: string, data: Partial<CharRelationship>) => {
    return apiFetch<CharRelationship>({
      url: `${RELATIONSHIPS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete relationship
  deleteRelationship: async (id: string) => {
    return apiFetch<void>({
      url: `${RELATIONSHIPS_URL}/${id}`,
      method: 'DELETE',
    });
  },
};

