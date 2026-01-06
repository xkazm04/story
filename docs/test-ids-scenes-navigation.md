# Test IDs: Scenes Navigation & Management

## Overview

This document lists all `data-testid` attributes available in the Scenes - Navigation & Management feature for automated testing and screenshot capture.

## Context Information

- **Context ID**: `ctx_1763865421310_0cn3lnltf`
- **Context Name**: scenes - Navigation & Management
- **Feature Location**: Center Panel → Scenes Tab

---

## Navigation Test IDs

### Landing & Project Selection

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `project-card-{id}` | LandingCard.tsx | Card | Click to select project |
| `projects-grid` | Landing.tsx | Grid container | Project cards container |

### Feature Navigation

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `feature-tab-scenes` | CenterPanel.tsx | Tab button | Navigate to Scenes feature |
| `feature-tab-characters` | CenterPanel.tsx | Tab button | Navigate to Characters |
| `feature-tab-story` | CenterPanel.tsx | Tab button | Navigate to Story |
| `feature-tab-voice` | CenterPanel.tsx | Tab button | Navigate to Voice |
| `feature-tab-datasets` | CenterPanel.tsx | Tab button | Navigate to Datasets |
| `feature-tab-images` | CenterPanel.tsx | Tab button | Navigate to Images |
| `feature-tab-videos` | CenterPanel.tsx | Tab button | Navigate to Videos |
| `feature-tab-assets` | CenterPanel.tsx | Tab button | Navigate to Assets |

---

## Act Management Test IDs

### ActManager Component

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `act-manager` | ActManager.tsx | Container | Act management container |
| `no-acts-state` | ActManager.tsx | Empty state | Shown when no acts exist |
| `create-first-act-btn` | ActManager.tsx | Button | Create first act button |
| `more-acts-btn` | ActManager.tsx | Button | Show more acts dropdown |

### Act Tab Buttons

| Test ID Pattern | Component | Element | Purpose |
|-----------------|-----------|---------|---------|
| `act-tab-{actId}` | ActTabButton.tsx | Button | Individual act tab button |

**Note**: ActTabButton doesn't currently have test IDs. Consider adding:
```tsx
<button data-testid={`act-tab-${act.id}`}>
```

---

## Scene Management Test IDs

### ScenesList Component

| Test ID Pattern | Component | Element | Purpose |
|-----------------|-----------|---------|---------|
| `scene-item-{sceneId}` | ScenesList.tsx | List item | Individual scene in list |
| `scene-delete-btn-{sceneId}` | ScenesList.tsx | Button | Delete scene button |

**Note**: ScenesList doesn't currently have explicit test IDs. Consider adding:
```tsx
<div data-testid={`scene-item-${scene.id}`}>
  <button data-testid={`scene-delete-btn-${scene.id}`}>
```

### SceneAdd Component

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `add-scene-btn` | SceneAdd.tsx | Button | Open scene creation form |
| `scene-name-input` | SceneAdd.tsx | Input | Scene name input field |
| `create-scene-btn` | SceneAdd.tsx | Button | Submit create scene form |

**Note**: SceneAdd doesn't currently have test IDs. Consider adding them.

---

## ScenesFeature Test IDs

### Main Feature

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `scenes-feature` | ScenesFeature.tsx | Container | Main scenes feature container |
| `no-scene-selected` | ScenesFeature.tsx | Message | Empty state message |

**Note**: Consider adding these test IDs to ScenesFeature:
```tsx
<div data-testid="scenes-feature" className="h-full w-full flex flex-col">
  {!selectedSceneId && (
    <div data-testid="no-scene-selected" className="flex-1 flex items-center justify-center">
```

### Script Editor

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `script-editor` | ScriptEditor.tsx | Editor | Scene script editor |
| `script-textarea` | ScriptEditor.tsx | Textarea | Script text input |

**Note**: ScriptEditor test IDs need to be verified in the component.

---

## Test Scenario Usage

### Current Test Scenario

The test scenario for this context uses:

1. ✅ `[data-testid^="project-card-"]` - Select any project
2. ✅ `[data-testid="feature-tab-scenes"]` - Navigate to scenes

### Recommended Additional Test IDs

To improve test coverage, consider adding these test IDs:

```tsx
// ActTabButton.tsx
<button data-testid={`act-tab-${act.id}`} className={...}>

// ScenesList.tsx
<div
  data-testid={`scene-item-${scene.id}`}
  onClick={() => setSelectedSceneId(scene.id)}
>
  <button
    data-testid={`scene-delete-btn-${scene.id}`}
    onClick={(e) => { e.stopPropagation(); handleDelete(scene.id); }}
  >

// SceneAdd.tsx
<button
  data-testid="add-scene-btn"
  onClick={handleShowForm}
>

<input
  data-testid="scene-name-input"
  value={sceneName}
  onChange={(e) => setSceneName(e.target.value)}
/>

<button
  data-testid="create-scene-btn"
  onClick={handleCreateScene}
>

// ScenesFeature.tsx
<div data-testid="scenes-feature" className="h-full w-full flex flex-col">
  {!selectedSceneId ? (
    <div data-testid="no-scene-selected" className="flex-1 flex items-center justify-center">
  ) : (
    <div data-testid="scene-content" className="flex-1 overflow-auto p-4">
  )}
```

