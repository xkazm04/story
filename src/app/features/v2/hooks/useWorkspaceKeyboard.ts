'use client';

import { useEffect } from 'react';
import { useTerminalDockStore } from '../store/terminalDockStore';
import { useWorkspaceStore } from '../store/workspaceStore';
import { getNextLayout } from '../workspace/layoutEngine';

/**
 * Keyboard shortcuts for V2 workspace.
 *
 * | Shortcut         | Action                    |
 * |------------------|---------------------------|
 * | Ctrl+`           | Toggle terminal dock      |
 * | Ctrl+T           | New terminal tab          |
 * | Ctrl+W           | Close active terminal tab |
 * | Ctrl+Tab         | Cycle terminal tabs       |
 * | Ctrl+Shift+L     | Cycle workspace layout    |
 */
export function useWorkspaceKeyboard() {
  const toggleCollapsed = useTerminalDockStore((s) => s.toggleCollapsed);
  const createTab = useTerminalDockStore((s) => s.createTab);
  const closeTab = useTerminalDockStore((s) => s.closeTab);
  const tabs = useTerminalDockStore((s) => s.tabs);
  const activeTabId = useTerminalDockStore((s) => s.activeTabId);
  const setActiveTab = useTerminalDockStore((s) => s.setActiveTab);
  const layout = useWorkspaceStore((s) => s.layout);
  const setLayout = useWorkspaceStore((s) => s.setLayout);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      // Ctrl+` — Toggle terminal dock
      if (ctrl && e.key === '`') {
        e.preventDefault();
        toggleCollapsed();
        return;
      }

      // Ctrl+T — New terminal tab
      if (ctrl && !e.shiftKey && e.key === 't') {
        e.preventDefault();
        createTab();
        return;
      }

      // Ctrl+W — Close active terminal tab
      if (ctrl && !e.shiftKey && e.key === 'w') {
        // Only intercept if no input is focused
        const active = document.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;

        if (activeTabId) {
          e.preventDefault();
          closeTab(activeTabId);
        }
        return;
      }

      // Ctrl+Tab — Cycle terminal tabs
      if (ctrl && e.key === 'Tab') {
        e.preventDefault();
        if (tabs.length < 2) return;
        const currentIdx = tabs.findIndex((t) => t.id === activeTabId);
        const nextIdx = (currentIdx + 1) % tabs.length;
        setActiveTab(tabs[nextIdx].id);
        return;
      }

      // Ctrl+Shift+L — Cycle workspace layout
      if (ctrl && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        setLayout(getNextLayout(layout));
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    toggleCollapsed,
    createTab,
    closeTab,
    activeTabId,
    tabs,
    setActiveTab,
    layout,
    setLayout,
  ]);
}
