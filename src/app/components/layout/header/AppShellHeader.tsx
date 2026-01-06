'use client';

import React, { useState } from 'react';
import { Edit } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { IconButton } from '../../UI/Button';
import ProjectEditModal from '@/app/features/projects/sub_projectModal/ProjectEditModal';
import ActSelector from './ActSelector';
import SceneSelector from './SceneSelector';
import CharacterSelectionBadge from '../../UI/CharacterSelectionBadge';

const AppShellHeader: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-1.5 bg-slate-950/95 border-b border-slate-800/70 backdrop-blur-sm relative z-10">
        <div className="flex items-center gap-2.5 text-sm">
          {/* Project Name with Edit Button */}
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-semibold text-slate-50 tracking-tight">
              {selectedProject?.name || 'Project'}
            </h1>
            <IconButton
              icon={<Edit size={14} />}
              size="sm"
              variant="ghost"
              onClick={() => setIsEditModalOpen(true)}
              aria-label="Edit project"
              title="Edit project details"
            />
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-800" />

          {/* Act Selector */}
          <ActSelector />

          {/* Scene Selector */}
          <SceneSelector />
        </div>

        {/* Right side - Character Selection */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          <CharacterSelectionBadge />
        </div>
      </div>

      {/* Project Edit Modal */}
      {selectedProject && (
        <ProjectEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          project={selectedProject}
        />
      )}
    </>
  );
};

export default AppShellHeader;
