# Story - NextJS Storytelling Application

A clean, modern rewrite of the Storyteller application with optimized architecture and improved UX.

## 🎯 Project Overview

This is a migration from the original `fe-teller` application with a focus on:
- **Cleaner Architecture**: Feature-based organization
- **Better Performance**: Optimized rendering and code splitting
- **Type Safety**: Full TypeScript implementation
- **Modern Stack**: Latest Next.js, React Query, and Zustand
- **Simplified UI**: Streamlined components and state management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (default: http://localhost:8001)

### Installation

```bash
# Clone or navigate to the project
cd story

# Install dependencies (already done)
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local and configure your API URL
# NEXT_PUBLIC_API_URL=http://localhost:8001

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/app/
├── api/                    # API layer - centralized API functions
│   ├── characters.ts       # Character CRUD operations
│   └── factions.ts         # Faction CRUD operations
│
├── components/             # Reusable components
│   ├── layout/            # Layout components
│   │   ├── AppShell.tsx   # Main 3-panel resizable layout
│   │   ├── LeftPanel.tsx  # Projects/navigation sidebar
│   │   ├── CenterPanel.tsx # Main content area
│   │   └── RightPanel.tsx  # Properties/details panel
│   │
│   └── UI/                # Reusable UI components
│       ├── ColoredBorder.tsx  # Decorative borders
│       ├── TabMenu.tsx        # Tab navigation component
│       └── resizable.tsx      # Resizable panels wrapper
│
├── features/              # Feature modules (domain-driven)
│   └── characters/
│       ├── CharactersFeature.tsx      # Main feature component
│       └── components/
│           ├── CharacterCard.tsx      # Character display card
│           ├── CharacterCreateForm.tsx # Create new character
│           ├── CharacterDetails.tsx   # Character details view
│           ├── CharactersList.tsx     # Characters grid/list
│           └── FactionsList.tsx       # Factions management
│
├── store/                 # State management (Zustand)
│   ├── characterStore.ts  # Character state
│   └── projectStore.ts    # Project state
│
├── types/                 # TypeScript type definitions
│   ├── Character.ts       # Character, Trait, Relationship types
│   ├── Faction.ts         # Faction types
│   └── Project.ts         # Project types
│
├── utils/                 # Utility functions
│   └── api.ts            # API fetch utilities, hooks
│
├── lib/                   # Helper libraries
│   └── utils.ts          # Utility functions (cn)
│
├── hooks/                 # Custom React hooks (future)
├── globals.css           # Global styles
├── layout.tsx            # Root layout
└── page.tsx              # Home page
```

## 🛠️ Tech Stack

### Core
- **Next.js 15.5.6** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5** - Type safety

### State Management
- **Zustand 5.0** - Client state management
- **TanStack Query 5.90** - Server state & caching

### UI & Styling
- **Tailwind CSS 4** - Utility-first CSS
- **Framer Motion 12** - Animations
- **Lucide React** - Icon library
- **react-resizable-panels** - Resizable layout panels

### Utilities
- **clsx** & **tailwind-merge** - Conditional class merging

## 📋 Features

### ✅ Implemented
- **3-Panel Resizable Layout**: Adjustable workspace with left/center/right panels
- **Character Management**:
  - Create, view, edit, delete characters
  - Organize by factions
  - Filter by faction or independent
  - Card-based grid layout
  - Character details view
- **Faction Support**:
  - View factions list
  - Filter characters by faction
- **Type-Safe API Layer**: Centralized API with TypeScript
- **Modern UI**: Clean, dark theme with smooth animations

### 🚧 Planned Features
- Character appearance editor
- Character traits system
- Character relationships
- Faction CRUD operations
- Project management UI
- Act/Scene/Beat story structure
- Avatar upload/generation
- Authentication (Clerk integration)
- Real-time collaboration (SSE)

## 🔧 Development

### Available Scripts

```bash
# Development mode with Turbopack
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

### Code Organization Principles

1. **Feature-Based**: Related components grouped by feature (e.g., `features/characters/`)
2. **Separation of Concerns**: API, State, UI clearly separated
3. **Type Safety**: TypeScript throughout the codebase
4. **Component Composition**: Small, focused components
5. **Performance**: Dynamic imports, optimized re-renders

### Adding a New Feature

1. Create feature folder: `src/app/features/my-feature/`
2. Add types: `src/app/types/MyFeature.ts`
3. Add API functions: `src/app/api/my-feature.ts`
4. Create store if needed: `src/app/store/myFeatureStore.ts`
5. Build components in feature folder
6. Import feature in appropriate panel

## 🎨 UI Components

### TabMenu
Clean tab navigation with smooth animations:
```tsx
import TabMenu from '@/app/components/UI/TabMenu';

<TabMenu tabs={[
  { id: 'tab1', label: 'Tab 1', content: <Content1 /> },
  { id: 'tab2', label: 'Tab 2', content: <Content2 /> },
]} />
```

### ColoredBorder
Decorative gradient borders:
```tsx
import ColoredBorder from '@/app/components/UI/ColoredBorder';

<div className="relative">
  <ColoredBorder color="blue" />
  {/* content */}
</div>
```

### Resizable Panels
3-panel layout with drag handles:
```tsx
import { ResizablePanelGroup, ResizablePanel, ResizableHandle }
  from '@/app/components/UI/resizable';

<ResizablePanelGroup direction="horizontal">
  <ResizablePanel defaultSize={20}>Left</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={60}>Center</ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize={20}>Right</ResizablePanel>
</ResizablePanelGroup>
```

## 🔗 API Integration

### Configuration
Set your API URL in `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Using API Functions
```tsx
import { characterApi } from '@/app/api/characters';

// In component
const { data: characters, isLoading } = characterApi.useProjectCharacters(projectId);

// Create character
await characterApi.createCharacter({ name: 'Hero', project_id: '123' });

// Update character
await characterApi.updateCharacter(id, { name: 'New Name' });

// Delete character
await characterApi.deleteCharacter(id);
```

## 📊 State Management

### Zustand Stores
```tsx
import { useCharacterStore } from '@/app/store/characterStore';

const { selectedCharacter, setSelectedCharacter } = useCharacterStore();
```

### TanStack Query
Automatic caching and refetching:
```tsx
const { data, isLoading, refetch } = useApiGet<Character[]>(url);
```

## 🎯 Migration from Original

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed migration information.

### Key Improvements
- **66% less boilerplate** in character list component
- **100% TypeScript** coverage
- **Simplified state** - removed redundant contexts
- **Better performance** - optimized re-renders
- **Cleaner API** - async/await instead of callbacks

## 🤝 Contributing

### Guidelines
1. Follow existing folder structure
2. Use TypeScript strictly
3. Keep components small and focused
4. Add types for all API responses
5. Use TanStack Query for API calls
6. Use Zustand only for client-side state

## 📝 License

Private project - All rights reserved

## 🔮 Roadmap

### Phase 1 (Current)
- [x] Project structure
- [x] Character management basics
- [x] Faction support
- [x] Clean UI foundation

### Phase 2
- [ ] Character details (traits, appearance, relationships)
- [ ] Faction CRUD
- [ ] Project management
- [ ] Avatar upload

### Phase 3
- [ ] Story structure (Acts, Scenes, Beats)
- [ ] Authentication
- [ ] Real-time features
- [ ] Advanced character features

---

**Built with ❤️ using Next.js, React, and TypeScript**
