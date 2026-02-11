/**
 * Story Structure Tools — Acts, Beats, and narrative structure
 */

import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { StoryHttpClient } from '../http-client.js';
import type { McpConfig } from '../config.js';

const textContent = (text: string) => ({ content: [{ type: 'text' as const, text }] });
const errorContent = (text: string) => ({ content: [{ type: 'text' as const, text }], isError: true });

export function registerStoryStructureTools(server: McpServer, config: McpConfig, client: StoryHttpClient) {
  // ---- Acts ----

  server.tool(
    'list_acts',
    'List all acts in a project, ordered by sequence. Acts are the major structural divisions of the story.',
    {
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
    },
    async ({ projectId }) => {
      const pid = projectId || config.projectId;
      if (!pid) return errorContent('No projectId available.');

      const result = await client.get('/api/acts', { projectId: pid });
      if (!result.success) return errorContent(`Failed to list acts: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  // ---- Beats ----

  server.tool(
    'list_beats',
    'List beats for a project or specific act, ordered by sequence. Beats are the narrative building blocks within acts.',
    {
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
      actId: z.string().optional().describe('Act ID to filter beats by. If not provided, lists all beats in project.'),
    },
    async ({ projectId, actId }) => {
      const pid = projectId || config.projectId;
      const params: Record<string, string> = {};
      if (actId) params.actId = actId;
      else if (pid) params.projectId = pid;
      else return errorContent('No projectId or actId available.');

      const result = await client.get('/api/beats', params);
      if (!result.success) return errorContent(`Failed to list beats: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'get_beat',
    'Get full beat details including name, type, description, and associated scene.',
    {
      beatId: z.string().describe('Beat ID to fetch.'),
    },
    async ({ beatId }) => {
      const result = await client.get(`/api/beats/${beatId}`);
      if (!result.success) return errorContent(`Failed to get beat: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'create_beat',
    'Create a new beat in an act. Beats are narrative moments (e.g., introduction, conflict, resolution).',
    {
      actId: z.string().describe('Act ID to add the beat to.'),
      projectId: z.string().optional().describe('Project ID. Uses configured project if not provided.'),
      name: z.string().describe('Beat name.'),
      type: z.string().describe('Beat type (e.g., setup, conflict, resolution, climax, transition).'),
      description: z.string().optional().describe('Beat description.'),
      order: z.number().optional().describe('Position in the sequence.'),
    },
    async ({ actId, projectId, name, type, description, order }) => {
      const pid = projectId || config.projectId;
      const body: Record<string, unknown> = { name, type, act_id: actId };
      if (pid) body.project_id = pid;
      if (description) body.description = description;
      if (order !== undefined) body.order = order;

      const result = await client.post('/api/beats', body);
      if (!result.success) return errorContent(`Failed to create beat: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );

  server.tool(
    'update_beat',
    'Update beat fields (name, type, description, order, completed). Only include fields you want to change.',
    {
      beatId: z.string().describe('Beat ID to update.'),
      updates: z.string().describe('JSON string of fields to update. Common fields: name, type, description, order, completed. Example: {"name":"The Revelation","type":"climax"}'),
    },
    async ({ beatId, updates }) => {
      let parsed: Record<string, unknown>;
      try { parsed = JSON.parse(updates); } catch { return errorContent('Invalid JSON in updates.'); }
      const result = await client.put(`/api/beats/${beatId}`, parsed);
      if (!result.success) return errorContent(`Failed to update beat: ${result.error}`);

      return textContent(JSON.stringify(result.data, null, 2));
    }
  );
}
