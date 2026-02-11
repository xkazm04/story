'use client';

import { useState } from 'react';
import {
  Users, BookOpen, Image, Mic, Layers, Settings, Info, Edit,
  Sparkles, Pencil, Sliders, Bookmark, History,
} from 'lucide-react';
import { Tabs } from '@/app/components/UI/Tabs';
import { FilterBar } from '@/app/components/UI/FilterBar';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function TabsSection() {
  const [tab1, setTab1] = useState('overview');
  const [tab2, setTab2] = useState('overview');
  const [tab3, setTab3] = useState('overview');
  const [tab4, setTab4] = useState('overview');
  const [filter1, setFilter1] = useState('all');
  const [filter2, setFilter2] = useState('all');
  const [filter3, setFilter3] = useState('all');
  const [featureTab, setFeatureTab] = useState('characters');
  const [imageTab, setImageTab] = useState('generator');
  const [editorTab, setEditorTab] = useState('adjustments');
  const [storyTab, setStoryTab] = useState('art-style');
  const [sceneTab, setSceneTab] = useState('scene-editor');

  return (
    <ShowcaseSection
      id="tabs"
      title="Tabs & Filters"
      description="Unified tab navigation — all features now use UI/Tabs"
      count={14}
    >
      {/* Core Tabs variants */}
      <ShowcaseItem label="Tabs: pills variant" source="UI/Tabs">
        <Tabs
          items={[
            { value: 'overview', label: 'Overview', icon: <Info /> },
            { value: 'edit', label: 'Edit', icon: <Edit /> },
            { value: 'settings', label: 'Settings', icon: <Settings /> },
          ]}
          value={tab1}
          onChange={setTab1}
          variant="pills"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Tabs: underline variant" source="UI/Tabs">
        <Tabs
          items={[
            { value: 'overview', label: 'Overview', icon: <Info /> },
            { value: 'edit', label: 'Edit', icon: <Edit /> },
            { value: 'settings', label: 'Settings', icon: <Settings /> },
            { value: 'disabled', label: 'Disabled', disabled: true },
          ]}
          value={tab2}
          onChange={setTab2}
          variant="underline"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Tabs: medium size" source="UI/Tabs">
        <Tabs
          items={[
            { value: 'overview', label: 'Overview' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'export', label: 'Export' },
          ]}
          value={tab3}
          onChange={setTab3}
          size="md"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Tabs: no icons" source="UI/Tabs">
        <Tabs
          items={[
            { value: 'overview', label: 'Act 1' },
            { value: 'act2', label: 'Act 2' },
            { value: 'act3', label: 'Act 3' },
            { value: 'act4', label: 'Act 4' },
          ]}
          value={tab4}
          onChange={setTab4}
        />
      </ShowcaseItem>

      {/* Migrated feature patterns (was TabButton / TabMenu) */}
      <ShowcaseItem label="ImageFeature tabs (was TabButton)" source="features/image/ImageFeature.tsx">
        <Tabs
          items={[
            { value: 'generator', label: 'Generator', icon: <Sparkles className="w-4 h-4" /> },
            { value: 'sketch', label: 'Sketch', icon: <Pencil className="w-4 h-4" /> },
            { value: 'editor', label: 'Editor', icon: <Image className="w-4 h-4" /> },
          ]}
          value={imageTab}
          onChange={setImageTab}
          variant="pills"
        />
      </ShowcaseItem>

      <ShowcaseItem label="ImageEditor sidebar (was TabButton)" source="features/image/editor/ImageEditor.tsx">
        <Tabs
          items={[
            { value: 'adjustments', label: 'Adjustments', icon: <Sliders className="w-4 h-4" /> },
            { value: 'presets', label: 'Presets', icon: <Bookmark className="w-4 h-4" /> },
            { value: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
          ]}
          value={editorTab}
          onChange={setEditorTab}
          variant="underline"
        />
      </ShowcaseItem>

      <ShowcaseItem label="StoryFeature 8-tab nav (was TabMenu)" source="features/story/StoryFeature.tsx">
        <Tabs
          items={[
            { value: 'art-style', label: 'Art Style' },
            { value: 'beats', label: 'Beats' },
            { value: 'scene-editor', label: 'Content' },
            { value: 'act-evaluation', label: 'Evaluator' },
            { value: 'scene-graph', label: 'Graph' },
            { value: 'prompt-composer', label: 'Prompts' },
            { value: 'story-script', label: 'Script' },
            { value: 'story-setup', label: 'Setup' },
          ]}
          value={storyTab}
          onChange={setStoryTab}
          variant="pills"
        />
      </ShowcaseItem>

      <ShowcaseItem label="ScenesFeature tabs (was TabMenu)" source="features/scenes/ScenesFeature.tsx">
        <Tabs
          items={[
            { value: 'scene-editor', label: 'Script Editor' },
            { value: 'character-relationships', label: 'Relationships' },
            { value: 'scene-impact', label: 'Impact' },
          ]}
          value={sceneTab}
          onChange={setSceneTab}
          variant="pills"
        />
      </ShowcaseItem>

      {/* FilterBar component */}
      <ShowcaseItem label="FilterBar: pills" source="UI/FilterBar">
        <FilterBar
          options={[
            { value: 'all', label: 'All', icon: <Layers /> },
            { value: 'characters', label: 'Characters', icon: <Users />, count: 12 },
            { value: 'scenes', label: 'Scenes', icon: <BookOpen />, count: 8 },
            { value: 'images', label: 'Images', icon: <Image />, count: 24 },
          ]}
          value={filter1}
          onChange={setFilter1}
          variant="pills"
        />
      </ShowcaseItem>

      <ShowcaseItem label="FilterBar: underline" source="UI/FilterBar">
        <FilterBar
          options={[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'archived', label: 'Archived' },
          ]}
          value={filter2}
          onChange={setFilter2}
          variant="underline"
        />
      </ShowcaseItem>

      <ShowcaseItem label="FilterBar: medium with counts" source="UI/FilterBar">
        <FilterBar
          options={[
            { value: 'all', label: 'All Types', count: 45 },
            { value: 'character', label: 'Character', count: 12 },
            { value: 'weapon', label: 'Weapon', count: 8 },
            { value: 'armor', label: 'Armor', count: 5 },
          ]}
          value={filter3}
          onChange={setFilter3}
          size="md"
        />
      </ShowcaseItem>

      {/* Feature-local patterns (kept as-is) */}
      <ShowcaseItem label="Tabs: feature nav with icons" source="UI/Tabs">
        <Tabs
          items={[
            { value: 'characters', label: 'Characters', icon: <Users /> },
            { value: 'story', label: 'Story', icon: <BookOpen /> },
            { value: 'image', label: 'Image', icon: <Image /> },
            { value: 'voice', label: 'Voice', icon: <Mic /> },
          ]}
          value={featureTab}
          onChange={setFeatureTab}
          variant="pills"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Tabs: many items" source="UI/Tabs">
        <Tabs
          items={[
            { value: 'characters', label: 'Characters' },
            { value: 'story', label: 'Story' },
            { value: 'image', label: 'Image' },
            { value: 'voice', label: 'Voice' },
            { value: 'datasets', label: 'Datasets' },
            { value: 'simulator', label: 'Simulator' },
            { value: 'assets', label: 'Assets' },
          ]}
          value={featureTab}
          onChange={setFeatureTab}
          variant="pills"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Beat filter panel" source="features/story/Beats/BeatFilterPanel.tsx">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border border-cyan-500/40 bg-cyan-500/10 text-cyan-400">
            <span>Filters</span>
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-medium">
              3
            </span>
          </div>
          <div className="flex gap-1">
            {['Plot', 'Character', 'Action'].map((f) => (
              <span key={f} className="px-2 py-1 rounded text-[10px] bg-slate-800 text-slate-400">
                {f}
              </span>
            ))}
          </div>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
