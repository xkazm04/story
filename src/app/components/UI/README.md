# Compact UI Design System

This directory contains the foundational UI components for the Story application, designed following the Vibeman Design Philosophy for compact, space-efficient, and elegant interfaces.

## Components Overview

### Button & IconButton
Unified button component with multiple variants and sizes.

**Usage:**
```tsx
import { Button, IconButton } from '@/app/components/UI';
import { Plus, Trash2 } from 'lucide-react';

// Primary button with icon
<Button variant="primary" size="sm" icon={<Plus />}>
  New Item
</Button>

// Secondary button
<Button variant="secondary" size="md">
  Cancel
</Button>

// Ghost button (no background)
<Button variant="ghost" size="sm">
  Secondary Action
</Button>

// Danger button
<Button variant="danger" size="sm">
  Delete
</Button>

// Icon-only button
<IconButton icon={<Trash2 />} size="sm" aria-label="Delete" />

// Loading state
<Button variant="primary" loading={isLoading}>
  Save Changes
</Button>
```

**Sizes:**
- `xs`: Extra small (px-2 py-1)
- `sm`: Small (px-3 py-1.5) - **Recommended for compact UIs**
- `md`: Medium (px-4 py-2) - Default
- `lg`: Large (px-6 py-3)

**Variants:**
- `primary`: Gradient cyan-to-blue with shadow
- `secondary`: Subtle white background with border
- `ghost`: Transparent background, shows on hover
- `danger`: Red color scheme for destructive actions
- `link`: Text-only link style

---

### Accordion
Collapsible sections with smooth animations. Supports single or multiple expansion.

**Usage:**
```tsx
import { Accordion, AccordionItemWrapper, AccordionTrigger, AccordionContent } from '@/app/components/UI';
import { User, Heart, MapPin } from 'lucide-react';

// Basic accordion (single item open at a time)
<Accordion type="single" defaultOpen="item-1">
  <AccordionItemWrapper value="item-1">
    <AccordionTrigger icon={<User />}>
      Personal Info
    </AccordionTrigger>
    <AccordionContent>
      <p>Personal information content here...</p>
    </AccordionContent>
  </AccordionItemWrapper>

  <AccordionItemWrapper value="item-2">
    <AccordionTrigger icon={<Heart />} badge={<span className="text-xs">3</span>}>
      Relationships
    </AccordionTrigger>
    <AccordionContent>
      <p>Relationships content here...</p>
    </AccordionContent>
  </AccordionItemWrapper>
</Accordion>

// Compact variant with array of items
import { CompactAccordion } from '@/app/components/UI';

<CompactAccordion
  type="multiple"
  items={[
    {
      value: '1',
      title: 'Section 1',
      content: <div>Content 1</div>,
      icon: <User />,
      badge: <span className="text-xs">5</span>,
    },
    {
      value: '2',
      title: 'Section 2',
      content: <div>Content 2</div>,
    },
  ]}
/>
```

**Types:**
- `single`: Only one item can be open at a time
- `multiple`: Multiple items can be open simultaneously

---

### Input, Textarea, Select
Form components with consistent styling and built-in error handling.

**Usage:**
```tsx
import { Input, Textarea, Select } from '@/app/components/UI';

// Text input
<Input
  label="Character Name"
  placeholder="Enter name..."
  size="sm"
  required
  error={errors.name}
  helperText="This will be the character's display name"
/>

// Mono-spaced input (for code, paths, etc.)
<Input
  variant="mono"
  label="File Path"
  size="sm"
/>

// Textarea with character count
<Textarea
  label="Description"
  rows={4}
  maxCharCount={500}
  showCharCount
  size="sm"
/>

// Select dropdown
<Select
  label="Faction"
  size="sm"
  options={[
    { value: '1', label: 'Faction A' },
    { value: '2', label: 'Faction B' },
    { value: '3', label: 'Independent', disabled: true },
  ]}
  placeholder="Select a faction..."
/>
```

**Sizes:** `sm`, `md`, `lg`

---

### Modal & Drawer
Overlay components for dialogs and side panels.

**Modal Usage:**
```tsx
import { Modal } from '@/app/components/UI';
import { Settings } from 'lucide-react';

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  size="md"
  title="Edit Character"
  subtitle="Update character information"
  icon={<Settings />}
  footer={
    <>
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave}>
        Save Changes
      </Button>
    </>
  }
>
  {/* Modal content */}
</Modal>
```

**Drawer Usage:**
```tsx
import { Drawer } from '@/app/components/UI';

<Drawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  side="right"
  size="md"
  title="Settings"
  footer={
    <Button variant="primary" fullWidth>
      Apply Changes
    </Button>
  }
>
  {/* Drawer content */}
</Drawer>
```

**Modal Sizes:** `sm` (384px), `md` (672px), `lg` (896px), `xl` (1152px), `full` (95vw)
**Drawer Sizes:** `sm` (320px), `md` (384px), `lg` (512px), `xl` (672px)
**Drawer Sides:** `left`, `right`, `top`, `bottom`

---

### Card Components
Content containers with multiple variants.

