/**
 * Faction Tools — CRUD for factions
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryHttpClient } from '../http-client.js';
import type { McpConfig } from '../config.js';

const textContent = (text: string) => ({ content: [{ type: 'text' as const, text }] });
const errorContent = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });

export function registerFactionTools(server: McpServer, config: McpConfig, client: StoryHttpClient) {
  server.tool(
    'list_factions',
    'List all factions in a project. Factions represent groups, organizations, or allegiances in the story world.',
    {
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
    },
    async ({ projectId }) => {
      const pid = projectId || config.projectId;
      if (!pid) return errorContent('No projectId available.');

      const result = await client.get('/api/factions', { projectId: pid });
      if (!result.success) return errorContent(`Failed to list factions: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'get_faction',
    'Get full faction details including description, lore, branding, and member characters.',
    {
      factionId: z.string().describe('Faction ID to fetch.'),
    },
    async ({ factionId }) => {
      const result = await client.get(`/api/factions/${factionId}`);
      if (!result.success) return errorContent(`Failed to get faction: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'update_faction',
    'Update faction fields (name, description, color, branding). Only include fields you want to change.',
    {
      factionId: z.string().describe('Faction ID to update.'),
      updates: z.string().describe('JSON string of fields to update. Common fields: name, description, color, logo_url, branding. Example: {"name":"The Order","color":"#ff0000"}'),
    },
    async ({ factionId, updates }) => {
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(updates); } catch { return errorContent('Invalid JSON in updates.'); }
      const result = await client.put(`/api/factions/${factionId}`, parsed);
      if (!result.success) return errorContent(`Failed to update faction: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );
}
