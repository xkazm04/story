-- Migration: Add Image Generation Tables
-- Created: Phase 3 Migration
-- Description: Tables for image generation, editing, and versioning

-- =====================================================
-- GENERATED IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  generation_id TEXT, -- External provider generation ID
  provider TEXT NOT NULL CHECK (provider IN ('leonardo', 'stability', 'midjourney', 'dalle', 'local')),
  model TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  seed INTEGER,
  steps INTEGER,
  cfg_scale DECIMAL(4,2),
  sampler TEXT,
  style TEXT,
  parent_image_id UUID REFERENCES generated_images(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- IMAGE EDIT OPERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS image_edit_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_id UUID NOT NULL REFERENCES generated_images(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('upscale', 'inpaint', 'outpaint', 'remove_background', 'style_transfer', 'variation')),
  parameters JSONB,
  result_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- IMAGE COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS image_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  image_ids TEXT[], -- Array of image IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CAMERA PRESETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS camera_presets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  angles TEXT[],
  shot_types TEXT[],
  lighting TEXT[],
  composition TEXT[],
  prompt_template TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_generated_images_project ON generated_images(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_parent ON generated_images(parent_image_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_provider ON generated_images(provider);
CREATE INDEX IF NOT EXISTS idx_generated_images_generation ON generated_images(generation_id);
CREATE INDEX IF NOT EXISTS idx_image_edit_operations_image ON image_edit_operations(image_id);
CREATE INDEX IF NOT EXISTS idx_image_edit_operations_status ON image_edit_operations(status);
CREATE INDEX IF NOT EXISTS idx_image_collections_project ON image_collections(project_id);
CREATE INDEX IF NOT EXISTS idx_camera_presets_user ON camera_presets(user_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE generated_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_edit_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE image_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_presets ENABLE ROW LEVEL SECURITY;

-- Generated images policies
CREATE POLICY "Users can view images in their projects" ON generated_images
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage images in their projects" ON generated_images
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Image edit operations policies
CREATE POLICY "Users can view edit operations for their images" ON image_edit_operations
  FOR SELECT USING (
    image_id IN (
      SELECT id FROM generated_images WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage edit operations for their images" ON image_edit_operations
  FOR ALL USING (
    image_id IN (
      SELECT id FROM generated_images WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- Image collections policies
CREATE POLICY "Users can view collections in their projects" ON image_collections
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage collections in their projects" ON image_collections
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Camera presets policies
CREATE POLICY "Users can manage their own presets" ON camera_presets
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_generated_images_updated_at ON generated_images;
CREATE TRIGGER update_generated_images_updated_at
  BEFORE UPDATE ON generated_images
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_image_collections_updated_at ON image_collections;
CREATE TRIGGER update_image_collections_updated_at
  BEFORE UPDATE ON image_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE generated_images IS 'Generated images with prompts and metadata';
COMMENT ON TABLE image_edit_operations IS 'Image editing operations and their results';
COMMENT ON TABLE image_collections IS 'Collections/albums of images';
COMMENT ON TABLE camera_presets IS 'Saved camera setup presets for consistent shots';

COMMENT ON COLUMN generated_images.parent_image_id IS 'Parent image ID for variants and edits';
COMMENT ON COLUMN generated_images.provider IS 'Image generation provider: leonardo, stability, midjourney, dalle, local';
COMMENT ON COLUMN image_edit_operations.operation_type IS 'Type: upscale, inpaint, outpaint, remove_background, style_transfer, variation';
COMMENT ON COLUMN image_edit_operations.status IS 'Operation status: pending, processing, completed, failed';
