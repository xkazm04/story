/**
 * Schema Definitions Index
 *
 * Exports all entity schemas and provides convenience functions
 * for schema registration.
 */

import { schemaRegistry } from '../SchemaRegistry';
import { beatSchema } from './beatSchema';
import { actSchema } from './actSchema';
import { sceneSchema } from './sceneSchema';
import { characterSchema } from './characterSchema';

// Export individual schemas
export { beatSchema } from './beatSchema';
export { actSchema } from './actSchema';
export { sceneSchema } from './sceneSchema';
export { characterSchema } from './characterSchema';

// All schemas collection
export const allSchemas = [
  beatSchema,
  actSchema,
  sceneSchema,
  characterSchema,
];

/**
 * Register all default schemas with the registry
 */
export function registerDefaultSchemas(): void {
  schemaRegistry.registerBulk(allSchemas);
}

/**
 * Get schema by name with type safety
 */
export function getSchema<T>(name: string) {
  return schemaRegistry.getSchema<T>(name);
}
