/**
 * Component Factory
 *
 * Generates fully typed, reusable UI components from entity schemas.
 * Produces tables, forms, timelines, exporters, and more with built-in
 * editing, validation, and styling hooks.
 */

'use client';

import { ReactNode, useMemo } from 'react';
import { clsx } from 'clsx';
import {
  EntitySchema,
  SchemaField,
  GeneratedTableProps,
  TableComponentOptions,
  GeneratedFormProps,
  FormComponentOptions,
} from './types';
import { ColumnDefinition, RowAction, EditableDataTable } from '@/app/components/UI/EditableDataTable';
import { schemaFieldToColumnDefinition } from './fieldMappers';
import { validateEntity } from './validators';

export class ComponentFactory {
  /**
   * Generate a table component from a schema
   */
  static createTableComponent<T extends Record<string, any>>(schema: EntitySchema<T>) {
    return function GeneratedTable({
      data,
      options = {},
      onCreate,
      onUpdate,
      onDelete,
      onReorder,
      loading = false,
      error = null,
      testId = `${schema.name}-table`,
    }: GeneratedTableProps<T>) {
      // Convert schema fields to column definitions
      const columns = useMemo((): ColumnDefinition<T>[] => {
        return schema.fields
          .filter((field) => !field.show || field.show({} as T))
          .map((field) => schemaFieldToColumnDefinition<T>(field, schema));
      }, []);

      // Convert schema actions to row actions
      const rowActions = useMemo((): RowAction<T>[] => {
        if (!schema.actions) return [];

        return schema.actions.map((action): RowAction<T> => ({
          icon: action.icon,
          label: action.label,
          onClick: async (row: T) => {
            if (action.requiresConfirmation) {
              const message =
                typeof action.confirmationMessage === 'function'
                  ? action.confirmationMessage(row)
                  : action.confirmationMessage || `Are you sure you want to ${action.label}?`;

              if (!window.confirm(message)) {
                return;
              }
            }

            await action.handler(row);
          },
          variant: action.variant || 'default',
          show: action.show,
          disabled: action.disabled,
        }));
      }, []);

      // Handle row updates with validation and hooks
      const handleUpdate = async (row: T, updates: Partial<T>) => {
        try {
          // Run beforeUpdate hook
          let processedUpdates = updates;
          if (schema.hooks?.beforeUpdate) {
            processedUpdates = await Promise.resolve(
              schema.hooks.beforeUpdate(row, updates)
            );
          }

          // Validate
          const updatedEntity = { ...row, ...processedUpdates };
          const errors = validateEntity(updatedEntity, schema);
          if (Object.keys(errors).length > 0) {
            throw new Error(
              `Validation failed: ${Object.values(errors).join(', ')}`
            );
          }

          // Call provided update handler
          if (onUpdate) {
            await onUpdate(row, processedUpdates);
          }

          // Run afterUpdate hook
          if (schema.hooks?.afterUpdate) {
            await Promise.resolve(schema.hooks.afterUpdate(updatedEntity));
          }
        } catch (err) {
          console.error('Update failed:', err);
          throw err;
        }
      };

      // Handle row deletion with hooks
      const handleDelete = async (row: T) => {
        try {
          // Run beforeDelete hook
          if (schema.hooks?.beforeDelete) {
            const canDelete = await Promise.resolve(schema.hooks.beforeDelete(row));
            if (!canDelete) {
              return;
            }
          }

          // Call provided delete handler
          if (onDelete) {
            await onDelete(row);
          }

          // Run afterDelete hook
          if (schema.hooks?.afterDelete) {
            await Promise.resolve(schema.hooks.afterDelete(row));
          }
        } catch (err) {
          console.error('Delete failed:', err);
          throw err;
        }
      };

      if (error) {
        return (
          <div
            className="p-6 bg-red-950/20 border border-red-800 rounded-lg"
            data-testid={`${testId}-error`}
          >
            <p className="text-red-400">Error loading {schema.displayName}: {error.message}</p>
          </div>
        );
      }

      return (
        <EditableDataTable<T>
          columns={columns}
          data={data}
          rowKey={schema.primaryKey}
          onRowUpdate={handleUpdate}
          onRowDelete={handleDelete}
          actions={rowActions}
          draggable={options.draggable}
          onReorder={onReorder}
          selectable={options.selectable}
          expandable={options.expandable}
          renderExpanded={options.renderExpanded}
          loading={loading}
          emptyMessage={`No ${schema.displayName.toLowerCase()} found`}
          className={options.className}
          rowClassName={options.rowClassName}
          onRowClick={options.onRowClick}
          data-testid={testId}
        />
      );
    };
  }

