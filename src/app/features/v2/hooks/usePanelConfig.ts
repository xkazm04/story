'use client';

import { useCallback } from 'react';
import { useWorkspaceStore } from '../store/workspaceStore';
import { useAppShellStore } from '@/app/store/appShellStore';
import { getSkill } from '@/app/components/cli/skills';
import { SKILL_PANEL_CONFIGS } from '../config/skillPanelConfigs';
import type { PanelDirective, WorkspaceLayout, WorkspacePanelType } from '../types';
import type { SkillPanelConfig } from '@/app/components/cli/skills/types';

/**
 * Hook that applies skill panelConfig to the workspace when a skill starts.
 *
 * Usage: call `applySkillPanels(skillId, contextParams)` when a CLI skill begins.
 */
export function usePanelConfig() {
  const replaceAllPanels = useWorkspaceStore((s) => s.replaceAllPanels);
  const showPanels = useWorkspaceStore((s) => s.showPanels);
  const layoutMode = useAppShellStore((s) => s.layoutMode);

  const resolveProps = useCallback(
    (
      props: Record<string, unknown> | undefined,
      contextParams?: Record<string, string>
    ): Record<string, unknown> => {
      if (!props || !contextParams) return props ?? {};

      const resolved: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(props)) {
        if (typeof value === 'string' && value.startsWith('$')) {
          const paramKey = value.slice(1);
          resolved[key] = contextParams[paramKey] ?? value;
        } else {
          resolved[key] = value;
        }
      }
      return resolved;
    },
    []
  );

  const applySkillPanels = useCallback(
    (skillId: string, contextParams?: Record<string, string>) => {
      // Only apply in v2 mode
      if (layoutMode !== 'v2') return;

      // Get config from skill definition or fallback config
      const skill = getSkill(skillId);
      const config: SkillPanelConfig | undefined =
        skill?.panelConfig ?? SKILL_PANEL_CONFIGS[skillId];

      if (!config) return;

      const directives: PanelDirective[] = config.panels.map((p) => ({
        type: p.type as WorkspacePanelType,
        role: p.role as PanelDirective['role'],
        props: resolveProps(p.props, contextParams),
      }));

      if (config.clearExisting) {
        replaceAllPanels(directives, config.preferredLayout as WorkspaceLayout);
      } else {
        showPanels(directives);
      }
    },
    [layoutMode, replaceAllPanels, showPanels, resolveProps]
  );

  return { applySkillPanels };
}
