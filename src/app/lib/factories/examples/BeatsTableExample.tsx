/**
 * Beats Table Example
 *
 * Demonstrates how to use the Schema-Based UI Component Factory
 * to generate a fully functional table component for beats.
 */

'use client';

import { useSchemaTable } from '../hooks/useSchemaTable';
import { beatSchema } from '../schemas/beatSchema';
import { Beat } from '@/app/types/Beat';

// Example: Using the hook approach
export function BeatsTableWithHook({ projectId }: { projectId: string }) {
  // In a real implementation, you'd fetch data from your API
  const beats: Beat[] = [
    {
      id: '1',
      name: 'Opening Scene',
      type: 'story',
      description: 'The hero wakes up in an ordinary world',
      completed: false,
      order: 1,
      created_at: new Date(),
    },
    {
      id: '2',
      name: 'Inciting Incident',
      type: 'story',
      description: 'Something disrupts the ordinary world',
      completed: true,
      order: 2,
      created_at: new Date(),
    },
  ];

  const handleUpdate = async (beat: Beat, updates: Partial<Beat>) => {
    console.log('Updating beat:', beat.id, updates);
    // Call your API here
  };

  const handleDelete = async (beat: Beat) => {
    console.log('Deleting beat:', beat.id);
    // Call your API here
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    console.log('Reordering from', fromIndex, 'to', toIndex);
    // Call your API here
  };

  const { render } = useSchemaTable({
    schema: beatSchema,
    data: beats,
    loading: false,
    options: {
      draggable: true,
      selectable: true,
      expandable: true,
      onRowClick: (beat) => {
        console.log('Clicked beat:', beat.name);
      },
      renderExpanded: (beat) => (
        <div className="p-4 bg-gray-900/50 space-y-2">
          <p className="text-sm text-gray-300">{beat.description}</p>
          {beat.paragraph_title && (
            <p className="text-xs text-gray-500">Paragraph: {beat.paragraph_title}</p>
          )}
        </div>
      ),
    },
    onUpdate: handleUpdate,
    onDelete: handleDelete,
    onReorder: handleReorder,
    testId: 'beats-table-example',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-200">Story Beats (Hook Example)</h2>
      {render()}
    </div>
  );
}

// Example: Using the component factory directly
import { ComponentFactory } from '../ComponentFactory';

const BeatsTable = ComponentFactory.createTableComponent(beatSchema);

export function BeatsTableDirect({ projectId }: { projectId: string }) {
  const beats: Beat[] = [
    {
      id: '1',
      name: 'Opening Scene',
      type: 'story',
      description: 'The hero wakes up in an ordinary world',
      completed: false,
      order: 1,
      created_at: new Date(),
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-200">Story Beats (Direct Example)</h2>
      <BeatsTable
        schema={beatSchema}
        data={beats}
        options={{
          draggable: true,
          compact: true,
        }}
        onUpdate={async (beat, updates) => {
          console.log('Update:', beat.id, updates);
        }}
        testId="beats-table-direct"
      />
    </div>
  );
}

// Example: With custom filtering and search
export function BeatsTableAdvanced({ projectId }: { projectId: string }) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'completed' | 'pending'>('all');

  const beats: Beat[] = []; // Your data here

  const filteredBeats = React.useMemo(() => {
    return beats.filter((beat) => {
      // Apply search filter
      const matchesSearch =
        !searchTerm ||
        beat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        beat.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Apply completion filter
      const matchesFilter =
        filter === 'all' ||
        (filter === 'completed' && beat.completed) ||
        (filter === 'pending' && !beat.completed);

      return matchesSearch && matchesFilter;
    });
  }, [beats, searchTerm, filter]);

  const { render } = useSchemaTable({
    schema: beatSchema,
    data: filteredBeats,
    options: {
      draggable: true,
      selectable: true,
    },
    onUpdate: async (beat, updates) => {
      // Update logic
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search beats..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200"
          data-testid="beats-search-input"
        />

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-200"
          data-testid="beats-filter-select"
        >
          <option value="all">All Beats</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {render()}
    </div>
  );
}

import React from 'react';
