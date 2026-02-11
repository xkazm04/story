'use client';

import React, { useCallback } from 'react';
import { useTerminalDockStore } from '../../store/terminalDockStore';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useWorkspaceDirectives } from '../../hooks/useWorkspaceDirectives';
import { usePanelConfig } from '../../hooks/usePanelConfig';
import { useIntentDetection } from '../../hooks/useIntentDetection';
import CompactTerminal from '@/app/components/cli/CompactTerminal';
import TerminalTabBar from './TerminalTabBar';
import TerminalDockEmpty from './TerminalDockEmpty';

export default function TerminalDock() {
  const tabs = useTerminalDockStore((s) => s.tabs);
  const activeTabId = useTerminalDockStore((s) => s.activeTabId);
  const isCollapsed = useTerminalDockStore((s) => s.isCollapsed);
  const { selectedProject, selectedSceneId } = useProjectStore();
  const { handleToolUse } = useWorkspaceDirectives();
  const { applySkillPanels } = usePanelConfig();
  const { detectIntent } = useIntentDetection();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const projectPath = selectedProject?.id
    ? `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'}`
    : '';

  // When user submits a prompt, detect intent and auto-compose workspace panels
  const handlePromptSubmit = useCallback(
    (prompt: string) => {
      const intent = detectIntent(prompt);
      if (!intent) return;

      // Build context params from current selection state
      const contextParams: Record<string, string> = {};
      if (selectedProject?.id) contextParams.projectId = selectedProject.id;
      if (selectedSceneId) contextParams.sceneId = selectedSceneId;

      applySkillPanels(intent.skillId, contextParams);
    },
    [detectIntent, applySkillPanels, selectedProject?.id, selectedSceneId]
  );

  return (
    <div className="flex flex-col h-full bg-slate-950/95 border-t border-slate-800/60">
      {/* Horizontally centered dock — 60% width */}
      <div className="mx-auto w-[60%] min-w-[480px] max-w-full flex flex-col h-full">
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
                onPromptSubmit={handlePromptSubmit}
              />
            ) : (
              <TerminalDockEmpty />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
