-- ============================================
-- Story App Database Schema
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROJECTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);

-- ============================================
-- ACTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS acts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_acts_project_id ON acts(project_id);
CREATE INDEX idx_acts_order ON acts("order");

-- ============================================
-- SCENES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scenes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    act_id UUID NOT NULL REFERENCES acts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scenes_project_id ON scenes(project_id);
CREATE INDEX idx_scenes_act_id ON scenes(act_id);
CREATE INDEX idx_scenes_order ON scenes("order");

-- ============================================
-- FACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS factions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_factions_project_id ON factions(project_id);

-- ============================================
-- CHARACTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    faction_id UUID REFERENCES factions(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    type TEXT,
    voice TEXT,
    avatar_url TEXT,
    transparent_avatar_url TEXT,
    body_url TEXT,
    transparent_body_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_characters_project_id ON characters(project_id);
CREATE INDEX idx_characters_faction_id ON characters(faction_id);

-- ============================================
-- TRAITS TABLE (Character traits/prompts)
-- ============================================
CREATE TABLE IF NOT EXISTS traits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_traits_character_id ON traits(character_id);
CREATE INDEX idx_traits_type ON traits(type);

-- ============================================
-- CHARACTER RELATIONSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS character_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_a_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    character_b_id UUID NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
    act_id UUID REFERENCES acts(id) ON DELETE SET NULL,
    relationship_type TEXT,
    description TEXT NOT NULL,
    event_date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_characters CHECK (character_a_id != character_b_id)
);

CREATE INDEX idx_char_rel_char_a ON character_relationships(character_a_id);
CREATE INDEX idx_char_rel_char_b ON character_relationships(character_b_id);
CREATE INDEX idx_char_rel_act_id ON character_relationships(act_id);

-- ============================================
-- FACTION RELATIONSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS faction_relationships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faction_a_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    faction_b_id UUID NOT NULL REFERENCES factions(id) ON DELETE CASCADE,
    relationship_type TEXT,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT different_factions CHECK (faction_a_id != faction_b_id)
);

CREATE INDEX idx_faction_rel_faction_a ON faction_relationships(faction_a_id);
CREATE INDEX idx_faction_rel_faction_b ON faction_relationships(faction_b_id);

-- ============================================
-- BEATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS beats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    act_id UUID REFERENCES acts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    paragraph_id TEXT,
    paragraph_title TEXT,
    completed BOOLEAN DEFAULT FALSE,
    default_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_beats_project_id ON beats(project_id);
CREATE INDEX idx_beats_act_id ON beats(act_id);
CREATE INDEX idx_beats_order ON beats("order");
CREATE INDEX idx_beats_completed ON beats(completed);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_acts_updated_at BEFORE UPDATE ON acts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_factions_updated_at BEFORE UPDATE ON factions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_characters_updated_at BEFORE UPDATE ON characters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_traits_updated_at BEFORE UPDATE ON traits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_character_relationships_updated_at BEFORE UPDATE ON character_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_faction_relationships_updated_at BEFORE UPDATE ON faction_relationships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beats_updated_at BEFORE UPDATE ON beats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- Enable RLS on all tables
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE acts ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE factions ENABLE ROW LEVEL SECURITY;
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE traits ENABLE ROW LEVEL SECURITY;
ALTER TABLE character_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE faction_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE beats ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- Note: These are basic policies. Adjust based on your auth setup.
-- ============================================

-- Users: Can only see/edit their own record
CREATE POLICY "Users can view own record" ON users
    FOR SELECT USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can update own record" ON users
    FOR UPDATE USING (auth.uid()::text = clerk_id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert own projects" ON projects
    FOR INSERT WITH CHECK (user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Users can update own projects" ON projects
    FOR UPDATE USING (user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.uid()::text
    ));

CREATE POLICY "Users can delete own projects" ON projects
    FOR DELETE USING (user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.uid()::text
    ));

-- Acts: Users can access acts from their projects
CREATE POLICY "Users can view acts from own projects" ON acts
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can manage acts in own projects" ON acts
    FOR ALL USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

-- Scenes: Users can access scenes from their projects
CREATE POLICY "Users can view scenes from own projects" ON scenes
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can manage scenes in own projects" ON scenes
    FOR ALL USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

-- Factions: Users can access factions from their projects
CREATE POLICY "Users can view factions from own projects" ON factions
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can manage factions in own projects" ON factions
    FOR ALL USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

-- Characters: Users can access characters from their projects
CREATE POLICY "Users can view characters from own projects" ON characters
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can manage characters in own projects" ON characters
    FOR ALL USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));

-- Traits: Users can access traits from characters in their projects
CREATE POLICY "Users can view traits from own characters" ON traits
    FOR SELECT USING (character_id IN (
        SELECT id FROM characters WHERE project_id IN (
            SELECT id FROM projects WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
    ));

CREATE POLICY "Users can manage traits in own characters" ON traits
    FOR ALL USING (character_id IN (
        SELECT id FROM characters WHERE project_id IN (
            SELECT id FROM projects WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
    ));

-- Character Relationships: Access through owned characters
CREATE POLICY "Users can view character relationships" ON character_relationships
    FOR SELECT USING (
        character_a_id IN (
            SELECT id FROM characters WHERE project_id IN (
                SELECT id FROM projects WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

CREATE POLICY "Users can manage character relationships" ON character_relationships
    FOR ALL USING (
        character_a_id IN (
            SELECT id FROM characters WHERE project_id IN (
                SELECT id FROM projects WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

-- Faction Relationships: Access through owned factions
CREATE POLICY "Users can view faction relationships" ON faction_relationships
    FOR SELECT USING (
        faction_a_id IN (
            SELECT id FROM factions WHERE project_id IN (
                SELECT id FROM projects WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

CREATE POLICY "Users can manage faction relationships" ON faction_relationships
    FOR ALL USING (
        faction_a_id IN (
            SELECT id FROM factions WHERE project_id IN (
                SELECT id FROM projects WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

-- Beats: Users can access beats from their projects
CREATE POLICY "Users can view beats from own projects" ON beats
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
        OR
        act_id IN (
            SELECT id FROM acts WHERE project_id IN (
                SELECT id FROM projects WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

CREATE POLICY "Users can manage beats in own projects" ON beats
    FOR ALL USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id IN (
                SELECT id FROM users WHERE clerk_id = auth.uid()::text
            )
        )
        OR
        act_id IN (
            SELECT id FROM acts WHERE project_id IN (
                SELECT id FROM projects WHERE user_id IN (
                    SELECT id FROM users WHERE clerk_id = auth.uid()::text
                )
            )
        )
    );

-- ============================================
-- COMPLETED
-- ============================================
-- Schema creation complete!
-- Next: Run 02_seed_data.sql to populate with initial data

