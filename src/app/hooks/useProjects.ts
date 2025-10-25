import { Project } from '../types/Project';
import { apiFetch, useApiGet, API_BASE_URL, USE_MOCK_DATA } from '../utils/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockProjects, simulateApiCall } from '../../../db/mockData';

const PROJECTS_URL = `${API_BASE_URL}/projects`;

export const projectApi = {
  // Get all projects for a user
  useUserProjects: (userId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Project[]>({
        queryKey: ['projects', 'user', userId],
        queryFn: async () => {
          const filtered = mockProjects.filter(p => p.user_id === userId);
          return simulateApiCall(filtered);
        },
        enabled: enabled && !!userId,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${PROJECTS_URL}?userId=${userId}`;
    return useApiGet<Project[]>(url, enabled && !!userId);
  },

  // Get a single project
  useProject: (id: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      return useQuery<Project>({
        queryKey: ['projects', id],
        queryFn: async () => {
          const project = mockProjects.find(p => p.id === id);
          if (!project) throw new Error('Project not found');
          return simulateApiCall(project);
        },
        enabled: enabled && !!id,
        staleTime: 5 * 60 * 1000,
      });
    }
    const url = `${PROJECTS_URL}/${id}`;
    return useApiGet<Project>(url, enabled && !!id);
  },

  // Create project
  createProject: async (data: {
    name: string;
    description?: string;
    user_id: string;
    type?: string;
  }) => {
    return apiFetch<Project>({
      url: PROJECTS_URL,
      method: 'POST',
      body: data,
    });
  },

  // Update project
  updateProject: async (id: string, data: Partial<Project>) => {
    return apiFetch<Project>({
      url: `${PROJECTS_URL}/${id}`,
      method: 'PUT',
      body: data,
    });
  },

  // Delete project
  deleteProject: async (id: string) => {
    return apiFetch<void>({
      url: `${PROJECTS_URL}/${id}`,
      method: 'DELETE',
    });
  },

  // Mutation hooks
  useCreateProject: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (data: { name: string; description?: string; user_id: string; type?: string }) => 
        projectApi.createProject(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  },

  useUpdateProject: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
        projectApi.updateProject(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  },

  useDeleteProject: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (id: string) => projectApi.deleteProject(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['projects'] });
      },
    });
  },
};

