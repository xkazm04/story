import { Faction, FactionEvent, FactionAchievement, FactionLore, FactionMedia } from '../../types/Faction';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockFactions, mockFactionEvents, mockFactionAchievements, mockFactionLore, mockFactionMedia, simulateApiCall } from '../../../../db/mockData';

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
    const url = `${FACTIONS_URL}?projectId=${projectId}`;
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

  // Get faction media
  useFactionMedia: (factionId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<FactionMedia[]>({
        queryKey: ['faction-media', factionId],
        queryFn: async () => {
          const filtered = mockFactionMedia.filter(m => m.faction_id === factionId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!factionId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTIONS_URL}/${factionId}/media`;
    return useApiGet<FactionMedia[]>(url, enabled && !!factionId);
  },

  // Upload faction media
  uploadFactionMedia: async (factionId: string, file: File, type: string, description: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('description', description);

    return apiFetch<FactionMedia>({
      url: `${FACTIONS_URL}/${factionId}/media`,
      method: 'POST',
      body: formData,
    });
  },

  // Delete faction media
  deleteFactionMedia: async (mediaId: string) => {
    return apiFetch<void>({
      url: `${API_BASE_URL}/faction-media/${mediaId}`,
      method: 'DELETE',
    });
  },

  // Get faction events
  useFactionEvents: (factionId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<FactionEvent[]>({
        queryKey: ['faction-events', factionId],
        queryFn: async () => {
          const filtered = mockFactionEvents
            .filter(e => e.faction_id === factionId)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!factionId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTIONS_URL}/${factionId}/events`;
    return useApiGet<FactionEvent[]>(url, enabled && !!factionId);
  },

  // Create faction event
  createFactionEvent: async (data: Omit<FactionEvent, 'id' | 'created_at'>) => {
    return apiFetch<FactionEvent>({
      url: `${FACTIONS_URL}/${data.faction_id}/events`,
      method: 'POST',
      body: data,
    });
  },

  // Update faction event
  updateFactionEvent: async (eventId: string, data: Partial<FactionEvent>) => {
    return apiFetch<FactionEvent>({
      url: `${API_BASE_URL}/faction-events/${eventId}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete faction event
  deleteFactionEvent: async (eventId: string) => {
    return apiFetch<void>({
      url: `${API_BASE_URL}/faction-events/${eventId}`,
      method: 'DELETE',
    });
  },

  // Get faction achievements
  useFactionAchievements: (factionId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<FactionAchievement[]>({
        queryKey: ['faction-achievements', factionId],
        queryFn: async () => {
          const filtered = mockFactionAchievements
            .filter(a => a.faction_id === factionId)
            .sort((a, b) => new Date(b.earned_date).getTime() - new Date(a.earned_date).getTime());
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!factionId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTIONS_URL}/${factionId}/achievements`;
    return useApiGet<FactionAchievement[]>(url, enabled && !!factionId);
  },

  // Create faction achievement
  createFactionAchievement: async (data: Omit<FactionAchievement, 'id' | 'created_at'>) => {
    return apiFetch<FactionAchievement>({
      url: `${FACTIONS_URL}/${data.faction_id}/achievements`,
      method: 'POST',
      body: data,
    });
  },

  // Update faction achievement
  updateFactionAchievement: async (achievementId: string, data: Partial<FactionAchievement>) => {
    return apiFetch<FactionAchievement>({
      url: `${API_BASE_URL}/faction-achievements/${achievementId}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete faction achievement
  deleteFactionAchievement: async (achievementId: string) => {
    return apiFetch<void>({
      url: `${API_BASE_URL}/faction-achievements/${achievementId}`,
      method: 'DELETE',
    });
  },

  // Get faction lore
  useFactionLore: (factionId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<FactionLore[]>({
        queryKey: ['faction-lore', factionId],
        queryFn: async () => {
          const filtered = mockFactionLore
            .filter(l => l.faction_id === factionId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!factionId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${FACTIONS_URL}/${factionId}/lore`;
    return useApiGet<FactionLore[]>(url, enabled && !!factionId);
  },

  // Create faction lore
  createFactionLore: async (data: Omit<FactionLore, 'id'>) => {
    return apiFetch<FactionLore>({
      url: `${FACTIONS_URL}/${data.faction_id}/lore`,
      method: 'POST',
      body: data,
    });
  },

  // Update faction lore
  updateFactionLore: async (loreId: string, data: Partial<FactionLore>) => {
    return apiFetch<FactionLore>({
      url: `${API_BASE_URL}/faction-lore/${loreId}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete faction lore
  deleteFactionLore: async (loreId: string) => {
    return apiFetch<void>({
      url: `${API_BASE_URL}/faction-lore/${loreId}`,
      method: 'DELETE',
    });
  },

  // Update faction branding
  updateFactionBranding: async (factionId: string, branding: Partial<Faction['branding']>) => {
    return apiFetch<Faction>({
      url: `${FACTIONS_URL}/${factionId}/branding`,
      method: 'PUT',
      body: branding,
    });
  },
};

