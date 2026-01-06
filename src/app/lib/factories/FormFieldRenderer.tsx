/**
 * Form Field Renderer
 *
 * Helper utilities for rendering form fields based on schema types.
 * Extracted from ComponentFactory for better maintainability.
 */

import React, { ReactNode } from 'react';
import { SchemaField } from './types';

const BASE_INPUT_CLASS =
  'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 transition';

/**
 * Renders a read-only field value
 */
function renderReadonlyField<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown
): ReactNode {
  return (
    <div className="px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300">
      {value !== null && value !== undefined
        ? field.format
          ? field.format(value, {} as T)
          : String(value)
        : '-'}
    </div>
  );
}

/**
 * Renders a boolean checkbox field
 */
function renderBooleanField<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-700 text-blue-600 focus:ring-blue-500"
      />
      <span className="text-sm text-gray-400">{field.placeholder}</span>
    </label>
  );
}

/**
 * Renders a number input field
 */
function renderNumberField<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <input
      type="number"
      value={(value as number) || ''}
      onChange={(e) => onChange(Number(e.target.value))}
      placeholder={field.placeholder}
      className={BASE_INPUT_CLASS}
    />
  );
}

/**
 * Renders a date input field
 */
function renderDateField(
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <input
      type="date"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      className={BASE_INPUT_CLASS}
    />
  );
}

/**
 * Renders a datetime input field
 */
function renderDatetimeField(
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <input
      type="datetime-local"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      className={BASE_INPUT_CLASS}
    />
  );
}

/**
 * Renders a textarea field
 */
function renderTextareaField<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <textarea
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      rows={4}
      className={BASE_INPUT_CLASS}
    />
  );
}

/**
 * Renders a select dropdown field
 */
function renderSelectField<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <select
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      className={BASE_INPUT_CLASS}
    >
      <option value="">Select {field.label}</option>
      {field.options?.map((opt) => (
        <option key={String(opt.value)} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

/**
 * Renders a color picker field
 */
function renderColorField(
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        value={(value as string) || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="w-12 h-10 rounded border border-gray-700"
      />
      <input
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className={BASE_INPUT_CLASS}
      />
    </div>
  );
}

/**
 * Renders a text input field (default)
 */
function renderTextField<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown,
  onChange: (value: unknown) => void
): ReactNode {
  return (
    <input
      type="text"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className={BASE_INPUT_CLASS}
    />
  );
}

/**
 * Helper to render input by field type
 */
export function renderInputByType<T extends Record<string, unknown>>(
  field: SchemaField<T>,
  value: unknown,
  readonly: boolean,
  onChange: (value: unknown) => void
): ReactNode {
  if (readonly) {
    return renderReadonlyField(field, value);
  }

  switch (field.type) {
    case 'boolean':
      return renderBooleanField(field, value, onChange);
    case 'number':
      return renderNumberField(field, value, onChange);
    case 'date':
      return renderDateField(value, onChange);
    case 'datetime':
      return renderDatetimeField(value, onChange);
    case 'textarea':
      return renderTextareaField(field, value, onChange);
    case 'select':
      return renderSelectField(field, value, onChange);
    case 'color':
      return renderColorField(value, onChange);
    default:
      return renderTextField(field, value, onChange);
  }
}

export { BASE_INPUT_CLASS };
