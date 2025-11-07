/**
 * Factory Showcase
 *
 * Complete demonstration of the Schema-Based UI Component Factory
 * capabilities. Shows all features and patterns.
 */

'use client';

import React, { useState } from 'react';
import { ComponentFactory, useSchemaTable, useSchemaForm } from '../index';
import { beatSchema, actSchema, sceneSchema, characterSchema } from '../schemas';
import { Beat } from '@/app/types/Beat';
import { Act } from '@/app/types/Act';
import { Scene } from '@/app/types/Scene';
import { Character } from '@/app/types/Character';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/app/components/UI/TabMenu';

export function FactoryShowcase() {
  const [activeTab, setActiveTab] = useState('beats');

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-gray-100">
            Schema-Based UI Component Factory
          </h1>
          <p className="text-gray-400">
            Demonstration of auto-generated UI components from TypeScript schemas
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="beats" data-testid="tab-beats">
                Beats
              </TabsTrigger>
              <TabsTrigger value="acts" data-testid="tab-acts">
                Acts
              </TabsTrigger>
              <TabsTrigger value="scenes" data-testid="tab-scenes">
                Scenes
              </TabsTrigger>
              <TabsTrigger value="characters" data-testid="tab-characters">
                Characters
              </TabsTrigger>
            </TabsList>

            <TabsContent value="beats">
              <BeatsShowcase />
            </TabsContent>

            <TabsContent value="acts">
              <ActsShowcase />
            </TabsContent>

            <TabsContent value="scenes">
              <ScenesShowcase />
            </TabsContent>

            <TabsContent value="characters">
              <CharactersShowcase />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

// Beats showcase
function BeatsShowcase() {
  const [beats] = useState<Beat[]>([
    {
      id: '1',
      name: 'Opening Scene',
      type: 'story',
      description: 'The hero wakes up in an ordinary world',
      completed: false,
      order: 1,
      duration: 5,
      created_at: new Date(),
    },
    {
      id: '2',
      name: 'Inciting Incident',
      type: 'story',
      description: 'Something disrupts the ordinary world',
      completed: true,
      order: 2,
      duration: 10,
      created_at: new Date(),
    },
    {
      id: '3',
      name: 'First Plot Point',
      type: 'act',
      description: 'Hero commits to the journey',
      completed: false,
      order: 3,
      duration: 8,
      pacing_score: 0.85,
      created_at: new Date(),
    },
  ]);

  const [showForm, setShowForm] = useState(false);

  const { render: renderTable } = useSchemaTable({
    schema: beatSchema,
    data: beats,
    options: {
      draggable: true,
      selectable: true,
      expandable: true,
      renderExpanded: (beat) => (
        <div className="p-4 bg-gray-900/50 space-y-2">
          <p className="text-sm text-gray-300">{beat.description}</p>
          {beat.duration && (
            <p className="text-xs text-gray-500">Duration: {beat.duration} minutes</p>
          )}
        </div>
      ),
    },
    onUpdate: async (beat, updates) => {
      console.log('Update beat:', beat.id, updates);
    },
    onDelete: async (beat) => {
      console.log('Delete beat:', beat.id);
    },
    testId: 'beats-showcase-table',
  });

  const { render: renderForm } = useSchemaForm({
    schema: beatSchema,
    mode: 'create',
    options: {
      layout: 'grid',
      columns: 2,
      sections: [
        {
          id: 'basic',
          title: 'Basic Information',
          fields: ['name', 'type', 'description'],
        },
        {
          id: 'planning',
          title: 'Planning',
          fields: ['order', 'duration', 'completed'],
        },
      ],
      submitLabel: 'Create Beat',
      showCancel: true,
    },
    onSubmit: async (beat) => {
      console.log('Create beat:', beat);
      setShowForm(false);
    },
    onCancel: () => setShowForm(false),
    testId: 'beats-showcase-form',
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-200">Story Beats</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          data-testid="beats-toggle-form-btn"
        >
          {showForm ? 'Hide Form' : 'Add Beat'}
        </button>
      </div>

      {showForm && (
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          {renderForm()}
        </div>
      )}

      {renderTable()}
    </div>
  );
}

// Acts showcase
function ActsShowcase() {
  const [acts] = useState<Act[]>([
    {
      id: '1',
      name: 'Act 1: Setup',
      project_id: 'project-1',
      description: 'Introduce the ordinary world and protagonist',
      order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Act 2: Confrontation',
      project_id: 'project-1',
      description: 'Rising action and obstacles',
      order: 2,
      created_at: new Date().toISOString(),
    },
  ]);

  const { render } = useSchemaTable({
    schema: actSchema,
    data: acts,
    options: {
      draggable: true,
    },
    onUpdate: async (act, updates) => {
      console.log('Update act:', act.id, updates);
    },
    testId: 'acts-showcase-table',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-200">Story Acts</h2>
      {render()}
    </div>
  );
}

// Scenes showcase
function ScenesShowcase() {
  const [scenes] = useState<Scene[]>([
    {
      id: '1',
      name: 'Opening Montage',
      project_id: 'project-1',
      act_id: 'act-1',
      description: 'Show the protagonist daily routine',
      location: 'Downtown Office',
      order: 1,
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'The Phone Call',
      project_id: 'project-1',
      act_id: 'act-1',
      description: 'Protagonist receives unexpected news',
      location: 'Home',
      script: 'INT. HOME - NIGHT\n\nThe phone rings...',
      order: 2,
      created_at: new Date().toISOString(),
    },
  ]);

  const { render } = useSchemaTable({
    schema: sceneSchema,
    data: scenes,
    options: {
      expandable: true,
      renderExpanded: (scene) => (
        <div className="p-4 bg-gray-900/50 space-y-2">
          <p className="text-sm text-gray-300">{scene.description}</p>
          {scene.location && (
            <p className="text-xs text-gray-500">Location: {scene.location}</p>
          )}
          {scene.script && (
            <pre className="mt-2 p-2 bg-gray-950 rounded text-xs text-gray-400 overflow-auto max-h-40">
              {scene.script}
            </pre>
          )}
        </div>
      ),
    },
    onUpdate: async (scene, updates) => {
      console.log('Update scene:', scene.id, updates);
    },
    testId: 'scenes-showcase-table',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-200">Scenes</h2>
      {render()}
    </div>
  );
}

// Characters showcase
function CharactersShowcase() {
  const [characters] = useState<Character[]>([
    {
      id: '1',
      name: 'John Doe',
      type: 'protagonist',
      project_id: 'project-1',
    },
    {
      id: '2',
      name: 'Jane Smith',
      type: 'antagonist',
      project_id: 'project-1',
    },
    {
      id: '3',
      name: 'Bob Wilson',
      type: 'supporting',
      project_id: 'project-1',
    },
  ]);

  const { render } = useSchemaTable({
    schema: characterSchema,
    data: characters,
    options: {
      selectable: true,
    },
    onUpdate: async (character, updates) => {
      console.log('Update character:', character.id, updates);
    },
    testId: 'characters-showcase-table',
  });

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-200">Characters</h2>
      {render()}
    </div>
  );
}
