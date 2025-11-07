# EditableDataTable Architecture

## Component Hierarchy

```
EditableDataTable (Container)
├── Header Row
│   ├── Drag Column (optional)
│   ├── Select All Checkbox (optional)
│   ├── Index Column (optional)
│   ├── Data Columns (dynamic)
│   └── Actions Column
│
├── Body
│   ├── DragDropContext (optional)
│   │   └── Droppable
│   │       └── Draggable Items (if draggable)
│   │           └── EditableRow
│   │               ├── Drag Handle (optional)
│   │               ├── Selection Checkbox (optional)
│   │               ├── Index Cell (optional)
│   │               ├── Expand Toggle (optional)
│   │               ├── EditableCell (per column)
│   │               │   ├── View Mode (default)
│   │               │   │   └── Custom Render or Formatted Value
│   │               │   └── Edit Mode
│   │               │       ├── Text Input
│   │               │       ├── Number Input
│   │               │       ├── Boolean Checkbox
│   │               │       ├── Select Dropdown
│   │               │       └── Custom Component
│   │               ├── Actions Cell
│   │               │   ├── Save Button (edit mode)
│   │               │   ├── Cancel Button (edit mode)
│   │               │   └── Action Buttons (view mode)
│   │               └── Expanded Content (optional)
│   │
│   └── Add Form Row (optional)
│
└── Footer (optional)
    ├── Row Count
    ├── Selection Count (optional)
    └── Add Button (optional)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Parent Component                        │
│  (e.g., BeatsTable, ScenesListTable)                        │
│                                                              │
│  - Defines columns: ColumnDefinition<T>[]                   │
│  - Defines actions: RowAction<T>[]                          │
│  - Provides data: T[]                                       │
│  - Implements handlers:                                     │
│    • onRowUpdate(row, updates)                              │
│    • onRowDelete(row)                                       │
│    • onReorder(from, to)                                    │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├── Props
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                    EditableDataTable                         │
│                                                              │
│  State:                                                      │
│  - rowStates: Map<string, EditableRowState>                 │
│  - undoStack: T[][] (optional)                              │
│                                                              │
│  Manages:                                                    │
│  - Row editing state (editing, editValues, errors)          │
│  - Row expansion state                                      │
│  - Drag-and-drop coordination                               │
│  - Selection state (if controlled)                          │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├── For each row
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      EditableRow                             │
│                                                              │
│  State:                                                      │
│  - isSaving: boolean                                        │
│  - isDeleting: boolean                                      │
│                                                              │
│  Receives:                                                   │
│  - rowState: EditableRowState (from parent)                 │
│  - updateRowState: (updates) => void                        │
│                                                              │
│  Manages:                                                    │
│  - Edit mode toggle                                         │
│  - Field changes                                            │
│  - Validation errors                                        │
│  - Save/Cancel actions                                      │
│  - Keyboard shortcuts                                       │
└───────────────────┬─────────────────────────────────────────┘
                    │
                    ├── For each column
                    ▼
┌─────────────────────────────────────────────────────────────┐
│                     EditableCell                             │
│                                                              │
│  Renders based on:                                           │
│  - column.type (text, number, boolean, select, custom)      │
│  - isEditing flag                                           │
│  - column.render / column.renderEdit                        │
│                                                              │
│  View Mode:                                                  │
│  - Uses column.render() or column.format()                  │
│                                                              │
│  Edit Mode:                                                  │
│  - Uses column.renderEdit() or default input for type       │
│  - Displays validation errors                               │
│  - Calls onChange(value) on input                           │
└─────────────────────────────────────────────────────────────┘
```

## State Management Flow

### Editing Flow

```
1. User clicks Edit button on row
   └─> EditableRow.startEditing()
       └─> updateRowState({ isEditing: true, editValues: {...row} })
           └─> EditableDataTable updates rowStates Map
               └─> Re-renders EditableRow with isEditing=true
                   └─> EditableCell renders edit inputs

2. User modifies field
   └─> EditableCell calls onChange(newValue)
       └─> EditableRow.handleCellChange(key, value)
           └─> updateRowState({ editValues: { ...editValues, [key]: value } })
               └─> EditableDataTable updates rowStates Map
                   └─> Re-renders with new editValues

3. User clicks Save
   └─> EditableRow.saveEditing()
       ├─> Validates all fields using column.validate()
       ├─> If errors: updateRowState({ errors })
       └─> If valid:
           ├─> calls onRowUpdate(row, editValues)
           ├─> Parent updates backend
           └─> updateRowState({ isEditing: false, editValues: {} })

4. User clicks Cancel
   └─> EditableRow.cancelEditing()
       └─> updateRowState({ isEditing: false, editValues: {}, errors: {} })
```

### Reordering Flow

