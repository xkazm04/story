'use client';

import React from 'react';
import { useTerminalDockStore } from '../../store/terminalDockStore';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useWorkspaceDirectives } from '../../hooks/useWorkspaceDirectives';
import CompactTerminal from '@/app/components/cli/CompactTerminal';
import TerminalTabBar from './TerminalTabBar';
import TerminalDockEmpty from './TerminalDockEmpty';

export default function TerminalDock() {
  const tabs = useTerminalDockStore((s) => s.tabs);
  const activeTabId = useTerminalDockStore((s) => s.activeTabId);
  const isCollapsed = useTerminalDockStore((s) => s.isCollapsed);
  const { selectedProject } = useProjectStore();
  const { handleToolUse } = useWorkspaceDirectives();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const projectPath = selectedProject?.id
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}`
    : '';

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border-t border-slate-800/60">
      {/* Tab bar — always visible */}
      <TerminalTabBar />

      {/* Terminal content — hidden when collapsed */}
      {!isCollapsed && (
        <div className="flex-1 overflow-hidden">
          {activeTab ? (
            <CompactTerminal
              key={activeTab.sessionId}
              instanceId={activeTab.sessionId}
              projectPath={projectPath}
              title={activeTab.label}
              className="h-full border-0 rounded-none"
              onToolUse={handleToolUse}
            />
          ) : (
            <TerminalDockEmpty />
          )}
        </div>
      )}
    </div>
  );
}
