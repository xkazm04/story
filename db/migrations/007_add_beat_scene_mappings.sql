-- ============================================
-- Beat-Scene Mapping Table Migration
-- Stores AI-generated suggestions for mapping beats to scenes
-- Enables semantic beat-to-scene auto-mapping workflow
-- ============================================

-- Create beat_scene_mappings table
CREATE TABLE IF NOT EXISTS beat_scene_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    beat_id UUID NOT NULL REFERENCES beats(id) ON DELETE CASCADE,
    scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

    -- Mapping status
    status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'accepted', 'rejected', 'modified')),

    -- AI-generated data
    suggested_scene_name TEXT,
    suggested_scene_description TEXT,
    suggested_scene_script TEXT,
    suggested_location TEXT,

    -- Semantic analysis
    semantic_similarity_score DECIMAL(3,2), -- 0.00 to 1.00
    reasoning TEXT, -- AI reasoning for the suggestion

    -- Metadata
    ai_model TEXT, -- e.g., 'gpt-4', 'claude-3-sonnet'
    confidence_score DECIMAL(3,2), -- 0.00 to 1.00

    -- User interaction
    user_feedback TEXT,
    user_modified BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_beat_id ON beat_scene_mappings(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_scene_id ON beat_scene_mappings(scene_id);
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_project_id ON beat_scene_mappings(project_id);
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_status ON beat_scene_mappings(status);
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_created_at ON beat_scene_mappings(created_at DESC);

-- Composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_beat_scene_mappings_beat_status ON beat_scene_mappings(beat_id, status);

-- Add comments to table
COMMENT ON TABLE beat_scene_mappings IS 'AI-generated suggestions for mapping beats to scenes, supporting semantic beat-to-scene auto-mapping workflow';

-- Add comments to key columns
COMMENT ON COLUMN beat_scene_mappings.beat_id IS 'Reference to the beat being mapped';
COMMENT ON COLUMN beat_scene_mappings.scene_id IS 'Reference to an existing scene (NULL if suggesting new scene)';
COMMENT ON COLUMN beat_scene_mappings.status IS 'Mapping status: suggested (pending), accepted, rejected, or modified';
COMMENT ON COLUMN beat_scene_mappings.semantic_similarity_score IS 'AI-calculated similarity between beat and scene (0.00-1.00)';
COMMENT ON COLUMN beat_scene_mappings.reasoning IS 'AI explanation for why this scene matches the beat';
COMMENT ON COLUMN beat_scene_mappings.confidence_score IS 'AI confidence in the suggestion (0.00-1.00)';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_beat_scene_mappings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_beat_scene_mappings_updated_at
    BEFORE UPDATE ON beat_scene_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_beat_scene_mappings_updated_at();

-- Create trigger to set accepted_at/rejected_at timestamps
CREATE OR REPLACE FUNCTION update_beat_scene_mapping_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
        NEW.accepted_at = NOW();
    END IF;
    IF NEW.status = 'rejected' AND OLD.status != 'rejected' THEN
        NEW.rejected_at = NOW();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_beat_scene_mapping_status_timestamp
    BEFORE UPDATE ON beat_scene_mappings
    FOR EACH ROW
    EXECUTE FUNCTION update_beat_scene_mapping_status_timestamp();
