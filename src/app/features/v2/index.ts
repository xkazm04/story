/**
 * V2 Dynamic Workspace — Public API
 */

// Layout
export { default as V2Layout } from './layout/V2Layout';
export { default as V2Provider } from './V2Provider';

// Stores
export { useWorkspaceStore } from './store/workspaceStore';
export { useTerminalDockStore } from './store/terminalDockStore';

// Hooks
export { useWorkspaceDirectives } from './hooks/useWorkspaceDirectives';
export { usePanelConfig } from './hooks/usePanelConfig';
export { useTerminalExecute } from './hooks/useTerminalExecute';
export { useWorkspaceKeyboard } from './hooks/useWorkspaceKeyboard';

// Config
export { SKILL_PANEL_CONFIGS } from './config/skillPanelConfigs';
export { DEFAULT_WORKSPACE_PRESETS } from './config/defaultWorkspacePresets';

// Types
export type {
  PanelRole,
  WorkspaceLayout,
  WorkspacePanelType,
  TerminalTab,
  WorkspacePanelInstance,
  PanelDirective,
} from './types';
