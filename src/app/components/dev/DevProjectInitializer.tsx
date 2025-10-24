'use client';

import { useEffect } from 'react';
import { useProjectStore } from '@/app/store/projectStore';
import { mockProjects } from '../../../db/mockData';
import { USE_MOCK_DATA } from '@/app/config/api';

/**
 * Dev Helper Component
 * 
 * Automatically selects the first mock project when:
 * - Mock data is enabled (USE_MOCK_DATA = true)
 * - No project is currently selected
 * 
 * This makes testing easier by skipping the project selection screen.
 * 
 * Usage: Add this component to your AppShell or layout when developing
 * Remove or disable in production!
 */

interface DevProjectInitializerProps {
  autoSelect?: boolean; // Set to false to disable auto-selection
  projectIndex?: number; // Which project to select (0 = first, 1 = second, etc.)
}

const DevProjectInitializer: React.FC<DevProjectInitializerProps> = ({ 
  autoSelect = true,
  projectIndex = 0 
}) => {
  const { selectedProject, initializeWithMockProject } = useProjectStore();

  useEffect(() => {
    // Only auto-select if:
    // 1. Feature is enabled
    // 2. Mock data is being used
    // 3. No project is currently selected
    // 4. We have mock projects available
    if (autoSelect && USE_MOCK_DATA && !selectedProject && mockProjects.length > 0) {
      const projectToSelect = mockProjects[projectIndex] || mockProjects[0];
      console.log('[DEV] Auto-selecting project:', projectToSelect.name);
      initializeWithMockProject(projectToSelect);
    }
  }, [autoSelect, selectedProject, projectIndex, initializeWithMockProject]);

  // This component doesn't render anything
  return null;
};

export default DevProjectInitializer;

