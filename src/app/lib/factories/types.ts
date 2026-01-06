/**
 * Schema-Based UI Component Factory - Type Definitions
 *
 * Core types for the component factory system that generates fully typed,
 * reusable UI components from TypeScript type definitions.
 */

import { ReactNode } from 'react';
import { ColumnDefinition, RowAction } from '@/app/components/UI/EditableDataTable';

// ============================================================================
// Schema Metadata
// ============================================================================

/**
 * Field type definitions that map TypeScript types to UI controls
 */
export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'textarea'
  | 'richtext'
  | 'color'
  | 'image'
  | 'json'
  | 'custom';

/**
 * Validation rule for a schema field
 * Note: Uses `any` for value parameter to support dynamic schema validation
 */
export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: string | number | boolean | RegExp;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validator?: (value: any, entity: any) => boolean;
}

/**
 * Schema field definition with metadata for UI generation
 * Note: Uses `any` for generic factory patterns that handle arbitrary data types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface SchemaField<T = any> {
  key: keyof T & string;
  label: string;
  type: FieldType;

  // Metadata
  description?: string;
  placeholder?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;

  // Validation
  required?: boolean;
  validations?: ValidationRule[];

  // UI Configuration
  editable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  searchable?: boolean;

  // Display
  width?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  format?: (value: any, entity: T) => string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, entity: T) => ReactNode;

  // Select options (for select/multiselect types)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Array<{ label: string; value: any; color?: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  optionsProvider?: () => Promise<Array<{ label: string; value: any }>>;

  // Custom rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  renderEdit?: (value: any, onChange: (value: any) => void, entity: T) => ReactNode;

  // Conditional display
  show?: (entity: T) => boolean;

  // Styling
  className?: string;
  headerClassName?: string;
}

/**
 * Entity action definition (CRUD operations)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface EntityAction<T = any> {
  id: string;
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'primary' | 'danger' | 'success';

  // Action handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (entity: T, context?: any) => Promise<void> | void;

  // Conditional display
  show?: (entity: T) => boolean;
  disabled?: (entity: T) => boolean;

  // Confirmation
  requiresConfirmation?: boolean;
  confirmationMessage?: string | ((entity: T) => string);

  // Batch support
  supportsBatch?: boolean;
  batchHandler?: (entities: T[]) => Promise<void> | void;
}

/**
 * Complete schema definition for an entity
 */
export interface EntitySchema<T = any> {
  // Basic metadata
  name: string;
  displayName: string;
  description?: string;

  // Fields
  fields: SchemaField<T>[];

  // Primary key
  primaryKey: keyof T & string;

  // Display fields
  displayField?: keyof T & string; // Field to use as display name

  // Actions
  actions?: EntityAction<T>[];

  // Default values for new entities
  defaultValues?: Partial<T>;

  // Relationships
  relationships?: {
    [key: string]: {
      type: 'one-to-one' | 'one-to-many' | 'many-to-many';
      entity: string;
      foreignKey?: string;
    };
  };

  // Hooks
  hooks?: {
    beforeCreate?: (entity: Partial<T>) => Promise<Partial<T>> | Partial<T>;
    afterCreate?: (entity: T) => Promise<void> | void;
    beforeUpdate?: (entity: T, updates: Partial<T>) => Promise<Partial<T>> | Partial<T>;
    afterUpdate?: (entity: T) => Promise<void> | void;
    beforeDelete?: (entity: T) => Promise<boolean> | boolean;
    afterDelete?: (entity: T) => Promise<void> | void;
  };

  // UI Customization
  ui?: {
    icon?: ReactNode;
    color?: string;
    enableTimeline?: boolean;
    enableExport?: boolean;
    enableImport?: boolean;
    enableSearch?: boolean;
    enableFilters?: boolean;
    defaultView?: 'table' | 'grid' | 'timeline' | 'kanban';

    // Custom views
    customViews?: {
      id: string;
      name: string;
      icon?: ReactNode;
      component: React.ComponentType<{ data: T[]; schema: EntitySchema<T> }>;
    }[];
  };
}

// ============================================================================
// Component Factory Options
// ============================================================================

/**
 * Options for table component generation
 */
export interface TableComponentOptions<T = any> {
  draggable?: boolean;
  selectable?: boolean;
  expandable?: boolean;
  inline?: boolean;
  pagination?: boolean;
  pageSize?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showExport?: boolean;
  showColumnToggle?: boolean;
  compact?: boolean;

  // Callbacks
  onRowClick?: (entity: T) => void;
  onSelectionChange?: (selected: T[]) => void;

