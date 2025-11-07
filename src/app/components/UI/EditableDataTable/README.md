# EditableDataTable Component

A reusable, feature-rich data table component with inline editing, drag-and-drop reordering, row actions, and extensive customization options.

## Features

- **Inline Editing**: Edit cells directly with support for text, number, boolean, select, and custom types
- **Row Actions**: Configurable action buttons (edit, delete, custom actions)
- **Drag & Drop Reordering**: Optional drag-and-drop row reordering with visual feedback
- **Row Selection**: Multi-select rows with checkboxes
- **Expandable Rows**: Collapsible row details
- **Keyboard Navigation**: Full keyboard support for accessibility
- **Loading States**: Built-in skeleton loader
- **Empty States**: Customizable empty state message and icon
- **Validation**: Per-column validation with error display
- **Responsive**: Adapts to different screen sizes
- **Test-Friendly**: Comprehensive data-testid attributes throughout

## Basic Usage

```tsx
import { EditableDataTable, ColumnDefinition, RowAction } from '@/app/components/UI/EditableDataTable';
import { Pencil, Trash2 } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  active: boolean;
}

function UsersTable() {
  const [users, setUsers] = useState<User[]>([...]);

  const columns: ColumnDefinition<User>[] = [
    {
      key: 'name',
      header: 'Name',
      width: 'w-1/4',
      type: 'text',
      editable: true,
      validate: (value) => {
        if (!value || value.trim() === '') return 'Name is required';
        return null;
      },
    },
    {
      key: 'email',
      header: 'Email',
      width: 'flex-1',
      type: 'text',
      editable: true,
    },
    {
      key: 'role',
      header: 'Role',
      width: 'w-32',
      type: 'select',
      editable: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ],
    },
    {
      key: 'active',
      header: 'Active',
      width: 'w-24',
      type: 'boolean',
      editable: true,
    },
  ];

  const actions: RowAction<User>[] = [
    {
      icon: <Pencil className="h-4 w-4" />,
      label: 'Edit user',
      onClick: (user) => console.log('Edit', user),
      variant: 'primary',
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: 'Delete user',
      onClick: (user) => handleDelete(user),
      variant: 'danger',
    },
  ];

  const handleRowUpdate = async (user: User, updates: Partial<User>) => {
    // API call to update user
    await updateUser(user.id, updates);
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...updates } : u));
  };

  return (
    <EditableDataTable
      columns={columns}
      data={users}
      rowKey="id"
      onRowUpdate={handleRowUpdate}
      actions={actions}
      draggable={true}
      onReorder={handleReorder}
      showIndex={true}
      showHeader={true}
      data-testid="users-table"
    />
  );
}
```

## Column Configuration

### ColumnDefinition Props

| Prop | Type | Description |
|------|------|-------------|
| `key` | `string` | Column data key (required) |
| `header` | `string` | Column header text (required) |
| `width` | `string` | Tailwind width class (e.g., 'w-1/4', 'flex-1') |
| `type` | `'text' \| 'number' \| 'boolean' \| 'select' \| 'custom'` | Input type for editing |
| `editable` | `boolean` | Whether column is editable (default: true) |
| `editMode` | `'inline' \| 'modal' \| 'none'` | Edit interaction mode |
| `sortable` | `boolean` | Enable column sorting |
| `render` | `(value, row, index) => ReactNode` | Custom display renderer |
| `renderEdit` | `(value, onChange, row) => ReactNode` | Custom edit renderer |
| `options` | `Array<{label, value}>` | Options for select type |
| `validate` | `(value, row) => string \| null` | Validation function |
| `format` | `(value) => string` | Value formatter |
| `className` | `string` | Cell CSS classes |
| `headerClassName` | `string` | Header cell CSS classes |

## Row Actions

```tsx
const actions: RowAction<T>[] = [
  {
    icon: <Icon />,
    label: 'Action label',
    onClick: (row, index) => { ... },
    variant: 'default' | 'danger' | 'primary',
    show: (row) => boolean,      // Conditional visibility
    disabled: (row) => boolean,   // Conditional disabled state
  },
];
```

## Advanced Features

### Custom Cell Rendering

```tsx
{
  key: 'avatar',
  header: 'Avatar',
  render: (value, row) => (
    <img src={value} alt={row.name} className="w-8 h-8 rounded-full" />
  ),
  editable: false,
}
```

### Custom Edit Inputs

```tsx
{
  key: 'date',
  header: 'Date',
  type: 'custom',
  renderEdit: (value, onChange) => (
    <DatePicker value={value} onChange={onChange} />
  ),
}
```

