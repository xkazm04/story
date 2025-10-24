# Mock Data Setup Guide

## Overview
This project is configured to use **mock data** instead of a real backend API during development. This allows you to test and validate UI components without needing a running backend server.

---

## Quick Start

### Using Mock Data (Default)

Mock data is **currently enabled**. Just run your app and all data will be served from the mock data files.

```bash
npm run dev
```

The app will:
- Show 3 mock projects on the Projects page
- Display characters, factions, acts, and scenes for "Epic Fantasy Saga" (proj-1)
- Support full UI navigation and interaction

---

## Mock Data Contents

### 📁 Projects (3 projects)
1. **Epic Fantasy Saga** - Main project with full data
2. **Cyberpunk Chronicles** - Secondary project  
3. **Mystery at Moonlight Manor** - Tertiary project

### 👥 Characters (5 characters in Epic Fantasy Saga)
- **Aldric Stormwind** (Key) - Silver Order knight
- **Lyra Shadowmoon** (Key) - Shadow Guild spy
- **Theron Drakehart** (Major) - Dragon Clan warrior
- **Elara Brightshield** (Major) - Silver Order protégé
- **Marcus the Wanderer** (Minor) - Independent character

### 🏰 Factions (3 factions)
- **The Silver Order** (Blue) - Ancient knights
- **Dragon Clan** (Red) - Dragon riders
- **Shadow Guild** (Gray) - Spies and assassins

### 📖 Character Traits (6 traits)
Sample traits for Aldric and Lyra covering:
- Background, Personality, Strengths, Motivations

### 💑 Relationships (3 character relationships)
- Aldric ↔ Lyra (complicated)
- Aldric ↔ Elara (positive/mentor)
- Lyra ↔ Theron (negative/rivalry)

### 🤝 Faction Relationships (2)
- Silver Order ↔ Dragon Clan (neutral/truce)
- Silver Order ↔ Shadow Guild (negative/conflict)

### 🎬 Acts (3 acts)
- **Act 1**: The Gathering Storm
- **Act 2**: Shadows Rising
- **Act 3**: Final Confrontation

### 🎞️ Scenes (6 scenes)
- 3 scenes in Act 1
- 2 scenes in Act 2
- 1 scene in Act 3

---

## Configuration

### Switching Between Mock and Real Data

Edit `src/app/config/api.ts`:

```typescript
// Use mock data
export const USE_MOCK_DATA = true;  // ✅ Currently enabled

// Use real backend API
export const USE_MOCK_DATA = false; // Switch to this when backend is ready
```

### Mock User ID

The mock data uses a predefined user ID: `user-123`

To use it in your components:

```typescript
import { MOCK_USER_ID } from '../../../db/mockData';

// Use in ProjectsFeature
<ProjectsFeature userId={MOCK_USER_ID} />
```

---

## How It Works

### Architecture

```
┌─────────────────────────────────────────┐
│  React Components                       │
│  (Characters, Scenes, etc.)             │
└───────────────┬─────────────────────────┘
                │
                ↓
┌─────────────────────────────────────────┐
│  API Layer (src/app/api/)               │
│  - characters.ts                        │
│  - factions.ts                          │
│  - acts.ts, scenes.ts, etc.             │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┐
        │               │
        ↓               ↓
┌──────────────┐  ┌──────────────┐
│  Mock Data   │  │  Real API    │
│  (db/*.ts)   │  │  (Backend)   │
└──────────────┘  └──────────────┘
   ↑ Active          Inactive
```

### Mock Data Implementation

Each API file has conditional logic:

```typescript
// Example from characters.ts
export const characterApi = {
  useProjectCharacters: (projectId: string, enabled: boolean = true) => {
    if (USE_MOCK_DATA) {
      // Return filtered mock data
      return useQuery<Character[]>({
        queryKey: ['characters', 'project', projectId],
        queryFn: async () => {
          const filtered = mockCharacters.filter(c => c.project_id === projectId);
          return simulateApiCall(filtered); // Adds 300ms delay
        },
        enabled: enabled && !!projectId,
        staleTime: 5 * 60 * 1000,
      });
    }
    // Otherwise, make real API call
    const url = `${CHARACTERS_URL}/project/${projectId}`;
    return useApiGet<Character[]>(url, enabled && !!projectId);
  },
}
```

### Simulated Delay

Mock API calls include a 300ms delay to simulate network latency:

```typescript
export const simulateApiCall = async <T>(data: T, delayMs: number = 300): Promise<T> => {
  await delay(delayMs);
  return data;
};
```

---

## Files Structure

```
story/
├── db/
│   └── mockData.ts           # All mock data arrays
├── src/
│   └── app/
│       ├── config/
│       │   └── api.ts         # USE_MOCK_DATA flag
│       ├── api/
│       │   ├── projects.ts    # ✅ Mock-enabled
│       │   ├── characters.ts  # ✅ Mock-enabled
│       │   ├── factions.ts    # ✅ Mock-enabled
│       │   ├── acts.ts        # ✅ Mock-enabled
│       │   ├── scenes.ts      # ✅ Mock-enabled
│       │   ├── traits.ts      # ✅ Mock-enabled
│       │   ├── relationships.ts          # ✅ Mock-enabled
│       │   └── factionRelationships.ts   # ✅ Mock-enabled
│       └── utils/
│           └── api.ts         # API utilities
```

