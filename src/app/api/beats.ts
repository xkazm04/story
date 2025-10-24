import { Beat } from '../types/Beat';
import { apiFetch, useApiGet, API_BASE_URL } from '../utils/api';

const BEATS_URL = `${API_BASE_URL}/beats`;

export const beatsApi = {
  // Get all beats for a project
  useGetBeats: (projectId: string | undefined, enabled: boolean = true) => {
    if (!projectId) {
      throw new Error('Project ID is required to fetch beats.');
    }
    const url = `${BEATS_URL}/project/${projectId}`;
    return useApiGet<Beat[]>(url, enabled && !!projectId);
  },

  // Get beats for a specific act
  useGetActBeats: (actId: string | undefined, enabled: boolean = true) => {
    if (!actId) return useApiGet<Beat[]>('', false);
    const url = `${BEATS_URL}/act/${actId}`;
    return useApiGet<Beat[]>(url, enabled && !!actId);
  },

  // Create a story beat
  createStoryBeat: async (data: {
    name: string;
    project_id: string;
    description?: string;
  }) => {
    return apiFetch<Beat>({
      url: BEATS_URL,
      method: 'POST',
      body: { ...data, type: 'story' },
    });
  },

  // Create an act beat
  createActBeat: async (data: {
    name: string;
    project_id: string;
    act_id: string;
    description?: string;
  }) => {
    return apiFetch<Beat>({
      url: BEATS_URL,
      method: 'POST',
      body: { ...data, type: 'act' },
    });
  },

  // Update a beat
  editBeat: async (id: string, field: string, value: string | number | boolean) => {
    return apiFetch<Beat>({
      url: `${BEATS_URL}/${id}`,
      method: 'PUT',
      body: { [field]: value },
    });
  },

  // Delete a beat
  deleteBeat: async (id: string) => {
    return apiFetch<void>({
      url: `${BEATS_URL}/${id}`,
      method: 'DELETE',
    });
  },

  // Delete all beats for a project
  deleteAllBeats: async (projectId: string) => {
    return apiFetch<void>({
      url: `${BEATS_URL}/project/${projectId}`,
      method: 'DELETE',
    });
  },
};

