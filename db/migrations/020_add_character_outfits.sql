-- Migration: Add Character Outfits/Wardrobe System
-- This migration creates tables to support multiple outfits per character
-- with scene-context matching and accessory management

-- ============================================================================
-- Outfit Types Enum
-- ============================================================================

DO $$ BEGIN
  CREATE TYPE outfit_type AS ENUM (
    'default',      -- Character's primary/signature look
    'casual',       -- Everyday, relaxed attire
    'formal',       -- Dressy occasions, ceremonies
    'combat',       -- Battle-ready, armored
    'work',         -- Professional, occupational
    'sleep',        -- Nightwear, comfortable
    'disguise',     -- Incognito, undercover
    'ceremonial',   -- Religious, ritualistic
    'athletic',     -- Sports, training
    'travel',       -- Journey, expedition
    'weather',      -- Rain, cold, heat specific
    'custom'        -- User-defined
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Accessory state enum
DO $$ BEGIN
  CREATE TYPE accessory_state AS ENUM (
    'worn',         -- Currently wearing/carrying
    'stored',       -- In possession but not visible
    'lost',         -- No longer has it
    'given',        -- Given to another character
    'destroyed'     -- Broken/destroyed
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- Character Outfits Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS character_outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

  -- Outfit identification
  name VARCHAR(100) NOT NULL,
  outfit_type outfit_type NOT NULL DEFAULT 'custom',
  description TEXT,
  is_default BOOLEAN DEFAULT FALSE,

  -- Clothing details (expanded from simple Appearance.clothing)
  clothing JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure:
  -- {
  --   "top": { "item": "", "material": "", "color": "", "pattern": "", "condition": "" },
  --   "bottom": { "item": "", "material": "", "color": "", "pattern": "", "condition": "" },
  --   "footwear": { "item": "", "material": "", "color": "", "condition": "" },
  --   "outerwear": { "item": "", "material": "", "color": "", "condition": "" },
  --   "headwear": { "item": "", "material": "", "color": "" },
  --   "handwear": { "item": "", "material": "", "color": "" },
  --   "style_notes": "",
  --   "overall_condition": "pristine|worn|damaged|tattered",
  --   "formality": "casual|smart_casual|business|formal|ceremonial"
  -- }

  -- Context matching metadata
  context_tags TEXT[] DEFAULT '{}',
  -- Examples: ['indoor', 'outdoor', 'rainy', 'sunny', 'cold', 'hot', 'night', 'day',
  --            'combat', 'stealth', 'social', 'work', 'rest', 'travel', 'celebration']

  suitable_locations TEXT[] DEFAULT '{}',
  -- Examples: ['castle', 'tavern', 'forest', 'city', 'battlefield', 'court', 'ship']

  suitable_weather TEXT[] DEFAULT '{}',
  -- Examples: ['sunny', 'rainy', 'snowy', 'windy', 'stormy', 'foggy']

  suitable_time_of_day TEXT[] DEFAULT '{}',
  -- Examples: ['morning', 'afternoon', 'evening', 'night', 'dawn', 'dusk']

  -- Visual reference
  reference_image_url TEXT,
  thumbnail_url TEXT,

  -- AI prompt generation
  prompt_fragment TEXT,  -- Pre-generated clothing description for AI

  -- Sorting and organization
  sort_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Character Accessories Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS character_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

  -- Accessory details
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  -- Categories: 'jewelry', 'weapon', 'tool', 'bag', 'magical_item', 'personal_item',
  --             'companion', 'vehicle', 'document', 'currency', 'other'

  description TEXT,
  material TEXT,
  color TEXT,

  -- Detailed attributes
  attributes JSONB DEFAULT '{}'::jsonb,
  -- Flexible structure for category-specific details

  -- Significance
  is_signature BOOLEAN DEFAULT FALSE,  -- Character's iconic item
  story_significance TEXT,
  acquired_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,

  -- State tracking
  current_state accessory_state DEFAULT 'stored',
  state_changed_at TIMESTAMPTZ,
  state_changed_scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,

  -- Visual
  reference_image_url TEXT,
  prompt_fragment TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Outfit-Accessory Link Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS outfit_accessories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  outfit_id UUID NOT NULL REFERENCES character_outfits(id) ON DELETE CASCADE,
  accessory_id UUID NOT NULL REFERENCES character_accessories(id) ON DELETE CASCADE,

  -- How the accessory is used with this outfit
  usage_type VARCHAR(50) DEFAULT 'worn',
  -- Options: 'worn', 'carried', 'attached', 'hidden'

  position TEXT,
  -- Examples: 'around neck', 'on belt', 'in pocket', 'on back', 'in hand'

  is_visible BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(outfit_id, accessory_id)
);

-- ============================================================================
-- Outfit Timeline/History Table
-- ============================================================================

CREATE TABLE IF NOT EXISTS outfit_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES character_outfits(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,

  -- When this outfit was worn
  start_time TIMESTAMPTZ DEFAULT NOW(),
  end_time TIMESTAMPTZ,

  -- Context at time of wearing
  scene_title TEXT,
  scene_description TEXT,
  narrative_reason TEXT,  -- Why this outfit was chosen

  -- Any modifications to standard outfit
  modifications JSONB DEFAULT '{}'::jsonb,
  -- E.g., { "damage": "torn sleeve", "additions": ["borrowed cloak"] }

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes
-- ============================================================================

-- Character outfits indexes
CREATE INDEX IF NOT EXISTS idx_character_outfits_character ON character_outfits(character_id);
CREATE INDEX IF NOT EXISTS idx_character_outfits_type ON character_outfits(outfit_type);
CREATE INDEX IF NOT EXISTS idx_character_outfits_default ON character_outfits(character_id, is_default)
  WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS idx_character_outfits_context_tags ON character_outfits USING GIN(context_tags);
CREATE INDEX IF NOT EXISTS idx_character_outfits_locations ON character_outfits USING GIN(suitable_locations);
CREATE INDEX IF NOT EXISTS idx_character_outfits_weather ON character_outfits USING GIN(suitable_weather);

-- Character accessories indexes
CREATE INDEX IF NOT EXISTS idx_character_accessories_character ON character_accessories(character_id);
CREATE INDEX IF NOT EXISTS idx_character_accessories_category ON character_accessories(category);
CREATE INDEX IF NOT EXISTS idx_character_accessories_state ON character_accessories(current_state);
CREATE INDEX IF NOT EXISTS idx_character_accessories_signature ON character_accessories(character_id, is_signature)
  WHERE is_signature = TRUE;

-- Outfit accessories indexes
CREATE INDEX IF NOT EXISTS idx_outfit_accessories_outfit ON outfit_accessories(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_accessories_accessory ON outfit_accessories(accessory_id);

-- Outfit history indexes
CREATE INDEX IF NOT EXISTS idx_outfit_history_character ON outfit_history(character_id);
CREATE INDEX IF NOT EXISTS idx_outfit_history_scene ON outfit_history(scene_id);
CREATE INDEX IF NOT EXISTS idx_outfit_history_outfit ON outfit_history(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_history_time ON outfit_history(start_time);

-- ============================================================================
-- Triggers
-- ============================================================================

-- Update timestamp trigger for character_outfits
CREATE OR REPLACE FUNCTION update_outfit_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_outfit_updated
  BEFORE UPDATE ON character_outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_timestamp();

-- Update timestamp trigger for character_accessories
CREATE TRIGGER trigger_accessory_updated
  BEFORE UPDATE ON character_accessories
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_timestamp();

-- Ensure only one default outfit per character
CREATE OR REPLACE FUNCTION ensure_single_default_outfit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE character_outfits
    SET is_default = FALSE
    WHERE character_id = NEW.character_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_single_default_outfit
  BEFORE INSERT OR UPDATE OF is_default ON character_outfits
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_outfit();

-- Track accessory state changes
CREATE OR REPLACE FUNCTION track_accessory_state_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.current_state IS DISTINCT FROM NEW.current_state THEN
    NEW.state_changed_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_accessory_state_change
  BEFORE UPDATE OF current_state ON character_accessories
  FOR EACH ROW
  EXECUTE FUNCTION track_accessory_state_change();

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

ALTER TABLE character_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_accessories ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_history ENABLE ROW LEVEL SECURITY;

-- Helper function to check character ownership
CREATE OR REPLACE FUNCTION user_owns_character(char_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM characters c
    JOIN projects p ON c.project_id = p.id
    WHERE c.id = char_id AND p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Character outfits policies
CREATE POLICY "Users can view outfits for their characters"
  ON character_outfits FOR SELECT
  USING (user_owns_character(character_id));

CREATE POLICY "Users can create outfits for their characters"
  ON character_outfits FOR INSERT
  WITH CHECK (user_owns_character(character_id));

CREATE POLICY "Users can update outfits for their characters"
  ON character_outfits FOR UPDATE
  USING (user_owns_character(character_id));

CREATE POLICY "Users can delete outfits for their characters"
  ON character_outfits FOR DELETE
  USING (user_owns_character(character_id));

-- Character accessories policies
CREATE POLICY "Users can view accessories for their characters"
  ON character_accessories FOR SELECT
  USING (user_owns_character(character_id));

CREATE POLICY "Users can create accessories for their characters"
  ON character_accessories FOR INSERT
  WITH CHECK (user_owns_character(character_id));

CREATE POLICY "Users can update accessories for their characters"
  ON character_accessories FOR UPDATE
  USING (user_owns_character(character_id));

CREATE POLICY "Users can delete accessories for their characters"
  ON character_accessories FOR DELETE
  USING (user_owns_character(character_id));

-- Outfit accessories policies
CREATE POLICY "Users can view outfit-accessory links"
  ON outfit_accessories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM character_outfits o
      WHERE o.id = outfit_accessories.outfit_id
      AND user_owns_character(o.character_id)
    )
  );

CREATE POLICY "Users can create outfit-accessory links"
  ON outfit_accessories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM character_outfits o
      WHERE o.id = outfit_accessories.outfit_id
      AND user_owns_character(o.character_id)
    )
  );

CREATE POLICY "Users can delete outfit-accessory links"
  ON outfit_accessories FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM character_outfits o
      WHERE o.id = outfit_accessories.outfit_id
      AND user_owns_character(o.character_id)
    )
  );

