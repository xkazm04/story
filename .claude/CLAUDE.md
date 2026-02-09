# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Story is a Next.js 16 storytelling application for managing creative writing projects with characters, factions, scenes, acts, and beats. It uses Supabase as the backend with a mock data mode for development.

**Key technologies:** Next.js 16 (App Router), React 19, TypeScript 5, Supabase, TanStack Query 5, Zustand 5, Tailwind CSS 4, TipTap (rich text), ReactFlow (scene graphs), Framer Motion.

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

Tests use the `@` alias for imports (resolves to `./src`).

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
- Tailwind CSS 4 with dark theme (slate color palette)
- `cn()` utility from `src/app/lib/utils.ts` for class merging
- Icons from `lucide-react`
- Animations via Framer Motion
- Drag-and-drop via `@hello-pangea/dnd`
- Rich text editing via TipTap
- Scene graph visualization via ReactFlow

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
- AI providers: Groq SDK and OpenAI SDK for LLM calls

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

AI Services:
- `ANTHROPIC_API_KEY` - For Claude LLM (Simulator AI features)
- `NEXT_PUBLIC_USE_REAL_SIMULATOR_AI` - Set to `true` to use real Anthropic API
- `GEMINI_API_KEY` or `GOOGLE_AI_API_KEY` - For Gemini image generation

## Simulator Feature

The Simulator is a "What If" image visualization module located in `src/app/features/simulator/`.

### Architecture

```
features/simulator/
├── SimulatorFeature.tsx      # Main component with 3-panel layout
├── types.ts                  # All type definitions
├── index.ts                  # Exports
├── components/
│   ├── BaseImageInput.tsx    # Base format input
│   ├── DimensionGrid.tsx     # Grid of dimension cards
│   ├── DimensionCard.tsx     # Individual dimension input
│   ├── SmartBreakdown.tsx    # AI-powered vision parser
│   ├── FeedbackPanel.tsx     # Preserve/Change inputs + Generate
│   ├── PromptOutput.tsx      # Generated prompts list
│   ├── PromptCard.tsx        # Individual prompt with elements
│   ├── ElementChip.tsx       # Clickable element labels
│   ├── SavedImagePanel.tsx   # Left/right saved images panels
│   └── ImageRegenerationModal.tsx  # Gemini regeneration UI
├── hooks/
│   └── useSavedImages.ts     # localStorage persistence hook
└── lib/
    ├── defaultDimensions.ts  # Dimension presets and examples
    ├── simulatorAI.ts        # Client-side API functions
    ├── debugLogger.ts        # Debug logging utility
    ├── gameUIPresets.ts      # Game UI genre presets
    └── llmPrompts.ts         # LLM prompt templates
```

### API Routes

**Simulator AI** (`/api/ai/simulator`):
- `?action=breakdown` - Parse user vision into dimensions
- `?action=element-to-dimension` - Convert locked elements to dimensions
- `?action=label-to-dimension` - Refine dimensions from accepted element
- `?action=feedback-to-dimensions` - Redesign dimensions based on feedback

**Gemini Image Generation** (`/api/ai/gemini`):
- POST with `{ prompt, sourceImageUrl?, aspectRatio? }`
- Uses `gemini-2.5-flash-preview-05-20` model
- Returns base64 data URL in `imageUrl` field

**Debug Logging** (`/api/ai/simulator/log`):
- POST to append log entries
- DELETE to clear log
- Writes to `/log/simulator-debug.txt`

### Key Types

```typescript
// Dimension types
type DimensionType = 'environment' | 'artStyle' | 'characters' | 'mood' |
  'action' | 'era' | 'camera' | 'technology' | 'genre' | 'creatures' |
  'gameUI' | 'custom';

// Output modes
type OutputMode = 'gameplay' | 'concept';

// Element categories (for extracted prompt elements)
type ElementCategory = 'composition' | 'lighting' | 'style' | 'mood' |
  'subject' | 'setting' | 'quality';

// Saved image for persistence
interface SavedImage {
  id: string;
  url: string;
  prompt: string;
  promptId: string;
  slotIndex: number;
  side: 'left' | 'right';
  createdAt: string;
  locked: boolean;
}
```

### Iteration Workflow

1. **Input**: User enters base image description + fills dimensions
2. **Smart Breakdown** (optional): AI parses natural language into structure
3. **Generate**: Creates 4-5 diverse prompts with extracted elements
4. **Feedback Loop**:
   - Lock prompts/elements to preserve
   - Enter Preserve/Change feedback
   - Click elements to accept → refines dimensions via LLM
   - Re-generate with updated dimensions
5. **Save**: Lock prompts to save images to side panels
6. **Regenerate**: Click saved images → Gemini modal → before/after comparison

### Important Implementation Notes

- **Feedback Processing**: Uses LLM to intelligently redesign dimensions, not just append text
- **Dimension Influence**: All dimension types (including era, genre, custom) affect prompt generation
- **Prompt Length**: Keep under 1500 chars for image generation APIs
- **Aspect Ratio**: Default 16:9 (1344x768) for cinematic look
- **localStorage Key**: `simulator_saved_images` for persistence
- **Debug Logs**: Check `/log/simulator-debug.txt` for iteration analysis

### Adding New Dimension Types

1. Add to `DimensionType` in `types.ts`
2. Add preset in `defaultDimensions.ts` (DEFAULT_DIMENSIONS or EXTRA_DIMENSIONS)
3. Update `buildMockPromptWithElements()` in `SimulatorFeature.tsx` to use the dimension
4. Update `buildContentSwaps()` if using real prompt builder

### Extending Image Generation

Current implementation uses placeholder images (picsum.photos) when locking prompts.
To integrate real image generation (Leonardo AI, etc.):
1. Create API route similar to `/api/ai/gemini/route.ts`
2. Update `handlePromptLock` in `SimulatorFeature.tsx`
3. Add polling mechanism for async generation (see conversation context for Leonardo example)
