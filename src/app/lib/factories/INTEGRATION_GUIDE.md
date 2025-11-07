# Integration Guide - Schema-Based UI Component Factory

## Quick Start

### 1. Initialize the Factory

Add this to your app's root layout or initialization file:

```typescript
// src/app/layout.tsx or similar
import { initializeComponentFactory } from '@/app/lib/factories';

// Call once at app startup
initializeComponentFactory();
```

### 2. Use Generated Components

#### Replace Existing Tables

**Before:**
```typescript
// src/app/features/story/components/Beats/BeatsOverview.tsx
export function BeatsOverview() {
  const { data: beats } = useGetBeats(projectId);

  return (
    <table>
      {/* Custom table implementation with 200+ lines */}
    </table>
  );
}
```

**After:**
```typescript
// src/app/features/story/components/Beats/BeatsOverview.tsx
import { useSchemaTable, beatSchema } from '@/app/lib/factories';

export function BeatsOverview() {
  const { data: beats } = useGetBeats(projectId);
  const { mutate: updateBeat } = useUpdateBeat();
  const { mutate: deleteBeat } = useDeleteBeat();

  const { render } = useSchemaTable({
    schema: beatSchema,
    data: beats || [],
    loading: !beats,
    options: {
      draggable: true,
      selectable: true,
      expandable: true,
    },
    onUpdate: (beat, updates) => updateBeat({ id: beat.id, ...updates }),
    onDelete: (beat) => deleteBeat(beat.id),
    testId: 'beats-overview-table',
  });

  return render();
}
```

**Result:** ~200 lines of code reduced to ~20 lines

#### Replace Existing Forms

**Before:**
```typescript
// Custom form with validation, state management, etc.
export function CreateBeatForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  // ... 150+ lines of form code
}
```

**After:**
```typescript
import { useSchemaForm, beatSchema } from '@/app/lib/factories';

export function CreateBeatForm({ projectId, onSuccess }) {
  const { mutate: createBeat } = useCreateBeat();

  const { render } = useSchemaForm({
    schema: beatSchema,
    mode: 'create',
    options: { layout: 'grid', columns: 2 },
    onSubmit: async (beat) => {
      await createBeat({ ...beat, project_id: projectId });
      onSuccess();
    },
    testId: 'create-beat-form',
  });

  return render();
}
```

**Result:** ~150 lines reduced to ~15 lines

### 3. Customize Schemas (Optional)

If you need custom behavior for a specific use case:

```typescript
import { beatSchema } from '@/app/lib/factories';

// Create a customized version
const customBeatSchema = {
  ...beatSchema,
  fields: beatSchema.fields.map((field) => {
    // Hide certain fields
    if (field.key === 'paragraph_id') {
      return { ...field, show: () => false };
    }

    // Add custom validation
    if (field.key === 'name') {
      return {
        ...field,
        validations: [
          ...(field.validations || []),
          {
            type: 'custom',
            validator: (value) => !existingNames.includes(value),
            message: 'Name already exists',
          },
        ],
      };
    }

    return field;
  }),
};
```

### 4. Create New Schemas

For new entities:

```typescript
import { EntitySchema } from '@/app/lib/factories';
import { MyEntity } from '@/app/types/MyEntity';

export const myEntitySchema: EntitySchema<MyEntity> = {
  name: 'myEntity',
  displayName: 'My Entities',
  primaryKey: 'id',
  displayField: 'name',

  fields: [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      required: true,
      editable: true,
      sortable: true,
      width: 'flex-1',
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      editable: true,
      options: [
        { label: 'Active', value: 'active', color: '#10b981' },
        { label: 'Inactive', value: 'inactive', color: '#6b7280' },
      ],
    },
  ],

  defaultValues: {
    name: '',
    status: 'active',
  },
};

// Register it
import { schemaRegistry } from '@/app/lib/factories';
schemaRegistry.register(myEntitySchema);

// Use it
import { useSchemaTable } from '@/app/lib/factories';

function MyEntityTable() {
  const { render } = useSchemaTable({
    schema: myEntitySchema,
    data: myEntities,
  });
  return render();
}
```

## Migration Strategy

### Phase 1: Parallel Implementation (Recommended)

1. Keep existing components as-is
2. Create new factory-based versions alongside them
3. Test thoroughly with both versions
4. Switch to factory version once validated
5. Remove old component

### Phase 2: Direct Replacement (For simple components)