-- Outfit history policies
CREATE POLICY "Users can view outfit history for their characters"
  ON outfit_history FOR SELECT
  USING (user_owns_character(character_id));

CREATE POLICY "Users can create outfit history for their characters"
  ON outfit_history FOR INSERT
  WITH CHECK (user_owns_character(character_id));

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Get outfits matching scene context
CREATE OR REPLACE FUNCTION get_matching_outfits(
  char_id UUID,
  location_ctx TEXT DEFAULT NULL,
  weather_ctx TEXT DEFAULT NULL,
  time_ctx TEXT DEFAULT NULL,
  tags_ctx TEXT[] DEFAULT '{}'
)
RETURNS SETOF character_outfits AS $$
SELECT o.*
FROM character_outfits o
WHERE o.character_id = char_id
  AND (location_ctx IS NULL OR location_ctx = ANY(o.suitable_locations) OR cardinality(o.suitable_locations) = 0)
  AND (weather_ctx IS NULL OR weather_ctx = ANY(o.suitable_weather) OR cardinality(o.suitable_weather) = 0)
  AND (time_ctx IS NULL OR time_ctx = ANY(o.suitable_time_of_day) OR cardinality(o.suitable_time_of_day) = 0)
  AND (cardinality(tags_ctx) = 0 OR o.context_tags && tags_ctx OR cardinality(o.context_tags) = 0)
