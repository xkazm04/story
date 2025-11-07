/**
 * Factory Initialization
 *
 * Initialize the schema registry with default schemas.
 * Call this function once at app startup.
 */

import { registerDefaultSchemas } from './schemas';
import { schemaRegistry } from './SchemaRegistry';

let initialized = false;

/**
 * Initialize the component factory system
 */
export function initializeComponentFactory(): void {
  if (initialized) {
    console.warn('Component factory already initialized');
    return;
  }

  try {
    // Register all default schemas
    registerDefaultSchemas();

    initialized = true;
    console.log('Component factory initialized successfully');
    console.log('Registered schemas:', schemaRegistry.getSchemaNames());
  } catch (error) {
    console.error('Failed to initialize component factory:', error);
    throw error;
  }
}

/**
 * Check if factory is initialized
 */
export function isFactoryInitialized(): boolean {
  return initialized;
}

/**
 * Reset factory (useful for testing)
 */
export function resetFactory(): void {
  schemaRegistry.clear();
  initialized = false;
}
