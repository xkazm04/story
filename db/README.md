# Database Setup Guide

This directory contains all SQL scripts and documentation for setting up your Supabase PostgreSQL database.

## 📁 Files Overview

- **01_schema.sql** - Complete database schema with tables, indexes, triggers, and RLS policies
- **02_seed_data.sql** - Seed data matching the mock data used during development
- **mockData.ts** - TypeScript mock data (used when `USE_MOCK_DATA=true`)

---

## 🚀 Quick Start

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and keys

### 2. Set Up Environment Variables

Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCK_DATA=false

# Mock User (for development without auth)
NEXT_PUBLIC_MOCK_USER_ID=550e8400-e29b-41d4-a716-446655440000
```

### 3. Run SQL Scripts

In your Supabase Dashboard SQL Editor:

1. **Run Schema**: Copy and paste `01_schema.sql` → Execute
2. **Run Seed Data**: Copy and paste `02_seed_data.sql` → Execute

### 4. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 5. Start Development Server

```bash
npm run dev
```

Your app will now use Supabase instead of mock data! 🎉

---

## 📊 Database Schema

### Tables

#### Core Tables
- **users** - User accounts
- **projects** - Story projects
- **acts** - Story acts within projects
- **scenes** - Scenes within acts

#### Character Tables
- **characters** - Characters in projects
- **traits** - Character traits/prompts
- **character_relationships** - Relationships between characters
- **factions** - Character factions/groups
- **faction_relationships** - Relationships between factions

#### Story Tables
- **beats** - Story beats (plot points)

### Relationships

```
users (1) ──→ (many) projects
projects (1) ──→ (many) acts
projects (1) ──→ (many) scenes
projects (1) ──→ (many) characters
projects (1) ──→ (many) factions
projects (1) ──→ (many) beats

acts (1) ──→ (many) scenes
acts (1) ──→ (many) beats

characters (1) ──→ (many) traits
characters (many) ──→ (many) characters (relationships)

factions (1) ──→ (many) characters
factions (many) ──→ (many) factions (relationships)
```

---

## 🔒 Row Level Security (RLS)

All tables have RLS enabled. Users can only access data belonging to their projects.

### Policy Examples

**Projects**: Users can only see/edit their own projects
```sql
CREATE POLICY "Users can view own projects" ON projects
    FOR SELECT USING (user_id IN (
        SELECT id FROM users WHERE clerk_id = auth.uid()::text
    ));
```

**Characters**: Users can access characters from their projects
```sql
CREATE POLICY "Users can view characters from own projects" ON characters
    FOR SELECT USING (project_id IN (
        SELECT id FROM projects WHERE user_id IN (
            SELECT id FROM users WHERE clerk_id = auth.uid()::text
        )
    ));
```

---

## 🔄 Auto-Update Timestamps

All tables have automatic `updated_at` timestamp triggers:

```sql
CREATE TRIGGER update_projects_updated_at 
BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## 🧪 Testing with Seed Data

The seed data includes:
- 1 test user
- 3 projects
- 3 acts
- 7 scenes
- 3 factions
- 6 characters
- 8 traits
- 4 character relationships
- 3 faction relationships
- 10 beats

**Test User ID**: `550e8400-e29b-41d4-a716-446655440000`
**Main Project ID**: `550e8400-e29b-41d4-a716-446655440001` (Epic Fantasy Saga)

---

## 🔧 Development Mode

### Using Mock Data (No Database Required)

Set in `.env.local`:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

This uses the data from `db/mockData.ts` instead of Supabase.

### Using Supabase (Production-Ready)

