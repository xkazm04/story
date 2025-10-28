-- Migration: Add Dataset Management Tables
-- Created: Phase 2 Migration
-- Description: Tables for managing datasets (audio, image, character extractions)

-- =====================================================
-- DATASETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('image', 'audio', 'character', 'mixed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- DATASET IMAGES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS dataset_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dataset_id UUID NOT NULL REFERENCES datasets(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  internal_id TEXT, -- Reference to generated image ID
  thumbnail_url TEXT,
  tags TEXT[], -- Array of tags
  description TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIO TRANSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audio_transcriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audio_file_url TEXT NOT NULL,
  filename TEXT NOT NULL,
  transcription_text TEXT NOT NULL,
  language TEXT DEFAULT 'en',
  confidence DECIMAL(3,2),
  engine TEXT NOT NULL CHECK (engine IN ('whisper', 'elevenlabs', 'assembly', 'other')),
  duration INTEGER, -- Duration in seconds
  word_count INTEGER,
  segments JSONB, -- Array of {text, start, end, speaker_id, confidence}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CHARACTER EXTRACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS character_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audio_transcription_id UUID REFERENCES audio_transcriptions(id) ON DELETE SET NULL,
  personality_analysis TEXT NOT NULL,
  traits TEXT[], -- Array of personality traits
  speaking_style TEXT,
  emotional_range TEXT,
  extracted_quotes TEXT[], -- Array of notable quotes
  confidence_score DECIMAL(3,2) CHECK (confidence_score BETWEEN 0 AND 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- YOUTUBE EXTRACTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS youtube_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  youtube_url TEXT NOT NULL,
  video_title TEXT,
  video_duration INTEGER, -- Duration in seconds
  sample_length INTEGER NOT NULL, -- Length of each sample in minutes
  samples_generated INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- YOUTUBE SAMPLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS youtube_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  extraction_id UUID NOT NULL REFERENCES youtube_extractions(id) ON DELETE CASCADE,
  sample_number INTEGER NOT NULL,
  audio_url TEXT NOT NULL,
  start_time INTEGER NOT NULL, -- Start time in seconds
  end_time INTEGER NOT NULL, -- End time in seconds
  duration INTEGER NOT NULL, -- Duration in seconds
  file_size INTEGER, -- File size in bytes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_datasets_project ON datasets(project_id);
CREATE INDEX IF NOT EXISTS idx_datasets_type ON datasets(type);
CREATE INDEX IF NOT EXISTS idx_dataset_images_dataset ON dataset_images(dataset_id);
CREATE INDEX IF NOT EXISTS idx_dataset_images_internal ON dataset_images(internal_id);
CREATE INDEX IF NOT EXISTS idx_audio_transcriptions_filename ON audio_transcriptions(filename);
CREATE INDEX IF NOT EXISTS idx_audio_transcriptions_engine ON audio_transcriptions(engine);
CREATE INDEX IF NOT EXISTS idx_character_extractions_transcription ON character_extractions(audio_transcription_id);
CREATE INDEX IF NOT EXISTS idx_youtube_extractions_status ON youtube_extractions(status);
CREATE INDEX IF NOT EXISTS idx_youtube_samples_extraction ON youtube_samples(extraction_id);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE datasets ENABLE ROW LEVEL SECURITY;
ALTER TABLE dataset_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_transcriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_extractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE youtube_samples ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view datasets in their projects" ON datasets;
DROP POLICY IF EXISTS "Users can manage datasets in their projects" ON datasets;
DROP POLICY IF EXISTS "Users can view dataset images" ON dataset_images;
DROP POLICY IF EXISTS "Users can manage dataset images" ON dataset_images;

-- Datasets policies
CREATE POLICY "Users can view datasets in their projects" ON datasets
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage datasets in their projects" ON datasets
  FOR ALL USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Dataset images policies
CREATE POLICY "Users can view dataset images" ON dataset_images
  FOR SELECT USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage dataset images" ON dataset_images
  FOR ALL USING (
    dataset_id IN (
      SELECT id FROM datasets WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- Audio transcriptions - allow all authenticated users (shared resource)
CREATE POLICY "Authenticated users can manage transcriptions" ON audio_transcriptions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Character extractions - allow all authenticated users
CREATE POLICY "Authenticated users can manage extractions" ON character_extractions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- YouTube extractions - allow all authenticated users
CREATE POLICY "Authenticated users can manage YouTube extractions" ON youtube_extractions
  FOR ALL USING (auth.uid() IS NOT NULL);

-- YouTube samples - allow all authenticated users
CREATE POLICY "Authenticated users can manage YouTube samples" ON youtube_samples
  FOR ALL USING (auth.uid() IS NOT NULL);

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_datasets_updated_at ON datasets;
CREATE TRIGGER update_datasets_updated_at
  BEFORE UPDATE ON datasets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE datasets IS 'Datasets for organizing project assets (images, audio, etc.)';
COMMENT ON TABLE dataset_images IS 'Images within datasets with tags and metadata';
COMMENT ON TABLE audio_transcriptions IS 'Transcribed audio files with text and timing data';
COMMENT ON TABLE character_extractions IS 'Character personality analysis from audio/text';
COMMENT ON TABLE youtube_extractions IS 'YouTube video audio extraction jobs';
COMMENT ON TABLE youtube_samples IS 'Audio samples extracted from YouTube videos';

COMMENT ON COLUMN datasets.type IS 'Dataset type: image, audio, character, or mixed';
COMMENT ON COLUMN audio_transcriptions.engine IS 'Transcription engine: whisper, elevenlabs, assembly, other';
COMMENT ON COLUMN audio_transcriptions.segments IS 'JSON array of {text, start, end, speaker_id, confidence}';
COMMENT ON COLUMN character_extractions.confidence_score IS 'Confidence in personality analysis (0-1)';
COMMENT ON COLUMN youtube_extractions.status IS 'Extraction status: pending, processing, completed, failed';