---

## Testing the UI

### 1. Projects Page
Load the app → See 3 projects → Click "Epic Fantasy Saga"

### 2. Left Panel - Acts & Scenes
- See 3 acts in tabs
- Select Act 1 → See 3 scenes
- Select Act 2 → See 2 scenes
- Drag scenes to reorder (UI only, not persisted)

### 3. Characters Feature
Navigate to Characters → See:
- 5 characters total
- Faction filters (Silver Order, Dragon Clan, Shadow Guild, Independent)
- Character cards with names and types

### 4. Character Details
Click on a character → See tabs:
- **Info**: Basic character information
- **About**: 6 trait sections (Background, Personality, etc.)
- **Appearance**: Appearance editor (empty by default)
- **Relationships**: See character relationships

### 5. Factions
Go to Factions tab → See:
- 3 faction cards with colors
- Member counts
- Click to see faction details

---

## Limitations

### What Works ✅
- All **GET** operations (reading data)
- UI interactions
- Navigation
- Data filtering and display
- Loading states
- Empty states

### What Doesn't Work ❌
- **Create/Update/Delete** operations (not persisted)
- Data persistence across page refreshes
- Real-time updates
- User authentication

Note: Create/Update/Delete functions are implemented in the API files but won't persist data when using mock mode.

---

## Adding More Mock Data

### To add new characters:

Edit `db/mockData.ts`:

```typescript
export const mockCharacters: Character[] = [
  // ... existing characters
  {
    id: 'char-6',
    name: 'Your New Character',
    type: 'Major',
    project_id: 'proj-1',
    faction_id: 'faction-1',
    avatar_url: '',
  },
];
```

### To add new scenes:

```typescript
export const mockScenes: Scene[] = [
  // ... existing scenes
  {
    id: 'scene-7',
    name: 'Your New Scene',
    project_id: 'proj-1',
    act_id: 'act-1',  // Add to Act 1
    order: 4,
    description: 'Scene description',
    created_at: '2024-01-15T13:00:00Z',
  },
];
```

---

## Switching to Real Backend

When your backend is ready:

### 1. Set the API URL

Edit `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://your-backend-url:port
```

### 2. Disable Mock Data

Edit `src/app/config/api.ts`:
```typescript
export const USE_MOCK_DATA = false;
```

### 3. Restart Your App

```bash
npm run dev
```

The app will now make real API calls to your backend!

---

## API Endpoints Expected by Frontend

When you build your backend, implement these endpoints:

### Projects
- `GET /projects/user/:userId`
- `GET /projects/:id`
- `POST /projects`
- `PUT /projects/:id`
- `DELETE /projects/:id`

### Characters
- `GET /characters/project/:projectId`
- `GET /characters/:id`
- `GET /characters/faction/:factionId`
- `POST /characters`
- `PUT /characters/:id`
- `DELETE /characters/:id`

### Factions
- `GET /factions/project/:projectId`
- `GET /factions/:id`
- `POST /factions`
- `PUT /factions/:id`
- `DELETE /factions/:id`

### Acts
- `GET /acts/project/:projectId`
- `GET /acts/:id`
- `POST /acts`
- `PUT /acts/:id`
- `DELETE /acts/:id`

### Scenes
- `GET /scenes/project/:projectId`
- `GET /scenes/project/:projectId/act/:actId`
- `GET /scenes/:id`
- `POST /scenes`
- `PUT /scenes/:id`
- `PUT /scenes/:id/reorder`
- `DELETE /scenes/:id`

### Traits
- `GET /traits/character/:characterId`
- `POST /traits`
- `PUT /traits/:id`
- `DELETE /traits/:id`

### Relationships
- `GET /relationships/character/:characterId`
- `POST /relationships`
- `PUT /relationships/:id`
- `DELETE /relationships/:id`

### Faction Relationships
- `GET /faction-relationships/faction/:factionId`
- `POST /faction-relationships`
- `PUT /faction-relationships/:id`
- `DELETE /faction-relationships/:id`

---

## Troubleshooting

### "Cannot find module '../../../db/mockData'"

**Solution**: Make sure the `db` folder exists at the root level (same level as `src/`).

### Mock data not showing up

**Solution**: 
1. Check that `USE_MOCK_DATA = true` in `src/app/config/api.ts`
2. Clear browser cache and restart dev server
3. Check console for errors

### Data filters not working

**Solution**: Mock data is filtered by IDs. Make sure you're using the correct IDs:
- Project: `proj-1` (Epic Fantasy Saga)
- User: `user-123`

---

## Summary

✅ **Mock data is ready!**  
✅ **All GET operations work**  
✅ **UI can be fully tested**  
✅ **Easy to switch to real backend**

Just run `npm run dev` and start testing your UI! 🎉

