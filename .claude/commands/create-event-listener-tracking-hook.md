# create-event-listener-tracking-hook

## Description

Implement a custom React hook `useEventListenerGuard` that automatically tracks all event listeners added within a component and logs warnings if any listeners remain attached after unmount. This hook will help developers identify memory leaks early by comparing listeners added vs removed. The hook should integrate with the existing project structure and provide a development-time debugging tool with minimal performance overhead in production.

## Implementation Steps

1. Create `src/app/hooks/useEventListenerGuard.ts` that wraps the native `addEventListener` and `removeEventListener` methods using a Proxy pattern to track listener lifecycle
2. Implement listener tracking data structure that stores event type, handler reference, target element, and timestamp for each listener added within the hook's scope
3. Add cleanup detection logic that runs on component unmount (via useEffect cleanup) and compares tracked listeners vs removed listeners, logging warnings for orphaned listeners
4. Integrate with existing project patterns by following the hook structure used in other parts of the codebase (similar to how `useProjectStore` and `useQuery` hooks are utilized in `CharacterRelationships.tsx` and `ActManager.tsx`)
5. Add development-only flag using `process.env.NODE_ENV` to disable tracking in production builds, ensuring no performance impact on production
6. Create comprehensive TypeScript interfaces for tracked listener metadata and return types, matching the project's type safety standards

## Files to Modify

- src/app/hooks/useEventListenerGuard.ts

## UI/UX Innovation Experiment

Add an optional debug panel component that visualizes active event listeners in real-time with a collapsible tree view showing listener counts per event type and target element - useful for development mode only

## Recommended Next Goal

After implementing the hook, create integration examples in existing components like ActManager.tsx and CharacterRelationships.tsx that use network status listeners or window resize listeners to demonstrate the hook's effectiveness

