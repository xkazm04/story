# Setup Assets Test Scenario

## Overview

This document provides instructions for setting up the test scenario for the **assets - AI Image Analysis System** context. The test scenario enables automated screenshot capture for documentation.

## Context Information

- **Context ID**: `ctx_1763860493254_ry45q0t49`
- **Context Name**: assets - AI Image Analysis System
- **Project ID**: `dd11e61e-f267-4e52-95c5-421b1ed9567b`

## Test Scenario Navigation

The test scenario navigates to the Assets feature through the following steps:

1. **Navigate** to `http://localhost:3008` (homepage)
2. **Wait** 3000ms (page load)
3. **Click** `[data-testid='feature-tab-assets']` (Assets tab button)
4. **Wait** 2000ms (feature load)

## Setup Instructions

### Step 1: Create the Contexts Table in Supabase

The `contexts` table must exist in your Supabase database before the test scenario can be saved.

**Option A: Use Supabase SQL Editor (Recommended)**

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the following SQL:

```sql
-- ============================================
-- Migration: Add Contexts Table
-- Purpose: Store UI context information for automated screenshot testing
-- ============================================

CREATE TABLE IF NOT EXISTS contexts (
    id TEXT PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    test_scenario TEXT, -- Stringified JSON array of test steps or null
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_contexts_project_id ON contexts(project_id);
CREATE INDEX IF NOT EXISTS idx_contexts_name ON contexts(name);

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_contexts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS contexts_updated_at_trigger ON contexts;
CREATE TRIGGER contexts_updated_at_trigger
    BEFORE UPDATE ON contexts
    FOR EACH ROW
    EXECUTE FUNCTION update_contexts_updated_at();
```

5. Click **Run** to execute the migration

**Option B: Use Migration File**

Run the existing migration file:
```bash
# File: db/migrations/013_add_contexts_table.sql
```

### Step 2: Create the Context with Test Scenario

After the table is created, run the following SQL to create the context and set its test scenario:

```sql
-- Insert or update the assets context with test scenario
INSERT INTO contexts (id, project_id, name, description, test_scenario, created_at, updated_at)
VALUES (
    'ctx_1763860493254_ry45q0t49',
    'dd11e61e-f267-4e52-95c5-421b1ed9567b',
    'assets - AI Image Analysis System',
    'Complete AI-powered image analysis system for extracting game assets from uploaded images. The feature integrates multiple AI vision models (Gemini, Groq) to analyze images and extract structured asset information.',
    '[{"type":"navigate","url":"http://localhost:3008"},{"type":"wait","delay":3000},{"type":"click","selector":"[data-testid=''feature-tab-assets'']"},{"type":"wait","delay":2000}]',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO UPDATE SET
    test_scenario = EXCLUDED.test_scenario,
    updated_at = NOW();

-- Verify the insert
SELECT
    id,
    name,
    test_scenario,
    updated_at
FROM contexts
WHERE id = 'ctx_1763860493254_ry45q0t49';
```

### Step 3: Verify via Node.js Script (Optional)

Once the table exists, you can use the Node.js script to verify and update:

```bash
node scripts/setup-and-update-assets-context.js
```

## Test Scenario Details

### JSON Format

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
    "selector": "[data-testid='feature-tab-assets']"
  },
  {
    "type": "wait",
    "delay": 2000
  }
]
```

### Navigation Path Explanation

1. **Homepage**: Start at the root URL where the AppShell loads
2. **Wait for Load**: Allow time for the project to load and CenterPanel to render
3. **Click Assets Tab**: The CenterPanel has tab buttons with `data-testid="feature-tab-assets"` (see `src/app/components/layout/CenterPanel.tsx:89`)
4. **Wait for Feature**: Allow time for the AssetsFeature component to lazy load and render

### Component References

- **Navigation Button**: `CenterPanel.tsx:89` - `data-testid="feature-tab-assets"`
- **Feature Component**: `AssetsFeature.tsx` - Main feature wrapper
- **Upload Component**: `AssetAnalysisUpload.tsx` - Primary UI component

## Troubleshooting

### Error: "Could not find the table 'public.contexts'"

**Cause**: The contexts table doesn't exist in Supabase.

**Solution**: Run Step 1 (Create the Contexts Table) using the Supabase SQL Editor.

### Error: "Context not found"

**Cause**: The context record doesn't exist in the contexts table.

**Solution**: Run Step 2 to insert the context record.

### Error: "Foreign key violation on project_id"

**Cause**: The project with ID `dd11e61e-f267-4e52-95c5-421b1ed9567b` doesn't exist.

**Solution**: Either create the project first, or update the `project_id` in the SQL to match an existing project in your database.

## Next Steps

After completing the setup:

1. The test scenario will be available for Playwright automation
2. Screenshots can be captured automatically during CI/CD
3. Visual documentation will be generated for the Assets feature

## Files

- **Migration**: `db/migrations/013_add_contexts_table.sql`
- **Setup Script**: `scripts/setup-and-update-assets-context.js`
- **SQL Script**: `scripts/update-assets-context.sql`
- **This Document**: `SETUP_ASSETS_TEST_SCENARIO.md`
