# Panel Preset System

## Overview
The Panel Preset System provides intelligent snap-to-preset functionality for the 3-panel resizable layout. When dragging a panel divider, an animated overlay appears showing preset panel ratios, allowing users to quickly snap to common layout configurations.

## Components

### PanelPresetOverlay
**Location**: `src/app/components/layout/PanelPresetOverlay.tsx`

An animated overlay that displays preset panel layouts during drag operations.

**Features**:
- Translucent backdrop with blur effect
- Animated entrance/exit with Framer Motion
- 6 preset layouts in a grid
- Visual bars showing panel proportions
- Bounce animation on hover
- Click to snap to preset
- Keyboard-friendly with test IDs

**Props**:
```typescript
interface PanelPresetOverlayProps {
  isVisible: boolean;
  onPresetSelect: (preset: PanelPreset) => void;
}
```

### Panel Presets Type
**Location**: `src/app/types/PanelPreset.ts`

Defines the preset panel layout configurations.

**Available Presets**:
1. **Balanced** (20/60/20) - Equal focus on all panels
2. **Center Focus** (15/70/15) - Maximize center workspace
3. **Left Expanded** (30/50/20) - More space for navigation
4. **Right Expanded** (20/50/30) - More space for details
5. **Minimal Sides** (10/80/10) - Maximum center space
6. **Even Split** (33/34/33) - Three equal columns

## Integration

### AppShell Integration
The system is integrated into `AppShell.tsx` with the following flow:

1. **Drag Detection**: When a ResizableHandle starts dragging, `handleDragging(true)` is called
2. **Delayed Show**: After 200ms of continuous dragging, the overlay appears (prevents accidental triggers)
3. **Preset Selection**: User clicks a preset, panels animate to new sizes via `ImperativePanelHandle.resize()`
4. **Drag End**: When drag ends or preset is selected, overlay disappears

**State Management**:
```typescript
const [isResizing, setIsResizing] = useState(false);
const [showPresetOverlay, setShowPresetOverlay] = useState(false);
const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

**Key Functions**:
- `handleDragging(isDragging: boolean)` - Manages overlay visibility during drag
- `handlePresetSelect(preset: PanelPreset)` - Snaps panels to preset sizes

## User Experience

### Drag Interaction Flow
1. User grabs a panel divider handle
2. Begins dragging
3. After 200ms, overlay fades in with preset options
4. User can:
   - Click a preset to snap instantly
   - Continue dragging to set custom size
   - Release to keep current position
5. Overlay fades out when drag ends or preset selected

### Visual Feedback
- **Overlay entrance**: Scale up + fade in + slide up
- **Preset cards**: Hover scale + bounce animation
- **Preset bars**: Scale and opacity change on hover
- **Panel resize**: Smooth transition with react-resizable-panels

## Animation Details

### Overlay Animations
```typescript
// Backdrop
initial: { opacity: 0 }
animate: { opacity: 1 }
exit: { opacity: 0 }

// Container
initial: { scale: 0.9, y: 20 }
animate: { scale: 1, y: 0 }
exit: { scale: 0.9, y: 20 }
transition: { type: 'spring', damping: 25, stiffness: 300 }
```

### Preset Card Hover
```typescript
whileHover: { scale: 1.05, y: -4 }
whileTap: { scale: 0.98 }

// Bounce animation
animate: {
  y: [0, -8, 0],
  transition: {
    duration: 0.6,
    repeat: Infinity,
    ease: 'easeInOut'
  }
}
```

## Testing

All interactive elements include `data-testid` attributes for automated testing:

**Overlay**:
- `data-testid="panel-preset-overlay"`

**Preset Buttons**:
- `data-testid="preset-balanced"`
- `data-testid="preset-center-focus"`
- `data-testid="preset-left-expanded"`
- `data-testid="preset-right-expanded"`
- `data-testid="preset-minimal-sides"`
- `data-testid="preset-even-split"`

**Panels**:
- `data-testid="left-panel"`
- `data-testid="center-panel"`
- `data-testid="right-panel"`

**Handles**:
- `data-testid="left-center-handle"`
- `data-testid="center-right-handle"`

## Design Philosophy

This feature follows the Vibeman Design Philosophy:

1. **Delightful Interactions**: Smooth animations and visual feedback
2. **Space Efficiency**: Quick access to optimized layouts
3. **Visual Polish**: Glassmorphism, gradients, and cyan accents
4. **User Control**: Balance between presets and custom sizing
5. **Progressive Disclosure**: Overlay only appears when needed

## Future Enhancements

Potential improvements:
- [ ] Save custom presets
- [ ] Keyboard shortcuts (e.g., Ctrl+1-6 for presets)
- [ ] Preset preview on hover (show layout in miniature)
- [ ] Undo/redo for layout changes
- [ ] Preset names/descriptions customization
- [ ] Animated panel size indicators during drag
- [ ] Touch gesture support for mobile
- [ ] Accessibility improvements (ARIA labels, focus management)

## Dependencies

- **react-resizable-panels**: Core panel resizing functionality
- **framer-motion**: Smooth animations and transitions
- **lucide-react**: Icons (Layout icon)
- **tailwindcss**: Styling and responsive design
