-- Migration: Add AI-generated summary and tags fields to faction_lore table
-- This enables AI-driven lore summarization and auto-tagging functionality

-- Add summary field for AI-generated bullet-point summaries
ALTER TABLE faction_lore ADD COLUMN summary TEXT;

-- Add tags field for AI-extracted searchable tags (stored as JSON array)
ALTER TABLE faction_lore ADD COLUMN tags JSONB;

-- Add timestamp for when AI analysis was generated
ALTER TABLE faction_lore ADD COLUMN ai_generated_at TIMESTAMP;

-- Create index on tags for efficient tag-based filtering
CREATE INDEX IF NOT EXISTS idx_faction_lore_tags ON faction_lore USING GIN (tags);

-- Create index on ai_generated_at for sorting by freshness
CREATE INDEX IF NOT EXISTS idx_faction_lore_ai_generated_at ON faction_lore(ai_generated_at);

-- Add comment for documentation
COMMENT ON COLUMN faction_lore.summary IS 'AI-generated concise summary in bullet-point format';
COMMENT ON COLUMN faction_lore.tags IS 'AI-extracted key themes and tags for searchability';
COMMENT ON COLUMN faction_lore.ai_generated_at IS 'Timestamp when AI analysis was generated';
