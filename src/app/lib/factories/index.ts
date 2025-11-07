/**
 * Schema-Based UI Component Factory
 *
 * Main entry point for the component factory system.
 * Provides schema registry, component factory, and all utilities.
 */

// Core exports
export { ComponentFactory } from './ComponentFactory';
export { SchemaRegistry, schemaRegistry } from './SchemaRegistry';

// Types
export type {
  EntitySchema,
  SchemaField,
  EntityAction,
  ValidationRule,
  FieldType,
  TableComponentOptions,
  FormComponentOptions,
  TimelineComponentOptions,
  ExporterComponentOptions,
  GridComponentOptions,
  GeneratedTableProps,
  GeneratedFormProps,
  GeneratedTimelineProps,
  GeneratedExporterProps,
  GeneratedGridProps,
  FactoryContext,
} from './types';

// Utilities
export { schemaFieldToColumnDefinition } from './fieldMappers';
export {
  validateEntity,
  validateField,
  validateEntities,
  isEntityValid,
} from './validators';

// Schemas
export {
  beatSchema,
  actSchema,
  sceneSchema,
  characterSchema,
  allSchemas,
  registerDefaultSchemas,
  getSchema,
} from './schemas';

// Convenience hooks and functions
export { useSchemaTable } from './hooks/useSchemaTable';
export { useSchemaForm } from './hooks/useSchemaForm';

// Initialization
export { initializeComponentFactory, isFactoryInitialized, resetFactory } from './init';
