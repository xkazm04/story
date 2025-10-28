# File Structure - Faction Lore and Achievements Gallery

## Overview

This document describes the implementation of the Faction Lore and Achievements Gallery feature, which provides a comprehensive view of faction history, achievements, and lore documentation.

## New Files Created

### Type Definitions

**src/app/types/Faction.ts** (Modified)
- Added `FactionEvent` interface for tracking faction timeline events
- Added `FactionAchievement` interface for faction-wide achievements
- Added `FactionLore` interface for lore documentation entries

### Components

**src/app/features/characters/sub_CharFactions/FactionLoreGallery.tsx**
- Main component orchestrating the lore gallery experience
- Manages three sections: Timeline, Achievements, and Lore
- Features "Story Mode" toggle for narrative presentation
- Integrates all sub-components

**src/app/features/characters/sub_CharFactions/TimelineView.tsx**
- Displays faction events in vertical timeline format
- Features animated event nodes with color-coded event types
- Expandable event cards with particle effects
- Smooth scroll animations with staggered entry

**src/app/features/characters/sub_CharFactions/AchievementBadges.tsx**
- Grid layout of faction achievements with badge icons
- Hover states revealing member names
- Animated particle effects around badges
- Visual feedback with shine effects

**src/app/features/characters/sub_CharFactions/LoreRepository.tsx**
- Searchable lore entries with category filtering
- Markdown-supported rich content display
- Expandable entries with typewriter-style reveal
- Edit/add buttons for faction leaders

**src/app/features/characters/sub_CharFactions/FactionDetails.tsx** (Modified)
- Added new "History & Achievements" tab
- Integrated FactionLoreGallery component
- Added Trophy icon import

### API Integration

**src/app/api/factions.ts** (New)
- Barrel export file re-exporting factionApi from hooks
- Provides clean import path for components

**src/app/api/characters.ts** (New)
- Barrel export file re-exporting characterApi from hooks
- Provides clean import path for components

**src/app/hooks/integration/useFactions.ts** (Modified)
- Added `useFactionMedia` hook for faction media gallery
- Added `useFactionEvents` hook for timeline events
- Added `useFactionAchievements` hook for achievements
- Added `useFactionLore` hook for lore entries
- Added mutation hooks for create/update/delete operations
- Mock data integration for all new entity types

### Mock Data

**db/mockData.ts** (Modified)
- Added `mockFactionEvents` array with sample timeline events
- Added `mockFactionAchievements` array with sample achievements
- Added `mockFactionLore` array with detailed lore entries
- Rich content including markdown-formatted lore

## Component Relationships

```
FactionDetails (Modified)
├── TimelineView
│   └── Animated event cards
├── AchievementBadges
│   └── Badge grid with hover effects
└── LoreRepository
    └── Searchable lore entries

FactionLoreGallery
├── Uses: factionApi hooks
│   ├── useFactionEvents
│   ├── useFactionAchievements
│   └── useFactionLore
├── Displays: TimelineView
├── Displays: AchievementBadges
└── Displays: LoreRepository
```

## Data Flow

1. **FactionDetails** receives faction prop and fetches faction members
2. **FactionLoreGallery** uses faction.id to fetch:
   - Events via `useFactionEvents(faction.id)`
   - Achievements via `useFactionAchievements(faction.id)`
   - Lore via `useFactionLore(faction.id)`
3. Data is passed to respective sub-components for rendering
4. All data fetching uses React Query for caching and optimistic updates

## UI/UX Innovations

### Timeline View
- Vertical timeline with gradient connecting line
- Color-coded event nodes based on event type (founding, battle, alliance, etc.)
- 360° rotation animation on node hover
- Expandable event cards with particle effects
- Staggered animation entry (0.1s delay per item)

### Achievement Badges
- 3-column responsive grid layout
- Badge icon with glow effect on hover
- Particle burst animation (6 particles in circular pattern)
- Member reveal on hover with fade-in animation
- Shine sweep effect on hover

### Lore Repository
- Full-text search across titles and content
- Category filtering (History, Culture, Conflicts, Notable Figures)
- Expandable entries with gradient fade for collapsed state
- Markdown content support for rich formatting
- Typewriter reveal effect (via CSS line-clamp)

### Story Mode
- Alternative narrative presentation of timeline
- Sequential fade-in animations (0.5s delay per event)
- Centered layout with dramatic typography
- Vertical connecting lines between events

## Architectural Decisions

### Component Structure
- Separated concerns: main gallery orchestrator with three specialized sub-components
- Each sub-component is independently testable and reusable
- Props-based data flow (no global state dependency within sub-components)

### API Design
- Hooks follow React Query best practices
- Mock data support for development without backend
- Consistent query key naming: `['faction-{entity}', factionId]`
- 5-minute stale time for all queries (balance between freshness and performance)

### Animation Strategy
- Framer Motion for all animations
- `AnimatePresence` for smooth tab transitions
- Staggered animations for list items (better perceived performance)
- Hardware-accelerated transforms (scale, opacity, translateX/Y)

### Type Safety
- All entity types defined in Faction.ts
- Proper TypeScript interfaces for all components
- No `any` types used

## Performance Considerations

- React Query caching prevents unnecessary refetches
- Staggered animations prevent layout thrashing
- `AnimatePresence mode="wait"` for tab switching
- Memoized filtering in LoreRepository
- Lazy evaluation of character names in AchievementBadges

## Future Enhancements

Based on current implementation, recommended next features:

1. **Export Functionality** - Generate PDF/HTML documents of faction history
2. **Collaborative Editing** - Real-time lore editing with conflict resolution
3. **Version History** - Track changes to lore entries over time
4. **Media Integration** - Link media gallery items to timeline events
5. **Cross-Faction Timeline** - View events from multiple factions chronologically
6. **Achievement Notifications** - Toast notifications when achievements are unlocked
7. **Lore Templates** - Pre-built templates for common lore entry types

## Next Steps

**Recommended Next Goal: Faction Export Feature**

Implement a comprehensive export system that generates beautifully formatted documents containing:
- Faction branding (colors, emblems, logos)
- Complete media gallery
- Full timeline with event details
- All achievements with member information
- Complete lore repository with markdown rendering

Export formats:
- PDF (print-ready, formatted for sharing)
- HTML (interactive web page, embeddable)
- Markdown (for wikis and documentation systems)

This feature would:
- Provide tangible value for users documenting their worldbuilding
- Enable sharing faction stories with others
- Prepare infrastructure for future collaboration features
- Create opportunities for premium features (custom templates, branded exports)

Technical requirements:
- PDF generation library (e.g., jsPDF, Puppeteer)
- HTML template engine
- Export preview modal
- Background job queue for large exports
- Cloud storage integration for export delivery
