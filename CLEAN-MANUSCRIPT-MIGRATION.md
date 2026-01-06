# Clean Manuscript Design System Migration Guide

This document provides guidance for migrating components and features to follow the **Clean Manuscript** design philosophy established in the Writer Studio application.

## Design Philosophy

The Clean Manuscript design system creates a cohesive, professional writing environment with these core principles:

### Visual Identity

| Aspect | Approach |
|--------|----------|
| **Typography** | Sans-serif fonts (`font-sans`) for body content with **monospace accents** (`font-mono`) for labels, code-like elements, and status indicators |
| **Background** | Dark slate/zinc palette with subtle **notebook patterns** (ruled lines + dot grid) |
| **Accent Color** | Cyan (`cyan-500` / `#06b6d4`) for primary actions, focus states, and interactive elements |
| **Borders** | Subtle slate borders with transparency (`border-slate-700/50`) |
| **Corners** | Rounded elements (`rounded-md`, `rounded-lg`) |
| **Depth** | Glassmorphism effects with `backdrop-blur-sm` on elevated surfaces |

### Color Palette

```css
/* Background layers (darkest to lightest) */
--ms-bg-base: #030712;           /* gray-950 - Deepest background */
--ms-bg-surface: #0f172a;        /* slate-900 - Elevated surfaces */
--ms-bg-elevated: #1e293b;       /* slate-800 - Hover states, cards */

/* Accent - Cyan (Primary) */
--ms-accent-primary: #06b6d4;    /* cyan-500 */
--ms-accent-hover: #22d3ee;      /* cyan-400 */
--ms-accent-muted: #0891b2;      /* cyan-600 */

/* Text hierarchy */
--ms-text-primary: #f1f5f9;      /* slate-100 */
--ms-text-secondary: #cbd5e1;    /* slate-300 */
--ms-text-muted: #94a3b8;        /* slate-400 */
--ms-text-dim: #64748b;          /* slate-500 */

/* Status colors */
--ms-success: #10b981;           /* emerald-500 */
--ms-warning: #f59e0b;           /* amber-500 */
--ms-error: #ef4444;             /* red-500 */
--ms-info: #a855f7;              /* purple-500 */
```

---

## CSS Utility Classes

All utility classes are prefixed with `ms-` (manuscript) and defined in `src/app/globals.css`.

### Surface Classes

```tsx
// Base surface with blur
<div className="ms-surface" />          // bg-slate-900/80 backdrop-blur-sm

// Elevated surface
<div className="ms-surface-elevated" /> // bg-slate-800/80 backdrop-blur-sm

// Card container
<div className="ms-card" />             // Includes border, rounded-lg, backdrop-blur

// Panel (sidebars, dialogs)
<div className="ms-panel" />            // bg-slate-900/95 with subtle border

// Notebook background pattern
<div className="ms-notebook-bg" />      // Gradient + ruled lines + dot grid
```

### Typography Classes

```tsx
// Headings - sans-serif, semibold
<h2 className="ms-heading">Title</h2>

// Labels - monospace, uppercase, tracking
<span className="ms-label">// label_name</span>

// Code-style label (slightly brighter)
<span className="ms-code-label">field_name</span>

// Body text
<p className="ms-body">Content text</p>

// Caption (smallest)
<span className="ms-caption">metadata</span>
```

### Button Classes

```tsx
// Primary action - cyan background
<button className="ms-btn-primary">Save</button>

// Secondary action - slate background
<button className="ms-btn-secondary">Cancel</button>

// Ghost button - transparent with hover
<button className="ms-btn-ghost">Options</button>

// Danger action - red background
<button className="ms-btn-danger">Delete</button>
```

### Badge Classes

```tsx
<span className="ms-badge-default">Draft</span>    // Slate
<span className="ms-badge-accent">Active</span>    // Cyan
<span className="ms-badge-success">Saved</span>    // Emerald
<span className="ms-badge-warning">Orphan</span>   // Amber
<span className="ms-badge-error">Dead End</span>   // Red
```

### Input Classes

```tsx
// Standard input
<input className="ms-input" />

// Monospace input (for code/IDs)
<input className="ms-input-mono" />

// Textarea
<textarea className="ms-textarea" />

// Select dropdown
<select className="ms-select" />
```

### Border & Divider Classes

```tsx
<div className="ms-border" />          // Standard border
<div className="ms-border-subtle" />   // Lighter border
<div className="ms-border-accent" />   // Cyan accent border
<hr className="ms-divider" />          // Horizontal divider
<div className="ms-divider-vertical" /> // Vertical divider
```

### Transition Classes

```tsx
<div className="ms-transition" />      // 200ms ease-in-out
<div className="ms-transition-fast" /> // 150ms
<div className="ms-transition-slow" /> // 300ms
```

### Scrollbar

```tsx
<div className="ms-scrollbar" />       // Cyan-accented thin scrollbar
```

---

## Migration Patterns

### Pattern 1: Headers and Labels

**Before:**
```tsx
<h2 className="text-lg font-semibold text-white">Scene Editor</h2>
<label className="text-sm text-gray-400">Title</label>
```

**After:**
```tsx
<h2 className="ms-heading text-lg">// scene_editor</h2>
<label className="ms-label">scene_title</label>
```

Key changes:
- Add `font-mono` for code-comment style headers
- Use `uppercase tracking-wide` for labels
- Prefix labels with `//` for code-comment aesthetic
- Use underscores instead of spaces in label text

### Pattern 2: Cards and Panels

**Before:**
```tsx
<div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
  {content}
</div>
```

**After:**
```tsx
<div className="ms-card p-4">
  {content}
</div>

// Or with hover effect:
<div className="ms-card ms-card-hover p-4">
  {content}
</div>
```

