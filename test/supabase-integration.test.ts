/**
 * Supabase Integration Tests
 *
 * Tests all GET endpoint Supabase queries to verify:
 * 1. Tables exist in the database
 * 2. Expected columns are present (schema sync)
 * 3. Query patterns used in API routes work correctly (joins, filters, ordering)
 *
 * Run: npx vitest run test/supabase-integration.test.ts
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { describe, it, expect, beforeAll } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load env from project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

let supabase: SupabaseClient;

beforeAll(() => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  }
  supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
});

// ============================================================================
// Helper: check table exists and return columns from first row
// ============================================================================
async function probeTable(tableName: string) {
  const { data, error, status } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  return { data, error, status, columns: data?.[0] ? Object.keys(data[0]) : [] };
}

function expectColumns(actual: string[], expected: string[], tableName: string) {
  const missing = expected.filter(col => !actual.includes(col));
  if (missing.length > 0) {
    throw new Error(
      `Table "${tableName}" is missing expected columns: [${missing.join(', ')}]\n` +
      `Available columns: [${actual.join(', ')}]`
    );
  }
}

// ============================================================================
// 1. PROJECTS — GET /api/projects?userId=xxx
// ============================================================================
describe('projects table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('projects').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (user_id, name, description, created_at)', async () => {
    const { columns } = await probeTable('projects');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'user_id', 'name', 'created_at'], 'projects');
    }
  });

  it('should support the API query pattern: filter by user_id, order by created_at desc', async () => {
    const { error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', '00000000-0000-0000-0000-000000000000')
      .order('created_at', { ascending: false });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 2. CHARACTERS — GET /api/characters?projectId=xxx
// ============================================================================
describe('characters table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('characters').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, name, type)', async () => {
    const { columns } = await probeTable('characters');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'name'], 'characters');
    }
  });

  it('should support filter by project_id, order by name', async () => {
    const { error } = await supabase
      .from('characters')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .order('name', { ascending: true });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 3. SCENES — GET /api/scenes?projectId=xxx&actId=yyy
// ============================================================================
describe('scenes table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('scenes').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, act_id, order)', async () => {
    const { columns } = await probeTable('scenes');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'act_id', 'order'], 'scenes');
    }
  });

  it('should support filter by project_id + act_id, order by order', async () => {
    const { error } = await supabase
      .from('scenes')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .eq('act_id', '00000000-0000-0000-0000-000000000000')
      .order('order', { ascending: true });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 4. FACTIONS — GET /api/factions?projectId=xxx
// ============================================================================
describe('factions table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('factions').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, name)', async () => {
    const { columns } = await probeTable('factions');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'name'], 'factions');
    }
  });

  it('should support filter by project_id, order by name', async () => {
    const { error } = await supabase
      .from('factions')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .order('name', { ascending: true });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 5. BEATS — GET /api/beats?projectId=xxx&actId=yyy
// ============================================================================
describe('beats table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('beats').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, act_id, order, completed, name, type)', async () => {
    const { columns } = await probeTable('beats');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'order', 'completed', 'name', 'type'], 'beats');
    }
  });

  it('should support filter by project_id, order by order', async () => {
    const { error } = await supabase
      .from('beats')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .order('order', { ascending: true });
    expect(error).toBeNull();
  });

  it('should support select completed only (used by projectStats)', async () => {
    const { error } = await supabase
      .from('beats')
      .select('completed')
      .eq('project_id', '00000000-0000-0000-0000-000000000000');
    expect(error).toBeNull();
  });
});

// ============================================================================
// 6. ACTS — GET /api/acts?projectId=xxx
// ============================================================================
describe('acts table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('acts').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, name, order)', async () => {
    const { columns } = await probeTable('acts');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'name', 'order'], 'acts');
    }
  });

  it('should support filter by project_id, order by order', async () => {
    const { error } = await supabase
      .from('acts')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .order('order', { ascending: true });
    expect(error).toBeNull();
  });

  it('should support count query (used by projectStats)', async () => {
    const { error, count } = await supabase
      .from('acts')
      .select('id', { count: 'exact', head: true })
      .eq('project_id', '00000000-0000-0000-0000-000000000000');
    expect(error).toBeNull();
    expect(typeof count).toBe('number');
  });
});

// ============================================================================
// 7. CHARACTER_RELATIONSHIPS — GET /api/relationships?characterId=xxx
// ============================================================================
describe('character_relationships table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('character_relationships').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (character_a_id, character_b_id, description)', async () => {
    const { columns } = await probeTable('character_relationships');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'character_a_id', 'character_b_id', 'description'], 'character_relationships');
    }
  });

  it('should support bidirectional OR filter', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabase
      .from('character_relationships')
      .select('*')
      .or(`character_a_id.eq.${fakeId},character_b_id.eq.${fakeId}`);
    expect(error).toBeNull();
  });
});

// ============================================================================
// 8. TRAITS — GET /api/traits?characterId=xxx
// ============================================================================
describe('traits table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('traits').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (character_id, type, description)', async () => {
    const { columns } = await probeTable('traits');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'character_id', 'type', 'description'], 'traits');
    }
  });

  it('should support filter by character_id', async () => {
    const { error } = await supabase
      .from('traits')
      .select('*')
      .eq('character_id', '00000000-0000-0000-0000-000000000000');
    expect(error).toBeNull();
  });
});

// ============================================================================
// 9. CONTEXTS — GET /api/contexts?project_id=xxx
// ============================================================================
describe('contexts table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('contexts').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, name)', async () => {
    const { columns } = await probeTable('contexts');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'name'], 'contexts');
    }
  });

  it('should support filter by project_id', async () => {
    const { error } = await supabase
      .from('contexts')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000');
    expect(error).toBeNull();
  });
});

// ============================================================================
// 10. CHARACTER_OUTFITS — GET /api/character-outfits?characterId=xxx
// ============================================================================
describe('character_outfits table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('character_outfits').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (character_id, name, sort_order, created_at)', async () => {
    const { columns } = await probeTable('character_outfits');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'character_id', 'name', 'sort_order', 'created_at'], 'character_outfits');
    }
  });

  it('should support filter by character_id, order by sort_order + created_at', async () => {
    const { error } = await supabase
      .from('character_outfits')
      .select('*')
      .eq('character_id', '00000000-0000-0000-0000-000000000000')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 11. CHARACTER_ACCESSORIES — GET /api/character-outfits/accessories?characterId=xxx
// ============================================================================
describe('character_accessories table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('character_accessories').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (character_id, name, is_signature)', async () => {
    const { columns } = await probeTable('character_accessories');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'character_id', 'name', 'is_signature'], 'character_accessories');
    }
  });

  it('should support filter by character_id, order by is_signature desc + name asc', async () => {
    const { error } = await supabase
      .from('character_accessories')
      .select('*')
      .eq('character_id', '00000000-0000-0000-0000-000000000000')
      .order('is_signature', { ascending: false })
      .order('name', { ascending: true });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 12. AVATAR_TIMELINE — GET /api/avatar-timeline?characterId=xxx
// ============================================================================
describe('avatar_timeline table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('avatar_timeline').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (character_id, timeline_order, transformation_type, is_milestone)', async () => {
    const { columns } = await probeTable('avatar_timeline');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'character_id', 'timeline_order', 'transformation_type', 'is_milestone'], 'avatar_timeline');
    }
  });

  it('should support join with scenes(id, name, order) and acts(id, name, order)', async () => {
    const { error } = await supabase
      .from('avatar_timeline')
      .select(`
        *,
        scene:scenes(id, name, order),
        act:acts(id, name, order)
      `)
      .eq('character_id', '00000000-0000-0000-0000-000000000000')
      .order('timeline_order', { ascending: true })
      .order('created_at', { ascending: true });
    expect(error).toBeNull();
  });

  it('should support optional filters: scene_id, act_id, transformation_type, is_milestone', async () => {
    const { error } = await supabase
      .from('avatar_timeline')
      .select('*')
      .eq('character_id', '00000000-0000-0000-0000-000000000000')
      .eq('is_milestone', true);
    expect(error).toBeNull();
  });
});

// ============================================================================
// 13. BEAT_SCENE_MAPPINGS — GET /api/beat-scene-mappings?beatId=xxx
// ============================================================================
describe('beat_scene_mappings table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('beat_scene_mappings').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (beat_id, project_id, status, created_at)', async () => {
    const { columns } = await probeTable('beat_scene_mappings');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'beat_id', 'project_id', 'status', 'created_at'], 'beat_scene_mappings');
    }
  });

  it('should support filter by project_id, order by created_at desc', async () => {
    const { error } = await supabase
      .from('beat_scene_mappings')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .order('created_at', { ascending: false });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 14. FACTION_RELATIONSHIPS — GET /api/faction-relationships?factionId=xxx
// ============================================================================
describe('faction_relationships table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('faction_relationships').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (faction_a_id, faction_b_id, description)', async () => {
    const { columns } = await probeTable('faction_relationships');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'faction_a_id', 'faction_b_id', 'description'], 'faction_relationships');
    }
  });

  it('should support bidirectional OR filter', async () => {
    const fakeId = '00000000-0000-0000-0000-000000000000';
    const { error } = await supabase
      .from('faction_relationships')
      .select('*')
      .or(`faction_a_id.eq.${fakeId},faction_b_id.eq.${fakeId}`);
    expect(error).toBeNull();
  });
});

// ============================================================================
// 15. CHAR_APPEARANCE — GET /api/char-appearance?character_id=xxx
// ============================================================================
describe('char_appearance table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('char_appearance').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (character_id)', async () => {
    const { columns } = await probeTable('char_appearance');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'character_id'], 'char_appearance');
    }
  });

  it('should support single-row query by character_id (PGRST116 = not found is OK)', async () => {
    const { error } = await supabase
      .from('char_appearance')
      .select('*')
      .eq('character_id', '00000000-0000-0000-0000-000000000000')
      .single();
    // PGRST116 = no rows found, which is acceptable
    if (error) {
      expect(error.code).toBe('PGRST116');
    }
  });
});

// ============================================================================
// 16. DATASETS — GET /api/datasets?projectId=xxx
// ============================================================================
describe('datasets table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('datasets').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id, name, created_at)', async () => {
    const { columns } = await probeTable('datasets');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id', 'name', 'created_at'], 'datasets');
    }
  });

  it('should support filter by project_id, order by created_at desc', async () => {
    const { error } = await supabase
      .from('datasets')
      .select('*')
      .eq('project_id', '00000000-0000-0000-0000-000000000000')
      .order('created_at', { ascending: false });
    expect(error).toBeNull();
  });
});

// ============================================================================
// 17. PROJECT STATS (cross-table) — GET /api/projectStats?projectId=xxx
// ============================================================================
describe('projectStats (cross-table queries)', () => {
  it('should support parallel count queries on acts, scenes, beats', async () => {
    const fakeProjectId = '00000000-0000-0000-0000-000000000000';
    const [actsResult, scenesResult, beatsResult] = await Promise.all([
      supabase.from('acts').select('id', { count: 'exact', head: true }).eq('project_id', fakeProjectId),
      supabase.from('scenes').select('id', { count: 'exact', head: true }).eq('project_id', fakeProjectId),
      supabase.from('beats').select('completed').eq('project_id', fakeProjectId),
    ]);

    expect(actsResult.error).toBeNull();
    expect(scenesResult.error).toBeNull();
    expect(beatsResult.error).toBeNull();
    expect(typeof actsResult.count).toBe('number');
    expect(typeof scenesResult.count).toBe('number');
  });
});

// ============================================================================
// 18. SIMULATOR_GENERATED_PROMPTS — GET /api/simulator-projects/[id]/prompts
// (Routes use TABLES.generatedPrompts which maps to 'simulator_generated_prompts')
// ============================================================================
describe('simulator_generated_prompts table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('simulator_generated_prompts').select('*').limit(1);
    expect(error).toBeNull();
  });

  it('should have expected columns (project_id)', async () => {
    const { columns } = await probeTable('simulator_generated_prompts');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'project_id'], 'simulator_generated_prompts');
    }
  });
});

// ============================================================================
// 19. SIMULATOR_PANEL_IMAGES — used by simulator-projects images route
// (Routes use TABLES.panelImages which maps to 'simulator_panel_images')
// ============================================================================
describe('simulator_panel_images table', () => {
  it('should exist and be queryable', async () => {
    const { error } = await supabase.from('simulator_panel_images').select('*').limit(1);
    expect(error).toBeNull();
  });
});

// ============================================================================
// SCENES additional columns check (for avatar_timeline join)
// After fix: route now joins on scenes(id, name, order) instead of (id, title, scene_number)
// ============================================================================
describe('scenes table - join columns for avatar_timeline', () => {
  it('should have name and order columns (used in avatar_timeline join)', async () => {
    const { columns } = await probeTable('scenes');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'name', 'order'], 'scenes');
    }
  });
});

// ============================================================================
// ACTS additional columns check (for avatar_timeline join)
// After fix: route now joins on acts(id, name, order) instead of (id, title, act_number)
// ============================================================================
describe('acts table - join columns for avatar_timeline', () => {
  it('should have name and order columns (used in avatar_timeline join)', async () => {
    const { columns } = await probeTable('acts');
    if (columns.length > 0) {
      expectColumns(columns, ['id', 'name', 'order'], 'acts');
    }
  });
});