### Expandable Rows

```tsx
<EditableDataTable
  expandable={true}
  renderExpanded={(row) => (
    <div className="p-4 bg-gray-900/20">
      <h4>Additional Details</h4>
      <p>{row.details}</p>
    </div>
  )}
  {...props}
/>
```

### Row Selection

```tsx
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

<EditableDataTable
  selectable={true}
  selectedRows={selectedRows}
  onSelectionChange={setSelectedRows}
  {...props}
/>
```

### Drag & Drop Reordering

```tsx
const handleReorder = async (fromIndex: number, toIndex: number) => {
  const reordered = [...data];
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  // Update order in backend
  await updateOrder(reordered);
  setData(reordered);
};

<EditableDataTable
  draggable={true}
  onReorder={handleReorder}
  {...props}
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `ColumnDefinition[]` | - | Column definitions (required) |
| `data` | `T[]` | - | Table data (required) |
| `rowKey` | `keyof T \| (row: T) => string` | - | Row identifier (required) |
| `onRowUpdate` | `(row, updates) => void \| Promise<void>` | - | Row update handler |
| `onRowDelete` | `(row) => void \| Promise<void>` | - | Row delete handler |
| `onRowAdd` | `(newRow) => void \| Promise<void>` | - | Row add handler |
| `actions` | `RowAction[]` | `[]` | Row action buttons |
| `draggable` | `boolean` | `false` | Enable drag & drop |
| `onReorder` | `(from, to) => void \| Promise<void>` | - | Reorder handler |
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectedRows` | `Set<string>` | - | Selected row IDs |
| `onSelectionChange` | `(selected) => void` | - | Selection change handler |
| `showIndex` | `boolean` | `true` | Show row index column |
| `indexHeader` | `string` | `'#'` | Index column header |
| `showHeader` | `boolean` | `true` | Show table header |
| `showFooter` | `boolean` | `false` | Show table footer |
| `emptyMessage` | `string` | `'No data available'` | Empty state message |
| `emptyIcon` | `ReactNode` | - | Empty state icon |
| `loading` | `boolean` | `false` | Show loading skeleton |
| `loadingRows` | `number` | `5` | Skeleton row count |
| `className` | `string` | - | Table container classes |
| `headerClassName` | `string` | - | Header row classes |
| `rowClassName` | `string \| (row, index) => string` | - | Row classes |
| `expandable` | `boolean` | `false` | Enable row expansion |
| `renderExpanded` | `(row, index) => ReactNode` | - | Expanded content renderer |
| `addable` | `boolean` | `false` | Show add button |
| `renderAddForm` | `(onSave, onCancel) => ReactNode` | - | Add form renderer |
| `onRowClick` | `(row, index) => void` | - | Row click handler |
| `highlightRow` | `(row) => boolean` | - | Row highlight condition |
| `keyboardNavigation` | `boolean` | `true` | Enable keyboard nav |
| `undoable` | `boolean` | `false` | Enable undo stack |
| `data-testid` | `string` | `'editable-data-table'` | Test ID prefix |

## Keyboard Shortcuts

- **Enter**: Start editing focused row
- **Escape**: Cancel editing
- **Ctrl/Cmd + Enter**: Save changes
- **Tab**: Navigate between cells (when editing)
- **Arrow Keys**: Navigate between rows

## Accessibility

- Full keyboard navigation support
- ARIA labels on action buttons
- Proper focus management
- Screen reader friendly

## Testing

All interactive elements include data-testid attributes:

- `{testId}`: Main table container
- `{testId}-select-all`: Select all checkbox
- `{testId}-row-{index}`: Individual rows
- `{testId}-row-{index}-drag-handle`: Drag handle
- `{testId}-row-{index}-select`: Row checkbox
- `{testId}-row-{index}-expand-btn`: Expand button
- `{testId}-row-{index}-cell-{key}`: Individual cells
- `{testId}-row-{index}-save-btn`: Save button
- `{testId}-row-{index}-cancel-btn`: Cancel button
- `{testId}-row-{index}-action-{idx}`: Action buttons
- `{testId}-empty`: Empty state
- `{testId}-add-btn`: Add button

## Examples in Codebase

- **Beats Table**: `src/app/features/story/components/Beats/BeatsTable.tsx`
- **Scenes Table**: `src/app/features/scenes/components/ScenesListTable.tsx`

## Notes

- The component uses `@hello-pangea/dnd` for drag and drop
- Animations powered by `framer-motion`
- Styling uses Tailwind CSS with glassmorphism design
- All async operations (update, delete, reorder) support Promises
