'use client';

import React, { useState } from 'react';
import { Edit, Terminal, Loader2 } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useAppShellStore } from '@/app/store/appShellStore';
import { IconButton } from '../../UI/Button';
import ProjectEditModal from '@/app/features/projects/sub_projectModal/ProjectEditModal';
import ActSelector from './ActSelector';
import SceneSelector from './SceneSelector';
import CharacterSelectionBadge from '../../UI/CharacterSelectionBadge';
import { useCLISessionStore } from '@/app/components/cli/store/cliSessionStore';
import { cn } from '@/app/lib/utils';

const AppShellHeader: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const layoutMode = useAppShellStore((s) => s.layoutMode);
  const setLayoutMode = useAppShellStore((s) => s.setLayoutMode);
  // Derive primitives directly to avoid unstable array references from getActiveSessions()
  const activeCount = useCLISessionStore((s) => {
    let count = 0;
    for (const session of Object.values(s.sessions)) {
      if (session.isRunning || session.queue.some((t) => t.status === 'running')) count++;
    }
    return count;
  });
  const isAnyRunning = useCLISessionStore((s) =>
    Object.values(s.sessions).some((session) => session.isRunning)
  );

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

        {/* Right side - Layout toggle + CLI indicator + Character Selection */}
        <div className="flex items-center gap-3 text-xs text-slate-300">
          {/* V1/V2 Layout Toggle */}
          <div className="flex items-center gap-0.5 bg-slate-900/60 rounded-md border border-slate-800/50 p-0.5">
            <button
              onClick={() => setLayoutMode('v1')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                layoutMode === 'v1'
                  ? 'bg-slate-700/60 text-slate-100'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Panels
            </button>
            <button
              onClick={() => setLayoutMode('v2')}
              className={cn(
                'px-2 py-0.5 rounded text-[10px] font-medium transition-colors',
                layoutMode === 'v2'
                  ? 'bg-cyan-600/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              Workspace
            </button>
          </div>

          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-900/60 border border-slate-800/50" title={`${activeCount} CLI session(s) active`}>
              {isAnyRunning ? (
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              ) : (
                <Terminal className="w-3 h-3 text-slate-500" />
              )}
              <span className="text-[10px] font-mono text-slate-400">
                {activeCount}
              </span>
            </div>
          )}
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
