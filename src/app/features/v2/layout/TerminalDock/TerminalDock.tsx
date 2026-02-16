'use client';

import React, { useCallback } from 'react';
import { useTerminalDockStore } from '../../store/terminalDockStore';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useWorkspaceDirectives } from '../../hooks/useWorkspaceDirectives';
import { usePanelConfig } from '../../hooks/usePanelConfig';
import { useIntentDetection } from '../../hooks/useIntentDetection';
import { useCLIDataSync } from '../../hooks/useCLIDataSync';
import { cn } from '@/app/lib/utils';
import CompactTerminal from '@/app/components/cli/CompactTerminal';
import TerminalTabBar from './TerminalTabBar';
import TerminalDockEmpty from './TerminalDockEmpty';

export default function TerminalDock() {
  const tabs = useTerminalDockStore((s) => s.tabs);
  const activeTabId = useTerminalDockStore((s) => s.activeTabId);
  const isCollapsed = useTerminalDockStore((s) => s.isCollapsed);
  const { selectedProject, selectedAct, selectedSceneId } = useProjectStore();
  const { handleToolUse: handleWorkspaceToolUse } = useWorkspaceDirectives();
  const { applySkillPanels } = usePanelConfig();
  const { detectIntent } = useIntentDetection();
  const { trackToolUse, flush } = useCLIDataSync();

  const projectPath = selectedProject?.id || '';

  // Extend workspace tool handler to also track MCP tool calls for data sync
  const handleToolUse = useCallback(
    (toolName: string, toolInput: Record<string, unknown>) => {
      trackToolUse(toolName);
      return handleWorkspaceToolUse(toolName, toolInput);
    },
    [trackToolUse, handleWorkspaceToolUse]
  );

  // Flush accumulated query invalidations when CLI execution completes
  const handleExecutionComplete = useCallback(
    (success: boolean) => {
      if (success) flush();
    },
    [flush]
  );

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
            {tabs.length > 0 ? (
              tabs.map((tab) => (
                <div
                  key={tab.sessionId}
                  className={cn(
                    'h-full',
                    tab.id === activeTabId ? 'block' : 'hidden'
                  )}
                >
                  <CompactTerminal
                    instanceId={tab.sessionId}
                    projectPath={projectPath}
                    actId={selectedAct?.id}
                    sceneId={selectedSceneId || undefined}
                    title={tab.label}
                    className="h-full border-0 rounded-none"
                    onToolUse={handleToolUse}
                    onPromptSubmit={handlePromptSubmit}
                    onExecutionComplete={handleExecutionComplete}
                  />
                </div>
              ))
            ) : (
              <TerminalDockEmpty />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
