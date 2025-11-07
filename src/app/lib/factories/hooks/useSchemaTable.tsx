/**
 * useSchemaTable Hook
 *
 * Convenience hook for creating table components from schemas.
 * Handles data fetching, loading states, and CRUD operations.
 */

'use client';

import { useMemo } from 'react';
import { ComponentFactory } from '../ComponentFactory';
import { EntitySchema, TableComponentOptions } from '../types';

export interface UseSchemaTableOptions<T> {
  schema: EntitySchema<T>;
  data: T[];
  loading?: boolean;
  error?: Error | null;
  options?: TableComponentOptions<T>;
  onCreate?: (entity: Partial<T>) => Promise<void>;
  onUpdate?: (entity: T, updates: Partial<T>) => Promise<void>;
  onDelete?: (entity: T) => Promise<void>;
  onReorder?: (fromIndex: number, toIndex: number) => Promise<void>;
  testId?: string;
}

export function useSchemaTable<T extends Record<string, any>>({
  schema,
  data,
  loading = false,
  error = null,
  options = {},
  onCreate,
  onUpdate,
  onDelete,
  onReorder,
  testId,
}: UseSchemaTableOptions<T>) {
  // Generate table component
  const TableComponent = useMemo(() => {
    return ComponentFactory.createTableComponent<T>(schema);
  }, [schema]);

  // Render function
  const render = () => (
    <TableComponent
      schema={schema}
      data={data}
      loading={loading}
      error={error}
      options={options}
      onCreate={onCreate}
      onUpdate={onUpdate}
      onDelete={onDelete}
      onReorder={onReorder}
      testId={testId}
    />
  );

  return {
    TableComponent,
    render,
    schema,
    data,
    loading,
    error,
  };
}
