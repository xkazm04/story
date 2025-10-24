import { FactionRelationship } from '../types/Faction';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockFactionRelationships, simulateApiCall } from '../../../db/mockData';

const FACTION_RELATIONSHIPS_URL = `${API_BASE_URL}/faction-relationships`;

export const factionRelationshipApi = {
  // Get all relationships for a faction
  useFactionRelationships: (factionId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<FactionRelationship[]>({
        queryKey: ['factionRelationships', 'faction', factionId],
        queryFn: async () => {
          const filtered = mockFactionRelationships.filter(
            r => r.faction_a_id === factionId || r.faction_b_id === factionId
          );
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!factionId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTION_RELATIONSHIPS_URL}/faction/${factionId}`;
    return useApiGet<FactionRelationship[]>(url, enabled && !!factionId);
  },

  // Get a single relationship
  useFactionRelationship: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<FactionRelationship>({
        queryKey: ['factionRelationships', id],
        queryFn: async () => {
          const relationship = mockFactionRelationships.find(r => r.id === id);
          if (!relationship) throw new Error('Faction relationship not found');
          return simulateApiCall(relationship);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTION_RELATIONSHIPS_URL}/${id}`;
    return useApiGet<FactionRelationship>(url, enabled && !!id);
  },

  // Create faction relationship
  createFactionRelationship: async (data: {
    faction_a_id: string;
    faction_b_id: string;
    description: string;
    relationship_type?: string;
  }) => {
    return apiFetch<FactionRelationship>({
      url: FACTION_RELATIONSHIPS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update faction relationship
  updateFactionRelationship: async (id: string, data: Partial<FactionRelationship>) => {
    return apiFetch<FactionRelationship>({
      url: `${FACTION_RELATIONSHIPS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete faction relationship
  deleteFactionRelationship: async (id: string) => {
    return apiFetch<void>({
      url: `${FACTION_RELATIONSHIPS_URL}/${id}`,
      method: 'DELETE',
    });
  },
};