**Usage:**
```tsx
import { Card, CardHeader, CardContent, CardFooter, CompactCard, GridCard } from '@/app/components/UI';
import { User, MoreVertical } from 'lucide-react';

// Standard card
<Card variant="default" padding="md" hoverable>
  <CardHeader
    title="Character Name"
    subtitle="Supporting role"
    icon={<User />}
    action={<IconButton icon={<MoreVertical />} />}
  />
  <CardContent>
    <p>Character description goes here...</p>
  </CardContent>
  <CardFooter>
    <span className="text-xs text-gray-500">Created 2 days ago</span>
    <Button size="xs" variant="ghost">Edit</Button>
  </CardFooter>
</Card>

// Compact card (for lists)
<CompactCard
  icon={<User />}
  title="Character Name"
  subtitle="Faction A"
  meta="Level 5"
  actions={
    <>
      <IconButton icon={<Edit />} size="xs" />
      <IconButton icon={<Trash2 />} size="xs" variant="danger" />
    </>
  }
/>

// Grid card (for galleries)
<GridCard
  image="/images/character.jpg"
  title="Character Portrait"
  subtitle="By Artist Name"
  badge={<span className="text-xs bg-green-500 px-2 py-0.5 rounded">New</span>}
  overlay={
    <div className="flex gap-2">
      <IconButton icon={<Download />} />
      <IconButton icon={<Trash2 />} variant="danger" />
    </div>
  }
>
  <div className="flex gap-2 mt-2">
    <span className="text-xs text-gray-400">1024x1024</span>
    <span className="text-xs text-gray-400">PNG</span>
  </div>
</GridCard>
```

**Card Variants:**
- `default`: Standard gray background with border
- `bordered`: Thicker border for emphasis
- `gradient`: Gradient background
- `glass`: Glassmorphic effect

**Padding:** `none`, `sm`, `md`, `lg`

---

## Design Principles

### 1. Compact Spacing
- Use `sm` size by default for buttons and inputs
- Reduce gaps between elements: `gap-1.5` instead of `gap-2` or `gap-3`
- Compact padding: `p-3` instead of `p-4` or `p-6`

### 2. Consistent Sizing
All components follow the same size system:
- **xs**: 12px text, tight padding
- **sm**: 14px text, compact padding (recommended)
- **md**: 16px text, standard padding
- **lg**: 18px text, comfortable padding

### 3. Visual Hierarchy
- Primary actions: `variant="primary"` with gradient and shadow
- Secondary actions: `variant="secondary"` with subtle background
- Tertiary actions: `variant="ghost"` with no background

### 4. Motion & Animation
All interactive components include:
- Hover scale effects (subtle 1.02x)
- Tap scale effects (0.98x)
- Smooth transitions (200ms)
- Spring physics for modals/drawers

### 5. Accessibility
- Focus rings on all interactive elements
- Proper ARIA labels for icon buttons
- Keyboard navigation support (Escape to close)
- Disabled states with reduced opacity

---

## Migration Guide

### Replacing Old Buttons
**Before:**
```tsx
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
  Click Me
</button>
```

**After:**
```tsx
<Button variant="primary" size="sm">
  Click Me
</Button>
```

### Replacing Filter Pills
**Before:**
```tsx
<button
  className={`px-4 py-2 rounded-lg ${
    selected ? 'bg-blue-600' : 'bg-gray-800'
  }`}
>
  Filter
</button>
```

**After:**
```tsx
<Button
  variant={selected ? 'primary' : 'secondary'}
  size="sm"
>
  Filter
</Button>
```

### Replacing Manual Accordions
**Before:**
```tsx
<div>
  <button onClick={() => setOpen(!open)}>
    Toggle
  </button>
  {open && <div>Content</div>}
</div>
```

**After:**
```tsx
<Accordion type="single" defaultOpen="item-1">
  <AccordionItemWrapper value="item-1">
    <AccordionTrigger>Toggle</AccordionTrigger>
    <AccordionContent>Content</AccordionContent>
  </AccordionItemWrapper>
</Accordion>
```

---

## Best Practices

### DO:
✅ Use `size="sm"` for most UI elements (compact design)
✅ Use `variant="primary"` sparingly (only for main actions)
✅ Group related buttons with `gap-1.5`
✅ Use `IconButton` for toolbars and action rows
✅ Include loading states for async actions
✅ Provide `aria-label` for icon-only buttons

### DON'T:
❌ Mix old button styles with new Button components
❌ Use large padding (`px-6 py-3`) unless necessary
❌ Create custom buttons when a variant exists
❌ Forget disabled/loading states
❌ Use icons without labels in important actions

---

## Component Import Paths

All components can be imported from the main index:
```tsx
import {
  Button,
  IconButton,
  Input,
  Textarea,
  Select,
  Accordion,
  Modal,
  Drawer,
  Card,
} from '@/app/components/UI';
```

Or individually:
```tsx
import { Button } from '@/app/components/UI/Button';
import { Modal } from '@/app/components/UI/Modal';
```

---

## Next Steps

### High Priority Refactoring
1. **Replace all manual buttons** with `Button` component
2. **Convert expand/collapse sections** to `Accordion`
3. **Standardize all forms** with `Input`, `Textarea`, `Select`
4. **Replace modals** with unified `Modal` component

### Medium Priority
5. **Convert character/scene cards** to `Card` variants
6. **Create compact list views** with `CompactCard`
7. **Add drawers for side panels** (settings, filters)

### Low Priority
8. Add more button variants (e.g., `success`, `warning`)
9. Create `Badge` component for status indicators
10. Create `Tooltip` component for help text

---

## Questions?

Refer to the Vibeman Design Philosophy guide at `.claude/skills/compact-ui-design.md` for detailed design patterns and examples.