### Pattern 3: Buttons

**Before:**
```tsx
<button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
  Save
</button>
```

**After:**
```tsx
<button className="ms-btn-primary">
  <Check className="w-4 h-4" />
  Save
</button>
```

### Pattern 4: Status Badges

**Before:**
```tsx
<span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
  Active
</span>
```

**After:**
```tsx
<span className="ms-badge-success">
  <span className="ms-status-active" />
  Active
</span>
```

### Pattern 5: Form Inputs

**Before:**
```tsx
<input
  className="w-full bg-gray-900 border border-gray-600 rounded px-3 py-2 text-white focus:border-blue-500"
/>
```

**After:**
```tsx
<input className="ms-input" />
```

### Pattern 6: Empty States

**Before:**
```tsx
<div className="text-center text-gray-400">
  <p>No items found</p>
</div>
```

**After:**
```tsx
<div className="py-8 text-center">
  <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
  <p className="ms-body text-slate-500">// no_items_found</p>
  <button className="mt-2 text-xs text-cyan-400 hover:underline font-mono">
    create_first_item
  </button>
</div>
```

### Pattern 7: Stats and Metadata

**Before:**
```tsx
<div className="text-sm text-gray-500">
  12 scenes | 45 choices
</div>
```

**After:**
```tsx
<div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wide text-slate-500">
  <span>12 scenes</span>
  <span className="ms-divider-vertical h-3" />
  <span>45 choices</span>
</div>
```

---

## Component Migration Checklist

When migrating a component, verify these elements:

### Typography
- [ ] Headers use `ms-heading` or `font-mono uppercase tracking-wide`
- [ ] Labels use `ms-label` with underscore_naming convention
- [ ] Body text uses `ms-body` or `text-slate-300`
- [ ] Metadata uses `font-mono text-[10px]` or `ms-caption`

### Surfaces
- [ ] Main containers use `ms-surface` or `ms-panel`
- [ ] Cards use `ms-card` with optional `ms-card-hover`
- [ ] Backgrounds use `ms-notebook-bg` where appropriate

### Interactive Elements
- [ ] Buttons use `ms-btn-*` classes
- [ ] Inputs use `ms-input` or `ms-input-mono`
- [ ] Focus states show cyan ring (`focus:ring-cyan-500/50`)

### Status & Feedback
- [ ] Status badges use `ms-badge-*` classes
- [ ] Status dots use `ms-status-*` classes
- [ ] Success/error/warning use semantic colors (emerald/red/amber)

### Layout
- [ ] Borders use `ms-border` or `ms-border-subtle`
- [ ] Dividers use `ms-divider` or `ms-divider-vertical`
- [ ] Scrollable areas have `ms-scrollbar`
- [ ] Transitions use `ms-transition` variants

---

## Files Already Migrated

These components have been updated to follow Clean Manuscript design:

### Core Layout
- `src/app/components/layout/AppShell.tsx`
- `src/app/components/layout/header/AppShellHeader.tsx`
- `src/app/components/layout/header/WriterStudioThemes.tsx`

### Story Module
- `src/app/features/story/sub_SceneGraph/SceneGraph.tsx`
- `src/app/features/story/sub_SceneGraph/components/SceneNode.tsx`
- `src/app/features/story/sub_SceneGraph/components/GraphCanvas.tsx`
- `src/app/features/story/sub_SceneEditor/SceneEditor.tsx`
- `src/app/features/story/sub_SceneEditor/components/ContentSection.tsx`
- `src/app/features/story/sub_ChoiceEditor/ChoiceEditor.tsx`
- `src/app/features/story/sub_ChoiceEditor/components/ChoiceForm.tsx`
- `src/app/features/story/sub_ChoiceEditor/components/ChoiceList.tsx`
- `src/app/features/story/sub_OutlineSidebar/OutlineSidebar.tsx`
- `src/app/features/story/sub_OutlineSidebar/components/OutlineItem.tsx`

### Styles
- `src/app/globals.css` - Complete design system tokens and utilities

---

## Files Pending Migration

Priority components that should be migrated next:

### High Priority
- `src/app/components/layout/LeftPanel.tsx`
- `src/app/components/layout/CenterPanel.tsx`
- `src/app/components/layout/RightPanel.tsx`
- `src/app/components/layout/PanelPresetOverlay.tsx`

### Medium Priority
- `src/app/features/story/sub_AICompanion/` (all components)
- `src/app/features/story/sub_PromptComposer/` (all components)
- `src/app/features/story/sub_StoryArtstyle/` (all components)

### Lower Priority
- `src/app/features/landing/Landing.tsx`
- `src/app/features/characters/` (all components)
- Modal and dialog components

---

## Design Tokens Reference

Quick reference for commonly used values:

| Token | Tailwind Class | Hex Value |
|-------|---------------|-----------|
| Background base | `bg-gray-950` | `#030712` |
| Surface | `bg-slate-900` | `#0f172a` |
| Elevated | `bg-slate-800` | `#1e293b` |
| Border default | `border-slate-700/50` | `rgba(51, 65, 85, 0.5)` |
| Primary accent | `text-cyan-500` | `#06b6d4` |
| Accent hover | `text-cyan-400` | `#22d3ee` |
| Primary text | `text-slate-100` | `#f1f5f9` |
| Muted text | `text-slate-400` | `#94a3b8` |
| Dim text | `text-slate-500` | `#64748b` |
| Success | `text-emerald-500` | `#10b981` |
| Warning | `text-amber-500` | `#f59e0b` |
| Error | `text-red-500` | `#ef4444` |

---

## Questions?

Refer to `src/app/globals.css` for the complete implementation of all CSS custom properties and utility classes. The design system is self-documenting with detailed comments explaining each section.
