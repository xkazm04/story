/**
 * Scene Tools — CRUD for scenes and relationships
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryHttpClient } from '../http-client.js';
import type { McpConfig } from '../config.js';

const textContent = (text: string) => ({ content: [{ type: 'text' as const, text }] });
const errorContent = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });

export function registerSceneTools(server: McpServer, config: McpConfig, client: StoryHttpClient) {
  server.tool(
    'list_scenes',
    'List all scenes in a project or act, ordered by sequence. Scenes contain location, participants, dialogue, and visual descriptions.',
    {
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
      actId: z.string().optional().describe('Act ID to filter scenes by.'),
    },
    async ({ projectId, actId }) => {
      const pid = projectId || config.projectId;
      if (!pid) return errorContent('No projectId available.');

      const params: Record<string, string> = { projectId: pid };
      if (actId) params.actId = actId;

      const result = await client.get('/api/scenes', params);
      if (!result.success) return errorContent(`Failed to list scenes: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'get_scene',
    'Get full scene details including name, description, script, location, image prompt, and content.',
    {
      sceneId: z.string().describe('Scene ID to fetch.'),
    },
    async ({ sceneId }) => {
      const result = await client.get(`/api/scenes/${sceneId}`);
      if (!result.success) return errorContent(`Failed to get scene: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'update_scene',
    'Update scene fields (name, description, script, location, content, image_prompt, etc). Only include fields you want to change.',
    {
      sceneId: z.string().describe('Scene ID to update.'),
      updates: z.string().describe('JSON string of fields to update. Common fields: name, description, script, location, content, image_url, image_prompt. Example: {"location":"Castle hall","description":"A tense confrontation"}'),
    },
    async ({ sceneId, updates }) => {
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(updates); } catch { return errorContent('Invalid JSON in updates.'); }
      const result = await client.put(`/api/scenes/${sceneId}`, parsed);
      if (!result.success) return errorContent(`Failed to update scene: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  // ---- Relationships ----

  server.tool(
    'list_relationships',
    'List all relationships for a character. Shows connections to other characters with descriptions and types.',
    {
      characterId: z.string().describe('Character ID to get relationships for.'),
    },
    async ({ characterId }) => {
      const result = await client.get('/api/relationships', { characterId });
      if (!result.success) return errorContent(`Failed to list relationships: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );
}