  // Custom rendering
  renderExpanded?: (entity: T) => ReactNode;
  emptyState?: ReactNode;

  // Styling
  className?: string;
  rowClassName?: string | ((entity: T) => string);
}

/**
 * Options for form component generation
 */
export interface FormComponentOptions<T = any> {
  layout?: 'vertical' | 'horizontal' | 'grid';
  columns?: number;
  showLabels?: boolean;
  showDescriptions?: boolean;
  showValidation?: boolean;

  // Sections
  sections?: {
    id: string;
    title: string;
    description?: string;
    fields: (keyof T & string)[];
    collapsible?: boolean;
    defaultOpen?: boolean;
  }[];

  // Buttons
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  showReset?: boolean;

  // Callbacks
  onSubmit?: (entity: Partial<T>) => Promise<void> | void;
  onCancel?: () => void;
  onChange?: (entity: Partial<T>) => void;

  // Styling
  className?: string;
  fieldClassName?: string;
}

/**
 * Options for timeline component generation
 */
export interface TimelineComponentOptions<T = any> {
  dateField: keyof T & string;
  titleField: keyof T & string;
  descriptionField?: keyof T & string;
  groupBy?: keyof T & string;

  // Visualization
  orientation?: 'vertical' | 'horizontal';
  showConnectors?: boolean;
  showIcons?: boolean;

  // Interaction
  clickable?: boolean;
  onItemClick?: (entity: T) => void;

  // Styling
  className?: string;
  itemClassName?: string | ((entity: T) => string);
}

/**
 * Options for exporter component generation
 */
export interface ExporterComponentOptions<T = any> {
  formats?: ('json' | 'csv' | 'excel' | 'pdf' | 'markdown')[];
  includeHeaders?: boolean;
  includeMetadata?: boolean;
  filename?: string;

  // Field selection
  selectableFields?: boolean;
  defaultFields?: (keyof T & string)[];

  // Callbacks
  onExport?: (data: T[], format: string) => void;

  // Styling
  className?: string;
}

/**
 * Options for grid/card component generation
 */
export interface GridComponentOptions<T = any> {
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;

  // Card content
  titleField?: keyof T & string;
  subtitleField?: keyof T & string;
  imageField?: keyof T & string;
  descriptionField?: keyof T & string;

  // Interaction
  selectable?: boolean;
  onItemClick?: (entity: T) => void;

  // Custom rendering
  renderCard?: (entity: T) => ReactNode;

  // Styling
  className?: string;
  cardClassName?: string | ((entity: T) => string);
}

// ============================================================================
// Generated Component Props
// ============================================================================

/**
 * Base props for all generated components
 */
export interface GeneratedComponentProps<T = any> {
  schema: EntitySchema<T>;
  data: T[];
  loading?: boolean;
  error?: Error | null;
  testId?: string;
}

/**
 * Props for generated table component
 */
export interface GeneratedTableProps<T = any> extends GeneratedComponentProps<T> {
  options?: TableComponentOptions<T>;
  onCreate?: (entity: Partial<T>) => Promise<void>;
  onUpdate?: (entity: T, updates: Partial<T>) => Promise<void>;
  onDelete?: (entity: T) => Promise<void>;
  onReorder?: (fromIndex: number, toIndex: number) => Promise<void>;
}

/**
 * Props for generated form component
 */
export interface GeneratedFormProps<T = any> {
  schema: EntitySchema<T>;
  entity?: T;
  mode: 'create' | 'edit' | 'view';
  options?: FormComponentOptions<T>;
  onSubmit?: (entity: Partial<T>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: Error | null;
  testId?: string;
}

/**
 * Props for generated timeline component
 */
export interface GeneratedTimelineProps<T = any> extends GeneratedComponentProps<T> {
  options?: TimelineComponentOptions<T>;
}

/**
 * Props for generated exporter component
 */
export interface GeneratedExporterProps<T = any> extends GeneratedComponentProps<T> {
  options?: ExporterComponentOptions<T>;
}

/**
 * Props for generated grid component
 */
export interface GeneratedGridProps<T = any> extends GeneratedComponentProps<T> {
  options?: GridComponentOptions<T>;
}

// ============================================================================
// Factory Context
// ============================================================================

/**
 * Context provided to custom renderers and validators
 */
export interface FactoryContext {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemas: Map<string, EntitySchema<any>>;
  getSchema: <T>(name: string) => EntitySchema<T> | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getRelatedData: <T>(entityName: string, foreignKey: string, value: any) => Promise<T[]>;
}
