-- Migration: Add Voice Management Tables
-- Created: Phase 1 Migration
-- Description: Tables for voice management, TTS configuration, and audio samples

-- =====================================================
-- VOICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS voices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_id TEXT NOT NULL UNIQUE, -- External TTS provider ID (e.g., ElevenLabs voice_id)
  name TEXT NOT NULL,
  description TEXT,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  character_id UUID REFERENCES characters(id) ON DELETE SET NULL,
  provider TEXT DEFAULT 'custom', -- 'elevenlabs' | 'openai' | 'custom'
  language TEXT DEFAULT 'en',
  gender TEXT, -- 'male' | 'female' | 'neutral'
  age_range TEXT,
  audio_sample_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VOICE CONFIGURATIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS voice_configs (
  voice_id TEXT PRIMARY KEY REFERENCES voices(voice_id) ON DELETE CASCADE,
  stability DECIMAL(3,2) DEFAULT 0.50 CHECK (stability BETWEEN 0 AND 1),
  similarity_boost DECIMAL(3,2) DEFAULT 0.75 CHECK (similarity_boost BETWEEN 0 AND 1),
  style DECIMAL(3,2) DEFAULT 0.50 CHECK (style BETWEEN 0 AND 1),
  speed DECIMAL(3,2) DEFAULT 1.00 CHECK (speed BETWEEN 0.5 AND 2.0),
  use_speaker_boost BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AUDIO SAMPLES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS audio_samples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voice_id TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  duration DECIMAL(10,2), -- Duration in seconds
  size INTEGER, -- File size in bytes
  transcription TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_voices_project ON voices(project_id);
CREATE INDEX IF NOT EXISTS idx_voices_character ON voices(character_id);
CREATE INDEX IF NOT EXISTS idx_voices_provider ON voices(provider);
CREATE INDEX IF NOT EXISTS idx_audio_samples_voice ON audio_samples(voice_id);
CREATE INDEX IF NOT EXISTS idx_voices_created_at ON voices(created_at DESC);

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE voices ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_samples ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view voices in their projects" ON voices;
DROP POLICY IF EXISTS "Users can create voices in their projects" ON voices;
DROP POLICY IF EXISTS "Users can update voices in their projects" ON voices;
DROP POLICY IF EXISTS "Users can delete voices in their projects" ON voices;

DROP POLICY IF EXISTS "Users can view voice configs for their voices" ON voice_configs;
DROP POLICY IF EXISTS "Users can manage voice configs for their voices" ON voice_configs;

DROP POLICY IF EXISTS "Users can view audio samples for their voices" ON audio_samples;
DROP POLICY IF EXISTS "Users can manage audio samples for their voices" ON audio_samples;

-- Voices policies
CREATE POLICY "Users can view voices in their projects" ON voices
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create voices in their projects" ON voices
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update voices in their projects" ON voices
  FOR UPDATE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete voices in their projects" ON voices
  FOR DELETE USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Voice configs policies
CREATE POLICY "Users can view voice configs for their voices" ON voice_configs
  FOR SELECT USING (
    voice_id IN (
      SELECT voice_id FROM voices WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage voice configs for their voices" ON voice_configs
  FOR ALL USING (
    voice_id IN (
      SELECT voice_id FROM voices WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- Audio samples policies
CREATE POLICY "Users can view audio samples for their voices" ON audio_samples
  FOR SELECT USING (
    voice_id IN (
      SELECT voice_id FROM voices WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage audio samples for their voices" ON audio_samples
  FOR ALL USING (
    voice_id IN (
      SELECT voice_id FROM voices WHERE project_id IN (
        SELECT id FROM projects WHERE user_id = auth.uid()
      )
    )
  );

-- =====================================================
-- TRIGGERS
-- =====================================================
-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_voices_updated_at ON voices;
CREATE TRIGGER update_voices_updated_at
  BEFORE UPDATE ON voices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_voice_configs_updated_at ON voice_configs;
CREATE TRIGGER update_voice_configs_updated_at
  BEFORE UPDATE ON voice_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON TABLE voices IS 'Stores voice profiles for TTS (Text-to-Speech) integration';
COMMENT ON TABLE voice_configs IS 'Configuration settings for voice synthesis (stability, similarity, style, speed)';
COMMENT ON TABLE audio_samples IS 'Audio files used for voice training/cloning';

COMMENT ON COLUMN voices.voice_id IS 'External TTS provider voice ID (e.g., ElevenLabs voice ID)';
COMMENT ON COLUMN voices.provider IS 'TTS provider: elevenlabs, openai, or custom';
COMMENT ON COLUMN voice_configs.stability IS 'Voice stability 0-1: higher = more consistent, lower = more variable';
COMMENT ON COLUMN voice_configs.similarity_boost IS 'Similarity to original 0-1: higher = closer match';
COMMENT ON COLUMN voice_configs.style IS 'Expressiveness 0-1: higher = more dramatic';
COMMENT ON COLUMN voice_configs.speed IS 'Speaking rate 0.5-2.0: 1.0 = normal speed';
