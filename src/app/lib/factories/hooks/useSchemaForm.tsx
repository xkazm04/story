/**
 * useSchemaForm Hook
 *
 * Convenience hook for creating form components from schemas.
 * Handles form state, validation, and submission.
 */

'use client';

import { useMemo } from 'react';
import { ComponentFactory } from '../ComponentFactory';
import { EntitySchema, FormComponentOptions } from '../types';

export interface UseSchemaFormOptions<T> {
  schema: EntitySchema<T>;
  entity?: T;
  mode?: 'create' | 'edit' | 'view';
  options?: FormComponentOptions<T>;
  onSubmit?: (entity: Partial<T>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
  error?: Error | null;
  testId?: string;
}

export function useSchemaForm<T extends Record<string, any>>({
  schema,
  entity,
  mode = 'create',
  options = {},
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  testId,
}: UseSchemaFormOptions<T>) {
  // Generate form component
  const FormComponent = useMemo(() => {
    return ComponentFactory.createFormComponent<T>(schema);
  }, [schema]);

  // Render function
  const render = () => (
    <FormComponent
      schema={schema}
      entity={entity}
      mode={mode}
      options={options}
      onSubmit={onSubmit}
      onCancel={onCancel}
      loading={loading}
      error={error}
      testId={testId}
    />
  );

  return {
    FormComponent,
    render,
    schema,
    entity,
    mode,
    loading,
    error,
  };
}