---

## Layout & Panel Test IDs

### AppShell Panels

| Test ID | Component | Element | Purpose |
|---------|-----------|---------|---------|
| `left-panel` | AppShell.tsx | Panel | Left resizable panel |
| `center-panel` | AppShell.tsx | Panel | Center panel (main content) |
| `right-panel` | AppShell.tsx | Panel | Right resizable panel |
| `left-center-handle` | AppShell.tsx | Handle | Resize handle between left/center |
| `center-right-handle` | AppShell.tsx | Handle | Resize handle between center/right |

---

## Complete Navigation Flow

### From Homepage to Scenes Feature

```typescript
// Step 1: Start at homepage
await page.goto('http://localhost:3008');

// Step 2: Click any project card
await page.click('[data-testid^="project-card-"]');

// Step 3: Click Scenes tab
await page.click('[data-testid="feature-tab-scenes"]');

// Step 4: Wait for feature to load
await page.waitForSelector('[data-testid="scenes-feature"]'); // Need to add this

// Step 5: Verify acts are loaded
await page.waitForSelector('[data-testid="act-manager"]');

// Step 6: Select an act (if needed)
await page.click('[data-testid^="act-tab-"]'); // Need to add this

// Step 7: Select a scene (if needed)
await page.click('[data-testid^="scene-item-"]'); // Need to add this
```

---

## Best Practices

### Test ID Naming Conventions

1. **Static elements**: Use descriptive names
   ```tsx
   data-testid="create-first-act-btn"
   data-testid="more-acts-btn"
   ```

2. **Dynamic elements**: Include ID in test-id
   ```tsx
   data-testid={`act-tab-${act.id}`}
   data-testid={`scene-item-${scene.id}`}
   ```

3. **Container elements**: Use feature/component name
   ```tsx
   data-testid="act-manager"
   data-testid="scenes-feature"
   ```

4. **Action buttons**: Include action in name
   ```tsx
   data-testid="create-scene-btn"
   data-testid={`scene-delete-btn-${scene.id}`}
   ```

### Selector Patterns

| Pattern | Use Case | Example |
|---------|----------|---------|
| `[data-testid="exact"]` | Exact match | `[data-testid="feature-tab-scenes"]` |
| `[data-testid^="prefix-"]` | Starts with | `[data-testid^="project-card-"]` |
| `[data-testid$="-suffix"]` | Ends with | `[data-testid$="-btn"]` |
| `[data-testid*="contains"]` | Contains | `[data-testid*="scene"]` |

---

## Missing Test IDs (Recommendations)

### High Priority

These test IDs would significantly improve test coverage:

1. **ActTabButton** - `act-tab-{actId}`
2. **ScenesList items** - `scene-item-{sceneId}`
3. **ScenesFeature container** - `scenes-feature`
4. **SceneAdd form** - `add-scene-btn`, `scene-name-input`, `create-scene-btn`

### Medium Priority

These would enable more detailed testing:

1. **Scene delete buttons** - `scene-delete-btn-{sceneId}`
2. **Act dropdown items** - `act-list-item-{actId}`
3. **Script editor** - `script-editor`, `script-textarea`
4. **Empty states** - `no-scene-selected`, `no-acts-state`

### Low Priority

These are nice-to-have for comprehensive testing:

1. **Tab menu items** - `scene-tab-script`, `scene-tab-relationships`
2. **Act create form** - `act-name-input`, `create-act-btn`
3. **Loading states** - `scenes-loading`, `acts-loading`

---

## Implementation Checklist

To improve test coverage for this feature:

- [ ] Add `data-testid` to ActTabButton component
- [ ] Add `data-testid` to ScenesList items
- [ ] Add `data-testid` to ScenesFeature container
- [ ] Add `data-testid` to SceneAdd form elements
- [ ] Add `data-testid` to delete buttons
- [ ] Add `data-testid` to empty states
- [ ] Document all new test IDs
- [ ] Update test scenarios with new selectors
- [ ] Create Playwright tests using these IDs

---

## References

- **Context**: `ctx_1763865421310_0cn3lnltf`
- **Test Scenario**: See `IMPLEMENTATION_SCENES_NAVIGATION_TEST_SCENARIO.md`
- **Components**: `src/app/features/scenes/`
- **Quick Start**: See `QUICKSTART_SCENES_NAVIGATION_TEST_SCENARIO.md`

---

**Last Updated**: November 23, 2025