```
1. User drags row
   └─> DragDropContext captures drag event
       └─> Visual feedback (isDragging=true)

2. User drops row
   └─> handleDragEnd(result: DropResult)
       ├─> Extract fromIndex, toIndex
       ├─> Reorder data array locally (optimistic update)
       ├─> Save to undoStack (if undoable=true)
       ├─> Call onReorder(fromIndex, toIndex)
       │   └─> Parent updates backend
       └─> On error: revert to previous state
```

### Selection Flow

```
1. User clicks row checkbox
   └─> EditableRow calls onSelectionToggle()
       └─> EditableDataTable.handleSelectionToggle(row)
           ├─> Clone selectedRows Set
           ├─> Toggle row ID in Set
           └─> Call onSelectionChange(newSet)
               └─> Parent updates selection state

2. User clicks Select All
   └─> EditableDataTable.handleSelectAll()
       ├─> If all selected: clear selection
       └─> If not all: select all rows
           └─> Call onSelectionChange(newSet)
```

## Type System

```typescript
// Generic type T represents the row data type
EditableDataTable<T>
├── columns: ColumnDefinition<T>[]
│   ├── key: keyof T
│   ├── type: ColumnType
│   ├── render?: (value: T[key], row: T, index: number) => ReactNode
│   ├── renderEdit?: (value: T[key], onChange: (val) => void, row: T) => ReactNode
│   └── validate?: (value: T[key], row: T) => string | null
│
├── data: T[]
├── rowKey: keyof T | ((row: T) => string)
├── onRowUpdate?: (row: T, updates: Partial<T>) => void | Promise<void>
├── onRowDelete?: (row: T) => void | Promise<void>
└── actions: RowAction<T>[]
    ├── icon: ReactNode
    ├── onClick: (row: T, index: number) => void
    ├── show?: (row: T) => boolean
    └── disabled?: (row: T) => boolean
```

## Event Handling

### Keyboard Events

```
EditableRow.handleKeyDown(e)
├── If editing:
│   ├── Ctrl/Cmd + Enter → saveEditing()
│   └── Escape → cancelEditing()
└── If not editing:
    ├── Enter → startEditing()
    └── Space → startEditing()
```

### Click Events

```
Row Click → onRowClick(row, index) [if provided]
Checkbox → onSelectionToggle()
Expand → toggleExpanded()
Edit Button → startEditing()
Delete Button → action.onClick(row, index)
Save Button → saveEditing()
Cancel Button → cancelEditing()
```

## Performance Optimizations

1. **useCallback**: Memoized event handlers prevent unnecessary re-renders
2. **useMemo**: Column widths and actions calculated once
3. **Map-based state**: O(1) row state lookups
4. **Optimistic updates**: Immediate UI feedback before backend confirmation
5. **Conditional rendering**: Only render edit inputs when in edit mode
6. **Lazy expansion**: Expanded content only renders when expanded

## Accessibility

1. **Keyboard Navigation**:
   - Tab through interactive elements
   - Enter/Space to activate
   - Escape to cancel

2. **ARIA Labels**:
   - aria-label on action buttons
   - Checkbox labels for screen readers

3. **Focus Management**:
   - Focus on first edit input when editing starts
   - Return focus after save/cancel

4. **Semantic HTML**:
   - Proper button elements
   - Form inputs with labels

## Styling Architecture

```
Container (EditableDataTable)
├── rounded-lg border border-gray-800
└── overflow-hidden

Header
├── bg-gray-900/50
├── border-b border-gray-800
└── text-gray-300 text-xs font-medium

Row (EditableRow)
├── Default: hover:bg-gray-900/30
├── Dragging: bg-gray-900/50 shadow-xl
├── Highlighted: bg-blue-500/10
├── Editing: bg-gray-900/50
└── Custom: rowClassName prop

Cell (EditableCell)
├── View: text-sm text-gray-300
└── Edit: Input/Select components with consistent styling

Actions
├── IconButton with variant-based colors
├── Primary: text-blue-500
├── Danger: text-red-500
└── Default: text-gray-500
```

## Testing Strategy

```
Unit Tests (Future)
├── Column rendering with different types
├── Validation logic
├── Edit/Save/Cancel flow
├── Reordering logic
└── Selection logic

Integration Tests
├── BeatsTable workflow
├── ScenesListTable workflow
└── Keyboard navigation

E2E Tests (data-testid)
├── {testId}-select-all
├── {testId}-row-{index}
├── {testId}-row-{index}-cell-{key}
├── {testId}-row-{index}-save-btn
├── {testId}-row-{index}-cancel-btn
└── {testId}-row-{index}-action-{idx}
```

## Extension Points

1. **Custom Cell Types**: Add new ColumnType and renderEdit logic in EditableCell
2. **Custom Actions**: Define new RowAction with custom onClick handlers
3. **Custom Validation**: Implement column.validate() for complex rules
4. **Custom Rendering**: Use column.render() for special display formats
5. **Row Expansion**: Use renderExpanded() for nested data
6. **Hooks Integration**: onRowUpdate can call any API or state management
7. **Styling**: Override via className props at table/row/cell level
