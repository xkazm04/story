/**
 * Workspace Tools — Control the V2 dynamic workspace UI panels.
 *
 * The update_workspace tool is intercepted client-side by CompactTerminal.
 * The MCP server handler is a simple acknowledgment — the real work
 * happens in the browser via useWorkspaceDirectives hook.
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryHttpClient } from '../http-client.js';
import type { McpConfig } from '../config.js';

const textContent = (text: string) => ({ content: [{ type: 'text' as const, text }] });

export function registerWorkspaceTools(server: McpServer, _config: McpConfig, _client: StoryHttpClient) {
  server.tool(
    'update_workspace',
    'Control the workspace UI panels. Actions: show (add/update panels), hide (remove panels), replace (replace all), clear (remove all). Panel types: scene-editor, scene-metadata, dialogue-view, character-cards, character-detail, character-creator, story-map, beats-manager, story-evaluator, story-graph, script-editor, theme-manager, art-style, image-canvas, image-generator, voice-manager, voice-casting, scene-list, writing-desk. Use props to pass data to panels (e.g. cliAppearanceUpdate for character-creator).',
    {
      action: z.enum(['show', 'hide', 'replace', 'clear']).describe('Action to perform on workspace panels'),
      panels: z.array(z.object({
        type: z.string().describe('Panel type identifier'),
        role: z.enum(['primary', 'secondary', 'tertiary', 'sidebar']).optional().describe('Layout role for the panel'),
        props: z.record(z.string(), z.unknown()).optional().describe('Props to pass to the panel component'),
      })).optional().describe('Panels to show/hide/replace'),
    },
    async ({ action, panels }) => {
      // This tool is intercepted client-side. The MCP handler just acknowledges.
      return textContent(JSON.stringify({
        applied: true,
        action,
        panelCount: panels?.length ?? 0,
      }));
    }
  );
}
