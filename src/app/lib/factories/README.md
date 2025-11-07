# Schema-Based UI Component Factory

A powerful code-generation layer that consumes TypeScript type definitions for core entities and outputs fully typed, reusable UI components with built-in editing, validation, and styling hooks.

## Overview

The Component Factory eliminates code duplication and speeds up development by generating UI components from entity schemas. Provide a schema, and the factory produces:

- **Tables**: Sortable, filterable, editable data tables with drag-and-drop
- **Forms**: Smart forms with validation, sections, and conditional fields
- **Timelines**: Visual timelines for date-based entities
- **Exporters**: Multi-format data export components
- **Grids**: Card-based grid layouts for visual entities

## Features

- ✅ **Fully Typed**: TypeScript-first with complete type safety
- ✅ **Zero Boilerplate**: Define schema once, generate multiple components
- ✅ **Built-in Validation**: Field-level and entity-level validation
- ✅ **Lifecycle Hooks**: beforeCreate, afterUpdate, beforeDelete, etc.
- ✅ **Conditional Fields**: Show/hide fields based on entity state
- ✅ **Custom Renderers**: Override default rendering for any field
- ✅ **Relationships**: Define entity relationships with foreign keys
- ✅ **Test IDs**: Automatic test ID generation for all interactive elements
- ✅ **Consistent Styling**: Matches existing app design system

## Quick Start

### 1. Define a Schema

```typescript
import { EntitySchema } from '@/app/lib/factories';
import { Beat } from '@/app/types/Beat';

const beatSchema: EntitySchema<Beat> = {
  name: 'beat',
  displayName: 'Story Beats',
  primaryKey: 'id',
  displayField: 'name',

  fields: [
    {
      key: 'name',
      label: 'Beat Name',
      type: 'string',
      required: true,
      editable: true,
      sortable: true,
      width: 'flex-1',
    },
    {
      key: 'completed',
      label: 'Completed',
      type: 'boolean',
      editable: true,
      width: 'w-24',
    },
    // ... more fields
  ],

  defaultValues: {
    name: '',
    completed: false,
  },
};
```

### 2. Generate a Table Component

```typescript
import { ComponentFactory } from '@/app/lib/factories';

const BeatTable = ComponentFactory.createTableComponent(beatSchema);

// Use in your component
function BeatsView({ beats }: { beats: Beat[] }) {
  return (
    <BeatTable
      schema={beatSchema}
      data={beats}
      onUpdate={handleUpdate}
      onDelete={handleDelete}
      options={{ draggable: true, selectable: true }}
    />
  );
}
```

### 3. Or Use the Hook

```typescript
import { useSchemaTable } from '@/app/lib/factories';

function BeatsView() {
  const { data: beats } = useBeats();

  const { render } = useSchemaTable({
    schema: beatSchema,
    data: beats || [],
    onUpdate: updateBeat,
    onDelete: deleteBeat,
    options: { draggable: true },
  });

  return render();
}
```

## Schema Definition

### Basic Schema Structure

```typescript
interface EntitySchema<T> {
  name: string;              // Unique schema identifier
  displayName: string;       // Human-readable name
  description?: string;      // Schema description
  primaryKey: keyof T;       // Primary key field
  displayField?: keyof T;    // Field to use as display name
  fields: SchemaField<T>[];  // Field definitions
  actions?: EntityAction<T>[]; // Custom actions
  defaultValues?: Partial<T>; // Default values for new entities
  relationships?: {...};      // Entity relationships
  hooks?: {...};             // Lifecycle hooks
  ui?: {...};                // UI customization
}
```

### Field Types

- `string`: Text input
- `number`: Number input
- `boolean`: Checkbox
- `date`: Date picker
- `datetime`: Date and time picker
- `select`: Dropdown selection
- `multiselect`: Multi-value selection
- `textarea`: Multi-line text
- `richtext`: Rich text editor
- `color`: Color picker
- `image`: Image upload/display
- `json`: JSON editor
- `custom`: Custom renderer

### Field Definition

```typescript
interface SchemaField<T> {
  key: keyof T & string;
  label: string;
  type: FieldType;

  // Validation
  required?: boolean;
  validations?: ValidationRule[];

  // UI
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;
  width?: string;

  // Rendering
  render?: (value, entity) => ReactNode;
  renderEdit?: (value, onChange, entity) => ReactNode;
  format?: (value, entity) => string;

  // Conditional
  show?: (entity) => boolean;

  // Options (for select fields)
  options?: Array<{ label, value, color? }>;
}
```

### Validation Rules

```typescript
{
  validations: [
    {
      type: 'required',
      message: 'This field is required',
    },
    {
      type: 'min',
      value: 3,
      message: 'Must be at least 3 characters',
    },
    {
      type: 'max',
      value: 100,
      message: 'Must be less than 100 characters',
    },
    {
      type: 'pattern',
      value: '^[a-zA-Z]+$',
      message: 'Must contain only letters',
    },
    {
      type: 'custom',
      validator: (value, entity) => value !== 'forbidden',
      message: 'This value is not allowed',
    },
  ],
}
```

### Lifecycle Hooks

```typescript
{
  hooks: {
    beforeCreate: async (entity) => {
      // Modify entity before creation
      return { ...entity, created_at: new Date() };
    },
    afterCreate: async (entity) => {
      // Run after creation
      console.log('Created:', entity);
    },
    beforeUpdate: async (entity, updates) => {
      // Modify updates before saving
      return { ...updates, updated_at: new Date() };
    },
    afterUpdate: async (entity) => {
      // Run after update
    },
    beforeDelete: async (entity) => {
      // Return false to cancel deletion
      return confirm('Are you sure?');
    },
    afterDelete: async (entity) => {
      // Run after deletion
    },
  },
}
```

