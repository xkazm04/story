-- Migration: Add Video Generation Tables
-- Created: Phase 4 Migration
-- Description: Tables for video generation, storyboarding, and video editing

-- =====================================================
-- GENERATED VIDEOS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS generated_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  prompt TEXT NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  generation_id TEXT, -- External provider generation ID
  provider TEXT NOT NULL CHECK (provider IN ('runway', 'pika', 'stable-video', 'deforum', 'local')),
  model TEXT,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  duration INTEGER NOT NULL, -- Duration in seconds
  fps INTEGER NOT NULL,
  style TEXT,
  motion_strength DECIMAL(3,2), -- 0-1 scale
  seed INTEGER,
  parent_video_id UUID REFERENCES generated_videos(id) ON DELETE SET NULL,
  scene_id UUID REFERENCES scenes(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VIDEO STORYBOARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS video_storyboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_duration INTEGER, -- Total duration in seconds
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STORYBOARD FRAMES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS storyboard_frames (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storyboard_id UUID NOT NULL REFERENCES video_storyboards(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  duration INTEGER NOT NULL, -- Frame duration in seconds
  image_id UUID REFERENCES generated_images(id) ON DELETE SET NULL,
  video_id UUID REFERENCES generated_videos(id) ON DELETE SET NULL,
  transition TEXT CHECK (transition IN ('cut', 'fade', 'dissolve', 'wipe', 'zoom', 'pan')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VIDEO EDIT OPERATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS video_edit_operations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID NOT NULL REFERENCES generated_videos(id) ON DELETE CASCADE,
  operation_type TEXT NOT NULL CHECK (operation_type IN ('trim', 'merge', 'speed_change', 'style_transfer', 'upscale', 'interpolation')),
  parameters JSONB,
  result_url TEXT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- VIDEO COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS video_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  video_ids TEXT[], -- Array of video IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_generated_videos_project ON generated_videos(project_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_scene ON generated_videos(scene_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_parent ON generated_videos(parent_video_id);
CREATE INDEX IF NOT EXISTS idx_generated_videos_provider ON generated_videos(provider);
CREATE INDEX IF NOT EXISTS idx_video_storyboards_project ON video_storyboards(project_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_frames_storyboard ON storyboard_frames(storyboard_id);
CREATE INDEX IF NOT EXISTS idx_storyboard_frames_order ON storyboard_frames(storyboard_id, order_index);
CREATE INDEX IF NOT EXISTS idx_video_edit_operations_video ON video_edit_operations(video_id);
CREATE INDEX IF NOT EXISTS idx_video_edit_operations_status ON video_edit_operations(status);
CREATE INDEX IF NOT EXISTS idx_video_collections_project ON video_collections(project_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE generated_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_storyboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE storyboard_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_edit_operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_collections ENABLE ROW LEVEL SECURITY;

-- Generated videos policies
CREATE POLICY "Users can view videos in their projects" ON generated_videos
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage videos in their projects" ON generated_videos
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Video storyboards policies
CREATE POLICY "Users can view storyboards in their projects" ON video_storyboards
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage storyboards in their projects" ON video_storyboards
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Storyboard frames policies
CREATE POLICY "Users can view frames in their storyboards" ON storyboard_frames
  FOR SELECT USING (
    storyboard_id IN (
      SELECT id FROM video_storyboards WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage frames in their storyboards" ON storyboard_frames
  FOR ALL USING (
    storyboard_id IN (
      SELECT id FROM video_storyboards WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- Video edit operations policies
CREATE POLICY "Users can view edit operations for their videos" ON video_edit_operations
  FOR SELECT USING (
    video_id IN (
      SELECT id FROM generated_videos WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage edit operations for their videos" ON video_edit_operations
  FOR ALL USING (
    video_id IN (
      SELECT id FROM generated_videos WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- Video collections policies
CREATE POLICY "Users can view collections in their projects" ON video_collections
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage collections in their projects" ON video_collections
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_generated_videos_updated_at ON generated_videos;
CREATE TRIGGER update_generated_videos_updated_at
  BEFORE UPDATE ON generated_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_storyboards_updated_at ON video_storyboards;
CREATE TRIGGER update_video_storyboards_updated_at
  BEFORE UPDATE ON video_storyboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_video_collections_updated_at ON video_collections;
CREATE TRIGGER update_video_collections_updated_at
  BEFORE UPDATE ON video_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE generated_videos IS 'Generated videos with prompts and metadata';
COMMENT ON TABLE video_storyboards IS 'Video storyboards containing multiple frames';
COMMENT ON TABLE storyboard_frames IS 'Individual frames within a storyboard';
COMMENT ON TABLE video_edit_operations IS 'Video editing operations and their results';
COMMENT ON TABLE video_collections IS 'Collections/playlists of videos';

COMMENT ON COLUMN generated_videos.parent_video_id IS 'Parent video ID for variants and edits';
COMMENT ON COLUMN generated_videos.scene_id IS 'Link to scene if generated from scene';
COMMENT ON COLUMN generated_videos.provider IS 'Video generation provider: runway, pika, stable-video, deforum, local';
COMMENT ON COLUMN generated_videos.motion_strength IS 'Motion intensity level (0-1)';
COMMENT ON COLUMN storyboard_frames.order_index IS 'Order of frame in storyboard sequence';
COMMENT ON COLUMN storyboard_frames.transition IS 'Transition effect to next frame';
COMMENT ON COLUMN video_edit_operations.operation_type IS 'Type: trim, merge, speed_change, style_transfer, upscale, interpolation';
COMMENT ON COLUMN video_edit_operations.status IS 'Operation status: pending, processing, completed, failed';