ORDER BY
  -- Prioritize outfits with more matching context
  (CASE WHEN location_ctx = ANY(o.suitable_locations) THEN 1 ELSE 0 END +
   CASE WHEN weather_ctx = ANY(o.suitable_weather) THEN 1 ELSE 0 END +
   CASE WHEN time_ctx = ANY(o.suitable_time_of_day) THEN 1 ELSE 0 END +
   cardinality(array(SELECT unnest(tags_ctx) INTERSECT SELECT unnest(o.context_tags)))) DESC,
  o.sort_order,
  o.created_at;
$$ LANGUAGE SQL;

-- Get character's current outfit (most recent in history with no end_time)
CREATE OR REPLACE FUNCTION get_current_outfit(char_id UUID)
RETURNS character_outfits AS $$
SELECT o.*
FROM character_outfits o
JOIN outfit_history h ON o.id = h.outfit_id
WHERE h.character_id = char_id
  AND h.end_time IS NULL
ORDER BY h.start_time DESC
LIMIT 1;
$$ LANGUAGE SQL;

-- Get outfit timeline for a character
CREATE OR REPLACE FUNCTION get_outfit_timeline(char_id UUID)
RETURNS TABLE(
  outfit_id UUID,
  outfit_name VARCHAR(100),
  scene_id UUID,
  scene_title TEXT,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  narrative_reason TEXT
) AS $$
SELECT
  h.outfit_id,
  o.name,
  h.scene_id,
  h.scene_title,
  h.start_time,
  h.end_time,
  h.narrative_reason
FROM outfit_history h
JOIN character_outfits o ON h.outfit_id = o.id
WHERE h.character_id = char_id
ORDER BY h.start_time;
$$ LANGUAGE SQL;

-- Get all accessories currently worn by character
CREATE OR REPLACE FUNCTION get_worn_accessories(char_id UUID)
RETURNS SETOF character_accessories AS $$
SELECT * FROM character_accessories
WHERE character_id = char_id AND current_state = 'worn'
ORDER BY is_signature DESC, name;
$$ LANGUAGE SQL;
