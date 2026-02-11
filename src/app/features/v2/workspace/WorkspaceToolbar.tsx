'use client';

import React from 'react';
import { LayoutGrid, Plus, RotateCw } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getNextLayout, LAYOUT_TEMPLATES } from './layoutEngine';
import { PANEL_REGISTRY } from './panelRegistry';
import type { WorkspacePanelType } from '../types';

export default function WorkspaceToolbar() {
  const layout = useWorkspaceStore((s) => s.layout);
  const panels = useWorkspaceStore((s) => s.panels);
  const setLayout = useWorkspaceStore((s) => s.setLayout);
  const showPanels = useWorkspaceStore((s) => s.showPanels);

  const template = LAYOUT_TEMPLATES[layout];
  const existingTypes = new Set(panels.map((p) => p.type));

  const availablePanels = Object.values(PANEL_REGISTRY).filter(
    (entry) => entry.type !== 'empty-welcome' && !existingTypes.has(entry.type)
  );

  const handleCycleLayout = () => {
    setLayout(getNextLayout(layout));
  };

  const handleAddPanel = (type: WorkspacePanelType) => {
    showPanels([{ type, role: PANEL_REGISTRY[type].defaultRole }]);
  };

  if (panels.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1 border-b border-slate-800/40 bg-slate-950/60">
      {/* Layout indicator + cycle */}
      <button
        onClick={handleCycleLayout}
        className={cn(
          'flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-medium',
          'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 transition-colors'
        )}
        title="Cycle layout"
      >
        <LayoutGrid className="w-3 h-3" />
        <span>{template.label}</span>
        <RotateCw className="w-2.5 h-2.5 text-slate-600" />
      </button>

      <div className="flex-1" />

      {/* Add panel dropdown */}
      {availablePanels.length > 0 && (
        <div className="relative group">
          <button
            className={cn(
              'flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium',
              'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors'
            )}
          >
            <Plus className="w-3 h-3" />
            <span>Add Panel</span>
          </button>

          {/* Dropdown */}
          <div className="absolute right-0 top-full mt-1 py-1 bg-slate-900 border border-slate-800/60 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[160px]">
            {availablePanels.map((entry) => {
              const Icon = entry.icon;
              return (
                <button
                  key={entry.type}
                  onClick={() => handleAddPanel(entry.type)}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-[11px] text-slate-300 hover:bg-slate-800/50 transition-colors"
                >
                  <Icon className="w-3 h-3 text-slate-500" />
                  {entry.label}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
