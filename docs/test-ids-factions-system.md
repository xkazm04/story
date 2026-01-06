# Test IDs: Characters - Factions System

## Overview

This document lists all `data-testid` attributes available in the Factions System for automated testing and screenshot capture.

## Navigation Test IDs

### Center Panel (Main Feature Tabs)

Located in: `src/app/components/layout/CenterPanel.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `feature-tab-characters` | Button | Navigate to Characters feature |
| `feature-tab-scenes` | Button | Navigate to Scenes feature |
| `feature-tab-story` | Button | Navigate to Story feature |
| `feature-tab-voice` | Button | Navigate to Voice feature |
| `feature-tab-datasets` | Button | Navigate to Datasets feature |
| `feature-tab-images` | Button | Navigate to Images feature |
| `feature-tab-videos` | Button | Navigate to Videos feature |
| `feature-tab-assets` | Button | Navigate to Assets feature |

### Characters Feature (Sub Tabs)

Located in: `src/app/features/characters/CharactersFeature.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `character-tab-characters` | Button | Show characters list |
| `character-tab-factions` | Button | Show factions list (PRIMARY TARGET) |
| `character-tab-relationship-map` | Button | Show relationship map |
| `character-tab-details` | Button | Show character details |

## Factions System Test IDs

### Create Faction Form

Located in: `src/app/features/characters/components/CreateFactionForm.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `create-faction-modal` | Modal Container | Main modal wrapper |
| `close-form-btn` | Button | Close the form |
| `open-ai-wizard-btn` | Button | Open AI-powered faction wizard |
| `faction-name-input` | Input | Faction name field |
| `faction-description-input` | Textarea | Faction description field |
| `color-preset-{color}` | Button | Color preset buttons (dynamic) |
| `submit-faction-btn` | Button | Submit/create faction |

### Color Customizer

Located in: `src/app/features/characters/sub_CharFactions/ColorCustomizer.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `primary-color-input` | Input | Primary color picker |
| `primary-preset-{color}` | Button | Primary color presets (dynamic) |

### Character Cards

Located in: `src/app/features/characters/components/CharacterCard.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `character-card-{id}` | Div | Individual character card (dynamic) |
| `character-delete-btn-{id}` | Button | Delete character button (dynamic) |

### Character Creation

Located in: `src/app/features/characters/components/CharacterCreateForm.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `character-name-input` | Input | Character name field |

### Character Consistency Panel

Located in: `src/app/features/characters/components/CharacterConsistencyPanel.tsx`

| Test ID | Element | Purpose |
|---------|---------|---------|
| `analyze-consistency-btn` | Button | Trigger consistency analysis |
| `start-analysis-btn` | Button | Start new analysis |
| `consistency-issue-{id}` | Div | Individual consistency issue (dynamic) |
| `expand-issue-{id}-btn` | Button | Expand issue details (dynamic) |
| `accept-suggestion-{id}-btn` | Button | Accept AI suggestion (dynamic) |
| `custom-edit-{id}-btn` | Button | Open custom edit (dynamic) |
| `ignore-issue-{id}-btn` | Button | Ignore the issue (dynamic) |

## Test Scenario Usage

### Primary Navigation Path

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
    "selector": "[data-testid='feature-tab-characters']"
  },
  {
    "type": "wait",
    "delay": 2000
  },
  {
    "type": "click",
    "selector": "[data-testid='character-tab-factions']"
  },
  {
    "type": "wait",
    "delay": 2500
  }
]
```

### Create Faction Flow

```json
[
  // ... navigate to factions as above ...
  {
    "type": "click",
    "selector": "button:has-text('New Faction')"
  },
  {
    "type": "wait",
    "delay": 500
  },
  {
    "type": "fill",
    "selector": "[data-testid='faction-name-input']",
    "value": "Test Faction"
  },
  {
    "type": "fill",
    "selector": "[data-testid='faction-description-input']",
    "value": "A test faction description"
  },
  {
    "type": "click",
    "selector": "[data-testid='submit-faction-btn']"
  }
]
```

### Open AI Wizard

```json
[
  // ... navigate to factions as above ...
  {
    "type": "click",
    "selector": "button:has-text('New Faction')"
  },
  {
    "type": "wait",
    "delay": 500
  },
  {
    "type": "click",
    "selector": "[data-testid='open-ai-wizard-btn']"
  },
  {
    "type": "wait",
    "delay": 1000
  }
]
```

## Component Test IDs to Add

### Recommended Additions

The following components should have test IDs added for comprehensive testing:

#### FactionsList
- `factions-list-container`
- `create-faction-btn`
- `faction-card-{id}`

#### FactionDetails
- `faction-details-container`
- `faction-back-btn`
- `faction-tab-info`
- `faction-tab-members`
- `faction-tab-media`
- `faction-tab-branding`
- `faction-tab-history`
- `faction-tab-search`

#### FactionBrandingPanel
- `branding-panel-container`
- `emblem-designer-btn`
- `color-customizer-section`

#### EmblemDesigner
- `emblem-designer-modal`
- `emblem-style-{style}`
- `upload-emblem-btn`
- `save-emblem-btn`

#### FactionMediaGallery
- `media-gallery-container`
- `upload-media-btn`
- `media-item-{id}`
- `delete-media-{id}-btn`

#### LoreRepository
- `lore-repository-container`
- `add-lore-entry-btn`
- `lore-entry-{id}`

#### SemanticSearchPanel
- `semantic-search-input`
- `search-results-container`
- `search-result-{id}`

## Playwright Test Examples

### Basic Screenshot Test

```typescript
import { test, expect } from '@playwright/test';

