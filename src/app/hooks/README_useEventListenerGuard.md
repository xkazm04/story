# useEventListenerGuard Hook

A custom React hook that automatically tracks all event listeners added within a component and logs warnings if any listeners remain attached after unmount. This helps developers identify memory leaks early in development.

## Features

- **Automatic Tracking**: Wraps native `addEventListener` and `removeEventListener` methods using override patterns
- **Memory Leak Detection**: Compares listeners added vs removed, warning about orphaned listeners
- **Development-Only**: Zero performance impact in production builds (controlled by `process.env.NODE_ENV`)
- **Real-time Statistics**: Provides detailed stats about active listeners
- **Debug Panel**: Optional visual component for real-time listener visualization
- **TypeScript Support**: Comprehensive type definitions for type safety

## Installation

The hook is already installed in your project at:
```
src/app/hooks/useEventListenerGuard.ts
```

## Basic Usage

### Simple Leak Detection

```tsx
import { useEventListenerGuard } from '@/app/hooks/useEventListenerGuard';

function MyComponent() {
  // Enable tracking with default options
  useEventListenerGuard('MyComponent');

  useEffect(() => {
    const handler = () => console.log('Window resized!');
    window.addEventListener('resize', handler);

    // If you forget to remove this listener, you'll get a warning on unmount!
    return () => window.removeEventListener('resize', handler);
  }, []);

  return <div>My Component</div>;
}
```

### With Statistics

```tsx
import { useEventListenerGuard } from '@/app/hooks/useEventListenerGuard';

function MyComponent() {
  const listenerGuard = useEventListenerGuard('MyComponent');

  useEffect(() => {
    console.log('Active listeners:', listenerGuard.stats.active);
    console.log('Total added:', listenerGuard.stats.totalAdded);
    console.log('Total removed:', listenerGuard.stats.totalRemoved);
    console.log('By type:', listenerGuard.stats.byEventType);
  });

  return <div>My Component</div>;
}
```

### With Debug Panel

```tsx
import { useEventListenerGuard } from '@/app/hooks/useEventListenerGuard';
import EventListenerDebugPanel from '@/app/components/dev/EventListenerDebugPanel';

function MyComponent() {
  const listenerGuard = useEventListenerGuard('MyComponent');

  return (
    <>
      <div>My Component Content</div>

      {/* Debug Panel - Development Only */}
      {process.env.NODE_ENV !== 'production' && (
        <EventListenerDebugPanel
          guardResult={listenerGuard}
          componentName="MyComponent"
        />
      )}
    </>
  );
}
```

## API Reference

### useEventListenerGuard

```tsx
function useEventListenerGuard(
  componentName?: string,
  options?: {
    enabled?: boolean;
    warnOnUnmount?: boolean;
    trackGlobalListeners?: boolean;
  }
): EventListenerGuardResult
```

#### Parameters

- **componentName** (optional): String to identify the component in debug messages (default: `'Component'`)
- **options** (optional):
  - **enabled**: Whether to enable tracking (default: `process.env.NODE_ENV !== 'production'`)
  - **warnOnUnmount**: Whether to log warnings on unmount (default: `true`)
  - **trackGlobalListeners**: Whether to track window/document listeners (default: `true`)

#### Returns: `EventListenerGuardResult`

```tsx
interface EventListenerGuardResult {
  stats: ListenerStats;
  trackedListeners: TrackedListener[];
  isEnabled: boolean;
}

interface ListenerStats {
  active: number;
  totalAdded: number;
  totalRemoved: number;
  byEventType: Record<string, number>;
}

interface TrackedListener {
  eventType: string;
  handler: EventListenerOrEventListenerObject;
  target: EventTarget;
  addedAt: number;
  capture: boolean;
  options?: AddEventListenerOptions | boolean;
  id: string;
}
```

### useEventListenerLeakDetector

A simpler version that just logs warnings without returning stats:

```tsx
function useEventListenerLeakDetector(componentName: string): void
```

#### Usage

```tsx
import { useEventListenerLeakDetector } from '@/app/hooks/useEventListenerGuard';

function MyComponent() {
  useEventListenerLeakDetector('MyComponent');
  // ... rest of component
}
```

## EventListenerDebugPanel Component

An optional debug panel that visualizes active event listeners in real-time.

### Features

- Collapsible tree view showing listener counts per event type
- Shows target element details
- Displays when listeners were added
- Highlights potential memory leaks
- Auto-hides in production

### Props

```tsx
interface EventListenerDebugPanelProps {
  guardResult: EventListenerGuardResult;
  componentName?: string;
}
```

## Integration Examples

### Example 1: ActManager Component

The hook is integrated into `ActManager.tsx` to track the `mousedown` event listener used for click-outside detection:

