# Supabase Quick Start Guide

## ⚡ Get Your Database Running in 5 Minutes

### 📋 Prerequisites
- Node.js installed
- Supabase account (free at [supabase.com](https://supabase.com))

---

## 🚀 Setup Steps

### 1. Create Supabase Project (2 min)

1. Go to https://supabase.com/dashboard
2. Click **"New Project"**
3. Enter project details:
   - **Name**: story-app (or your choice)
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
4. Wait for project to initialize (~2 minutes)

### 2. Get Your Keys (30 sec)

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with `https://`)
   - **anon public** key
   - **service_role** key (click reveal first)

### 3. Configure Environment (30 sec)

Create `.env.local` in your project root:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NEXT_PUBLIC_USE_MOCK_DATA=false

# Mock User (for dev without auth)
NEXT_PUBLIC_MOCK_USER_ID=550e8400-e29b-41d4-a716-446655440000
```

### 4. Run SQL Scripts (1 min)

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New Query"**
3. Copy entire content of `db/01_schema.sql`
4. Paste and click **"Run"**
5. Create another new query
6. Copy entire content of `db/02_seed_data.sql`
7. Paste and click **"Run"**

### 5. Start Your App (30 sec)

```bash
npm run dev
```

Visit http://localhost:3000

**Done!** 🎉 Your app is now using Supabase!

---

## 🔍 Verify It's Working

### Check Database Tables

In Supabase Dashboard → **Table Editor**, you should see:
- ✅ users (1 row)
- ✅ projects (3 rows)
- ✅ characters (6 rows)
- ✅ acts (3 rows)
- ✅ scenes (7 rows)
- ✅ factions (3 rows)
- ✅ traits (8 rows)
- ✅ beats (10 rows)
- ✅ character_relationships (4 rows)
- ✅ faction_relationships (3 rows)

### Test API Endpoints

Open browser console and run:

```javascript
// Get projects
fetch('http://localhost:3000/api/projects?userId=550e8400-e29b-41d4-a716-446655440000')
  .then(r => r.json())
  .then(console.log);

// Should return 3 projects: Epic Fantasy Saga, Cyberpunk Chronicles, Mystery at Moonlight Manor
```

### Check UI

1. Open app
2. You should see **3 projects** on landing page
3. Click "Epic Fantasy Saga"
4. You should see characters, acts, scenes loaded from database

---

## 🐛 Troubleshooting

### "Cannot connect to Supabase"
```bash
# Check your .env.local file
# Make sure NEXT_PUBLIC_SUPABASE_URL is correct
# Restart dev server: Ctrl+C then npm run dev
```

### "Empty results" or "No data"
```bash
# Verify USE_MOCK_DATA is set to false
echo $env:NEXT_PUBLIC_USE_MOCK_DATA  # Should be 'false'

# Re-run SQL scripts if needed
```

### "Module not found: @supabase/supabase-js"
```bash
# Install Supabase package
npm install @supabase/supabase-js
```

### SQL Script Errors
- Run `01_schema.sql` BEFORE `02_seed_data.sql`
- If you get errors, try running DROP TABLE commands first:
  ```sql
  DROP TABLE IF EXISTS beats CASCADE;
  DROP TABLE IF EXISTS character_relationships CASCADE;
  DROP TABLE IF EXISTS faction_relationships CASCADE;
  DROP TABLE IF EXISTS traits CASCADE;
  DROP TABLE IF EXISTS characters CASCADE;
  DROP TABLE IF EXISTS factions CASCADE;
  DROP TABLE IF EXISTS scenes CASCADE;
  DROP TABLE IF EXISTS acts CASCADE;
  DROP TABLE IF EXISTS projects CASCADE;
  DROP TABLE IF EXISTS users CASCADE;
  ```
- Then re-run both scripts

---

## 🔄 Switch Between Mock/Real Data

### Use Mock Data (No Database)
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=true
```

### Use Supabase (Real Database)
```bash
# .env.local
NEXT_PUBLIC_USE_MOCK_DATA=false
```

Restart dev server after changing.

---

## 📊 What You Get

### Test Data Included:

**Projects** (3):
- Epic Fantasy Saga
- Cyberpunk Chronicles  
- Mystery at Moonlight Manor

**Characters** (6):
- Aldric Stormwind (Key)
- Lyra Shadowmoon (Key)
- Theron Drakehart (Major)
- Elara Brightshield (Major)
- Morgath the Dark (Minor)
- Raven Swift (Minor)

**Factions** (3):
- The Silver Order (Blue)
- Dragon Clan (Red)
- Shadow Guild (Gray)

**Acts** (3):
- The Awakening
- Trials and Tribulations
- The Final Stand

**Scenes** (7): Distributed across acts

**Beats** (10): Story structure plot points

---

## 🎯 Next Steps

### Recommended Order:

1. ✅ **Set up Supabase** (you just did this!)
2. ✅ **Test with seed data**
3. 🔜 **Add your own projects** via UI
4. 🔜 **Create characters** for your stories
5. 🔜 **Build acts and scenes**
6. 🔜 **Track story beats**
7. 🔜 **Set up authentication** (Clerk integration)
8. 🔜 **Deploy to production** (Vercel + Supabase)

### Production Checklist:

- [ ] Change database password
- [ ] Set up SSL certificates
- [ ] Configure backups in Supabase
- [ ] Set production environment variables
- [ ] Enable Supabase's Auth (if using)
- [ ] Review RLS policies
- [ ] Set up monitoring
- [ ] Configure CORS for production domain

---

## 📚 Helpful Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check environment variables
echo $env:NEXT_PUBLIC_SUPABASE_URL  # Windows PowerShell
echo $NEXT_PUBLIC_SUPABASE_URL      # Mac/Linux
```

---

## 🆘 Need Help?

### Documentation
- **Full Guide**: See `db/README.md`
- **Integration Details**: See `SUPABASE_INTEGRATION_SUMMARY.md`
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

### Common Issues
- **Port 3000 in use**: Change port with `npm run dev -- -p 3001`
- **Environment variables not loading**: Restart dev server
- **RLS policy errors**: Check user ID matches seed data
- **TypeScript errors**: Run `npm install` and restart TS server

---

## ✅ Success Checklist

After setup, verify:

- [ ] `.env.local` file created with all keys
- [ ] Supabase project shows 10 tables
- [ ] Seed data visible in Table Editor
- [ ] Dev server running without errors
- [ ] Landing page shows 3 projects
- [ ] Can click into "Epic Fantasy Saga" project
- [ ] Characters tab shows 6 characters
- [ ] Scenes tab shows acts and scenes
- [ ] Story tab shows beats

**If all checked, you're ready to go!** 🚀

---

## 💡 Pro Tips

1. **Use Supabase Studio**: Great UI for viewing/editing data during development
2. **Enable Realtime**: Supabase supports websockets for live updates
3. **Backup Regularly**: Supabase has automatic backups, but export manually too
4. **Monitor Usage**: Free tier has limits, watch your usage in dashboard
5. **Use Migrations**: For production, use proper migration tools (not manual SQL)

---

**Happy coding!** 🎉

Your Story app now has a powerful PostgreSQL database backend!

