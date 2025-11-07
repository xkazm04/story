/**
 * Act Entity Schema
 *
 * Schema definition for story acts with all fields, validations,
 * and UI metadata.
 */

import { EntitySchema } from '../types';
import { Act } from '@/app/types/Act';

export const actSchema: EntitySchema<Act> = {
  name: 'act',
  displayName: 'Acts',
  description: 'Story acts that organize scenes and beats',
  primaryKey: 'id',
  displayField: 'name',

  fields: [
    {
      key: 'id',
      label: 'ID',
      type: 'string',
      editable: false,
      width: 'w-32',
      className: 'font-mono text-xs text-gray-500',
    },
    {
      key: 'name',
      label: 'Act Name',
      type: 'string',
      required: true,
      editable: true,
      sortable: true,
      searchable: true,
      width: 'flex-1',
      placeholder: 'e.g., Act 1: Setup',
      validations: [
        {
          type: 'required',
          message: 'Act name is required',
        },
        {
          type: 'min',
          value: 2,
          message: 'Act name must be at least 2 characters',
        },
        {
          type: 'max',
          value: 150,
          message: 'Act name must be less than 150 characters',
        },
      ],
    },
    {
      key: 'description',
      label: 'Description',
      type: 'textarea',
      editable: true,
      searchable: true,
      width: 'flex-1',
      placeholder: 'Describe the purpose and key events of this act...',
      validations: [
        {
          type: 'max',
          value: 2000,
          message: 'Description must be less than 2000 characters',
        },
      ],
    },
    {
      key: 'order',
      label: 'Order',
      type: 'number',
      editable: true,
      sortable: true,
      width: 'w-20',
      format: (value) => (value !== null && value !== undefined ? `#${value}` : '-'),
      validations: [
        {
          type: 'min',
          value: 1,
          message: 'Order must be at least 1',
        },
      ],
    },
    {
      key: 'created_at',
      label: 'Created',
      type: 'datetime',
      editable: false,
      sortable: true,
      width: 'w-40',
      format: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      },
    },
    {
      key: 'updated_at',
      label: 'Updated',
      type: 'datetime',
      editable: false,
      sortable: true,
      width: 'w-40',
      format: (value) => {
        if (!value) return '-';
        return new Date(value).toLocaleDateString();
      },
    },
  ],

  defaultValues: {
    name: '',
    order: 1,
  },

  relationships: {
    project: {
      type: 'one-to-many',
      entity: 'project',
      foreignKey: 'project_id',
    },
    scenes: {
      type: 'one-to-many',
      entity: 'scene',
    },
    beats: {
      type: 'one-to-many',
      entity: 'beat',
    },
  },

  hooks: {
    beforeCreate: async (act) => {
      // Auto-increment order if not provided
      if (!act.order) {
        // TODO: Query max order and increment
        act.order = 1;
      }
      return act;
    },
  },

  ui: {
    color: '#10b981',
    enableExport: true,
    enableSearch: true,
    defaultView: 'table',
  },
};
