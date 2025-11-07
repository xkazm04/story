/**
 * Schema Registry
 *
 * Centralized registry for entity schemas. Provides schema lookup,
 * relationship resolution, and schema validation.
 */

import { EntitySchema, FactoryContext } from './types';

export class SchemaRegistry {
  private schemas: Map<string, EntitySchema<any>>;
  private context: FactoryContext;

  constructor() {
    this.schemas = new Map();

    // Create factory context
    this.context = {
      schemas: this.schemas,
      getSchema: this.getSchema.bind(this),
      getRelatedData: this.getRelatedData.bind(this),
    };
  }

  /**
   * Register a new schema
   */
  register<T>(schema: EntitySchema<T>): void {
    if (this.schemas.has(schema.name)) {
      console.warn(`Schema "${schema.name}" is already registered. Overwriting.`);
    }

    // Validate schema
    this.validateSchema(schema);

    this.schemas.set(schema.name, schema);
  }

  /**
   * Register multiple schemas at once
   */
  registerBulk(schemas: EntitySchema<any>[]): void {
    schemas.forEach((schema) => this.register(schema));
  }

  /**
   * Get a schema by name
   */
  getSchema<T = any>(name: string): EntitySchema<T> | undefined {
    return this.schemas.get(name);
  }

  /**
   * Get all registered schemas
   */
  getAllSchemas(): EntitySchema<any>[] {
    return Array.from(this.schemas.values());
  }

  /**
   * Get schema names
   */
  getSchemaNames(): string[] {
    return Array.from(this.schemas.keys());
  }

  /**
   * Check if a schema exists
   */
  hasSchema(name: string): boolean {
    return this.schemas.has(name);
  }

  /**
   * Remove a schema
   */
  unregister(name: string): boolean {
    return this.schemas.delete(name);
  }

  /**
   * Get factory context
   */
  getContext(): FactoryContext {
    return this.context;
  }

  /**
   * Get related data for a relationship
   * This is a placeholder - implement with your data fetching logic
   */
  private async getRelatedData<T>(
    entityName: string,
    foreignKey: string,
    value: any
  ): Promise<T[]> {
    // TODO: Implement data fetching based on your API/database layer
    console.warn('getRelatedData not implemented yet');
    return [];
  }

  /**
   * Validate schema structure
   */
  private validateSchema(schema: EntitySchema<any>): void {
    // Check required fields
    if (!schema.name) {
      throw new Error('Schema must have a name');
    }

    if (!schema.displayName) {
      throw new Error(`Schema "${schema.name}" must have a displayName`);
    }

    if (!schema.fields || schema.fields.length === 0) {
      throw new Error(`Schema "${schema.name}" must have at least one field`);
    }

    if (!schema.primaryKey) {
      throw new Error(`Schema "${schema.name}" must have a primaryKey`);
    }

    // Check primary key exists in fields
    const primaryKeyField = schema.fields.find((f) => f.key === schema.primaryKey);
    if (!primaryKeyField) {
      throw new Error(
        `Schema "${schema.name}" primary key "${String(schema.primaryKey)}" not found in fields`
      );
    }

    // Check display field if specified
    if (schema.displayField) {
      const displayField = schema.fields.find((f) => f.key === schema.displayField);
      if (!displayField) {
        throw new Error(
          `Schema "${schema.name}" display field "${String(schema.displayField)}" not found in fields`
        );
      }
    }

    // Validate field definitions
    schema.fields.forEach((field) => {
      if (!field.key) {
        throw new Error(`Schema "${schema.name}" has a field without a key`);
      }

      if (!field.label) {
        throw new Error(`Schema "${schema.name}" field "${String(field.key)}" must have a label`);
      }

      if (!field.type) {
        throw new Error(`Schema "${schema.name}" field "${String(field.key)}" must have a type`);
      }

      // Validate select fields have options
      if (
        (field.type === 'select' || field.type === 'multiselect') &&
        !field.options &&
        !field.optionsProvider
      ) {
        throw new Error(
          `Schema "${schema.name}" field "${String(field.key)}" is a select type but has no options or optionsProvider`
        );
      }
    });

    // Validate relationships reference valid schemas
    if (schema.relationships) {
      Object.entries(schema.relationships).forEach(([key, rel]) => {
        if (!rel.entity) {
          throw new Error(
            `Schema "${schema.name}" relationship "${key}" must specify an entity`
          );
        }
        // Note: We can't validate if the entity exists yet as it might not be registered
      });
    }
  }

  /**
   * Get related entities for a schema
   */
  getRelatedSchemas(schemaName: string): Array<{ key: string; schema: EntitySchema<any> }> {
    const schema = this.getSchema(schemaName);
    if (!schema || !schema.relationships) {
      return [];
    }

    const related: Array<{ key: string; schema: EntitySchema<any> }> = [];

    Object.entries(schema.relationships).forEach(([key, rel]) => {
      const relatedSchema = this.getSchema(rel.entity);
      if (relatedSchema) {
        related.push({ key, schema: relatedSchema });
      } else {
        console.warn(
          `Schema "${schemaName}" references unknown entity "${rel.entity}" in relationship "${key}"`
        );
      }
    });

    return related;
  }

  /**
   * Export all schemas as JSON
   */
  export(): string {
    const schemasArray = this.getAllSchemas();
    return JSON.stringify(schemasArray, null, 2);
  }

  /**
   * Import schemas from JSON
   */
  import(json: string): void {
    try {
      const schemas = JSON.parse(json);
      if (!Array.isArray(schemas)) {
        throw new Error('Invalid schema format: expected array');
      }
      this.registerBulk(schemas);
    } catch (error) {
      throw new Error(`Failed to import schemas: ${error}`);
    }
  }

  /**
   * Clear all schemas
   */
  clear(): void {
    this.schemas.clear();
  }
}

// Create singleton instance
export const schemaRegistry = new SchemaRegistry();
