import { Act, ActCreateInput, ActUpdateInput } from '../../types/Act';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockActs, simulateApiCall } from '../../../../db/mockData';

const ACTS_URL = `${API_BASE_URL}/acts`;

export const actApi = {
  // Get all acts for a project
  useProjectActs: (projectId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Act[]>({
        queryKey: ['acts', 'project', projectId],
        queryFn: async () => {
          const filtered = mockActs.filter((a: Act) => a.project_id === projectId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!projectId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${ACTS_URL}?projectId=${projectId}`;
    return useApiGet<Act[]>(url, enabled && !!projectId);
  },

  // Get a single act
  useAct: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Act>({
        queryKey: ['acts', id],
        queryFn: async () => {
          const act = mockActs.find((a: Act) => a.id === id);
          if (!act) throw new Error('Act not found');
          return simulateApiCall(act);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${ACTS_URL}/${id}`;
    return useApiGet<Act>(url, enabled && !!id);
  },

  // Create act
  createAct: async (data: ActCreateInput) => {
    return apiFetch<Act>({
      url: ACTS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update act
  updateAct: async (id: string, data: ActUpdateInput) => {
    return apiFetch<Act>({
      url: `${ACTS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Rename act
  renameAct: async (id: string, name: string) => {
    return apiFetch<Act>({
      url: `${ACTS_URL}/${id}`,
      method: 'PUT',
      body: { name },
    });
  },

  // Delete act
  deleteAct: async (id: string) => {
    return apiFetch<void>({
      url: `${ACTS_URL}/${id}`,
      method: 'DELETE',
    });
  },
};

