import { Faction } from '../types/Faction';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockFactions, simulateApiCall } from '../../../db/mockData';

const FACTIONS_URL = `${API_BASE_URL}/factions`;

export const factionApi = {
  // Get all factions for a project
  useFactions: (projectId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Faction[]>({
        queryKey: ['factions', 'project', projectId],
        queryFn: async () => {
          const filtered = mockFactions.filter(f => f.project_id === projectId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!projectId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTIONS_URL}/project/${projectId}`;
    return useApiGet<Faction[]>(url, enabled && !!projectId);
  },

  // Get a single faction
  useFaction: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Faction>({
        queryKey: ['factions', id],
        queryFn: async () => {
          const faction = mockFactions.find(f => f.id === id);
          if (!faction) throw new Error('Faction not found');
          return simulateApiCall(faction);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTIONS_URL}/${id}`;
    return useApiGet<Faction>(url, enabled && !!id);
  },

  // Create faction
  createFaction: async (data: {
    name: string;
    project_id: string;
    description?: string;
  }) => {
    return apiFetch<Faction>({
      url: FACTIONS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update faction
  updateFaction: async (id: string, data: Partial<Faction>) => {
    return apiFetch<Faction>({
      url: `${FACTIONS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete faction
  deleteFaction: async (id: string) => {
    return apiFetch<void>({
      url: `${FACTIONS_URL}/${id}`,
      method: 'DELETE',
    });
  },
};
