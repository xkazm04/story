# SafePanelStorage

A resilient localStorage wrapper for persisting panel sizes with comprehensive error handling.

## Overview

SafePanelStorage provides a robust API for storing and retrieving panel sizes in localStorage while gracefully handling all common failure scenarios. The system ensures the UI remains functional even when localStorage is unavailable, full, or contains corrupted data.

## Features

- **Error Resilience**: Wraps all localStorage operations in try/catch blocks
- **Data Validation**: Validates numeric ranges and rejects invalid values (NaN, Infinity, out-of-bounds)
- **Quota Management**: Handles quota exceeded errors by attempting to clear old panel data
- **Default Fallbacks**: Returns sensible defaults when data is missing or invalid
- **Type Safety**: Full TypeScript support with exported types
- **Caching**: Caches localStorage availability check to minimize repeated tests
- **Logging**: Console warnings/errors for debugging storage issues

## API Reference

### Constants

```typescript
// Default panel sizes (percentages)
DEFAULT_PANEL_SIZES = {
  left: 20,
  center: 60,
  right: 20,
}

// Valid range constraints
PANEL_SIZE_CONSTRAINTS = {
  left: { min: 2, max: 40 },
  center: { min: 30, max: 80 },
  right: { min: 2, max: 40 },
}
```

### Types

```typescript
type PanelId = 'left' | 'center' | 'right';
```

### Functions

#### `getPanelSize(panelId: PanelId): number`

Safely retrieves a panel size from localStorage.

**Returns**: The stored size, or default if unavailable/invalid

**Example**:
```typescript
const leftPanelSize = getPanelSize('left'); // Returns 20 (default) if not stored
```

#### `setPanelSize(panelId: PanelId, size: number): boolean`

Safely stores a panel size to localStorage.

**Returns**: `true` if successful, `false` if failed or invalid

**Example**:
```typescript
const success = setPanelSize('left', 25);
if (!success) {
  console.warn('Failed to store panel size');
}
```

#### `removePanelSize(panelId: PanelId): boolean`

Removes a panel size from localStorage.

**Returns**: `true` if successful, `false` if failed

#### `resetAllPanelSizes(): boolean`

Resets all panel sizes to defaults by removing stored values.

**Returns**: `true` if all removals succeeded, `false` if any failed

#### `getAllPanelSizes(): Record<PanelId, number>`

Retrieves all panel sizes at once.

**Returns**: Object with all panel sizes (stored or defaults)

**Example**:
```typescript
const sizes = getAllPanelSizes();
// { left: 25, center: 60, right: 20 }
```

### Storage API

#### `safePanelStorageAPI`

Custom storage API compatible with react-resizable-panels' `storage` prop.

**Methods**:
- `getItem(key: string): string | null`
- `setItem(key: string, value: string): void`

**Example**:
```typescript
<ResizablePanelGroup
  direction="horizontal"
  storage={safePanelStorageAPI}
  autoSaveId="app-shell-panels"
>
  {/* panels */}
</ResizablePanelGroup>
```

## Integration

### AppShell.tsx

The safePanelStorage API is integrated into the main application shell:

```typescript
import { safePanelStorageAPI, DEFAULT_PANEL_SIZES } from '@/app/utils/safePanelStorage';

<ResizablePanelGroup
  direction="horizontal"
  storage={safePanelStorageAPI}
  autoSaveId="app-shell-panels"
>
  <ResizablePanel
    defaultSize={DEFAULT_PANEL_SIZES.left}
    minSize={15}
    maxSize={40}
  >
    <LeftPanel />
  </ResizablePanel>

  {/* ... */}
</ResizablePanelGroup>
```

## Error Handling

### Scenarios Handled

1. **localStorage Unavailable**
   - Private browsing mode
   - Browser security settings
   - Incognito mode

2. **Quota Exceeded**
   - Attempts to clear old panel sizes
   - Falls back gracefully if clearing fails

3. **Corrupted Data**
   - Invalid JSON
   - Non-numeric values
   - NaN or Infinity values
   - Out-of-range values

4. **General Errors**
   - Unexpected exceptions
   - DOM security errors

### Error Messages

All errors are logged to console with `[SafePanelStorage]` prefix:

```
[SafePanelStorage] localStorage not available, using default size
[SafePanelStorage] Invalid stored size for left: 50, using default
[SafePanelStorage] localStorage quota exceeded
[SafePanelStorage] Error reading panel size: Error: ...
```

## Testing

Comprehensive unit tests cover all scenarios:

```bash
npm run test:run -- src/app/utils/__tests__/safePanelStorage.test.ts
```

**Test Coverage**:
- ✓ Default values when nothing stored
- ✓ Valid stored values retrieval
- ✓ Invalid value rejection (too small/large, NaN, Infinity)
- ✓ localStorage unavailability
- ✓ Quota exceeded errors
- ✓ Constraint validation per panel type
- ✓ Remove and reset operations
- ✓ Storage API compatibility

## Performance

- **Caching**: localStorage availability is cached after first check
- **Minimal Overhead**: Simple validation logic with no external dependencies
- **Error Recovery**: Cache is reset on errors to allow recovery

## Browser Compatibility

Works in all modern browsers that support:
- localStorage API
- try/catch statements
- DOMException

Falls back gracefully in unsupported environments.

## Future Enhancements

- [ ] Add compression for stored panel layouts
- [ ] Support for named layout presets
- [ ] Migration utility for old storage formats
- [ ] Analytics/telemetry for storage failures
- [ ] Configurable validation constraints
- [ ] Session storage fallback option

## Related Files

- `src/app/utils/safePanelStorage.ts` - Main implementation
- `src/app/utils/__tests__/safePanelStorage.test.ts` - Unit tests
- `src/app/components/layout/AppShell.tsx` - Integration point
- `src/app/components/UI/resizable.tsx` - Resizable panel components