  /**
   * Generate a form component from a schema
   */
  static createFormComponent<T extends Record<string, any>>(schema: EntitySchema<T>) {
    return function GeneratedForm({
      entity,
      mode = 'create',
      options = {},
      onSubmit,
      onCancel,
      loading = false,
      error = null,
      testId = `${schema.name}-form`,
    }: GeneratedFormProps<T>) {
      const [formData, setFormData] = React.useState<Partial<T>>(() => {
        if (entity) return entity;
        return schema.defaultValues || {};
      });

      const [errors, setErrors] = React.useState<Record<string, string>>({});
      const [touched, setTouched] = React.useState<Set<string>>(new Set());

      // Organize fields into sections
      const sections = useMemo(() => {
        if (options.sections) {
          return options.sections;
        }

        // Default: single section with all fields
        return [
          {
            id: 'default',
            title: schema.displayName,
            fields: schema.fields.map((f) => f.key),
          },
        ];
      }, [options.sections]);

      // Validate form
      const validate = () => {
        const validationErrors = validateEntity(formData as T, schema);
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
      };

      // Handle field change
      const handleFieldChange = (key: keyof T & string, value: any) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        setTouched((prev) => new Set(prev).add(key));

        // Call onChange callback
        if (options.onChange) {
          options.onChange({ ...formData, [key]: value });
        }
      };

      // Handle submit
      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
          return;
        }

