# Test Scenario Implementation for Relationship Map

## Overview

This document describes the implementation of the test scenario for the **Relationships - Interactive Graph Visualization** context.

## Context Information

- **Context ID**: `ctx_1763865000929_t58t6kx9u`
- **Context Name**: relationships - Interactive Graph Visualization
- **Feature Type**: UI Feature (Interactive Graph)
- **Project ID**: `dd11e61e-f267-4e52-95c5-421b1ed9567b`

## Navigation Path Analysis

### Feature Location

The Relationship Map is accessed through the following navigation hierarchy:

```
Homepage (http://localhost:3008)
  └─> Characters Tab (Center Panel)
      └─> Relationship Map Tab (Characters Feature)
```

### Component Architecture

1. **AppShell** (`src/app/components/layout/AppShell.tsx`)
   - Main application shell with three-panel layout
   - Contains CenterPanel where features are rendered

2. **CenterPanel** (`src/app/components/layout/CenterPanel.tsx`)
   - Feature tabs navigation (Characters, Scenes, Story, etc.)
   - Tab selector: `[data-testid="feature-tab-characters"]`

3. **CharactersFeature** (`src/app/features/characters/CharactersFeature.tsx`)
   - Sub-tab navigation (Characters, Factions, Relationship Map, Details)
   - Tab selector: `[data-testid="character-tab-relationship-map"]`

4. **RelationshipMap** (`src/app/features/relationships/RelationshipMap.tsx`)
   - Main feature component
   - Renders interactive React Flow graph visualization

## Test Scenario

The test scenario navigates to the Relationship Map feature through the UI:

```json
[
  {
    "type": "navigate",
    "url": "http://localhost:3008"
  },
  {
    "type": "wait",
    "delay": 3000
  },
  {
    "type": "click",
    "selector": "[data-testid=\"feature-tab-characters\"]"
  },
  {
    "type": "wait",
    "delay": 2000
  },
  {
    "type": "click",
    "selector": "[data-testid=\"character-tab-relationship-map\"]"
  },
  {
    "type": "wait",
    "delay": 3000
  }
]
```

### Step-by-Step Breakdown

1. **Navigate to Homepage** (`navigate`)
   - URL: `http://localhost:3008`
   - Loads the main application with AppShell

2. **Wait for Initial Load** (`wait: 3000ms`)
   - Allows time for project selection and initial render
   - React components lazy load

3. **Click Characters Tab** (`click`)
   - Selector: `[data-testid="feature-tab-characters"]`
   - Opens CharactersFeature in center panel

4. **Wait for Characters Feature** (`wait: 2000ms`)
   - Allows CharactersFeature to render
   - Sub-tabs become available

5. **Click Relationship Map Tab** (`click`)
   - Selector: `[data-testid="character-tab-relationship-map"]`
   - Loads RelationshipMap component via DynamicComponentLoader

6. **Wait for Relationship Map** (`wait: 3000ms`)
   - Allows time for:
     - React Flow initialization
     - API calls to fetch characters, factions, relationships
     - Graph rendering with nodes and edges

## Database Schema

### Contexts Table

Created via migration: `db/migrations/013_add_contexts_table.sql`

```sql
CREATE TABLE IF NOT EXISTS contexts (
    id TEXT PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    test_scenario TEXT, -- Stringified JSON array
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Endpoints

**POST /api/contexts**
- Create new context

**GET /api/contexts**
- Fetch contexts (filter by project_id or id)

**PUT /api/contexts**
- Update context (including test_scenario field)

**DELETE /api/contexts**
- Delete context by id

## Implementation Steps

### 1. Database Migration

Run the migration in Supabase SQL Editor:

```sql
-- Copy and paste db/migrations/013_add_contexts_table.sql
```

### 2. Add Test IDs to Components

Added `data-testid` attributes to enable automated testing:

**CharactersFeature.tsx** (Line 120):
```tsx
<button
  data-testid={`character-tab-${tab.id}`}
  // ... other props
>
```

This generates test IDs:
- `data-testid="character-tab-characters"`
- `data-testid="character-tab-factions"`
- `data-testid="character-tab-relationship-map"`
- `data-testid="character-tab-details"`

### 3. Update Context with Test Scenario

Run the update script:

```bash
node scripts/update-relationship-map-test-scenario.mjs
```

This script:
1. Defines the test scenario steps
2. Converts to JSON string
3. Calls PUT /api/contexts with contextId and updates

## Verification

### Manual Testing

1. Start dev server: `npm run dev`
2. Open browser: `http://localhost:3008`
3. Follow navigation steps:
   - Click "Characters" tab
   - Click "Relationship Map" tab
   - Verify graph visualization loads

### API Testing

```bash
# Fetch the context to verify test_scenario is saved
curl http://localhost:3008/api/contexts?id=ctx_1763865000929_t58t6kx9u
```

Expected response:
```json
{
  "id": "ctx_1763865000929_t58t6kx9u",
  "project_id": "dd11e61e-f267-4e52-95c5-421b1ed9567b",
  "name": "relationships - Interactive Graph Visualization",
  "test_scenario": "[{\"type\":\"navigate\",\"url\":\"http://localhost:3008\"}...]",
  "created_at": "...",
  "updated_at": "..."
}
```

## Files Modified/Created

### Created Files
- `db/migrations/013_add_contexts_table.sql` - Database migration
- `src/app/api/contexts/route.ts` - API endpoints
- `scripts/update-relationship-map-test-scenario.ts` - TypeScript script
- `scripts/update-relationship-map-test-scenario.mjs` - Node.js script
- `docs/TEST_SCENARIO_IMPLEMENTATION.md` - This documentation

### Modified Files
- `src/app/features/characters/CharactersFeature.tsx` - Added data-testid attributes

## Usage for Automated Screenshots

The test scenario can be used by Playwright or other automation tools:

```typescript
import { test, expect } from '@playwright/test';

test('screenshot relationship map', async ({ page }) => {
  // Fetch test scenario from API
  const response = await fetch('http://localhost:3008/api/contexts?id=ctx_1763865000929_t58t6kx9u');
  const context = await response.json();
  const steps = JSON.parse(context.test_scenario);

  // Execute steps
  for (const step of steps) {
    if (step.type === 'navigate') {
      await page.goto(step.url);
    } else if (step.type === 'wait') {
      await page.waitForTimeout(step.delay);
    } else if (step.type === 'click') {
      await page.click(step.selector);
    }
  }

  // Take screenshot
  await page.screenshot({ path: 'relationship-map.png', fullPage: true });
});
```

## Notes

- **Wait Times**: Configured for lazy-loaded components and API calls
- **Selectors**: Use data-testid attributes for stability
- **Project Selection**: Assumes a project is already selected (via Landing page)
- **Empty States**: Feature handles empty state (no characters/relationships)

## Troubleshooting

### Context Not Found
- Ensure migration has been run in Supabase
- Verify context ID matches in database

### Test Scenario Fails
- Check that dev server is running on port 3008
- Verify data-testid attributes exist in DOM
- Ensure project has characters/relationships for visualization

### API Errors
- Check Supabase connection in `.env.local`
- Verify RLS policies allow access to contexts table
- Check server logs for detailed error messages
