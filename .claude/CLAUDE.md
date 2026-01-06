# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Story is a Next.js 16 storytelling application for managing creative writing projects with characters, factions, scenes, acts, and beats. It uses Supabase as the backend with a mock data mode for development.

## Common Commands

```bash
npm run dev          # Development server with Turbopack
npm run build        # Production build with Turbopack
npm run lint         # ESLint
npm run test         # Vitest in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Vitest with UI
```

Run a single test file:
```bash
npx vitest run src/app/store/slices/__tests__/characterSlice.test.ts
```

## Architecture Overview

### State Management Pattern

The app uses a **dual-state architecture**:

1. **Zustand stores** (`src/app/store/`) - Client-side UI state (selected items, filters)
   - Slice-based architecture in `slices/` with selectors exported for optimized renders
   - Root store in `index.ts` re-exports individual slices

2. **TanStack Query** - Server state and API caching
   - Integration hooks in `src/app/hooks/integration/` wrap API calls with `createMockableQuery`
   - `queryHelpers.ts` provides the mock/real API toggle pattern

### API Layer

- **Route handlers**: `src/app/api/[resource]/route.ts` - Next.js API routes using Supabase
- **Client hooks**: `src/app/hooks/integration/use[Resource].ts` - TanStack Query hooks
- **Legacy API files**: `src/app/api/[resource].ts` - Direct fetch wrappers (being phased out)

API routes use centralized error handling from `src/app/utils/apiErrorHandling.ts`.

### Mock Data Toggle

Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local` to use mock data from `db/mockData/` instead of Supabase. The `createMockableQuery` helper in `queryHelpers.ts` handles the switch.

### Feature Structure

Features follow domain-driven organization in `src/app/features/`:
```
features/[feature]/
├── [Feature]Feature.tsx      # Main feature component with tabs
├── components/               # Feature-specific components
└── sub_[SubFeature]/        # Sub-feature modules
```

Features use `DynamicComponentLoader` for lazy loading heavy components.

### UI Components

Reusable components in `src/app/components/UI/`:
- Uses Tailwind CSS 4 with dark theme (slate color palette)
- `cn()` utility from `src/app/lib/utils.ts` for class merging
- Icons from `lucide-react`
- Animations via Framer Motion

### Layout System

Three-panel resizable layout in `src/app/components/layout/`:
- `AppShell.tsx` - Main wrapper with QueryClientProvider
- Panels are dynamically imported and use `react-resizable-panels`
- Panel sizes persist to localStorage

### Prompt System

LLM prompts in `src/prompts/` organized by domain (character, scene, story, etc.):
- Each prompt exports a function returning system/user messages
- Smart prompts use context gatherers from `src/app/lib/contextGathering.ts`
- Index file re-exports all prompts

### Database

- **Supabase**: Primary backend with client (`src/lib/supabase/client.ts`) and server (`src/lib/supabase/server.ts`) instances
- **Migrations**: `db/migrations/` - SQL migration files
- **Types**: `src/lib/supabase/database.types.ts` - Generated Supabase types

### Type Definitions

Domain types in `src/app/types/`:
- `Character.ts`, `Faction.ts`, `Project.ts`, `Act.ts`, etc.
- API error types in `ApiError.ts` with type guards

## Key Patterns

### Adding a New API Resource

1. Create route handler: `src/app/api/[resource]/route.ts`
2. Create integration hook: `src/app/hooks/integration/use[Resource].ts`
3. Add mock data: `db/mockData/[resource].ts`
4. Add types: `src/app/types/[Resource].ts`

### Component Data Fetching

```tsx
// Use integration hooks that support mock/real toggle
const { data, isLoading } = resourceApi.useProjectResources(projectId, !!projectId);
```

### Store Selectors

Use selectors for optimized re-renders:
```tsx
const selectedId = useCharacterStore((state) => state.selectedCharacter);
```

### Dynamic Imports in Features

Heavy components use `DynamicComponentLoader` with preload on hover:
```tsx
<DynamicComponentLoader
  importFn={() => import('./HeavyComponent')}
  componentProps={{}}
  moduleName="HeavyComponent"
  preloadOnHover
/>
```

## Environment Variables

Required for Supabase mode:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `NEXT_PUBLIC_USE_MOCK_DATA` - Set to `true` for mock data mode
- `NEXT_PUBLIC_API_BASE_URL` - Defaults to `http://localhost:3000/api`
