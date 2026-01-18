-- Migration: Add Custom Archetypes System
-- This migration creates tables to support user-created custom archetypes
-- with hierarchical inheritance and override tracking

-- ============================================================================
-- Custom Archetypes Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic info
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,

  -- Hierarchy
  level VARCHAR(20) NOT NULL DEFAULT 'custom' CHECK (level IN ('base', 'genre', 'specific', 'custom')),
  parent_id UUID REFERENCES custom_archetypes(id) ON DELETE SET NULL,
  base_archetype_id VARCHAR(100), -- Reference to built-in archetype if derived from one

  -- Source tracking
  created_from_character_id UUID REFERENCES characters(id) ON DELETE SET NULL,

  -- Full archetype data stored as JSONB for flexibility
  archetype_data JSONB NOT NULL,

  -- Appearance data (denormalized for queries)
  appearance_data JSONB,

  -- Story elements
  backstory TEXT,
  motivations TEXT,
  personality TEXT,

  -- AI prompts
  image_prompt TEXT,
  story_prompt TEXT,

  -- Tags for searchability
  tags TEXT[] DEFAULT '{}',
  genres TEXT[] DEFAULT '{"all"}',

  -- Metadata
  is_public BOOLEAN DEFAULT FALSE, -- For future sharing feature
  popularity INTEGER DEFAULT 0,
  use_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Character Archetype Links
-- ============================================================================

-- Track which archetype(s) a character is based on
CREATE TABLE IF NOT EXISTS character_archetype_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

  -- Can link to either built-in or custom archetype
  builtin_archetype_id VARCHAR(100), -- e.g., 'hero-reluctant-farm-boy'
  custom_archetype_id UUID REFERENCES custom_archetypes(id) ON DELETE SET NULL,

  -- For blended archetypes, store the blend weight
  blend_weight DECIMAL(3,2) DEFAULT 1.0 CHECK (blend_weight >= 0 AND blend_weight <= 1),

  -- Override tracking - bitmap stored as base36 string
  override_mask VARCHAR(20) DEFAULT '0',

  -- Primary archetype flag (only one per character)
  is_primary BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT archetype_link_check CHECK (
    builtin_archetype_id IS NOT NULL OR custom_archetype_id IS NOT NULL
  ),
  CONSTRAINT unique_primary_archetype UNIQUE (character_id, is_primary)
    WHERE is_primary = TRUE
);

-- ============================================================================
-- Archetype Usage Analytics
-- ============================================================================

CREATE TABLE IF NOT EXISTS archetype_usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Can track both built-in and custom
  builtin_archetype_id VARCHAR(100),
  custom_archetype_id UUID REFERENCES custom_archetypes(id) ON DELETE CASCADE,

  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

  -- Usage event
  event_type VARCHAR(50) NOT NULL, -- 'applied', 'blended', 'variation_created', etc.
  event_data JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Custom archetypes indexes
CREATE INDEX IF NOT EXISTS idx_custom_archetypes_user ON custom_archetypes(user_id);
CREATE INDEX IF NOT EXISTS idx_custom_archetypes_category ON custom_archetypes(category);
CREATE INDEX IF NOT EXISTS idx_custom_archetypes_parent ON custom_archetypes(parent_id);
CREATE INDEX IF NOT EXISTS idx_custom_archetypes_tags ON custom_archetypes USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_custom_archetypes_genres ON custom_archetypes USING GIN(genres);
CREATE INDEX IF NOT EXISTS idx_custom_archetypes_public ON custom_archetypes(is_public) WHERE is_public = TRUE;

-- Character archetype links indexes
CREATE INDEX IF NOT EXISTS idx_char_archetype_links_character ON character_archetype_links(character_id);
CREATE INDEX IF NOT EXISTS idx_char_archetype_links_builtin ON character_archetype_links(builtin_archetype_id)
  WHERE builtin_archetype_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_char_archetype_links_custom ON character_archetype_links(custom_archetype_id)
  WHERE custom_archetype_id IS NOT NULL;

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_archetype_analytics_user ON archetype_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_archetype_analytics_project ON archetype_usage_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_archetype_analytics_event ON archetype_usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_archetype_analytics_created ON archetype_usage_analytics(created_at);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamp trigger for custom_archetypes
CREATE OR REPLACE FUNCTION update_custom_archetype_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_custom_archetype_updated
  BEFORE UPDATE ON custom_archetypes
  FOR EACH ROW
  EXECUTE FUNCTION update_custom_archetype_timestamp();