## Component Types

### Table Component

```typescript
const TableComponent = ComponentFactory.createTableComponent(schema);

<TableComponent
  schema={schema}
  data={entities}
  loading={false}
  error={null}
  options={{
    draggable: true,
    selectable: true,
    expandable: true,
    compact: true,
    showSearch: true,
    showFilters: true,
  }}
  onCreate={handleCreate}
  onUpdate={handleUpdate}
  onDelete={handleDelete}
  onReorder={handleReorder}
/>
```

### Form Component

```typescript
const FormComponent = ComponentFactory.createFormComponent(schema);

<FormComponent
  schema={schema}
  entity={existingEntity}
  mode="edit" // 'create' | 'edit' | 'view'
  options={{
    layout: 'grid',
    columns: 2,
    showValidation: true,
    sections: [
      {
        id: 'basic',
        title: 'Basic Info',
        fields: ['name', 'description'],
      },
      {
        id: 'advanced',
        title: 'Advanced',
        fields: ['order', 'completed'],
        collapsible: true,
      },
    ],
  }}
  onSubmit={handleSubmit}
  onCancel={handleCancel}
/>
```

## Schema Registry

The registry stores and manages all schemas:

```typescript
import { schemaRegistry } from '@/app/lib/factories';

// Register schemas
schemaRegistry.register(beatSchema);
schemaRegistry.register(actSchema);

// Or register multiple at once
schemaRegistry.registerBulk([beatSchema, actSchema, sceneSchema]);

// Get schema
const schema = schemaRegistry.getSchema('beat');

// Get all schemas
const allSchemas = schemaRegistry.getAllSchemas();

// Check if schema exists
if (schemaRegistry.hasSchema('beat')) {
  // ...
}
```

## Pre-defined Schemas

The factory includes schemas for core entities:

- **beatSchema**: Story beats
- **actSchema**: Story acts
- **sceneSchema**: Scenes
- **characterSchema**: Characters

To use them:

```typescript
import { beatSchema, registerDefaultSchemas } from '@/app/lib/factories';

// Register all default schemas
registerDefaultSchemas();
```

## Custom Renderers

Override default rendering for any field:

```typescript
{
  key: 'status',
  label: 'Status',
  type: 'select',
  options: [
    { label: 'Active', value: 'active', color: '#10b981' },
    { label: 'Inactive', value: 'inactive', color: '#6b7280' },
  ],
  render: (value, entity) => (
    <div className="flex items-center gap-2">
      <div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: getColorForStatus(value) }}
      />
      <span>{value}</span>
    </div>
  ),
  renderEdit: (value, onChange, entity) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="custom-select"
    >
      {/* options */}
    </select>
  ),
}
```

## Advanced Usage

### Conditional Fields

```typescript
{
  key: 'advanced_options',
  label: 'Advanced Options',
  type: 'json',
  show: (entity) => entity.mode === 'advanced',
}
```

### Relationships

```typescript
{
  relationships: {
    project: {
      type: 'one-to-many',
      entity: 'project',
      foreignKey: 'project_id',
    },
    scenes: {
      type: 'one-to-many',
      entity: 'scene',
    },
  },
}
```

### Custom Actions

```typescript
{
  actions: [
    {
      id: 'duplicate',
      label: 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      handler: async (entity) => {
        await duplicateEntity(entity);
      },
      variant: 'primary',
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      handler: async (entity) => {
        await archiveEntity(entity);
      },
      requiresConfirmation: true,
      confirmationMessage: 'Archive this item?',
    },
  ],
}
```

## Testing

All generated components include test IDs:

```typescript
<TableComponent testId="beats-table" />

// Generates:
// - beats-table (root element)
// - beats-table-select-all
// - beats-table-row-0, beats-table-row-1, etc.
// - beats-table-add-btn
// - beats-table-empty
```

## Best Practices

1. **Define schemas once**: Keep schemas in separate files
2. **Use type safety**: Import entity types from your types folder
3. **Leverage hooks**: Use lifecycle hooks for side effects
4. **Custom renderers**: Override only when necessary
5. **Validation**: Define validations at schema level
6. **Test IDs**: Always provide testId prop for generated components

## Examples

See the following files for complete examples:

- `src/app/lib/factories/schemas/beatSchema.ts` - Beat entity schema
- `src/app/lib/factories/schemas/actSchema.ts` - Act entity schema
- `src/app/lib/factories/schemas/sceneSchema.ts` - Scene entity schema
- `src/app/lib/factories/schemas/characterSchema.ts` - Character entity schema

## API Reference

### ComponentFactory

- `createTableComponent<T>(schema)`: Generate table component
- `createFormComponent<T>(schema)`: Generate form component

### SchemaRegistry

- `register(schema)`: Register a schema
- `registerBulk(schemas)`: Register multiple schemas
- `getSchema<T>(name)`: Get schema by name
- `getAllSchemas()`: Get all registered schemas
- `hasSchema(name)`: Check if schema exists
- `unregister(name)`: Remove a schema

### Hooks

- `useSchemaTable(options)`: Table component hook
- `useSchemaForm(options)`: Form component hook

### Validators

- `validateEntity(entity, schema)`: Validate entire entity
- `validateField(value, field, entity)`: Validate single field
- `isEntityValid(entity, schema)`: Check if entity is valid
