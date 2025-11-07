-- ============================================
-- Character Appearance Table Migration
-- Stores extracted appearance data for characters
-- One-to-one relationship with characters table
-- ============================================

-- Create char_appearance table
CREATE TABLE IF NOT EXISTS char_appearance (
    character_id UUID PRIMARY KEY REFERENCES characters(id) ON DELETE CASCADE,
    
    -- Basic Attributes
    gender TEXT,
    age TEXT,
    skin_color TEXT,
    body_type TEXT,
    height TEXT,
    
    -- Facial Features
    face_shape TEXT,
    eye_color TEXT,
    hair_color TEXT,
    hair_style TEXT,
    facial_hair TEXT,
    face_features TEXT,
    
    -- Clothing & Style
    clothing_style TEXT,
    clothing_color TEXT,
    clothing_accessories TEXT,
    
    -- Additional
    custom_features TEXT,
    
    -- AI Generation Prompt
    -- Prompt to regenerate the person in different styles
    -- Focuses on the character/person only, not background or image style
    prompt TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on character_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_char_appearance_character_id ON char_appearance(character_id);

-- Add comment to table
COMMENT ON TABLE char_appearance IS 'Stores physical appearance data for characters, extracted from images or manually entered';

-- Add comments to key columns
COMMENT ON COLUMN char_appearance.character_id IS 'Foreign key to characters table (one-to-one relationship)';
COMMENT ON COLUMN char_appearance.prompt IS 'AI generation prompt for recreating the character in different styles, focusing only on the person/character';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_char_appearance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_char_appearance_updated_at
    BEFORE UPDATE ON char_appearance
    FOR EACH ROW
    EXECUTE FUNCTION update_char_appearance_updated_at();