-- Update timestamp trigger for character_archetype_links
CREATE OR REPLACE FUNCTION update_char_archetype_link_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_char_archetype_link_updated
  BEFORE UPDATE ON character_archetype_links
  FOR EACH ROW
  EXECUTE FUNCTION update_char_archetype_link_timestamp();

-- Increment use_count when archetype is applied
CREATE OR REPLACE FUNCTION increment_archetype_use_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.custom_archetype_id IS NOT NULL THEN
    UPDATE custom_archetypes
    SET use_count = use_count + 1
    WHERE id = NEW.custom_archetype_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_archetype_use_count
  AFTER INSERT ON character_archetype_links
  FOR EACH ROW
  EXECUTE FUNCTION increment_archetype_use_count();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE custom_archetypes ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_archetype_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Custom archetypes policies
CREATE POLICY "Users can view their own archetypes"
  ON custom_archetypes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view public archetypes"
  ON custom_archetypes FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Users can create their own archetypes"
  ON custom_archetypes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own archetypes"
  ON custom_archetypes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own archetypes"
  ON custom_archetypes FOR DELETE
  USING (auth.uid() = user_id);

-- Character archetype links policies
CREATE POLICY "Users can view links for their characters"
  ON character_archetype_links FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = character_archetype_links.character_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create links for their characters"
  ON character_archetype_links FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM characters c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = character_archetype_links.character_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update links for their characters"
  ON character_archetype_links FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = character_archetype_links.character_id
      AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete links for their characters"
  ON character_archetype_links FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM characters c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = character_archetype_links.character_id
      AND p.user_id = auth.uid()
    )
  );

-- Analytics policies
CREATE POLICY "Users can view their own analytics"
  ON archetype_usage_analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics"
  ON archetype_usage_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get archetype hierarchy (all ancestors)
CREATE OR REPLACE FUNCTION get_archetype_hierarchy(archetype_id UUID)
RETURNS TABLE(
  id UUID,
  name VARCHAR(100),
  level VARCHAR(20),
  depth INTEGER
) AS $$
WITH RECURSIVE hierarchy AS (
  SELECT
    ca.id,
    ca.name,
    ca.level,
    0 AS depth
  FROM custom_archetypes ca
  WHERE ca.id = archetype_id

  UNION ALL

  SELECT
    parent.id,
    parent.name,
    parent.level,
    h.depth + 1
  FROM custom_archetypes parent
  JOIN hierarchy h ON parent.id = (
    SELECT ca2.parent_id FROM custom_archetypes ca2 WHERE ca2.id = h.id
  )
)
SELECT * FROM hierarchy ORDER BY depth DESC;
$$ LANGUAGE SQL;

-- Get archetypes compatible with a genre
CREATE OR REPLACE FUNCTION get_archetypes_by_genre(genre_filter TEXT)
RETURNS SETOF custom_archetypes AS $$
SELECT * FROM custom_archetypes
WHERE genre_filter = ANY(genres) OR 'all' = ANY(genres);
$$ LANGUAGE SQL;

-- Search archetypes by term
CREATE OR REPLACE FUNCTION search_archetypes(search_term TEXT, user_filter UUID DEFAULT NULL)
RETURNS SETOF custom_archetypes AS $$
SELECT * FROM custom_archetypes
WHERE
  (user_filter IS NULL OR user_id = user_filter OR is_public = TRUE)
  AND (
    name ILIKE '%' || search_term || '%'
    OR description ILIKE '%' || search_term || '%'
    OR search_term = ANY(tags)
  )
ORDER BY popularity DESC, use_count DESC;
$$ LANGUAGE SQL;
