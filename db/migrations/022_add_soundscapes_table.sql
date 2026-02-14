-- Sound Lab: Soundscapes table for persisting timeline arrangements
-- Each soundscape stores the full timeline state (lane groups + clips) as JSONB

CREATE TABLE IF NOT EXISTS soundscapes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  timeline_data JSONB NOT NULL,
  transport_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for project listing queries
CREATE INDEX IF NOT EXISTS idx_soundscapes_project ON soundscapes(project_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_soundscapes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER soundscapes_updated_at_trigger
  BEFORE UPDATE ON soundscapes
  FOR EACH ROW
  EXECUTE FUNCTION update_soundscapes_updated_at();

-- RLS policies
ALTER TABLE soundscapes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "soundscapes_select" ON soundscapes
  FOR SELECT USING (true);

CREATE POLICY "soundscapes_insert" ON soundscapes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "soundscapes_update" ON soundscapes
  FOR UPDATE USING (true);

CREATE POLICY "soundscapes_delete" ON soundscapes
  FOR DELETE USING (true);

-- Comments
COMMENT ON TABLE soundscapes IS 'Sound Lab timeline arrangements with clips and transport state';
COMMENT ON COLUMN soundscapes.timeline_data IS 'Serialized LaneGroup[] — clips with HTTP storage URLs for audio';
COMMENT ON COLUMN soundscapes.transport_data IS 'Serialized TransportState — zoom, totalDuration, etc.';
