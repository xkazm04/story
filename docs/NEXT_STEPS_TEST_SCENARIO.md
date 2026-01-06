# Next Steps: Test Scenario Implementation

## Summary

The test scenario infrastructure has been successfully implemented for the **Relationships - Interactive Graph Visualization** context. All code, database schema, and documentation are in place.

## Required Manual Steps

To activate the test scenario, follow these steps in order:

### Step 1: Run Database Migration

Open your Supabase SQL Editor and execute the migration:

**File**: `db/migrations/013_add_contexts_table.sql`

```sql
-- Copy the entire contents of this file and execute in Supabase
```

This creates the `contexts` table with proper schema, indexes, and triggers.

### Step 2: Create Context Record

The context record needs to be created in the database. You have two options:

#### Option A: API Request (Recommended)

```bash
curl -X POST http://localhost:3008/api/contexts \
  -H "Content-Type: application/json" \
  -d '{
    "id": "ctx_1763865000929_t58t6kx9u",
    "project_id": "dd11e61e-f267-4e52-95c5-421b1ed9567b",
    "name": "relationships - Interactive Graph Visualization",
    "description": "Interactive, visual graph-based mapping system using React Flow to visualize characters and factions as nodes with relationships displayed as edges.",
    "files": [],
    "test_scenario": null
  }'
```

#### Option B: Direct SQL Insert

```sql
INSERT INTO contexts (id, project_id, name, description, files, test_scenario)
VALUES (
  'ctx_1763865000929_t58t6kx9u',
  'dd11e61e-f267-4e52-95c5-421b1ed9567b',
  'relationships - Interactive Graph Visualization',
  'Interactive, visual graph-based mapping system using React Flow to visualize characters and factions as nodes with relationships displayed as edges.',
  '[]'::jsonb,
  NULL
);
```

### Step 3: Update Test Scenario

Once the context record exists, run the update script:

```bash
# Ensure dev server is running on port 3008
npm run dev

# In a separate terminal:
node scripts/update-relationship-map-test-scenario.mjs
```

**Expected Output**:
```
Updating context with test scenario...
Context ID: ctx_1763865000929_t58t6kx9u
Test Scenario: [
  {
    "type": "navigate",
    "url": "http://localhost:3008"
  },
  ...
]
✅ Test scenario saved successfully!
Updated context: { ... }
```

### Step 4: Verify Implementation

Test that the scenario works correctly:

1. **Manual Verification**:
   ```bash
   # Start dev server
   npm run dev

   # Open browser: http://localhost:3008
   # Click: Characters tab
   # Click: Relationship Map tab
   # Verify: Graph visualization loads
   ```

2. **API Verification**:
   ```bash
   curl http://localhost:3008/api/contexts?id=ctx_1763865000929_t58t6kx9u
   ```

   Should return context with `test_scenario` field containing JSON string.

## Test Scenario Details

### Navigation Path
```
Homepage (http://localhost:3008)
  ↓ [3s wait]
  ↓ Click: [data-testid="feature-tab-characters"]
  ↓ [2s wait]
  ↓ Click: [data-testid="character-tab-relationship-map"]
  ↓ [3s wait]
  → Relationship Map Loaded
```

### Test Steps JSON
```json
[
  { "type": "navigate", "url": "http://localhost:3008" },
  { "type": "wait", "delay": 3000 },
  { "type": "click", "selector": "[data-testid=\"feature-tab-characters\"]" },
  { "type": "wait", "delay": 2000 },
  { "type": "click", "selector": "[data-testid=\"character-tab-relationship-map\"]" },
  { "type": "wait", "delay": 3000 }
]
```

## Automated Screenshot Capture (Future)

Once the test scenario is saved, you can use it for automated screenshots:

### Playwright Example

```typescript
import { test, expect } from '@playwright/test';

test('capture relationship map screenshot', async ({ page }) => {
  // Fetch test scenario from API
  const response = await fetch(
    'http://localhost:3008/api/contexts?id=ctx_1763865000929_t58t6kx9u'
  );
  const context = await response.json();
  const steps = JSON.parse(context.test_scenario);

  // Execute test steps
  for (const step of steps) {
    switch (step.type) {
      case 'navigate':
        await page.goto(step.url);
        break;
      case 'wait':
        await page.waitForTimeout(step.delay);
        break;
      case 'click':
        await page.click(step.selector);
        break;
    }
  }

  // Take screenshot
  await page.screenshot({
    path: 'screenshots/relationship-map.png',
    fullPage: true
  });

  // Verify feature loaded
  await expect(page.locator('[data-testid="character-tab-relationship-map"]'))
    .toHaveClass(/active/);
});
```

## Files Reference

### Created Files
- ✅ `db/migrations/013_add_contexts_table.sql` - Database schema
- ✅ `src/app/api/contexts/route.ts` - API endpoints
- ✅ `scripts/update-relationship-map-test-scenario.mjs` - Update script
- ✅ `docs/TEST_SCENARIO_IMPLEMENTATION.md` - Technical documentation
- ✅ `IMPLEMENTATION_TEST_SCENARIO_RELATIONSHIPS.md` - Implementation log

### Modified Files
- ✅ `src/app/features/characters/CharactersFeature.tsx` - Added data-testid attributes

## Troubleshooting

### Migration Failed
- Check Supabase connection
- Verify RLS policies
- Ensure projects table exists

### Context Creation Failed
- Verify project_id exists in projects table
- Check API endpoint is accessible
- Review server logs for errors

### Update Script Failed
- Ensure dev server is running
- Verify context exists in database
- Check network connectivity

### Test Scenario Doesn't Work
- Verify all data-testid attributes exist in DOM
- Check that project has characters/factions/relationships
- Increase wait times if components load slowly

## Support

For issues or questions:
1. Check `docs/TEST_SCENARIO_IMPLEMENTATION.md` for detailed documentation
2. Review implementation log in `IMPLEMENTATION_TEST_SCENARIO_RELATIONSHIPS.md`
3. Examine API responses for error messages
4. Check browser console for client-side errors

---

**Status**: Ready for database migration and context creation
**Last Updated**: 2025-11-23
