/**
 * Character Entity Schema
 *
 * Schema definition for characters with all fields, validations,
 * and UI metadata.
 */

import { EntitySchema } from '../types';
import { Character } from '@/app/types/Character';
import { User, ImageIcon } from 'lucide-react';

export const characterSchema: EntitySchema<Character> = {
  name: 'character',
  displayName: 'Characters',
  description: 'Story characters with traits and relationships',
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
      label: 'Character Name',
      type: 'string',
      required: true,
      editable: true,
      sortable: true,
      searchable: true,
      width: 'flex-1',
      placeholder: 'e.g., John Doe',
      validations: [
        {
          type: 'required',
          message: 'Character name is required',
        },
        {
          type: 'min',
          value: 2,
          message: 'Character name must be at least 2 characters',
        },
        {
          type: 'max',
          value: 100,
          message: 'Character name must be less than 100 characters',
        },
      ],
      render: (value, character) => {
        return (
          <div className="flex items-center gap-2">
            {character.avatar_url ? (
              <img
                src={character.avatar_url}
                alt={value}
                className="w-8 h-8 rounded-full object-cover border border-gray-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            )}
            <span className="font-medium text-gray-200">{value}</span>
          </div>
        );
      },
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
        { label: 'Protagonist', value: 'protagonist', color: '#3b82f6' },
        { label: 'Antagonist', value: 'antagonist', color: '#ef4444' },
        { label: 'Supporting', value: 'supporting', color: '#10b981' },
        { label: 'Minor', value: 'minor', color: '#6b7280' },
      ],
    },
    {
      key: 'voice',
      label: 'Voice',
      type: 'string',
      editable: true,
      width: 'w-40',
      placeholder: 'Voice ID',
      description: 'Voice identifier for audio generation',
    },
    {
      key: 'avatar_url',
      label: 'Avatar',
      type: 'image',
      editable: true,
      width: 'w-24',
      render: (value) => {
        if (!value) {
          return (
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center border border-gray-700">
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </div>
          );
        }
        return (
          <img
            src={value}
            alt="Avatar"
            className="w-12 h-12 rounded-full object-cover border border-gray-700"
          />
        );
      },
    },
    {
      key: 'transparent_avatar_url',
      label: 'Transparent Avatar',
      type: 'image',
      editable: true,
      width: 'w-24',
      description: 'Avatar with transparent background',
    },
    {
      key: 'body_url',
      label: 'Body Image',
      type: 'image',
      editable: true,
      width: 'w-24',
      description: 'Full body character image',
    },
    {
      key: 'transparent_body_url',
      label: 'Transparent Body',
      type: 'image',
      editable: true,
      width: 'w-24',
      description: 'Full body with transparent background',
    },
  ],

  defaultValues: {
    name: '',
    type: 'supporting',
  },

  relationships: {
    project: {
      type: 'one-to-many',
      entity: 'project',
      foreignKey: 'project_id',
    },
    faction: {
      type: 'one-to-many',
      entity: 'faction',
      foreignKey: 'faction_id',
    },
    traits: {
      type: 'one-to-many',
      entity: 'trait',
    },
    relationships: {
      type: 'many-to-many',
      entity: 'character',
    },
  },

  ui: {
    color: '#f59e0b',
    enableExport: true,
    enableSearch: true,
    enableFilters: true,
    defaultView: 'grid',
  },
};
