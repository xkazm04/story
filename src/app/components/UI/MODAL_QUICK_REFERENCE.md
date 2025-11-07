# Modal System Quick Reference

## Installation

```tsx
import { Modal, ConfirmationModal, useModal, useModalWithData } from '@/app/components/UI';
```

---

## Basic Usage

```tsx
function MyComponent() {
  const { isOpen, open, close } = useModal();

  return (
    <>
      <button onClick={open}>Open</button>
      <Modal isOpen={isOpen} onClose={close} title="Hello">
        Content goes here
      </Modal>
    </>
  );
}
```

---

## Common Patterns

### 1. Simple Confirmation
```tsx
<ConfirmationModal
  isOpen={isOpen}
  onClose={close}
  onConfirm={handleDelete}
  title="Delete Item"
  message="Are you sure?"
  type="danger"
/>
```

### 2. Form with Actions
```tsx
<Modal
  isOpen={isOpen}
  onClose={close}
  title="Create User"
  footer={
    <div className="flex gap-2 justify-end w-full">
      <Button variant="ghost" onClick={close}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </div>
  }
>
  <UserForm />
</Modal>
```

### 3. Edit Modal with Data
```tsx
const { isOpen, data, openWith, close } = useModalWithData<User>();

// Trigger
<button onClick={() => openWith(user)}>Edit</button>

// Modal
{data && (
  <Modal isOpen={isOpen} onClose={close} title={`Edit ${data.name}`}>
    <EditForm user={data} />
  </Modal>
)}
```

### 4. Promise-Based Confirmation
```tsx
const { confirm, ConfirmationModalProps } = useConfirmation({
  title: 'Delete',
  message: 'Are you sure?',
  type: 'danger'
});

const handleDelete = async () => {
  if (await confirm()) {
    // User confirmed
    await deleteItem();
  }
};

<ConfirmationModal {...ConfirmationModalProps} />
```

---

## Props Reference

### Modal
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls visibility |
| `onClose` | `() => void` | - | Close handler |
| `title` | `string` | - | Header title |
| `subtitle` | `string` | - | Header subtitle |
| `icon` | `ReactNode` | - | Header icon |
| `size` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'md'` | Modal width |
| `children` | `ReactNode` | - | Content |
| `footer` | `ReactNode` | - | Footer content |
| `closeOnBackdropClick` | `boolean` | `true` | Backdrop closes modal |
| `showCloseButton` | `boolean` | `true` | Show X button |
| `className` | `string` | - | Additional classes |

### ConfirmationModal
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Controls visibility |
| `onClose` | `() => void` | - | Close handler |
| `onConfirm` | `() => void` | - | Confirm handler |
| `title` | `string` | - | Modal title |
| `message` | `string \| ReactNode` | - | Message content |
| `type` | `'danger' \| 'warning' \| 'info' \| 'success'` | `'warning'` | Visual theme |
| `confirmText` | `string` | `'Confirm'` | Confirm button text |
| `cancelText` | `string` | `'Cancel'` | Cancel button text |
| `isLoading` | `boolean` | `false` | Loading state |

---

## Size Guide

| Size | Width | Best For |
|------|-------|----------|
| `sm` | 448px | Confirmations, alerts |
| `md` | 672px | Standard forms |
| `lg` | 896px | Complex forms |
| `xl` | 1152px | Large tables |
| `full` | 95vw | Full screen |

---

## Hooks

### useModal()
```tsx
const { isOpen, open, close, toggle, setIsOpen } = useModal();
```

### useModalWithData<T>()
```tsx
const { isOpen, data, openWith, close, updateData } = useModalWithData<User>();
```

### useModals(['id1', 'id2'])
```tsx
const { open, close, closeAll, toggle, isOpen } = useModals(['modal1', 'modal2']);
open('modal1');
close('modal2');
closeAll();
```

### useConfirmation()
```tsx
const { confirm, ConfirmationModalProps } = useConfirmation({
  title: 'Delete',
  message: 'Sure?',
  type: 'danger'
});

if (await confirm()) { /* confirmed */ }
```

---

## Keyboard Shortcuts

- **Escape**: Close modal
- **Tab**: Next element
- **Shift+Tab**: Previous element

---

## Test IDs

```tsx
// Modal
modal-overlay
modal-backdrop
modal-container
modal-header
modal-title
modal-subtitle
modal-close-btn
modal-content
modal-footer

// ConfirmationModal
confirmation-message
confirmation-confirm-btn
confirmation-cancel-btn
```

---

## Tips

✅ **DO**
- Use `sm` for simple confirmations
- Add footer actions for forms
- Disable backdrop click during save
- Use `useModalWithData` for edit dialogs
- Add loading states for async operations

❌ **DON'T**
- Nest modals inside modals
- Forget to add loading states
- Remove focus management
- Make modals unclosable
- Overflow with content (use scrolling)

---

## Full Documentation

See `README_MODAL_SYSTEM.md` for complete documentation.
See `Modal.examples.tsx` for 9 detailed examples.
