-- ============================================
-- Migration 011: Ensure Faction Cascading Delete Constraints
-- Ensures all faction-related tables have proper ON DELETE CASCADE
-- This migration is idempotent and can be safely re-run
-- ============================================

-- Drop existing foreign key constraints if they exist (without CASCADE)
-- and recreate them with ON DELETE CASCADE

-- faction_lore table
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'faction_lore_faction_id_fkey'
        AND table_name = 'faction_lore'
    ) THEN
        ALTER TABLE faction_lore DROP CONSTRAINT faction_lore_faction_id_fkey;
    END IF;

    -- Add constraint with ON DELETE CASCADE
    ALTER TABLE faction_lore
    ADD CONSTRAINT faction_lore_faction_id_fkey
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE;
END $$;

-- faction_events table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'faction_events_faction_id_fkey'
        AND table_name = 'faction_events'
    ) THEN
        ALTER TABLE faction_events DROP CONSTRAINT faction_events_faction_id_fkey;
    END IF;

    ALTER TABLE faction_events
    ADD CONSTRAINT faction_events_faction_id_fkey
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE;
END $$;

-- faction_achievements table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'faction_achievements_faction_id_fkey'
        AND table_name = 'faction_achievements'
    ) THEN
        ALTER TABLE faction_achievements DROP CONSTRAINT faction_achievements_faction_id_fkey;
    END IF;

    ALTER TABLE faction_achievements
    ADD CONSTRAINT faction_achievements_faction_id_fkey
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE;
END $$;

-- faction_media table
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'faction_media_faction_id_fkey'
        AND table_name = 'faction_media'
    ) THEN
        ALTER TABLE faction_media DROP CONSTRAINT faction_media_faction_id_fkey;
    END IF;

    ALTER TABLE faction_media
    ADD CONSTRAINT faction_media_faction_id_fkey
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE CASCADE;
END $$;

-- faction_relationships table (both foreign keys)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'faction_relationships_faction_a_id_fkey'
        AND table_name = 'faction_relationships'
    ) THEN
        ALTER TABLE faction_relationships DROP CONSTRAINT faction_relationships_faction_a_id_fkey;
    END IF;

    ALTER TABLE faction_relationships
    ADD CONSTRAINT faction_relationships_faction_a_id_fkey
    FOREIGN KEY (faction_a_id) REFERENCES factions(id) ON DELETE CASCADE;

    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'faction_relationships_faction_b_id_fkey'
        AND table_name = 'faction_relationships'
    ) THEN
        ALTER TABLE faction_relationships DROP CONSTRAINT faction_relationships_faction_b_id_fkey;
    END IF;

    ALTER TABLE faction_relationships
    ADD CONSTRAINT faction_relationships_faction_b_id_fkey
    FOREIGN KEY (faction_b_id) REFERENCES factions(id) ON DELETE CASCADE;
END $$;

-- Ensure characters.faction_id is ON DELETE SET NULL (not CASCADE)
-- We don't want to delete characters when a faction is deleted
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'characters_faction_id_fkey'
        AND table_name = 'characters'
    ) THEN
        ALTER TABLE characters DROP CONSTRAINT characters_faction_id_fkey;
    END IF;

    ALTER TABLE characters
    ADD CONSTRAINT characters_faction_id_fkey
    FOREIGN KEY (faction_id) REFERENCES factions(id) ON DELETE SET NULL;
END $$;

-- Add comments documenting the cascade behavior
COMMENT ON TABLE faction_lore IS 'Faction lore entries - automatically deleted when faction is deleted';
COMMENT ON TABLE faction_events IS 'Faction timeline events - automatically deleted when faction is deleted';
COMMENT ON TABLE faction_achievements IS 'Faction achievements - automatically deleted when faction is deleted';
COMMENT ON TABLE faction_media IS 'Faction media gallery - automatically deleted when faction is deleted';
COMMENT ON TABLE faction_relationships IS 'Faction-to-faction relationships - automatically deleted when either faction is deleted';

-- Verify indexes exist for performance
CREATE INDEX IF NOT EXISTS idx_faction_lore_faction_id ON faction_lore(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_events_faction_id ON faction_events(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_achievements_faction_id ON faction_achievements(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_media_faction_id ON faction_media(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_relationships_faction_a ON faction_relationships(faction_a_id);
CREATE INDEX IF NOT EXISTS idx_faction_relationships_faction_b ON faction_relationships(faction_b_id);
CREATE INDEX IF NOT EXISTS idx_characters_faction_id ON characters(faction_id);
