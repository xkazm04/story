-- Migration: Add Semantic Search Embeddings Support
-- Description: Adds embedding columns to faction-related tables for semantic search using sentence transformers
-- Date: 2025-11-09

-- Add embedding column to faction_lore table
-- Store as JSON array of floats (vector representation)
-- In production, consider using pgvector extension for PostgreSQL
ALTER TABLE faction_lore ADD COLUMN embedding TEXT;

-- Add embedding column to faction_media table
ALTER TABLE faction_media ADD COLUMN embedding TEXT;

-- Add embedding column to faction_events table
ALTER TABLE faction_events ADD COLUMN embedding TEXT;

-- Add embedding column to faction_achievements table
ALTER TABLE faction_achievements ADD COLUMN embedding TEXT;

-- Add embedding column to faction_relationships table (if exists)
-- ALTER TABLE faction_relationships ADD COLUMN embedding TEXT;

-- Create index on columns that will be searched
CREATE INDEX IF NOT EXISTS idx_faction_lore_faction_id ON faction_lore(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_media_faction_id ON faction_media(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_events_faction_id ON faction_events(faction_id);
CREATE INDEX IF NOT EXISTS idx_faction_achievements_faction_id ON faction_achievements(faction_id);

-- Add metadata columns for search optimization
ALTER TABLE faction_lore ADD COLUMN searchable_content TEXT;
ALTER TABLE faction_media ADD COLUMN searchable_content TEXT;
ALTER TABLE faction_events ADD COLUMN searchable_content TEXT;
ALTER TABLE faction_achievements ADD COLUMN searchable_content TEXT;

-- Create triggers to automatically update searchable_content when data changes
-- (This is pseudo-code; actual implementation depends on your database system)

-- For SQLite:
-- You would need to manually update searchable_content via application logic

-- For PostgreSQL with tsvector:
-- CREATE TRIGGER faction_lore_search_update BEFORE INSERT OR UPDATE ON faction_lore
-- FOR EACH ROW EXECUTE FUNCTION tsvector_update_trigger(searchable_content, 'pg_catalog.english', title, content);

-- Notes for Production Implementation:
-- 1. Use pgvector extension for PostgreSQL: CREATE EXTENSION vector;
-- 2. Change embedding column type to vector(384) or vector(768) depending on model
-- 3. Create vector similarity index: CREATE INDEX ON faction_lore USING ivfflat (embedding vector_cosine_ops);
-- 4. Generate embeddings using sentence-transformers (e.g., 'all-MiniLM-L6-v2')
-- 5. Implement embedding generation on insert/update via triggers or application logic
-- 6. Consider using separate embedding service/worker for async generation
