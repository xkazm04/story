-- Migration: Add beat dependencies and pacing support
-- Date: 2025-11-07
-- Description: Adds support for beat dependencies, duration tracking, and AI pacing suggestions

-- Add new columns to beats table for duration and pacing
ALTER TABLE beats ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS pacing_score REAL DEFAULT 0.0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS x_position REAL DEFAULT 0.0;
ALTER TABLE beats ADD COLUMN IF NOT EXISTS y_position REAL DEFAULT 0.0;

-- Create beat_dependencies table for tracking dependencies between beats
CREATE TABLE IF NOT EXISTS beat_dependencies (
  id TEXT PRIMARY KEY,
  source_beat_id TEXT NOT NULL,
  target_beat_id TEXT NOT NULL,
  dependency_type TEXT NOT NULL DEFAULT 'sequential', -- sequential, parallel, causal
  strength TEXT DEFAULT 'required', -- required, suggested, optional
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (source_beat_id) REFERENCES beats(id) ON DELETE CASCADE,
  FOREIGN KEY (target_beat_id) REFERENCES beats(id) ON DELETE CASCADE,
  UNIQUE(source_beat_id, target_beat_id)
);

-- Create beat_pacing_suggestions table for AI-driven pacing recommendations
CREATE TABLE IF NOT EXISTS beat_pacing_suggestions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  beat_id TEXT NOT NULL,
  suggestion_type TEXT NOT NULL, -- reorder, adjust_duration, merge, split
  suggested_order INTEGER,
  suggested_duration INTEGER,
  reasoning TEXT,
  confidence REAL DEFAULT 0.0,
  applied BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (beat_id) REFERENCES beats(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_beat_dependencies_source ON beat_dependencies(source_beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_dependencies_target ON beat_dependencies(target_beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_pacing_suggestions_project ON beat_pacing_suggestions(project_id);
CREATE INDEX IF NOT EXISTS idx_beat_pacing_suggestions_beat ON beat_pacing_suggestions(beat_id);
CREATE INDEX IF NOT EXISTS idx_beat_pacing_suggestions_applied ON beat_pacing_suggestions(applied);
