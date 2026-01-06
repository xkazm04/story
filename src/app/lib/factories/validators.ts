/**
 * Validators
 *
 * Entity validation logic based on schema definitions.
 */

import { EntitySchema, SchemaField, ValidationRule } from './types';

/**
 * Validate an entity against its schema
 * Returns an object with field keys and error messages
 */
export function validateEntity<T>(
  entity: Partial<T>,
  schema: EntitySchema<T>
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of schema.fields) {
    const value = entity[field.key];
    const fieldErrors = validateField(value, field, entity as T);

    if (fieldErrors.length > 0) {
      errors[String(field.key)] = fieldErrors.join(', ');
    }
  }

  return errors;
}

/**
 * Validate a single field
 * Returns an array of error messages
 */
export function validateField<T>(
  value: any,
  field: SchemaField<T>,
  entity: T
): string[] {
  const errors: string[] = [];

  // Check required
  if (field.required) {
    if (value === null || value === undefined || value === '') {
      errors.push(`${field.label} is required`);
      return errors; // Stop validation if required field is empty
    }
  }

  // Skip further validation if field is empty and not required
  if (value === null || value === undefined || value === '') {
    return errors;
  }

  // Run field-specific validations
  if (field.validations) {
    for (const rule of field.validations) {
      const error = validateRule(value, rule, entity);
      if (error) {
        errors.push(error);
      }
    }
  }

  // Type-specific validation
  switch (field.type) {
    case 'number':
      if (typeof value !== 'number' || isNaN(value)) {
        errors.push(`${field.label} must be a valid number`);
      }
      break;

    case 'boolean':
      if (typeof value !== 'boolean') {
        errors.push(`${field.label} must be true or false`);
      }
      break;

    case 'date':
    case 'datetime':
      if (!isValidDate(value)) {
        errors.push(`${field.label} must be a valid date`);
      }
      break;

    case 'select':
      if (field.options && !field.options.some((opt) => opt.value === value)) {
        errors.push(`${field.label} must be one of the allowed options`);
      }
      break;

    case 'multiselect':
      if (!Array.isArray(value)) {
        errors.push(`${field.label} must be an array`);
      } else if (field.options) {
        const validValues = field.options.map((opt) => opt.value);
        const invalidValues = value.filter((v) => !validValues.includes(v));
        if (invalidValues.length > 0) {
          errors.push(`${field.label} contains invalid values: ${invalidValues.join(', ')}`);
        }
      }
      break;

    case 'color':
      if (!isValidColor(value)) {
        errors.push(`${field.label} must be a valid color (e.g., #RRGGBB)`);
      }
      break;

    case 'json':
      if (typeof value === 'string') {
        try {
          JSON.parse(value);
        } catch {
          errors.push(`${field.label} must be valid JSON`);
        }
      }
      break;
  }

  return errors;
}

/**
 * Validate a value against a validation rule
 * Returns error message or null if valid
 */
function validateRule<T>(
  value: any,
  rule: ValidationRule,
  entity: T
): string | null {
  switch (rule.type) {
    case 'required':
      if (value === null || value === undefined || value === '') {
        return rule.message;
      }
      break;

    case 'min':
      if (typeof rule.value === 'number') {
        const minVal = rule.value;
        if (typeof value === 'number') {
          if (value < minVal) {
            return rule.message;
          }
        } else if (typeof value === 'string') {
          if (value.length < minVal) {
            return rule.message;
          }
        } else if (Array.isArray(value)) {
          if (value.length < minVal) {
            return rule.message;
          }
        }
      }
      break;

    case 'max':
      if (typeof rule.value === 'number') {
        const maxVal = rule.value;
        if (typeof value === 'number') {
          if (value > maxVal) {
            return rule.message;
          }
        } else if (typeof value === 'string') {
          if (value.length > maxVal) {
            return rule.message;
          }
        } else if (Array.isArray(value)) {
          if (value.length > maxVal) {
            return rule.message;
          }
        }
      }
      break;

    case 'pattern':
      if (typeof value === 'string' && (typeof rule.value === 'string' || rule.value instanceof RegExp)) {
        const regex = rule.value instanceof RegExp ? rule.value : new RegExp(rule.value);
        if (!regex.test(value)) {
          return rule.message;
        }
      }
      break;

    case 'custom':
      if (rule.validator) {
        if (!rule.validator(value, entity)) {
          return rule.message;
        }
      }
      break;
  }

  return null;
}

/**
 * Check if a value is a valid date
 */
function isValidDate(value: any): boolean {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }

  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  return false;
}

/**
 * Check if a value is a valid color
 */
function isValidColor(value: any): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  // Hex color
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
    return true;
  }

  // RGB/RGBA
  if (/^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/.test(value)) {
    return true;
  }

  // Named colors (basic check)
  const namedColors = [
    'red',
    'blue',
    'green',
    'yellow',
    'orange',
    'purple',
    'pink',
    'black',
    'white',
    'gray',
    'transparent',
  ];
  if (namedColors.includes(value.toLowerCase())) {
    return true;
  }

  return false;
}

/**
 * Batch validate multiple entities
 */
export function validateEntities<T>(
  entities: Partial<T>[],
  schema: EntitySchema<T>
): Map<number, Record<string, string>> {
  const errorMap = new Map<number, Record<string, string>>();

  entities.forEach((entity, index) => {
    const errors = validateEntity(entity, schema);
    if (Object.keys(errors).length > 0) {
      errorMap.set(index, errors);
    }
  });

  return errorMap;
}

/**
 * Check if entity is valid (has no errors)
 */
export function isEntityValid<T>(entity: Partial<T>, schema: EntitySchema<T>): boolean {
  const errors = validateEntity(entity, schema);
  return Object.keys(errors).length === 0;
}
