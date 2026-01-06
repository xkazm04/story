-- ============================================
-- Appearance Propagation System Migration
-- Tracks appearance changes and propagates them to story elements
-- ============================================

-- Create appearance_change_log table to track all appearance changes
CREATE TABLE IF NOT EXISTS appearance_change_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,

    -- Change tracking
    changed_fields JSONB NOT NULL, -- Fields that were changed
    old_values JSONB, -- Previous values
    new_values JSONB, -- New values

    -- Propagation status
    propagation_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    propagation_started_at TIMESTAMP WITH TIME ZONE,
    propagation_completed_at TIMESTAMP WITH TIME ZONE,

    -- Error tracking
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appearance_propagation_targets table to track what needs to be updated
CREATE TABLE IF NOT EXISTS appearance_propagation_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    change_log_id UUID NOT NULL REFERENCES appearance_change_log(id) ON DELETE CASCADE,
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,

    -- Target information
    target_type TEXT NOT NULL, -- 'scene', 'beat', 'character_bio', 'dialogue'
    target_id UUID, -- ID of the scene, beat, etc.

    -- Update status
    status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed'

    -- Generated content
    original_content TEXT,
    updated_content TEXT,
    applied BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_appearance_change_log_character_id
    ON appearance_change_log(character_id);

CREATE INDEX IF NOT EXISTS idx_appearance_change_log_project_id
    ON appearance_change_log(project_id);

CREATE INDEX IF NOT EXISTS idx_appearance_change_log_status
    ON appearance_change_log(propagation_status);

CREATE INDEX IF NOT EXISTS idx_appearance_propagation_targets_change_log_id
    ON appearance_propagation_targets(change_log_id);

CREATE INDEX IF NOT EXISTS idx_appearance_propagation_targets_status
    ON appearance_propagation_targets(status);

-- Create trigger to update updated_at timestamp for change_log
CREATE OR REPLACE FUNCTION update_appearance_change_log_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appearance_change_log_updated_at
    BEFORE UPDATE ON appearance_change_log
    FOR EACH ROW
    EXECUTE FUNCTION update_appearance_change_log_updated_at();

-- Create trigger to update updated_at timestamp for propagation_targets
CREATE OR REPLACE FUNCTION update_appearance_propagation_targets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appearance_propagation_targets_updated_at
    BEFORE UPDATE ON appearance_propagation_targets
    FOR EACH ROW
    EXECUTE FUNCTION update_appearance_propagation_targets_updated_at();

-- Create function to automatically log appearance changes
CREATE OR REPLACE FUNCTION log_appearance_change()
RETURNS TRIGGER AS $$
DECLARE
    v_character_id UUID;
    v_project_id UUID;
    v_changed_fields JSONB;
    v_old_values JSONB;
    v_new_values JSONB;
