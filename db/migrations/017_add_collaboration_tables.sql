-- Collaboration tables for real-time collaborative project workspaces

-- Table: project_collaborators
-- Tracks users who have access to collaborate on projects
CREATE TABLE IF NOT EXISTS project_collaborators (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  invited_by TEXT,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_active TIMESTAMP,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'invited', 'removed')),
  permissions TEXT, -- JSON: custom permissions override
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(project_id, user_id)
);

-- Table: collaboration_sessions
-- Tracks active WebSocket sessions for real-time collaboration
CREATE TABLE IF NOT EXISTS collaboration_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  socket_id TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_ping TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cursor_position TEXT, -- JSON: {x, y, element_id}
  active_view TEXT, -- Current view/component user is on
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(socket_id)
);

-- Table: collaboration_messages
-- In-app chat messages for project collaboration
CREATE TABLE IF NOT EXISTS collaboration_messages (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'mention', 'file')),
  metadata TEXT, -- JSON: mentions, attachments, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  edited_at TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Table: document_versions
-- Version history for collaborative editing
CREATE TABLE IF NOT EXISTS document_versions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  document_type TEXT NOT NULL, -- 'scene', 'character', 'beat', etc.
  document_id TEXT NOT NULL,
  version_number INTEGER NOT NULL,
  content TEXT NOT NULL, -- JSON snapshot of document state
  created_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  change_summary TEXT,
  metadata TEXT, -- JSON: diff, tags, etc.
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(document_type, document_id, version_number)
);

-- Table: operational_transforms
-- Conflict-free editing operations (OT/CRDT)
CREATE TABLE IF NOT EXISTS operational_transforms (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- JSON: {type, position, content, timestamp}
  client_timestamp BIGINT NOT NULL,
  server_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  applied BOOLEAN DEFAULT FALSE,
  sequence_number INTEGER,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Table: collaboration_locks
-- Optimistic locking for concurrent editing
CREATE TABLE IF NOT EXISTS collaboration_locks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_id TEXT NOT NULL,
  field_path TEXT, -- Specific field being edited (optional)
  locked_by TEXT NOT NULL,
  locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE(document_type, document_id, field_path)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_collaborators_project ON project_collaborators(project_id);
CREATE INDEX IF NOT EXISTS idx_project_collaborators_user ON project_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_project ON collaboration_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_sessions_socket ON collaboration_sessions(socket_id);
CREATE INDEX IF NOT EXISTS idx_collaboration_messages_project ON collaboration_messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_document_versions_document ON document_versions(document_type, document_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_operational_transforms_document ON operational_transforms(document_type, document_id, sequence_number);
CREATE INDEX IF NOT EXISTS idx_collaboration_locks_document ON collaboration_locks(document_type, document_id);
