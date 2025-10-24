import { Scene, SceneCreateInput, SceneUpdateInput } from '../types/Scene';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../utils/api';
import { useQuery } from '@tanstack/react-query';
import { mockScenes, simulateApiCall } from '../../../db/mockData';

const SCENES_URL = `${API_BASE_URL}/scenes`;

export const sceneApi = {
  // Get all scenes for a project
  useProjectScenes: (projectId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Scene[]>({
        queryKey: ['scenes', 'project', projectId],
        queryFn: async () => {
          const filtered = mockScenes.filter(s => s.project_id === projectId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!projectId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${SCENES_URL}/project/${projectId}`;
    return useApiGet<Scene[]>(url, enabled && !!projectId);
  },

  // Get scenes by project and act
  useScenesByProjectAndAct: (projectId: string, actId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Scene[]>({
        queryKey: ['scenes', 'project', projectId, 'act', actId],
        queryFn: async () => {
          const filtered = mockScenes.filter(s => s.project_id === projectId && s.act_id === actId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!projectId && !!actId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${SCENES_URL}/project/${projectId}/act/${actId}`;
    return useApiGet<Scene[]>(url, enabled && !!projectId && !!actId);
  },

  // Get a single scene
  useScene: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Scene>({
        queryKey: ['scenes', id],
        queryFn: async () => {
          const scene = mockScenes.find(s => s.id === id);
          if (!scene) throw new Error('Scene not found');
          return simulateApiCall(scene);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${SCENES_URL}/${id}`;
    return useApiGet<Scene>(url, enabled && !!id);
  },

  // Create scene
  createScene: async (data: SceneCreateInput) => {
    return apiFetch<Scene>({
      url: SCENES_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update scene
  updateScene: async (id: string, data: SceneUpdateInput) => {
    return apiFetch<Scene>({
      url: `${SCENES_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Rename scene
  renameScene: async (id: string, name: string) => {
    return apiFetch<Scene>({
      url: `${SCENES_URL}/${id}`,
      method: 'PUT',
      body: { name },
    });
  },

  // Reorder scene
  reorderScene: async (id: string, newOrder: number) => {
    return apiFetch<Scene>({
      url: `${SCENES_URL}/${id}/reorder`,
      method: 'PUT',
      body: { order: newOrder },
    });
  },

  // Delete scene
  deleteScene: async (id: string) => {
    return apiFetch<void>({
      url: `${SCENES_URL}/${id}`,
      method: 'DELETE',
    });
  },
};

