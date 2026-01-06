# MediaGallery Component

A fully-featured, reusable media gallery component for displaying images and videos with lazy loading, responsive grids, and advanced UI interactions.

## Features

✅ **Lazy Loading** - Uses IntersectionObserver to load media only when visible
✅ **Skeleton Loading** - Smooth loading states with animated shimmer effects
✅ **Responsive Grid** - 1-6 column layouts with mobile-first design
✅ **Pagination** - Built-in pagination controls for large media sets
✅ **Modal Lightbox** - Full-screen view with keyboard navigation
✅ **Image & Video Support** - Handles both media types seamlessly
✅ **Error Handling** - Graceful fallback for failed media loads
✅ **Dark Mode** - 7 color themes matching app design system
✅ **Accessibility** - ARIA labels, keyboard navigation, alt text support
✅ **Custom Actions** - Render custom action buttons per media item
✅ **TypeScript** - Full type safety with exported interfaces
✅ **Test Ready** - Comprehensive data-testid attributes

## Installation

The component is already available in the project at:
```
src/app/components/ui/MediaGallery.tsx
```

No additional packages required - uses existing dependencies:
- `framer-motion` - Animations
- `lucide-react` - Icons
- `react` - Core framework

## Basic Usage

```tsx
import MediaGallery, { MediaItem } from '@/app/components/ui/MediaGallery';

const media: MediaItem[] = [
  {
    id: '1',
    url: '/images/photo1.jpg',
    type: 'image',
    alt: 'Beautiful landscape',
    description: 'A stunning mountain vista',
  },
  {
    id: '2',
    url: '/videos/demo.mp4',
    type: 'video',
    description: 'Product demonstration',
  },
];

function MyGallery() {
  return (
    <MediaGallery
      media={media}
      columns={3}
      spacing={4}
      color="purple"
    />
  );
}
```

## Props API

### MediaGalleryProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `media` | `MediaItem[]` | required | Array of media items to display |
| `columns` | `1 \| 2 \| 3 \| 4 \| 5 \| 6` | `3` | Number of grid columns |
| `spacing` | `2 \| 3 \| 4 \| 6 \| 8` | `4` | Gap spacing (Tailwind units) |
| `pagination` | `boolean` | `false` | Enable pagination controls |
| `itemsPerPage` | `number` | `12` | Items per page when pagination enabled |
| `color` | `'blue' \| 'green' \| 'purple' \| 'yellow' \| 'pink' \| 'orange' \| 'gray'` | `'purple'` | Color theme for borders/accents |
| `renderActions` | `(item: MediaItem) => ReactNode` | `undefined` | Custom action buttons for each item |
| `onMediaClick` | `(item: MediaItem) => void` | `undefined` | Custom click handler (overrides lightbox) |
| `emptyMessage` | `string` | `'No media available'` | Message when media array is empty |
| `keyboardNavigation` | `boolean` | `true` | Enable keyboard nav in lightbox |
| `className` | `string` | `''` | Additional CSS classes |

### MediaItem Interface

```typescript
interface MediaItem {
  id: string;              // Unique identifier
  url: string;             // Media URL
  type: 'image' | 'video'; // Media type
  alt?: string;            // Alt text for accessibility
  description?: string;    // Description shown in overlay/lightbox
  metadata?: Record<string, any>; // Custom metadata
}
```

## Advanced Examples

### Pagination

```tsx
<MediaGallery
  media={largeMediaArray}
  columns={4}
  spacing={4}
  pagination={true}
  itemsPerPage={12}
  color="blue"
/>
```

### Custom Actions (Delete Button)

```tsx
import { Trash2 } from 'lucide-react';

<MediaGallery
  media={media}
  renderActions={(item) => (
    <button
      onClick={() => handleDelete(item.id)}
      className="p-1 bg-red-600 hover:bg-red-700 rounded text-white"
      data-testid={`delete-media-${item.id}`}
    >
      <Trash2 size={14} />
    </button>
  )}
/>
```

### Custom Click Handler

```tsx
<MediaGallery
  media={media}
  onMediaClick={(item) => {
    console.log('Clicked:', item);
    // Navigate to detail page, open custom modal, etc.
  }}
/>
```

