# Global Modal System

## Overview

The Modal system provides a high-quality, accessible dialog component with focus trapping, animations, keyboard navigation, and ARIA compliance. It supports light/dark themes via Tailwind CSS and offers a composable API for building various modal interactions.

## Features

- **Focus Trapping**: Automatically traps focus within the modal and restores focus when closed
- **Keyboard Navigation**:
  - `Escape` key to close
  - `Tab` / `Shift+Tab` for focus cycling within modal
- **Framer Motion Animations**: Smooth entrance/exit animations with spring physics
- **ARIA Compliance**:
  - `role="dialog"`
  - `aria-modal="true"`
  - `aria-labelledby` / `aria-label` support
  - `aria-describedby` support
- **Flexible Sizing**: 5 size variants (sm, md, lg, xl, full)
- **Composable API**: Header, content, and footer slots
- **Theme Integration**: Glassmorphism design with cyan accents
- **Body Scroll Lock**: Prevents background scrolling when modal is open
- **Customizable Behavior**:
  - Close on backdrop click (optional)
  - Show/hide close button
  - Custom className support
- **Test Coverage Ready**: All interactive elements have `data-testid` attributes

## Components

### 1. Modal (Base Component)

The foundational modal component for building custom dialogs.

#### Props

```typescript
interface ModalProps {
  isOpen: boolean;              // Controls visibility
  onClose: () => void;          // Called when modal should close
  size?: ModalSize;             // 'sm' | 'md' | 'lg' | 'xl' | 'full'
  title?: string;               // Modal header title
  subtitle?: string;            // Optional subtitle below title
  icon?: ReactNode;             // Icon displayed next to title
  children: ReactNode;          // Main modal content
  footer?: ReactNode;           // Footer content (typically buttons)
  closeOnBackdropClick?: boolean; // Default: true
  showCloseButton?: boolean;    // Default: true
  className?: string;           // Additional classes for modal container
  ariaLabel?: string;           // Custom ARIA label
  ariaDescribedBy?: string;     // ID of element describing the modal
}
```

#### Basic Usage

```tsx
import { Modal } from '@/app/components/UI';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Example Modal"
        subtitle="This is a subtitle"
        size="md"
      >
        <p>Your modal content goes here...</p>
      </Modal>
    </>
  );
}
```

#### With Footer Actions

```tsx
import { Modal, Button } from '@/app/components/UI';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  footer={
    <div className="flex gap-2 justify-end w-full">
      <Button variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        Confirm
      </Button>
    </div>
  }
>
  <p>Are you sure you want to proceed?</p>
</Modal>
```

#### With Icon

```tsx
import { Modal } from '@/app/components/UI';
import { Settings } from 'lucide-react';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Settings"
  icon={<Settings size={16} />}
  size="lg"
>
  <SettingsForm />
</Modal>
```

### 2. ConfirmationModal (Specialized Component)

Pre-styled modal for confirmation dialogs with type-based theming.

#### Props

```typescript
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;         // Default: 'Confirm'
  cancelText?: string;          // Default: 'Cancel'
  type?: ConfirmationType;      // 'danger' | 'warning' | 'info' | 'success'
  size?: ModalSize;             // Default: 'sm'
  isLoading?: boolean;          // Shows loading state
}
```

#### Usage

```tsx
import { ConfirmationModal } from '@/app/components/UI';

<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Character"
  message="Are you sure you want to delete this character? This action cannot be undone."
  type="danger"
  confirmText="Delete"
  cancelText="Keep"
/>
```

#### Confirmation Types

- **danger**: Red theme, used for destructive actions (delete, remove)
- **warning**: Yellow theme, used for potentially risky actions
- **info**: Blue theme, used for informational confirmations
- **success**: Green theme, used for positive confirmations

### 3. Custom Modal Examples

#### Form Modal with Validation

```tsx
import { Modal, Input, Button } from '@/app/components/UI';
import { useState } from 'react';

function CreateCharacterModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    try {
      await api.createCharacter({ name });
      onClose();
    } catch (err) {
      setError('Failed to create character');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Character"
      closeOnBackdropClick={!isSaving}
      footer={
        <div className="flex gap-2 justify-end w-full">
          <Button variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSaving}
            loading={isSaving}
          >
            Create
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="px-3 py-2 bg-red-900/30 border border-red-500/50 rounded text-red-200 text-sm">
            {error}
          </div>
        )}
        <Input
          label="Character Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter name..."
          fullWidth
          required
        />
      </div>
    </Modal>
  );
}
```

#### Multi-Step Modal

```tsx
import { Modal, Button } from '@/app/components/UI';
import { useState } from 'react';

function WizardModal({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleNext = () => setStep(s => Math.min(s + 1, totalSteps));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Setup Wizard - Step ${step} of ${totalSteps}`}
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={step === totalSteps ? onClose : handleNext}
          >
            {step === totalSteps ? 'Finish' : 'Next'}
          </Button>
        </div>
      }
    >
      {step === 1 && <StepOneContent />}
      {step === 2 && <StepTwoContent />}
      {step === 3 && <StepThreeContent />}
    </Modal>
  );
}
```

#### Scrollable Content Modal

```tsx
import { Modal } from '@/app/components/UI';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Terms and Conditions"
  size="lg"
  footer={
    <Button variant="primary" onClick={onClose} fullWidth>
      I Agree
    </Button>
  }
