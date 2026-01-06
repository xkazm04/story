-- ============================================
-- Migration 008: Add AI-related fields to factions
-- Adds support for AI-generated faction data
-- ============================================

-- Add branding column to factions table
ALTER TABLE factions
ADD COLUMN IF NOT EXISTS branding JSONB;

-- Add type column to factions table
ALTER TABLE factions
ADD COLUMN IF NOT EXISTS type TEXT;

-- Add ai_generated flag to factions table
ALTER TABLE factions
ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT FALSE;

-- Add ai_metadata column to store AI generation metadata
ALTER TABLE factions
ADD COLUMN IF NOT EXISTS ai_metadata JSONB;

-- Create faction_lore table
CREATE TABLE IF NOT EXISTS faction_lore (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('history', 'culture', 'conflicts', 'notable-figures')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by TEXT NOT NULL
);

CREATE INDEX idx_faction_lore_faction_id ON faction_lore(faction_id);
CREATE INDEX idx_faction_lore_category ON faction_lore(category);

-- Create faction_events table
CREATE TABLE IF NOT EXISTS faction_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('founding', 'battle', 'alliance', 'discovery', 'ceremony', 'conflict', 'achievement')),
    created_by TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faction_events_faction_id ON faction_events(faction_id);
CREATE INDEX idx_faction_events_date ON faction_events(date);
CREATE INDEX idx_faction_events_type ON faction_events(event_type);

-- Create faction_achievements table
CREATE TABLE IF NOT EXISTS faction_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon_url TEXT,
    earned_date TEXT NOT NULL,
    members JSONB DEFAULT '[]'::JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_faction_achievements_faction_id ON faction_achievements(faction_id);
CREATE INDEX idx_faction_achievements_earned_date ON faction_achievements(earned_date);

-- Create faction_media table
CREATE TABLE IF NOT EXISTS faction_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('logo', 'banner', 'emblem', 'screenshot', 'lore')),
    url TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    uploader_id TEXT NOT NULL,
    description TEXT
);

CREATE INDEX idx_faction_media_faction_id ON faction_media(faction_id);
CREATE INDEX idx_faction_media_type ON faction_media(type);

-- Create faction_relationships table (if not exists)
CREATE TABLE IF NOT EXISTS faction_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_a_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    faction_b_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    relationship_type TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_factions CHECK (faction_a_id != faction_b_id)
);

CREATE INDEX idx_faction_relationships_faction_a ON faction_relationships(faction_a_id);
CREATE INDEX idx_faction_relationships_faction_b ON faction_relationships(faction_b_id);

-- Comment on new columns
COMMENT ON COLUMN factions.branding IS 'JSON object containing branding colors and emblem style';
COMMENT ON COLUMN factions.type IS 'Faction type: guild, family, nation, corporation, cult, military, academic, criminal, religious, other';
COMMENT ON COLUMN factions.ai_generated IS 'Flag indicating if faction was created using AI wizard';
COMMENT ON COLUMN factions.ai_metadata IS 'Metadata about AI generation (model, timestamp, etc.)';
