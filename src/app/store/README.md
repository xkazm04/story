# Zustand Store Slices Architecture

## Overview

This directory contains the Zustand store implementation using a modular slice pattern. Each domain (project, character, etc.) has its own independent slice store, enabling better separation of concerns, easier testing, and cleaner composition.

## Architecture

```
src/app/store/
├── index.ts              # Root store - re-exports all slices
├── slices/
│   ├── projectSlice.ts   # Project domain state & actions
│   └── characterSlice.ts # Character domain state & actions
├── projectStore.ts       # [DEPRECATED] Legacy store
└── characterStore.ts     # [DEPRECATED] Legacy store
```

## Usage

### Basic Usage - Individual Slices

Most components should import individual slice stores directly:

```tsx
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacterStore } from '@/app/store/slices/characterSlice';

function MyComponent() {
  const { selectedProject, setSelectedProject } = useProjectStore();
  const { selectedCharacter, setSelectedCharacter } = useCharacterStore();

  // Use the state and actions
}
```

### Alternative - Root Store Import

You can also import from the root store index:

```tsx
import { useProjectStore, useCharacterStore } from '@/app/store';

function MyComponent() {
  const { selectedProject } = useProjectStore();
  const { selectedCharacter } = useCharacterStore();
}
```

### Advanced - Combined Store Hook

For components that need access to multiple stores (use sparingly):

```tsx
import { useRootStore } from '@/app/store';

function MyComponent() {
  const { project, character } = useRootStore();

  // Access project.selectedProject, character.selectedCharacter, etc.
}
```

## Store Slices

### Project Slice (`projectSlice.ts`)

Manages project-related state including projects, acts, scenes, and UI state.

**State:**
- `selectedProject`: Currently selected project
- `projects`: Array of all projects
- `selectedAct`: Currently selected act
- `acts`: Array of acts in current project
- `selectedScene`: Currently selected scene
- `selectedSceneId`: ID of selected scene
- `scenes`: Array of scenes in current act
- `showLanding`: Boolean for landing page visibility

**Actions:**
- `setSelectedProject(project)`: Set the active project
- `setProjects(projects)`: Update projects array
- `setSelectedAct(act)`: Set the active act
- `setActs(acts)`: Update acts array
- `setSelectedScene(scene)`: Set the active scene
- `setSelectedSceneId(id)`: Set scene by ID
- `setScenes(scenes)`: Update scenes array
- `setShowLanding(show)`: Toggle landing page
- `initializeWithMockProject(project)`: Dev helper for initialization

### Character Slice (`characterSlice.ts`)

Manages character-related state including character selection, filtering, and faction management.

**State:**
- `selectedCharacter`: ID of currently selected character
- `projectCharacters`: Array of characters in current project
- `activeType`: Active character type filter
- `factionId`: Currently selected faction ID

**Actions:**
- `setSelectedCharacter(id)`: Select a character
- `setProjectCharacters(characters)`: Update characters array
- `setActiveType(type)`: Set character type filter
- `setFactionId(id)`: Set faction filter

## TypeScript Support

All slices export their state interface for strong typing:

```tsx
import { ProjectState, CharacterState } from '@/app/store';

// Use in custom hooks or utilities
function useProjectData(): ProjectState['selectedProject'] {
  return useProjectStore(state => state.selectedProject);
}
```

## Development Tools

### StoreDevtools Component

A visual debugger component for real-time store state monitoring:

```tsx
import StoreDevtools from '@/app/components/ui/StoreDevtools';

function App() {
  return (
    <>
      {/* Your app */}
      {process.env.NODE_ENV === 'development' && (
        <StoreDevtools isOpen={true} />
      )}
    </>
  );
}
```

**Features:**
- Real-time state tracking
- Change history with diffs
- Animated transitions
- Collapsible store sections
- Performance metrics

## Best Practices

### 1. Prefer Selector Functions

Use selector functions for performance optimization:

```tsx
// Good - only re-renders when selectedProject changes
const selectedProject = useProjectStore(state => state.selectedProject);

// Avoid - re-renders on any store change
const { selectedProject } = useProjectStore();
```

### 2. Keep Slices Focused

Each slice should represent a single domain:
- ✅ Project slice handles projects, acts, scenes
- ✅ Character slice handles characters, factions
- ❌ Don't mix unrelated concerns in one slice

### 3. Use Actions for Mutations

Always use provided actions to update state:

```tsx
// Good
setSelectedProject(newProject);

// Bad - doesn't work with Zustand
selectedProject = newProject;
```

### 4. Testing

Test slices independently:

```tsx
import { useProjectStore } from '@/app/store/slices/projectSlice';

describe('ProjectSlice', () => {
  it('should update selected project', () => {
    const { setSelectedProject, selectedProject } = useProjectStore.getState();
    const mockProject = { id: '1', name: 'Test' };

    setSelectedProject(mockProject);

    expect(useProjectStore.getState().selectedProject).toBe(mockProject);
  });
});
```

## Migration Guide

### From Old Store Imports

If you have code using the old store paths, update them:

```tsx
// Old (deprecated)
import { useProjectStore } from '@/app/store/projectStore';
import { useCharacterStore } from '@/app/store/characterStore';

// New (recommended)
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { useCharacterStore } from '@/app/store/slices/characterSlice';

// Or from root
import { useProjectStore, useCharacterStore } from '@/app/store';
```

## Adding New Slices

To add a new domain slice:

1. Create `src/app/store/slices/yourSlice.ts`:

```tsx
import { create } from 'zustand';

interface YourState {
  data: any;
  setData: (data: any) => void;
}

export const useYourStore = create<YourState>((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));

export type { YourState };
```

2. Export from `src/app/store/index.ts`:

```tsx
export { useYourStore, type YourState } from './slices/yourSlice';
```

3. Update `RootStore` interface if needed:

```tsx
export interface RootStore {
  project: ProjectState;
  character: CharacterState;
  your: YourState; // Add your slice
}
```

## Performance Considerations

- **Tree Shaking**: Direct slice imports enable better tree-shaking
- **Re-renders**: Use selector functions to minimize re-renders
- **Memory**: Each slice is independent, reducing memory overhead
- **Bundle Size**: Slice pattern reduces bundle size through code splitting

## References

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Redux Toolkit Slice Pattern](https://redux-toolkit.js.org/api/createSlice)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)

## Next Steps

After implementing the slice architecture, consider:

1. **Custom Hooks**: Create domain-specific hooks that combine related state and actions
2. **Middleware**: Add Zustand middleware for persistence, logging, or devtools
3. **Type Safety**: Implement stricter TypeScript constraints to prevent mutations
4. **Testing**: Add comprehensive test coverage for all slices
5. **Documentation**: Document complex state interactions and side effects

---

**Last Updated**: October 25, 2025
**Version**: 1.0.0
**Maintainer**: Development Team
