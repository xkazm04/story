/**
 * Field Mappers
 *
 * Maps schema fields to UI component column definitions with proper
 * type handling, formatting, and rendering.
 */

import { ReactNode } from 'react';
import { SchemaField, EntitySchema } from './types';
import { ColumnDefinition } from '@/app/components/UI/EditableDataTable';
import { Check, X } from 'lucide-react';

/**
 * Convert a schema field to a column definition for the table component
 */
export function schemaFieldToColumnDefinition<T>(
  field: SchemaField<T>,
  schema: EntitySchema<T>
): ColumnDefinition<T> {
  const column: ColumnDefinition<T> = {
    key: String(field.key),
    header: field.label,
    width: field.width,
    editable: field.editable !== false,
    sortable: field.sortable,
    className: field.className,
    headerClassName: field.headerClassName,
  };

  // Set column type
  switch (field.type) {
    case 'boolean':
      column.type = 'boolean';
      break;
    case 'number':
      column.type = 'number';
      break;
    case 'select':
    case 'multiselect':
      column.type = 'select';
      column.options = field.options;
      break;
    default:
      column.type = 'text';
  }

  // Custom render function
  if (field.render) {
    column.render = (value: any, row: T, index: number) => field.render!(value, row);
  } else {
    column.render = (value: any, row: T) => {
      return renderFieldValue(value, field, row);
    };
  }

  // Custom edit render function
  if (field.renderEdit) {
    column.renderEdit = (value: any, onChange: (value: any) => void, row: T) => {
      return field.renderEdit!(value, onChange, row);
    };
  }

  // Format function
  if (field.format) {
    column.format = (value: any) => field.format!(value, {} as T);
  }

  // Validation
  if (field.validations && field.validations.length > 0) {
    column.validate = (value: any, row: T) => {
      for (const rule of field.validations!) {
        const isValid = validateFieldValue(value, rule, row);
        if (!isValid) {
          return rule.message;
        }
      }
      return null;
    };
  }

  return column;
}

/**
 * Render field value based on type
 */
function renderFieldValue<T>(value: any, field: SchemaField<T>, entity: T): ReactNode {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-gray-600">-</span>;
  }

  // Handle custom format
  if (field.format) {
    return <span>{field.format(value, entity)}</span>;
  }

  // Type-specific rendering
  switch (field.type) {
    case 'boolean':
      return value ? (
        <Check className="w-4 h-4 text-green-400" />
      ) : (
        <X className="w-4 h-4 text-gray-600" />
      );

    case 'date':
      return <span>{formatDate(value)}</span>;

    case 'datetime':
      return <span>{formatDateTime(value)}</span>;

    case 'color':
      return (
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-gray-700"
            style={{ backgroundColor: value }}
          />
          <span className="text-xs text-gray-400">{value}</span>
        </div>
      );

    case 'image':
      return (
        <img
          src={value}
          alt="Preview"
          className="w-12 h-12 object-cover rounded border border-gray-700"
        />
      );

    case 'select':
    case 'multiselect':
      if (field.options) {
        const option = field.options.find((opt) => opt.value === value);
        if (option) {
          return (
            <span
              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: option.color ? `${option.color}20` : undefined,
                color: option.color || undefined,
              }}
            >
              {option.label}
            </span>
          );
        }
      }
      return <span>{String(value)}</span>;

    case 'json':
      return (
        <details className="cursor-pointer">
          <summary className="text-blue-400 text-xs">View JSON</summary>
          <pre className="mt-2 p-2 bg-gray-900 rounded text-xs overflow-auto max-h-40">
            {JSON.stringify(value, null, 2)}
          </pre>
        </details>
      );

    case 'textarea':
    case 'richtext':
      const text = String(value);
      const truncated = text.length > 100 ? text.substring(0, 100) + '...' : text;
      return (
        <div className="max-w-md" title={text}>
          <span className="text-sm text-gray-300">{truncated}</span>
        </div>
      );

    case 'number':
      return <span className="font-mono">{formatNumber(value)}</span>;

    default:
      return <span>{String(value)}</span>;
  }
}

/**
 * Validate field value against a validation rule
 */
function validateFieldValue<T>(value: any, rule: any, entity: T): boolean {
  switch (rule.type) {
    case 'required':
      return value !== null && value !== undefined && value !== '';

    case 'min':
      if (typeof value === 'number') {
        return value >= rule.value;
      }
      if (typeof value === 'string') {
        return value.length >= rule.value;
      }
      return true;

    case 'max':
      if (typeof value === 'number') {
        return value <= rule.value;
      }
      if (typeof value === 'string') {
        return value.length <= rule.value;
      }
      return true;

    case 'pattern':
      if (typeof value === 'string') {
        const regex = new RegExp(rule.value);
        return regex.test(value);
      }
      return true;

    case 'custom':
      if (rule.validator) {
        return rule.validator(value, entity);
      }
      return true;

    default:
      return true;
  }
}

/**
 * Format date for display
 */
function formatDate(value: any): string {
  try {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleDateString();
  } catch {
    return String(value);
  }
}

/**
 * Format datetime for display
 */
function formatDateTime(value: any): string {
  try {
    const date = value instanceof Date ? value : new Date(value);
    return date.toLocaleString();
  } catch {
    return String(value);
  }
}

/**
 * Format number for display
 */
function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toLocaleString();
  }
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}
