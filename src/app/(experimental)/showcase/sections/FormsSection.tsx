'use client';

import { useState } from 'react';
import { Plus, Film, Mic, Settings } from 'lucide-react';
import { InlineEdit } from '@/app/components/UI/InlineEdit';
import { InlineAddForm } from '@/app/components/UI/InlineAddForm';
import { FormSection } from '@/app/components/UI/FormSection';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function FormsSection() {
  const [editValue1, setEditValue1] = useState('Scene 1: The Arrival');
  const [editValue2, setEditValue2] = useState('');

  return (
    <ShowcaseSection
      id="forms"
      title="Forms & Inline Editing"
      description="Inline editing, form sections, and add-new patterns"
      count={10}
    >
      {/* Extracted InlineEdit */}
      <ShowcaseItem label="InlineEdit: with value" source="UI/InlineEdit">
        <InlineEdit
          value={editValue1}
          onSave={setEditValue1}
        />
      </ShowcaseItem>

      <ShowcaseItem label="InlineEdit: empty (placeholder)" source="UI/InlineEdit">
        <InlineEdit
          value={editValue2}
          onSave={setEditValue2}
          placeholder="Click to add description..."
          size="sm"
        />
      </ShowcaseItem>

      {/* Extracted InlineAddForm */}
      <ShowcaseItem label="InlineAddForm: collapsed" source="UI/InlineAddForm">
        <InlineAddForm
          trigger={{ label: 'Add Scene', icon: <Plus className="w-3.5 h-3.5" /> }}
          onSubmit={(close) => close()}
          renderForm={() => (
            <input
              type="text"
              placeholder="Scene name..."
              className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700/50 rounded text-slate-200 placeholder:text-slate-600"
            />
          )}
        />
      </ShowcaseItem>

      <ShowcaseItem label="InlineAddForm: expanded" source="UI/InlineAddForm">
        <div className="border border-slate-700/50 rounded-lg p-3 bg-slate-900/60 backdrop-blur-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Add Scene</span>
            <button className="p-0.5 text-slate-500 hover:text-slate-300">
              <span className="text-xs">&times;</span>
            </button>
          </div>
          <input
            type="text"
            placeholder="Scene name..."
            defaultValue="The Chase"
            className="w-full px-2 py-1.5 text-xs bg-slate-800 border border-slate-700/50 rounded text-slate-200 placeholder:text-slate-600"
          />
          <div className="flex justify-end gap-2">
            <button className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-md transition-all duration-200">
              Cancel
            </button>
            <button className="px-3 py-1.5 text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-md transition-all duration-200">
              Create
            </button>
          </div>
        </div>
      </ShowcaseItem>

      {/* Extracted FormSection */}
      <ShowcaseItem label="FormSection: basic" source="UI/FormSection">
        <div className="space-y-4">
          <FormSection label="Character Name" required>
            <input
              type="text"
              defaultValue="Elena Voss"
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200"
            />
          </FormSection>
          <FormSection label="Description" description="Brief character summary">
            <textarea
              defaultValue="A resourceful ex-detective..."
              className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200 h-16 resize-none"
            />
          </FormSection>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="FormSection: with select" source="UI/FormSection">
        <div className="space-y-4">
          <FormSection label="Character Type">
            <select className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200">
              <option>Protagonist</option>
              <option>Antagonist</option>
              <option>Supporting</option>
              <option>Minor</option>
            </select>
          </FormSection>
          <FormSection label="Faction">
            <select className="w-full px-2.5 py-1.5 text-sm bg-slate-800 border border-slate-700/50 rounded-lg text-slate-200">
              <option>None</option>
              <option>The Order</option>
              <option>Rebels</option>
            </select>
          </FormSection>
        </div>
      </ShowcaseItem>

      {/* Feature-local form variants */}
      <ShowcaseItem label="Feature form labels" source="features/ (common pattern)">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Name</label>
            <input
              type="text"
              defaultValue="The Last Kingdom"
              className="w-full px-3 py-2 text-sm bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Genre</label>
            <input
              type="text"
              defaultValue="Fantasy"
              className="w-full px-3 py-2 text-sm bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-cyan-500"
            />
          </div>
          <p className="text-[10px] text-slate-500">Note: mixed gray-* vs slate-* colors</p>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Dimension input form" source="features/simulator/DimensionCard.tsx">
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-200">Environment</span>
            <span className="text-[10px] text-slate-500 ml-auto">optional</span>
          </div>
          <input
            type="text"
            placeholder="e.g. medieval castle, neon city..."
            defaultValue="rainy cyberpunk street"
            className="w-full px-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded text-slate-200 placeholder:text-slate-600"
          />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Voice configuration form" source="features/voice/VoiceConfiguration.tsx">
        <div className="space-y-3 p-3 bg-slate-900/40 rounded-lg border border-slate-800/60">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-200">Voice Settings</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Speed</label>
              <input type="range" className="w-full accent-cyan-500" defaultValue={50} />
            </div>
            <div>
              <label className="block text-[10px] text-slate-500 mb-1">Pitch</label>
              <input type="range" className="w-full accent-cyan-500" defaultValue={50} />
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Stability</label>
            <input
              type="range"
              className="w-full accent-cyan-500"
              defaultValue={75}
            />
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Scene create form" source="features/scenes/SceneAdd.tsx">
        <div className="border-2 border-dashed border-slate-700 rounded-lg p-4 space-y-3">
          <h4 className="text-xs font-medium text-slate-300">Create New Scene</h4>
          <div>
            <label className="block text-[10px] text-slate-500 mb-1">Scene Name</label>
            <input
              type="text"
              placeholder="Enter scene name..."
              className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded text-slate-200 placeholder:text-slate-600"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button className="px-3 py-1 text-xs text-slate-400 rounded hover:text-slate-200">Cancel</button>
            <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-500">Create</button>
          </div>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