test('Factions System - Main View', async ({ page }) => {
  await page.goto('http://localhost:3008');
  await page.waitForTimeout(3000);

  await page.click('[data-testid="feature-tab-characters"]');
  await page.waitForTimeout(2000);

  await page.click('[data-testid="character-tab-factions"]');
  await page.waitForTimeout(2500);

  await page.screenshot({
    path: 'screenshots/factions-main-view.png',
    fullPage: true
  });
});
```

### Create Faction Test

```typescript
import { test, expect } from '@playwright/test';

test('Factions System - Create Faction', async ({ page }) => {
  await page.goto('http://localhost:3008');
  await page.click('[data-testid="feature-tab-characters"]');
  await page.click('[data-testid="character-tab-factions"]');
  await page.waitForTimeout(2000);

  // Open create form
  await page.click('button:has-text("New Faction")');
  await page.waitForSelector('[data-testid="create-faction-modal"]');

  // Fill form
  await page.fill('[data-testid="faction-name-input"]', 'Rebellion');
  await page.fill('[data-testid="faction-description-input"]', 'A rebel faction');

  // Screenshot before submission
  await page.screenshot({
    path: 'screenshots/faction-create-form.png'
  });

  // Submit
  await page.click('[data-testid="submit-faction-btn"]');
  await page.waitForTimeout(1000);

  // Screenshot after creation
  await page.screenshot({
    path: 'screenshots/faction-after-create.png',
    fullPage: true
  });
});
```

### AI Wizard Test

```typescript
import { test, expect } from '@playwright/test';

test('Factions System - AI Wizard', async ({ page }) => {
  await page.goto('http://localhost:3008');
  await page.click('[data-testid="feature-tab-characters"]');
  await page.click('[data-testid="character-tab-factions"]');
  await page.waitForTimeout(2000);

  // Open create form
  await page.click('button:has-text("New Faction")');
  await page.waitForSelector('[data-testid="create-faction-modal"]');

  // Open AI wizard
  await page.click('[data-testid="open-ai-wizard-btn"]');
  await page.waitForTimeout(1500);

  // Screenshot wizard
  await page.screenshot({
    path: 'screenshots/faction-ai-wizard.png'
  });
});
```

## Coverage Analysis

### Current Coverage

✅ **Well Covered**:
- Navigation (CenterPanel, CharactersFeature)
- Create Faction Form
- Color Customizer
- Character Cards
- Consistency Analysis

⚠️ **Partially Covered**:
- Faction Details (no test IDs)
- Faction Branding Panel (partial)
- Media Gallery (none)

❌ **Not Covered**:
- FactionsList component (no test IDs on cards/buttons)
- FactionDetails tabs (no test IDs)
- EmblemDesigner (no test IDs)
- LoreRepository (no test IDs)
- SemanticSearchPanel (no test IDs)
- TimelineView (no test IDs)

### Recommended Next Steps

1. Add test IDs to FactionsList component
2. Add test IDs to FactionDetails tabs
3. Add test IDs to EmblemDesigner modal
4. Add test IDs to MediaGallery items
5. Add test IDs to LoreRepository entries
6. Add test IDs to SemanticSearch components

## Related Files

- **Test Scenario Script**: `scripts/create-factions-context.ts`
- **Verification Script**: `scripts/verify-context.ts`
- **Implementation Doc**: `IMPLEMENTATION_TEST_SCENARIO_FACTIONS.md`
- **Context API**: `src/app/api/contexts/route.ts`

---

**Last Updated**: 2025-11-23
**Status**: Active Development
**Coverage**: ~40% (Navigation + Forms)