        try {
          // Run beforeCreate/beforeUpdate hook
          let processedData = formData;
          if (mode === 'create' && schema.hooks?.beforeCreate) {
            processedData = await Promise.resolve(schema.hooks.beforeCreate(formData));
          } else if (mode === 'edit' && schema.hooks?.beforeUpdate && entity) {
            processedData = await Promise.resolve(
              schema.hooks.beforeUpdate(entity, formData)
            );
          }

          // Call onSubmit
          if (onSubmit) {
            await onSubmit(processedData);
          }

          // Run afterCreate/afterUpdate hook
          if (mode === 'create' && schema.hooks?.afterCreate) {
            await Promise.resolve(schema.hooks.afterCreate(processedData as T));
          } else if (mode === 'edit' && schema.hooks?.afterUpdate) {
            await Promise.resolve(schema.hooks.afterUpdate(processedData as T));
          }
        } catch (err) {
          console.error('Form submission failed:', err);
        }
      };

      // Render field based on type
      const renderField = (field: SchemaField<T>) => {
        const value = formData[field.key];
        const fieldError = touched.has(field.key) ? errors[field.key] : undefined;
        const isReadonly = mode === 'view' || !field.editable;

        // Custom render edit
        if (field.renderEdit && !isReadonly) {
          return (
            <div key={String(field.key)} data-testid={`${testId}-field-${String(field.key)}`}>
              {field.renderEdit(value, (newValue) => handleFieldChange(field.key, newValue), formData as T)}
              {fieldError && (
                <p className="mt-1 text-xs text-red-400">{fieldError}</p>
              )}
            </div>
          );
        }

        // Default rendering based on type
        return (
          <div
            key={String(field.key)}
            className={clsx('space-y-1', options.fieldClassName)}
            data-testid={`${testId}-field-${String(field.key)}`}
          >
            {options.showLabels !== false && (
              <label className="block text-sm font-medium text-gray-300">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
            )}

            {options.showDescriptions && field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}

            {renderInputByType(field, value, isReadonly, (newValue) =>
              handleFieldChange(field.key, newValue)
            )}

            {fieldError && options.showValidation !== false && (
              <p className="text-xs text-red-400">{fieldError}</p>
            )}
          </div>
        );
      };

      return (
        <form onSubmit={handleSubmit} className={clsx('space-y-6', options.className)} data-testid={testId}>
          {error && (
            <div className="p-4 bg-red-950/20 border border-red-800 rounded-lg">
              <p className="text-red-400 text-sm">{error.message}</p>
            </div>
          )}

          {sections.map((section) => {
            const sectionFields = schema.fields.filter((f) =>
              section.fields.includes(f.key)
            );

            return (
              <div key={section.id} className="space-y-4">
                {section.title && (
                  <div className="border-b border-gray-800 pb-2">
                    <h3 className="text-lg font-semibold text-gray-200">{section.title}</h3>
                    {section.description && (
                      <p className="text-sm text-gray-400 mt-1">{section.description}</p>
                    )}
                  </div>
                )}

                <div
                  className={clsx(
                    options.layout === 'grid' && 'grid gap-4',
                    options.columns === 2 && 'grid-cols-2',
                    options.columns === 3 && 'grid-cols-3',
                    options.layout !== 'grid' && 'space-y-4'
                  )}
                >
                  {sectionFields.map((field) => {
                    if (field.show && !field.show(formData as T)) {
                      return null;
                    }
                    return renderField(field);
                  })}
                </div>
              </div>
            );
          })}

          {mode !== 'view' && (
            <div className="flex gap-3 pt-4 border-t border-gray-800">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
                data-testid={`${testId}-submit-btn`}
              >
                {loading ? 'Saving...' : options.submitLabel || 'Save'}
              </button>

              {options.showCancel !== false && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  data-testid={`${testId}-cancel-btn`}
                >
                  {options.cancelLabel || 'Cancel'}
                </button>
              )}

              {options.showReset && (
                <button
                  type="button"
                  onClick={() => setFormData(entity || schema.defaultValues || {})}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                  data-testid={`${testId}-reset-btn`}
                >
                  Reset
                </button>
              )}
            </div>
          )}
        </form>
      );
    };
  }
}

/**
 * Helper to render input by field type
 */
function renderInputByType(
  field: SchemaField<any>,
  value: any,
  readonly: boolean,
  onChange: (value: any) => void
): ReactNode {
  const baseInputClass =
    'w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200 focus:outline-none focus:border-blue-500 transition';

  if (readonly) {
    return (
      <div className="px-3 py-2 bg-gray-900/50 border border-gray-800 rounded-lg text-gray-300">
        {value !== null && value !== undefined
          ? field.format
            ? field.format(value, {} as any)
            : String(value)
          : '-'}
      </div>
    );
  }

  switch (field.type) {
    case 'boolean':
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

    case 'number':
      return (
        <input
          type="number"
          value={value || ''}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder={field.placeholder}
          className={baseInputClass}
        />
      );

    case 'date':
      return (
        <input
          type="date"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      );

    case 'datetime':
      return (
        <input
          type="datetime-local"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        />
      );

    case 'textarea':
      return (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={baseInputClass}
        />
      );

    case 'select':
      return (
        <select
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={baseInputClass}
        >
          <option value="">Select {field.label}</option>
          {field.options?.map((opt) => (
            <option key={String(opt.value)} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'color':
      return (
        <div className="flex gap-2">
          <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-10 rounded border border-gray-700"
          />
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className={baseInputClass}
          />
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInputClass}
        />
      );
  }
}

// Import React for hooks
import React from 'react';
