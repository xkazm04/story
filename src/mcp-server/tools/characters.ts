/**
 * Character Tools — CRUD for characters and traits
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryHttpClient } from '../http-client.js';
import type { McpConfig } from '../config.js';

const textContent = (text: string) => ({ content: [{ type: 'text' as const, text }] });
const errorContent = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });

export function registerCharacterTools(server: McpServer, config: McpConfig, client: StoryHttpClient) {
  server.tool(
    'list_characters',
    'List all characters in a project. Returns names, types, faction affiliations, and IDs. Use this to understand who exists in the story before creating or modifying characters.',
    {
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
    },
    async ({ projectId }) => {
      const pid = projectId || config.projectId;
      if (!pid) return errorContent('No projectId available.');

      const result = await client.get('/api/characters', { projectId: pid });
      if (!result.success) return errorContent(`Failed to list characters: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'get_character',
    'Get full character details including name, type, voice, backstory, appearance, faction role. Read this before generating character-specific content.',
    {
      characterId: z.string().describe('Character ID to fetch.'),
    },
    async ({ characterId }) => {
      const result = await client.get(`/api/characters/${characterId}`);
      if (!result.success) return errorContent(`Failed to get character: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'create_character',
    'Create a new character in the project. Returns the created character with its ID.',
    {
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
      name: z.string().describe('Character name.'),
      type: z.string().optional().describe('Character type (e.g., protagonist, antagonist, supporting).'),
      voice: z.string().optional().describe('Character voice/personality description.'),
      factionId: z.string().optional().describe('Faction ID to assign this character to.'),
      factionRole: z.string().optional().describe('Role within the faction.'),
    },
    async ({ projectId, name, type, voice, factionId, factionRole }) => {
      const pid = projectId || config.projectId;
      if (!pid) return errorContent('No projectId available.');

      const body: Record<string, unknown> = { name, project_id: pid };
      if (type) body.type = type;
      if (voice) body.voice = voice;
      if (factionId) body.faction_id = factionId;
      if (factionRole) body.faction_role = factionRole;

      const result = await client.post('/api/characters', body);
      if (!result.success) return errorContent(`Failed to create character: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'update_character',
    'Update character fields (name, type, voice, backstory, appearance, etc). Only include fields you want to change.',
    {
      characterId: z.string().describe('Character ID to update.'),
      updates: z.string().describe('JSON string of fields to update. Common fields: name, type, voice, avatar_url, faction_id, faction_role. Example: {"voice":"gruff","type":"antagonist"}'),
    },
    async ({ characterId, updates }) => {
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(updates); } catch { return errorContent('Invalid JSON in updates.'); }
      const result = await client.put(`/api/characters/${characterId}`, parsed);
      if (!result.success) return errorContent(`Failed to update character: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'list_traits',
    'List all traits for a character. Traits describe personality, skills, flaws, etc.',
    {
      characterId: z.string().describe('Character ID to get traits for.'),
    },
    async ({ characterId }) => {
      const result = await client.get('/api/traits', { characterId });
      if (!result.success) return errorContent(`Failed to list traits: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );
}