BEGIN
    v_character_id := NEW.character_id;

    -- Get project_id from character
    SELECT project_id INTO v_project_id
    FROM characters
    WHERE id = v_character_id;

    -- Build changed fields JSON
    v_changed_fields := '[]'::JSONB;
    v_old_values := '{}'::JSONB;
    v_new_values := '{}'::JSONB;

    -- Track changes to appearance fields
    IF OLD IS NOT NULL THEN
        IF OLD.gender IS DISTINCT FROM NEW.gender THEN
            v_changed_fields := v_changed_fields || '["gender"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('gender', OLD.gender);
            v_new_values := v_new_values || jsonb_build_object('gender', NEW.gender);
        END IF;

        IF OLD.age IS DISTINCT FROM NEW.age THEN
            v_changed_fields := v_changed_fields || '["age"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('age', OLD.age);
            v_new_values := v_new_values || jsonb_build_object('age', NEW.age);
        END IF;

        IF OLD.skin_color IS DISTINCT FROM NEW.skin_color THEN
            v_changed_fields := v_changed_fields || '["skin_color"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('skin_color', OLD.skin_color);
            v_new_values := v_new_values || jsonb_build_object('skin_color', NEW.skin_color);
        END IF;

        IF OLD.body_type IS DISTINCT FROM NEW.body_type THEN
            v_changed_fields := v_changed_fields || '["body_type"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('body_type', OLD.body_type);
            v_new_values := v_new_values || jsonb_build_object('body_type', NEW.body_type);
        END IF;

        IF OLD.height IS DISTINCT FROM NEW.height THEN
            v_changed_fields := v_changed_fields || '["height"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('height', OLD.height);
            v_new_values := v_new_values || jsonb_build_object('height', NEW.height);
        END IF;

        IF OLD.face_shape IS DISTINCT FROM NEW.face_shape THEN
            v_changed_fields := v_changed_fields || '["face_shape"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('face_shape', OLD.face_shape);
            v_new_values := v_new_values || jsonb_build_object('face_shape', NEW.face_shape);
        END IF;

        IF OLD.eye_color IS DISTINCT FROM NEW.eye_color THEN
            v_changed_fields := v_changed_fields || '["eye_color"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('eye_color', OLD.eye_color);
            v_new_values := v_new_values || jsonb_build_object('eye_color', NEW.eye_color);
        END IF;

        IF OLD.hair_color IS DISTINCT FROM NEW.hair_color THEN
            v_changed_fields := v_changed_fields || '["hair_color"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('hair_color', OLD.hair_color);
            v_new_values := v_new_values || jsonb_build_object('hair_color', NEW.hair_color);
        END IF;

        IF OLD.hair_style IS DISTINCT FROM NEW.hair_style THEN
            v_changed_fields := v_changed_fields || '["hair_style"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('hair_style', OLD.hair_style);
            v_new_values := v_new_values || jsonb_build_object('hair_style', NEW.hair_style);
        END IF;

        IF OLD.facial_hair IS DISTINCT FROM NEW.facial_hair THEN
            v_changed_fields := v_changed_fields || '["facial_hair"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('facial_hair', OLD.facial_hair);
            v_new_values := v_new_values || jsonb_build_object('facial_hair', NEW.facial_hair);
        END IF;

        IF OLD.face_features IS DISTINCT FROM NEW.face_features THEN
            v_changed_fields := v_changed_fields || '["face_features"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('face_features', OLD.face_features);
            v_new_values := v_new_values || jsonb_build_object('face_features', NEW.face_features);
        END IF;

        IF OLD.clothing_style IS DISTINCT FROM NEW.clothing_style THEN
            v_changed_fields := v_changed_fields || '["clothing_style"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('clothing_style', OLD.clothing_style);
            v_new_values := v_new_values || jsonb_build_object('clothing_style', NEW.clothing_style);
        END IF;

        IF OLD.clothing_color IS DISTINCT FROM NEW.clothing_color THEN
            v_changed_fields := v_changed_fields || '["clothing_color"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('clothing_color', OLD.clothing_color);
            v_new_values := v_new_values || jsonb_build_object('clothing_color', NEW.clothing_color);
        END IF;

        IF OLD.clothing_accessories IS DISTINCT FROM NEW.clothing_accessories THEN
            v_changed_fields := v_changed_fields || '["clothing_accessories"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('clothing_accessories', OLD.clothing_accessories);
            v_new_values := v_new_values || jsonb_build_object('clothing_accessories', NEW.clothing_accessories);
        END IF;

        IF OLD.custom_features IS DISTINCT FROM NEW.custom_features THEN
            v_changed_fields := v_changed_fields || '["custom_features"]'::JSONB;
            v_old_values := v_old_values || jsonb_build_object('custom_features', OLD.custom_features);
            v_new_values := v_new_values || jsonb_build_object('custom_features', NEW.custom_features);
        END IF;
    ELSE
        -- Insert case - all fields are new
        v_changed_fields := '["all"]'::JSONB;
        v_new_values := row_to_json(NEW)::JSONB;
    END IF;

    -- Only log if there are actual changes
    IF jsonb_array_length(v_changed_fields) > 0 THEN
        INSERT INTO appearance_change_log (
            character_id,
            project_id,
            changed_fields,
            old_values,
            new_values,
            propagation_status
        ) VALUES (
            v_character_id,
            v_project_id,
            v_changed_fields,
            v_old_values,
            v_new_values,
            'pending'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log appearance changes
CREATE TRIGGER trigger_log_appearance_change
    AFTER INSERT OR UPDATE ON char_appearance
    FOR EACH ROW
    EXECUTE FUNCTION log_appearance_change();

-- Add comments
COMMENT ON TABLE appearance_change_log IS 'Tracks all changes to character appearances for propagation to story elements';
COMMENT ON TABLE appearance_propagation_targets IS 'Tracks individual story elements that need to be updated when appearance changes';
COMMENT ON COLUMN appearance_change_log.propagation_status IS 'Status: pending, processing, completed, failed';
COMMENT ON COLUMN appearance_propagation_targets.target_type IS 'Type of target: scene, beat, character_bio, dialogue';
