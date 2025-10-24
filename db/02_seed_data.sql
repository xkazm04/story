-- ============================================
-- Story App Seed Data
-- Populates database with test data
-- ============================================

-- ============================================
-- USERS
-- ============================================
INSERT INTO users (id, clerk_id, email, name, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'user_mock123', 'test@example.com', 'Test User', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PROJECTS
-- ============================================
INSERT INTO projects (id, user_id, name, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Epic Fantasy Saga', 'A tale of dragons, magic, and ancient prophecies', '2024-01-15T10:00:00Z', '2024-01-20T15:30:00Z'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Cyberpunk Chronicles', 'Dark future, neon lights, and corporate espionage', '2024-02-01T08:00:00Z', '2024-02-10T12:00:00Z'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Mystery at Moonlight Manor', 'A detective story set in a haunted Victorian mansion', '2024-03-05T14:00:00Z', '2024-03-05T14:00:00Z')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ACTS
-- ============================================
INSERT INTO acts (id, project_id, name, description, "order", created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440101', '550e8400-e29b-41d4-a716-446655440001', 'The Awakening', 'The hero discovers their destiny', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440102', '550e8400-e29b-41d4-a716-446655440001', 'Trials and Tribulations', 'Tests of courage and wisdom', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440103', '550e8400-e29b-41d4-a716-446655440001', 'The Final Stand', 'Epic confrontation with darkness', 3, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SCENES
-- ============================================
INSERT INTO scenes (id, project_id, act_id, name, description, "order", created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440201', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'Prophecy Revealed', 'An ancient scroll foretells the coming storm', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440202', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'First Meeting', 'Unlikely allies cross paths', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440203', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'Village Under Siege', 'The first taste of danger', 3, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440204', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Mountain Trial', 'Climbing the forbidden peaks', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440205', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Betrayal in the Shadows', 'Trust is broken', 2, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440206', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440103', 'March to Battle', 'Armies assemble for the final conflict', 1, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440207', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440103', 'The Last Dawn', 'Victory at great cost', 2, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FACTIONS
-- ============================================
INSERT INTO factions (id, project_id, name, description, color, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440001', 'The Silver Order', 'Ancient order of knights sworn to protect the realm', '#3b82f6', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440001', 'Dragon Clan', 'Nomadic warriors who ride dragons', '#ef4444', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440303', '550e8400-e29b-41d4-a716-446655440001', 'Shadow Guild', 'Secretive organization of spies and assassins', '#6b7280', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CHARACTERS
-- ============================================
INSERT INTO characters (id, project_id, faction_id, name, type, voice, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440301', 'Aldric Stormwind', 'Key', 'deep-male', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440303', 'Lyra Shadowmoon', 'Key', 'female-mysterious', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440403', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440302', 'Theron Drakehart', 'Major', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440404', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440301', 'Elara Brightshield', 'Major', NULL, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440405', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Morgath the Dark', 'Minor', 'villain-deep', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440406', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440303', 'Raven Swift', 'Minor', NULL, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TRAITS
-- ============================================
INSERT INTO traits (id, character_id, type, description, created_at, updated_at) VALUES
-- Aldric Stormwind traits
('550e8400-e29b-41d4-a716-446655440501', '550e8400-e29b-41d4-a716-446655440401', 'about', 'Noble knight and leader of the Silver Order', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440502', '550e8400-e29b-41d4-a716-446655440401', 'personality', 'Honorable, brave, and fiercely loyal', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440503', '550e8400-e29b-41d4-a716-446655440401', 'background', 'Raised in the capital, trained since childhood', NOW(), NOW()),
-- Lyra Shadowmoon traits
('550e8400-e29b-41d4-a716-446655440504', '550e8400-e29b-41d4-a716-446655440402', 'about', 'Master spy and assassin with a mysterious past', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440505', '550e8400-e29b-41d4-a716-446655440402', 'personality', 'Cunning, independent, and morally ambiguous', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440506', '550e8400-e29b-41d4-a716-446655440402', 'background', 'Orphaned as a child, recruited by the Shadow Guild', NOW(), NOW()),
-- Theron Drakehart traits
('550e8400-e29b-41d4-a716-446655440507', '550e8400-e29b-41d4-a716-446655440403', 'about', 'Dragon rider and prince of the nomadic clans', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440508', '550e8400-e29b-41d4-a716-446655440403', 'personality', 'Proud, passionate, quick-tempered', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- CHARACTER RELATIONSHIPS
-- ============================================
INSERT INTO character_relationships (id, character_a_id, character_b_id, relationship_type, description, act_id, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440601', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440402', 'Allies', 'Reluctant allies brought together by necessity', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440602', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440403', 'Rivals', 'Old rivalry from their youth, competing for glory', '550e8400-e29b-41d4-a716-446655440101', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440603', '550e8400-e29b-41d4-a716-446655440402', '550e8400-e29b-41d4-a716-446655440403', 'Romantic', 'Secret romance that could change everything', '550e8400-e29b-41d4-a716-446655440102', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440604', '550e8400-e29b-41d4-a716-446655440401', '550e8400-e29b-41d4-a716-446655440405', 'Enemies', 'Sworn enemies locked in eternal conflict', '550e8400-e29b-41d4-a716-446655440103', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- FACTION RELATIONSHIPS
-- ============================================
INSERT INTO faction_relationships (id, faction_a_id, faction_b_id, relationship_type, description, created_at, updated_at) VALUES
('550e8400-e29b-41d4-a716-446655440701', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440302', 'Neutral', 'Mutual respect but different values', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440702', '550e8400-e29b-41d4-a716-446655440301', '550e8400-e29b-41d4-a716-446655440303', 'Hostile', 'Deep mistrust of secretive methods', NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440703', '550e8400-e29b-41d4-a716-446655440302', '550e8400-e29b-41d4-a716-446655440303', 'Allied', 'Temporary alliance against common enemy', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BEATS
-- ============================================
INSERT INTO beats (id, project_id, act_id, name, type, description, "order", completed, created_at, updated_at) VALUES
-- Story-level beats
('550e8400-e29b-41d4-a716-446655440801', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Introduction', 'story', 'Introduce the world and main characters', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440802', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Inciting Incident', 'story', 'The event that sets everything in motion', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440803', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Rising Action', 'story', 'Build tension and develop conflicts', 3, false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440804', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Climax', 'story', 'The peak moment of the story', 4, false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440805', '550e8400-e29b-41d4-a716-446655440001', NULL, 'Resolution', 'story', 'Wrap up loose ends and conclude', 5, false, NOW(), NOW()),
-- Act 1 beats
('550e8400-e29b-41d4-a716-446655440806', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'Meet the Hero', 'act', 'Introduce Aldric in his element', 1, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440807', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'Call to Adventure', 'act', 'The prophecy is discovered', 2, true, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440808', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440101', 'First Challenge', 'act', 'Village under attack', 3, false, NOW(), NOW()),
-- Act 2 beats
('550e8400-e29b-41d4-a716-446655440809', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Training Montage', 'act', 'Heroes prepare and grow stronger', 1, false, NOW(), NOW()),
('550e8400-e29b-41d4-a716-446655440810', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440102', 'Midpoint Twist', 'act', 'A shocking betrayal changes everything', 2, false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- COMPLETED
-- ============================================
-- Seed data insertion complete!
-- Database is now populated with test data matching mockData.ts

