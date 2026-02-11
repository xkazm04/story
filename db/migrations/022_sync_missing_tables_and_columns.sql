-- Migration 022: Sync missing tables and columns
-- Fixes issues discovered by integration tests:
-- 1. characters.project_id may be missing from live DB
-- 2. contexts table does not exist
-- 3. avatar_timeline table does not exist
-- 4. character_outfits / character_accessories not applied (migration 020)
-- 5. beat_scene_mappings not applied (migration 007)

-- ============================================================================
-- 1. Add project_id to characters if missing
-- ============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'characters' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE characters ADD COLUMN project_id UUID REFERENCES projects(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_characters_project_id ON characters(project_id);
  END IF;
END $$;

-- ============================================================================
-- 2. Create contexts table
-- ============================================================================
CREATE TABLE IF NOT EXISTS contexts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    test_scenario TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contexts_project_id ON contexts(project_id);

-- ============================================================================
-- 3. Create avatar_timeline table
-- ============================================================================
CREATE TABLE IF NOT EXISTS avatar_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Image data
    avatar_url TEXT NOT NULL,
    thumbnail_url TEXT,

    -- Scene/Act context
    scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
    act_id UUID REFERENCES acts(id) ON DELETE SET NULL,

    -- Transformation metadata
    transformation_type TEXT NOT NULL DEFAULT 'custom',
    transformation_trigger TEXT,
    visual_changes JSONB DEFAULT '[]'::jsonb,

    -- Age tracking
    age_stage TEXT,
    estimated_age INTEGER,

    -- Flags
    is_milestone BOOLEAN DEFAULT FALSE,

    -- Notes
    notes TEXT,
    prompt_used TEXT,
    generation_params JSONB DEFAULT '{}'::jsonb,

    -- Ordering
    timeline_order INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_avatar_timeline_character ON avatar_timeline(character_id);
CREATE INDEX IF NOT EXISTS idx_avatar_timeline_scene ON avatar_timeline(scene_id);
CREATE INDEX IF NOT EXISTS idx_avatar_timeline_act ON avatar_timeline(act_id);
CREATE INDEX IF NOT EXISTS idx_avatar_timeline_order ON avatar_timeline(timeline_order);
CREATE INDEX IF NOT EXISTS idx_avatar_timeline_milestone ON avatar_timeline(character_id, is_milestone)
    WHERE is_milestone = TRUE;

-- ============================================================================
-- 4. Create character_outfits table (from migration 020, idempotent)
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE outfit_type AS ENUM (
    'default', 'casual', 'formal', 'combat', 'work', 'sleep',
    'disguise', 'ceremonial', 'athletic', 'travel', 'weather', 'custom'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE accessory_state AS ENUM (
    'worn', 'stored', 'lost', 'given', 'destroyed'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS character_outfits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    outfit_type outfit_type NOT NULL DEFAULT 'custom',
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    clothing JSONB NOT NULL DEFAULT '{}'::jsonb,
    context_tags TEXT[] DEFAULT '{}',
    suitable_locations TEXT[] DEFAULT '{}',
    suitable_weather TEXT[] DEFAULT '{}',
    suitable_time_of_day TEXT[] DEFAULT '{}',
    reference_image_url TEXT,
    thumbnail_url TEXT,
    prompt_fragment TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_character_outfits_character ON character_outfits(character_id);

-- ============================================================================
-- 5. Create character_accessories table (from migration 020, idempotent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS character_accessories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    material TEXT,
    color TEXT,
    attributes JSONB DEFAULT '{}'::jsonb,
    is_signature BOOLEAN DEFAULT FALSE,
    story_significance TEXT,
    acquired_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
    current_state accessory_state DEFAULT 'stored',
    state_changed_at TIMESTAMPTZ,
    state_changed_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
    reference_image_url TEXT,
    prompt_fragment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_character_accessories_character ON character_accessories(character_id);

-- ============================================================================
-- 6. Create beat_scene_mappings table (from migration 007, idempotent)
-- ============================================================================
CREATE TABLE IF NOT EXISTS beat_scene_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'suggested'
        CHECK (status IN ('suggested', 'accepted', 'rejected', 'modified')),
    suggested_scene_name TEXT,
    suggested_scene_description TEXT,
    suggested_scene_script TEXT,
    suggested_location TEXT,
    semantic_similarity_score DECIMAL(3,2),
    reasoning TEXT,
    ai_model TEXT,
    confidence_score DECIMAL(3,2),
    user_feedback TEXT,
    user_modified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ,
    rejected_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_beat_id ON beat_scene_mappings(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_project_id ON beat_scene_mappings(project_id);
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_status ON beat_scene_mappings(status);