### Converting Faction Media

```tsx
import { FactionMedia } from '@/app/types/Faction';

const convertToMediaItems = (factionMedia: FactionMedia[]): MediaItem[] => {
  return factionMedia.map(m => ({
    id: m.id,
    url: m.url,
    type: 'image' as const,
    alt: m.description || m.type,
    description: m.description,
    metadata: {
      factionId: m.faction_id,
      uploadedAt: m.uploaded_at,
      uploaderId: m.uploader_id,
      mediaType: m.type,
    },
  }));
};

<MediaGallery
  media={convertToMediaItems(factionMedia)}
  columns={4}
  color="purple"
/>
```

## Keyboard Shortcuts (Lightbox)

- **ESC** - Close lightbox
- **←** Left Arrow - Previous media
- **→** Right Arrow - Next media
- **Enter/Space** - Open lightbox on focused item

## Lazy Loading Behavior

The component uses IntersectionObserver with:
- **Root Margin**: 100px (starts loading 100px before visible)
- **Threshold**: 0.01 (triggers when 1% visible)
- **Automatic Cleanup**: Observer disconnects after loading

This ensures optimal performance even with hundreds of media items.

## Skeleton Loading

Each media item shows a skeleton with:
- Animated shimmer effect
- Icon placeholder (image/video)
- Smooth fade-in when loaded
- Error state with retry option

## Color Themes

Available color themes match the app's design system:

- **blue** - Blue accent (tech, professional)
- **green** - Green accent (success, nature)
- **purple** - Purple accent (default, creative)
- **yellow** - Yellow accent (warning, energy)
- **pink** - Pink accent (playful, modern)
- **orange** - Orange accent (warm, vibrant)
- **gray** - Gray accent (neutral, minimal)

## Testing

All interactive elements include `data-testid` attributes:

```tsx
// Gallery navigation
data-testid="media-gallery-prev-page"
data-testid="media-gallery-next-page"

// Media items
data-testid="media-item-{id}"

// Lightbox
data-testid="media-lightbox"
data-testid="lightbox-prev-btn"
data-testid="lightbox-next-btn"
data-testid="lightbox-close-btn"

// Custom actions (example)
data-testid="delete-media-{id}"
```

## Integration with Existing Components

### FactionMediaGallery

Already integrated! See:
```
src/app/features/characters/sub_CharFactions/FactionMediaGallery.tsx
```

### Future Use Cases

- Character media galleries
- Scene/location image collections
- Asset libraries (props, costumes, etc.)
- Lore image repositories
- World-building visual references

## Performance Tips

1. **Use pagination** for collections >20 items
2. **Optimize images** before upload (webp, proper sizing)
3. **Lazy load external galleries** using code splitting
4. **Set itemsPerPage** based on typical viewport size

## Browser Support

- Chrome/Edge (modern)
- Firefox (modern)
- Safari 12+
- Mobile browsers (iOS Safari, Chrome Android)

Requires IntersectionObserver support (available in all modern browsers).

## Accessibility

- ✅ ARIA labels on all interactive elements
- ✅ Keyboard navigation support
- ✅ Alt text for all images
- ✅ Focus indicators
- ✅ Screen reader announcements
- ✅ Color contrast compliance

## Component Architecture

```
MediaGallery (main component)
├── MediaGalleryItem (individual media cards)
│   ├── Lazy loading logic
│   ├── Skeleton state
│   ├── Error state
│   └── Hover overlay
└── MediaLightbox (modal view)
    ├── Full-size media display
    ├── Navigation arrows
    ├── Keyboard controls
    └── Close button
```

## Contributing

When extending the component:
1. Maintain TypeScript type safety
2. Add `data-testid` to new interactive elements
3. Follow existing color theme patterns
4. Preserve accessibility features
5. Document new props in this README

## Related Components

- `SkeletonLoader` - Reusable skeleton patterns
- `ColoredBorder` - Border gradient utility
- `FactionMediaGallery` - Faction-specific implementation
- `Modal` - General modal component

## License

Part of the Story project.
