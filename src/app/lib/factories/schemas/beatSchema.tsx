/**
 * Beat Entity Schema
 *
 * Schema definition for story beats with all fields, validations,
 * and UI metadata.
 */

import { EntitySchema } from '../types';
import { Beat } from '@/app/types/Beat';
import { Check, X, Clock, MapPin } from 'lucide-react';

export const beatSchema: EntitySchema<Beat> = {
  name: 'beat',
  displayName: 'Story Beats',
  description: 'Granular story beats that break down narrative structure',
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
      label: 'Beat Name',
      type: 'string',
      required: true,
      editable: true,
      sortable: true,
      searchable: true,
      width: 'flex-1',
      placeholder: 'Enter beat name...',
      validations: [
        {
          type: 'required',
          message: 'Beat name is required',
        },
        {
          type: 'min',
          value: 3,
          message: 'Beat name must be at least 3 characters',
        },
        {
          type: 'max',
          value: 200,
          message: 'Beat name must be less than 200 characters',
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
      placeholder: 'Describe what happens in this beat...',
      validations: [
        {
          type: 'max',
          value: 2000,
          message: 'Description must be less than 2000 characters',
        },
      ],
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      editable: true,
      sortable: true,
      filterable: true,
      width: 'w-32',
      options: [
        { label: 'Story', value: 'story', color: '#3b82f6' },
        { label: 'Act', value: 'act', color: '#10b981' },
        { label: 'Scene', value: 'scene', color: '#8b5cf6' },
      ],
      defaultValue: 'story',
    },
    {
      key: 'order',
      label: 'Order',
      type: 'number',
      editable: true,
      sortable: true,
      width: 'w-20',
      format: (value) => (value !== null && value !== undefined ? `#${value}` : '-'),
    },
    {
      key: 'completed',
      label: 'Completed',
      type: 'boolean',
      editable: true,
      sortable: true,
      filterable: true,
      width: 'w-24',
      defaultValue: false,
      render: (value) =>
        value ? (
          <div className="flex items-center gap-1 text-green-400">
            <Check className="w-4 h-4" />
            <span className="text-xs">Done</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-gray-600">
            <X className="w-4 h-4" />
            <span className="text-xs">Pending</span>
          </div>
        ),
    },
    {
      key: 'duration',
      label: 'Duration (min)',
      type: 'number',
      editable: true,
      sortable: true,
      width: 'w-32',
      placeholder: '0',
      render: (value) =>
        value ? (
          <div className="flex items-center gap-1 text-gray-400">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{value}m</span>
          </div>
        ) : (
          <span className="text-gray-600 text-xs">-</span>
        ),
    },
    {
      key: 'estimated_duration',
      label: 'Est. Duration (min)',
      type: 'number',
      editable: true,
      width: 'w-32',
      placeholder: '0',
    },
    {
      key: 'pacing_score',
      label: 'Pacing Score',
      type: 'number',
      editable: false,
      sortable: true,
      width: 'w-28',
      format: (value) =>
        value !== null && value !== undefined ? `${(value * 100).toFixed(0)}%` : '-',
      render: (value) => {
        if (value === null || value === undefined) {
          return <span className="text-gray-600 text-xs">-</span>;
        }
        const percentage = value * 100;
        const color =
          percentage >= 80
            ? 'text-green-400'
            : percentage >= 60
            ? 'text-yellow-400'
            : 'text-red-400';
        return <span className={`text-xs font-medium ${color}`}>{percentage.toFixed(0)}%</span>;
      },
    },
    {
      key: 'paragraph_id',
      label: 'Paragraph ID',
      type: 'string',
      editable: true,
      width: 'w-32',
      className: 'font-mono text-xs',
    },
    {
      key: 'paragraph_title',
      label: 'Paragraph Title',
      type: 'string',
      editable: true,
      searchable: true,
      width: 'w-48',
    },
    {
      key: 'default_flag',
      label: 'Default',
      type: 'boolean',
      editable: true,
      filterable: true,
      width: 'w-20',
      defaultValue: false,
    },
    {
      key: 'x_position',
      label: 'X Position',
      type: 'number',
      editable: true,
      width: 'w-24',
      show: (beat) => beat.x_position !== null && beat.x_position !== undefined,
    },
    {
      key: 'y_position',
      label: 'Y Position',
      type: 'number',
      editable: true,
      width: 'w-24',
      show: (beat) => beat.y_position !== null && beat.y_position !== undefined,
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
    type: 'story',
    completed: false,
    default_flag: false,
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

  ui: {
    color: '#3b82f6',
    enableTimeline: true,
    enableExport: true,
    enableSearch: true,
    enableFilters: true,
    defaultView: 'table',
  },
};