1. Replace component implementation directly
2. Keep the same component name and props
3. Update tests to use new test IDs
4. Deploy and monitor

## Component Mapping

Here's which existing components can be replaced:

| Current Component | Schema | Notes |
|-------------------|--------|-------|
| `BeatsOverview.tsx` | `beatSchema` | Direct replacement, ~200 lines → 20 lines |
| `BeatsTableRow.tsx` | Built-in | No longer needed |
| `BeatsTableAdd.tsx` | Built-in | No longer needed |
| `ActList.tsx` | `actSchema` | Direct replacement |
| `ScenesList.tsx` | `sceneSchema` | Direct replacement |
| `CharactersList.tsx` | `characterSchema` | Direct replacement |
| Character forms | `characterSchema` | Use form mode |

## Advanced Usage

### Custom Actions

Add custom actions to any schema:

```typescript
const schemaWithActions: EntitySchema<Beat> = {
  ...beatSchema,
  actions: [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      handler: async (beat) => {
        await duplicateBeat(beat);
      },
      variant: 'primary',
    },
    {
      id: 'export',
      label: 'Export',
      icon: <Download className="w-4 h-4" />,
      handler: async (beat) => {
        exportToFile(beat);
      },
    },
  ],
};
```

### Lifecycle Hooks

Add hooks for side effects:

```typescript
const schemaWithHooks: EntitySchema<Beat> = {
  ...beatSchema,
  hooks: {
    beforeCreate: async (beat) => {
      // Add timestamps
      return { ...beat, created_at: new Date() };
    },
    afterUpdate: async (beat) => {
      // Invalidate cache
      invalidateBeatsCache();
    },
    beforeDelete: async (beat) => {
      // Confirm deletion
      return window.confirm(`Delete "${beat.name}"?`);
    },
  },
};
```

### Conditional Fields

Show/hide fields based on state:

```typescript
{
  key: 'advanced_settings',
  label: 'Advanced Settings',
  type: 'json',
  show: (entity) => entity.mode === 'advanced',
}
```

### Custom Renderers

Override field rendering:

```typescript
{
  key: 'status',
  label: 'Status',
  type: 'string',
  render: (value, entity) => (
    <Badge color={getStatusColor(value)}>
      {value}
    </Badge>
  ),
  renderEdit: (value, onChange) => (
    <CustomStatusSelector
      value={value}
      onChange={onChange}
    />
  ),
}
```

## Testing

Generated components include test IDs automatically:

```typescript
// In your tests
import { render, screen } from '@testing-library/react';

test('beats table renders', () => {
  render(<BeatsTable />);

  expect(screen.getByTestId('beats-table')).toBeInTheDocument();
  expect(screen.getByTestId('beats-table-row-0')).toBeInTheDocument();
});

test('create beat form submits', async () => {
  const onSubmit = jest.fn();
  render(<CreateBeatForm onSubmit={onSubmit} />);

  const nameInput = screen.getByTestId('create-beat-form-field-name');
  fireEvent.change(nameInput, { target: { value: 'New Beat' } });

  const submitBtn = screen.getByTestId('create-beat-form-submit-btn');
  fireEvent.click(submitBtn);

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'New Beat' });
  });
});
```

## Performance Tips

1. **Memoization**: Schema components are already memoized
2. **Pagination**: Use `pageSize` option for large datasets
3. **Lazy Loading**: Use React.lazy() for schema imports if needed
4. **Virtualization**: For 1000+ rows, consider react-window integration

## Troubleshooting

### "Schema not found" error

Make sure you've called `initializeComponentFactory()` at app startup.

### Type errors

Ensure your entity type matches the schema field keys:
```typescript
// Entity type
interface Beat {
  id: string;
  name: string;
  // ...
}

// Schema must reference the same keys
fields: [
  { key: 'id', ... },  // Must match entity property
  { key: 'name', ... },
]
```

### Styling issues

The factory uses Tailwind classes from your config. If styles look off, check your Tailwind setup.

## Support

For issues or questions:
1. Check the main README: `src/app/lib/factories/README.md`
2. Review examples: `src/app/lib/factories/examples/`
3. See implementation: `SCHEMA_FACTORY_IMPLEMENTATION.md`

## Next Steps

1. Initialize the factory in your app
2. Start with one component (BeatsOverview recommended)
3. Test thoroughly
4. Migrate remaining components
5. Create custom schemas for new features
