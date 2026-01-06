import { useApiGet, API_BASE_URL } from '../../utils/api';
import { ProjectStats } from '../../api/projectStats/route';

const PROJECT_STATS_URL = `${API_BASE_URL}/projectStats`;

export const projectStatsApi = {
  // Get unified project statistics
  useProjectStats: (projectId: string, enabled: boolean = true) => {
    const url = projectId ? `${PROJECT_STATS_URL}?projectId=${projectId}` : '';
    return useApiGet<ProjectStats>(url, enabled && !!projectId);
  },
};