Set in `.env.local`:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=false
```

This connects to your Supabase database.

---

## 📋 API Routes

All API routes are in `src/app/api/`:

### Projects
- `GET /api/projects?userId=xxx` - Get user projects
- `GET /api/projects/[id]` - Get single project
- `POST /api/projects` - Create project
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Characters
- `GET /api/characters?projectId=xxx` - Get project characters
- `GET /api/characters/[id]` - Get single character
- `POST /api/characters` - Create character
- `PUT /api/characters/[id]` - Update character
- `DELETE /api/characters/[id]` - Delete character

### Factions
- `GET /api/factions?projectId=xxx` - Get project factions
- `GET /api/factions/[id]` - Get single faction
- `POST /api/factions` - Create faction
- `PUT /api/factions/[id]` - Update faction
- `DELETE /api/factions/[id]` - Delete faction

### Acts
- `GET /api/acts?projectId=xxx` - Get project acts
- `GET /api/acts/[id]` - Get single act
- `POST /api/acts` - Create act
- `PUT /api/acts/[id]` - Update act
- `DELETE /api/acts/[id]` - Delete act

### Scenes
- `GET /api/scenes?projectId=xxx&actId=yyy` - Get scenes
- `GET /api/scenes/[id]` - Get single scene
- `POST /api/scenes` - Create scene
- `PUT /api/scenes/[id]` - Update scene
- `DELETE /api/scenes/[id]` - Delete scene

### Traits
- `GET /api/traits?characterId=xxx` - Get character traits
- `POST /api/traits` - Create trait
- `PUT /api/traits/[id]` - Update trait
- `DELETE /api/traits/[id]` - Delete trait

### Relationships
- `GET /api/relationships?characterId=xxx` - Get character relationships
- `POST /api/relationships` - Create relationship
- `PUT /api/relationships/[id]` - Update relationship
- `DELETE /api/relationships/[id]` - Delete relationship

### Faction Relationships
- `GET /api/faction-relationships?factionId=xxx` - Get faction relationships
- `POST /api/faction-relationships` - Create faction relationship
- `PUT /api/faction-relationships/[id]` - Update faction relationship
- `DELETE /api/faction-relationships/[id]` - Delete faction relationship

### Beats
- `GET /api/beats?projectId=xxx&actId=yyy` - Get beats
- `POST /api/beats` - Create beat
- `PUT /api/beats/[id]` - Update beat
- `DELETE /api/beats/[id]` - Delete beat

---

## 🛠️ Supabase Client Usage

### Server-Side (API Routes)

```typescript
import { supabaseServer } from '@/lib/supabase/server';

// Query data
const { data, error } = await supabaseServer
  .from('projects')
  .select('*')
  .eq('user_id', userId);

// Insert data
const { data, error } = await supabaseServer
  .from('projects')
  .insert({ name: 'New Project', user_id: userId })
  .select()
  .single();
```

### Client-Side (React Components)

```typescript
import { supabase } from '@/lib/supabase/client';

// Real-time subscriptions
useEffect(() => {
  const channel = supabase
    .channel('projects')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'projects' },
      (payload) => console.log('Change received!', payload)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 🐛 Troubleshooting

### Connection Issues

1. **Check environment variables** in `.env.local`
2. **Verify Supabase project** is running
3. **Check API routes** are responding (visit `/api/projects?userId=test`)

### RLS Policy Issues

If queries return empty results:
- Check that RLS policies match your auth setup
- Use service role key for admin operations
- Verify user IDs match between tables

### Migration from Mock Data

1. Keep `USE_MOCK_DATA=true` during development
2. Run SQL scripts to set up database
3. Switch `USE_MOCK_DATA=false`
4. Test each feature with real data
5. Update mock user ID if needed

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

Before deploying to production:

- [ ] Run `01_schema.sql` in Supabase
- [ ] Run `02_seed_data.sql` for test data
- [ ] Set environment variables
- [ ] Install @supabase/supabase-js
- [ ] Set `USE_MOCK_DATA=false`
- [ ] Test all CRUD operations
- [ ] Configure RLS policies for your auth provider
- [ ] Set up database backups in Supabase dashboard
- [ ] Enable SSL for production connections

---

**Database setup complete!** 🎉

Your app is now ready to use Supabase as the backend database.

