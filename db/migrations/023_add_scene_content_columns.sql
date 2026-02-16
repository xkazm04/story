-- Add content columns to scenes table for CLI scene composition
-- These columns support the studio editor workflow where CLI writes
-- screenplay scripts, location headers, and image metadata.

ALTER TABLE scenes ADD COLUMN IF NOT EXISTS script text;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS location text;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE scenes ADD COLUMN IF NOT EXISTS image_prompt text;
