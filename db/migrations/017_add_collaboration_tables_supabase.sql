-- Collaboration tables for real-time collaborative project workspaces (Supabase/PostgreSQL)

-- Table: project_collaborators
-- Tracks users who have access to collaborate on projects
CREATE TABLE IF NOT EXISTS project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by UUID,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed')),
  permissions JSONB, -- custom permissions override
  UNIQUE(project_id, user_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: collaboration_sessions
-- Tracks active WebSocket sessions for real-time collaboration
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  socket_id TEXT NOT NULL UNIQUE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_ping TIMESTAMPTZ DEFAULT NOW(),
  cursor_position JSONB, -- {x, y, element_id}
  active_view TEXT, -- Current view/component user is on
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: collaboration_messages
-- In-app chat messages for project collaboration
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'mention', 'file')),
  metadata JSONB, -- mentions, attachments, etc.
  created_at TIMESTAMPTZ DEFAULT NOW(),
  edited_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: document_versions
-- Version history for collaborative editing
CREATE TABLE IF NOT EXISTS document_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'scene', 'character', 'beat', etc.
  document_id UUID NOT NULL,
  version_number INTEGER NOT NULL,
  content JSONB NOT NULL, -- JSON snapshot of document state
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  change_summary TEXT,
  metadata JSONB, -- diff, tags, etc.
  UNIQUE(document_type, document_id, version_number)
);

-- Table: operational_transforms
-- Conflict-free editing operations (OT/CRDT)
CREATE TABLE IF NOT EXISTS operational_transforms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_id UUID NOT NULL,
  user_id UUID NOT NULL,
  operation JSONB NOT NULL, -- {type, position, content, timestamp}
  client_timestamp BIGINT NOT NULL,
  server_timestamp TIMESTAMPTZ DEFAULT NOW(),
  applied BOOLEAN DEFAULT FALSE,
  sequence_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: collaboration_locks
-- Optimistic locking for concurrent editing
CREATE TABLE IF NOT EXISTS collaboration_locks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_id UUID NOT NULL,
  field_path TEXT, -- Specific field being edited (optional)
  locked_by UUID NOT NULL,
  locked_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(document_type, document_id, field_path)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_status ON project_collaborators(project_id, status);

CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_project ON collaboration_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_socket ON collaboration_sessions(socket_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_active ON collaboration_sessions(project_id, last_ping);

CREATE INDEX IF NOT EXISTS idx_collaboration_messages_project ON collaboration_messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_user ON collaboration_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_not_deleted ON collaboration_messages(project_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_type, document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_project ON document_versions(project_id);

CREATE INDEX IF NOT EXISTS idx_operational_transforms_document ON operational_transforms(document_type, document_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_operational_transforms_timestamp ON operational_transforms(project_id, server_timestamp);

CREATE INDEX IF NOT EXISTS idx_collaboration_locks_document ON collaboration_locks(document_type, document_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_locks_expires ON collaboration_locks(expires_at);

-- Enable Row Level Security
ALTER TABLE project_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE operational_transforms ENABLE ROW LEVEL SECURITY;
ALTER TABLE collaboration_locks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (adjust based on your auth setup)
-- Note: These are basic policies - adjust based on your authentication system

-- project_collaborators policies
CREATE POLICY "Users can view collaborators of their projects"
  ON project_collaborators FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
    OR user_id = auth.uid()
  );

CREATE POLICY "Project owners can manage collaborators"
  ON project_collaborators FOR ALL
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- collaboration_sessions policies
CREATE POLICY "Users can view sessions of their projects"
  ON collaboration_sessions FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can manage their own sessions"
  ON collaboration_sessions FOR ALL
  USING (user_id = auth.uid());

-- collaboration_messages policies
CREATE POLICY "Collaborators can view messages"
  ON collaboration_messages FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Collaborators can send messages"
  ON collaboration_messages FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Users can edit their own messages"
  ON collaboration_messages FOR UPDATE
  USING (user_id = auth.uid());

-- document_versions policies
CREATE POLICY "Collaborators can view versions"
  ON document_versions FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

CREATE POLICY "Collaborators can create versions"
  ON document_versions FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_collaborators
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_project_collaborators_updated_at
  BEFORE UPDATE ON project_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_sessions_updated_at
  BEFORE UPDATE ON collaboration_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collaboration_messages_updated_at
  BEFORE UPDATE ON collaboration_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired locks
CREATE OR REPLACE FUNCTION cleanup_expired_locks()
RETURNS void AS $$
BEGIN
  DELETE FROM collaboration_locks WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to clean up inactive sessions
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM collaboration_sessions
  WHERE last_ping < NOW() - INTERVAL '10 minutes';
END;
$$ LANGUAGE plpgsql;
