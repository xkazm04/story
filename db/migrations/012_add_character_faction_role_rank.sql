-- ============================================
-- Migration 012: Add Character Faction Role and Rank
-- Adds role and rank fields to characters table for tracking
-- member roles and hierarchy within factions
-- ============================================

-- Add role column to characters table
-- Role represents the character's position (e.g., Leader, Member, Advisor, Guard, etc.)
ALTER TABLE characters ADD COLUMN IF NOT EXISTS faction_role VARCHAR(100);

-- Add rank column to characters table
-- Rank is a numeric value representing hierarchy (higher = more important)
-- This allows for granular sorting and filtering within roles
ALTER TABLE characters ADD COLUMN IF NOT EXISTS faction_rank INTEGER DEFAULT 0;

-- Create index for efficient role-based queries
CREATE INDEX IF NOT EXISTS idx_characters_faction_role ON characters(faction_role);

-- Create index for efficient rank-based queries and sorting
CREATE INDEX IF NOT EXISTS idx_characters_faction_rank ON characters(faction_rank);

-- Create composite index for efficient faction + role queries
CREATE INDEX IF NOT EXISTS idx_characters_faction_id_role ON characters(faction_id, faction_role);

-- Create composite index for efficient faction + rank queries
CREATE INDEX IF NOT EXISTS idx_characters_faction_id_rank ON characters(faction_id, faction_rank DESC);

-- Add comments documenting the new fields
COMMENT ON COLUMN characters.faction_role IS 'Character''s role within the faction (e.g., Leader, Member, Advisor, Guard, etc.)';
COMMENT ON COLUMN characters.faction_rank IS 'Numeric rank representing hierarchy within the faction (higher = more important, 0 = default/no rank)';

-- Example predefined roles (these are suggestions, not constraints):
-- 'Leader', 'Co-Leader', 'Advisor', 'Elder', 'Member', 'Recruit', 'Guard', 'Diplomat',
-- 'Scholar', 'Merchant', 'Craftsman', 'Warrior', 'Mage', 'Healer', 'Scout', 'Other'
