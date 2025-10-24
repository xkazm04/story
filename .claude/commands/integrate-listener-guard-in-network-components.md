# integrate-listener-guard-in-network-components

## Description

Apply the `useEventListenerGuard` hook to existing components that add event listeners for network status monitoring and window events. Specifically target `ActManager.tsx`, `CharacterRelationships.tsx`, and `ScenesFeature.tsx` which use React Query and API calls that may attach listeners. This integration will validate the hook works correctly in real-world scenarios and catch any existing memory leaks.

## Implementation Steps

1. Import `useEventListenerGuard` hook at the top of `src/app/features/scenes/components/ActManager.tsx` and call it within the component body to track any listeners added by React Query or API calls
2. Add the hook to `src/app/features/characters/components/CharacterRelationships.tsx` since it uses `relationshipApi.useCharacterRelationships` and `characterApi.useProjectCharacters` which may attach network listeners
3. Integrate the hook into `src/app/features/scenes/ScenesFeature.tsx` as a parent-level guard to catch listeners from child components like ActManager and ScenesList
4. Update the API utilities in `src/app/api/factionRelationships.ts` and similar API files to ensure they properly clean up any listeners when queries unmount
5. Test by rendering these components, verifying no warnings are logged in console when components unmount cleanly, and confirming warnings appear if listeners are intentionally left unremoved
6. Document the integration pattern in code comments so other developers can follow the same approach when adding new event listeners

## Files to Modify

- src/app/features/scenes/components/ActManager.tsx
- src/app/features/characters/components/CharacterRelationships.tsx
- src/app/features/scenes/ScenesFeature.tsx
- src/app/api/factionRelationships.ts

## UI/UX Innovation Experiment

Add an optional console-based event listener summary report that displays on component unmount in development mode, showing total listeners added/removed, cleanup percentage, and suggestions for problematic listeners

## Recommended Next Goal

Create a comprehensive test suite for the hook using React Testing Library to ensure it catches various memory leak scenarios, then document best practices for event listener management in the project's developer guidelines