>
  <div className="space-y-4 text-sm text-gray-300">
    {/* Long content that will scroll */}
    <section>
      <h3 className="font-semibold text-white mb-2">1. Introduction</h3>
      <p>Lorem ipsum dolor sit amet...</p>
    </section>
    {/* More sections... */}
  </div>
</Modal>
```

## Size Variants

| Size | Max Width | Best For |
|------|-----------|----------|
| `sm` | 28rem (448px) | Confirmations, simple forms |
| `md` | 42rem (672px) | Standard forms, medium content |
| `lg` | 56rem (896px) | Complex forms, detailed content |
| `xl` | 72rem (1152px) | Large forms, tables |
| `full` | 95vw | Full-screen experiences |

## Accessibility Features

### Focus Management

- When opened, focus moves to the first focusable element inside the modal
- When closed, focus returns to the element that triggered the modal
- Tab key cycles through focusable elements within the modal
- Shift+Tab cycles backwards

### Screen Reader Support

- Modal has `role="dialog"` and `aria-modal="true"`
- Title is linked via `aria-labelledby` when provided
- Custom labels supported via `ariaLabel` prop
- Descriptions linked via `ariaDescribedBy` prop
- Close button has descriptive `aria-label`

### Keyboard Shortcuts

- `Escape`: Close modal (when enabled)
- `Tab`: Move focus forward within modal
- `Shift+Tab`: Move focus backward within modal

## Styling and Theming

### Default Theme

The modal uses a glassmorphism design with:
- Dark gradient background (gray-900 → gray-800)
- Cyan accent borders with glow effect
- Semi-transparent backdrop with blur
- Smooth spring animations

### Custom Styling

```tsx
<Modal
  className="border-purple-500/30 shadow-purple-500/20"
  // ... other props
>
  {/* Content */}
</Modal>
```

### Responsive Design

- Modals adapt to viewport size
- Maximum height is 90vh to ensure close button is accessible
- Content area is scrollable when content exceeds available space
- Full-width on mobile, respecting safe areas

## Testing

All interactive elements include `data-testid` attributes:

- `modal-overlay`: The overlay container
- `modal-backdrop`: The backdrop (clickable area)
- `modal-container`: The modal dialog itself
- `modal-header`: The header section
- `modal-title`: The title text
- `modal-subtitle`: The subtitle text
- `modal-close-btn`: The close button
- `modal-content`: The content area
- `modal-footer`: The footer section

### Test Example

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/app/components/UI';

test('closes modal on backdrop click', () => {
  const onClose = jest.fn();

  render(
    <Modal isOpen={true} onClose={onClose} title="Test Modal">
      Content
    </Modal>
  );

  const backdrop = screen.getByTestId('modal-backdrop');
  fireEvent.click(backdrop);

  expect(onClose).toHaveBeenCalled();
});

test('closes modal on escape key', () => {
  const onClose = jest.fn();

  render(
    <Modal isOpen={true} onClose={onClose} title="Test Modal">
      Content
    </Modal>
  );

  fireEvent.keyDown(window, { key: 'Escape' });

  expect(onClose).toHaveBeenCalled();
});
```

## Best Practices

### Do's

- Use appropriate modal sizes for content
- Always provide a clear title
- Include clear action buttons in footer
- Use ConfirmationModal for simple yes/no dialogs
- Disable backdrop click during async operations
- Add loading states for async actions
- Provide meaningful ARIA labels
- Keep modal content focused and concise

### Don'ts

- Don't nest modals (use sequential modals instead)
- Don't use for non-critical information (use Drawer instead)
- Don't remove focus management features
- Don't make modals unclosable without good reason
- Don't overflow with too much content (split into steps)
- Don't forget to handle loading/error states

## Common Patterns

### Edit Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Item"
  icon={<Edit size={16} />}
  closeOnBackdropClick={!isSaving}
  footer={
    <div className="flex gap-2 justify-end w-full">
      <Button variant="ghost" onClick={onClose} disabled={isSaving}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSave} loading={isSaving}>
        Save Changes
      </Button>
    </div>
  }
>
  <EditForm />
</Modal>
```

### Delete Confirmation

```tsx
<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Item"
  message="This action cannot be undone."
  type="danger"
  confirmText="Delete"
  isLoading={isDeleting}
/>
```

### Info/Help Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Help"
  icon={<HelpCircle size={16} />}
  size="lg"
>
  <HelpContent />
</Modal>
```

## Performance Considerations

- Modals use `AnimatePresence` from Framer Motion for optimal animations
- Content is only rendered when `isOpen={true}`
- Body scroll lock prevents background scrolling
- Focus trap is efficient with minimal DOM queries
- Backdrop blur uses CSS `backdrop-filter` (hardware accelerated)

## Future Enhancements

- [ ] Stack multiple modals with z-index management
- [ ] Add modal transition presets (slide, fade, zoom)
- [ ] Support for modal templates (success, error, etc.)
- [ ] Draggable modal headers
- [ ] Resizable modals
- [ ] Modal state management hook (useModal)
- [ ] Auto-focus specific elements via prop
- [ ] Portal support for rendering outside root
- [ ] Animation customization props

## Related Components

- **ConfirmationModal**: Pre-styled confirmation dialogs
- **Drawer**: Side panel alternative for contextual content
- **Toast**: Non-blocking notifications
- **Button**: Used for modal actions
- **Input/Textarea**: Common in modal forms
