/**
 * Scene Entity Schema
 *
 * Schema definition for scenes with all fields, validations,
 * and UI metadata.
 */

import { EntitySchema } from '../types';
import { Scene } from '@/app/types/Scene';
import { MapPin, FileText } from 'lucide-react';

export const sceneSchema: EntitySchema<Scene> = {
  name: 'scene',
  displayName: 'Scenes',
  description: 'Individual scenes that make up acts',
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
      label: 'Scene Name',
      type: 'string',
      required: true,
      editable: true,
      sortable: true,
      searchable: true,
      width: 'flex-1',
      placeholder: 'e.g., Opening Scene',
      validations: [
        {
          type: 'required',
          message: 'Scene name is required',
        },
        {
          type: 'min',
          value: 2,
          message: 'Scene name must be at least 2 characters',
        },
        {
          type: 'max',
          value: 200,
          message: 'Scene name must be less than 200 characters',
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
      placeholder: 'Brief description of what happens in this scene...',
      validations: [
        {
          type: 'max',
          value: 2000,
          message: 'Description must be less than 2000 characters',
        },
      ],
    },
    {
      key: 'location',
      label: 'Location',
      type: 'string',
      editable: true,
      searchable: true,
      filterable: true,
      width: 'w-48',
      placeholder: 'e.g., Downtown Coffee Shop',
      render: (value) => {
        if (!value) return <span className="text-gray-600 text-xs">-</span>;
        return (
          <div className="flex items-center gap-1 text-gray-300">
            <MapPin className="w-3 h-3 text-blue-400" />
            <span className="text-xs">{value}</span>
          </div>
        );
      },
    },
    {
      key: 'script',
      label: 'Script',
      type: 'richtext',
      editable: true,
      searchable: true,
      width: 'flex-1',
      placeholder: 'Scene script or dialogue...',
      render: (value) => {
        if (!value) return <span className="text-gray-600 text-xs">No script</span>;
        const preview = value.length > 100 ? value.substring(0, 100) + '...' : value;
        return (
          <div className="flex items-center gap-2 text-gray-400">
            <FileText className="w-3 h-3" />
            <span className="text-xs">{preview}</span>
          </div>
        );
      },
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
    description: '',
    location: '',
  },

  relationships: {
    project: {
      type: 'one-to-many',
      entity: 'project',
      foreignKey: 'project_id',
    },
    act: {
      type: 'one-to-many',
      entity: 'act',
      foreignKey: 'act_id',
    },
  },

  hooks: {
    beforeCreate: async (scene) => {
      // Auto-increment order if not provided
      if (!scene.order) {
        scene.order = 1;
      }
      return scene;
    },
  },

  ui: {
    color: '#8b5cf6',
    enableExport: true,
    enableSearch: true,
    enableFilters: true,
    defaultView: 'table',
  },
};