```tsx
// src/app/features/scenes/components/ActManager.tsx

const ActManager: React.FC = () => {
  const listenerGuard = useEventListenerGuard('ActManager', {
    enabled: process.env.NODE_ENV !== 'production',
    warnOnUnmount: true,
    trackGlobalListeners: true,
  });

  // Click outside handler that adds document listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // ... handler logic
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActsList]);

  return (
    <>
      {/* Component content */}

      {/* Debug Panel */}
      {process.env.NODE_ENV !== 'production' && (
        <EventListenerDebugPanel
          guardResult={listenerGuard}
          componentName="ActManager"
        />
      )}
    </>
  );
};
```

### Example 2: CharacterRelationships Component

Similar integration for tracking listeners in the relationships component:

```tsx
// src/app/features/characters/components/CharacterRelationships.tsx

const CharacterRelationships: React.FC<CharacterRelationshipsProps> = ({
  characterId,
}) => {
  const listenerGuard = useEventListenerGuard('CharacterRelationships', {
    enabled: process.env.NODE_ENV !== 'production',
    warnOnUnmount: true,
    trackGlobalListeners: true,
  });

  // Component logic...

  return (
    <>
      {/* Component content */}

      {/* Debug Panel */}
      {process.env.NODE_ENV !== 'production' && (
        <EventListenerDebugPanel
          guardResult={listenerGuard}
          componentName="CharacterRelationships"
        />
      )}
    </>
  );
};
```

## How It Works

1. **Override Pattern**: The hook overrides `addEventListener` and `removeEventListener` on tracked targets (window, document)
2. **Tracking**: Each listener is tracked with metadata (event type, handler, target, timestamp)
3. **Cleanup Detection**: On unmount, the hook compares added vs removed listeners
4. **Warnings**: If orphaned listeners exist, detailed warnings are logged to console
5. **Restoration**: Original methods are restored on cleanup to prevent side effects

## Console Output Examples

### Success (No Memory Leaks)

```
[ActManager] Event listener added: mousedown (Total: 1)
[ActManager] Event listener removed: mousedown (Total: 0)
[ActManager] ✓ All event listeners properly cleaned up
```

### Warning (Memory Leak Detected)

```
[CharacterRelationships] Event listener added: resize (Total: 1)
[CharacterRelationships] ⚠️ 1 event listener(s) were not removed before unmount!
[CharacterRelationships] Orphaned listeners by type: { resize: 1 }
[CharacterRelationships] Detailed orphaned listeners: [...]
```

## Performance Considerations

- **Development Only**: Hook is disabled in production by default
- **Minimal Overhead**: Uses refs to avoid re-renders
- **No Bundle Impact**: Debug panel tree-shakeable in production builds
- **Efficient Tracking**: Uses Map for O(1) lookups

## Best Practices

1. **Always Enable in Development**: Set `enabled: process.env.NODE_ENV !== 'production'`
2. **Use Descriptive Names**: Provide clear component names for easier debugging
3. **Pair with Debug Panel**: Visual feedback helps identify issues faster
4. **Test Unmount Behavior**: Ensure listeners are properly cleaned up
5. **Check Console Warnings**: Review warnings during development regularly

## Troubleshooting

### Hook Not Tracking Listeners

- Ensure `trackGlobalListeners: true` if tracking window/document events
- Verify listeners are added after the hook is initialized
- Check that `enabled` option is set to `true`

### False Positives

- Some third-party libraries may add listeners that persist across components
- Consider filtering specific event types if needed
- Review the `trackedListeners` array to identify the source

### Debug Panel Not Showing

- Ensure `process.env.NODE_ENV !== 'production'`
- Verify the panel is rendered after component content
- Check z-index conflicts with other fixed/absolute elements

## Migration Guide

To add the hook to existing components:

1. Import the hook:
   ```tsx
   import { useEventListenerGuard } from '@/app/hooks/useEventListenerGuard';
   ```

2. Call the hook at the top of your component:
   ```tsx
   const listenerGuard = useEventListenerGuard('MyComponent');
   ```

3. (Optional) Add the debug panel:
   ```tsx
   {process.env.NODE_ENV !== 'production' && (
     <EventListenerDebugPanel
       guardResult={listenerGuard}
       componentName="MyComponent"
     />
   )}
   ```

## Future Enhancements

Potential improvements for future versions:

- Support for element-specific tracking (not just window/document)
- Custom filtering by event type or target
- Integration with React DevTools
- Configurable warning thresholds
- Export listener data for analysis
- Automated testing utilities

## Related Files

- **Hook**: `src/app/hooks/useEventListenerGuard.ts`
- **Debug Panel**: `src/app/components/dev/EventListenerDebugPanel.tsx`
- **Example 1**: `src/app/features/scenes/components/ActManager.tsx`
- **Example 2**: `src/app/features/characters/components/CharacterRelationships.tsx`

## Support

For issues, questions, or feature requests related to this hook, please refer to the project's main documentation or contact the development team.
