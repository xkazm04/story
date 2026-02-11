'use client';

import { useCallback } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import type { PanelDirective, WorkspaceLayout, WorkspacePanelType } from '../types';

interface WorkspaceDirectiveInput {
  action: 'show' | 'hide' | 'replace' | 'clear';
  panels?: Array<{
    type: string;
    role?: string;
    props?: Record<string, unknown>;
  }>;
}

/**
 * Hook that provides workspace directive handling.
 *
 * Exposes handleToolUse() to intercept update_workspace tool calls
 * from CompactTerminal's SSE stream and apply them to the workspace store.
 */
export function useWorkspaceDirectives() {
  const showPanels = useWorkspaceStore((s) => s.showPanels);
  const hidePanels = useWorkspaceStore((s) => s.hidePanels);
  const replaceAllPanels = useWorkspaceStore((s) => s.replaceAllPanels);
  const clearPanels = useWorkspaceStore((s) => s.clearPanels);

  const applyDirective = useCallback(
    (directive: WorkspaceDirectiveInput) => {
      const panelDirectives: PanelDirective[] = (directive.panels ?? []).map((p) => ({
        type: p.type as WorkspacePanelType,
        role: p.role as PanelDirective['role'],
        props: p.props,
      }));

      switch (directive.action) {
        case 'show':
          showPanels(panelDirectives);
          break;
        case 'hide':
          hidePanels(panelDirectives.map((p) => p.type));
          break;
        case 'replace':
          replaceAllPanels(panelDirectives);
          break;
        case 'clear':
          clearPanels();
          break;
      }
    },
    [showPanels, hidePanels, replaceAllPanels, clearPanels]
  );

  /**
   * Handle a tool_use event from the CLI stream.
   * Returns true if the event was intercepted (it was an update_workspace call).
   */
  const handleToolUse = useCallback(
    (toolName: string, toolInput: Record<string, unknown>): boolean => {
      if (toolName !== 'update_workspace') return false;

      try {
        applyDirective(toolInput as unknown as WorkspaceDirectiveInput);
      } catch {
        // Silently ignore malformed directives
      }

      return true;
    },
    [applyDirective]
  );

  return { handleToolUse, applyDirective };
}
