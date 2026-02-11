'use client';

import {
  Users, BookOpen, Plus, Settings, ChevronDown, ChevronRight,
  Layers, FileText, Image, FolderOpen
} from 'lucide-react';
import { Accordion } from '@/app/components/UI/Accordion';
import { PanelHeader } from '@/app/components/UI/PanelHeader';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function PanelsSection() {
  return (
    <ShowcaseSection
      id="panels"
      title="Panels, Sections & Collapsibles"
      description="Panel headers, accordion patterns, and collapsible sections"
      count={10}
    >
      {/* Extracted PanelHeader */}
      <ShowcaseItem label="PanelHeader: small" source="UI/PanelHeader">
        <PanelHeader
          title="Characters"
          subtitle="12 total"
          icon={<Users />}
          size="sm"
          actions={
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
              <Plus className="w-3.5 h-3.5" />
            </button>
          }
        />
      </ShowcaseItem>

      <ShowcaseItem label="PanelHeader: medium" source="UI/PanelHeader">
        <PanelHeader
          title="Scene Editor"
          subtitle="Act 1, Scene 3"
          icon={<BookOpen />}
          actions={
            <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400">
              <Settings className="w-4 h-4" />
            </button>
          }
        />
      </ShowcaseItem>

      <ShowcaseItem label="PanelHeader: large" source="UI/PanelHeader">
        <PanelHeader
          title="Project Assets"
          icon={<Layers />}
          size="lg"
          actions={
            <div className="flex gap-1">
              <button className="px-2 py-1 text-xs bg-cyan-600/20 text-cyan-400 rounded hover:bg-cyan-600/30">
                Upload
              </button>
              <button className="p-1.5 hover:bg-slate-800 rounded text-slate-400">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          }
        />
      </ShowcaseItem>

      {/* Extracted Accordion */}
      <ShowcaseItem label="Accordion: default" source="UI/Accordion">
        <Accordion
          items={[
            {
              id: 'characters',
              title: 'Characters',
              icon: <Users />,
              badge: '8',
              content: <p className="text-xs text-slate-400">Character list content...</p>,
            },
            {
              id: 'scenes',
              title: 'Scenes',
              icon: <BookOpen />,
              badge: '12',
              content: <p className="text-xs text-slate-400">Scene list content...</p>,
            },
            {
              id: 'assets',
              title: 'Assets',
              icon: <Image />,
              badge: '24',
              content: <p className="text-xs text-slate-400">Assets content...</p>,
            },
          ]}
          defaultOpen={['characters']}
        />
      </ShowcaseItem>

      <ShowcaseItem label="Accordion: bordered, multiple" source="UI/Accordion">
        <Accordion
          items={[
            {
              id: 'overview',
              title: 'Overview',
              content: <p className="text-xs text-slate-400">Overview panel content...</p>,
            },
            {
              id: 'details',
              title: 'Details',
              content: <p className="text-xs text-slate-400">Detailed configuration...</p>,
            },
          ]}
          defaultOpen={['overview', 'details']}
          multiple
          variant="bordered"
        />
      </ShowcaseItem>

      <ShowcaseItem label="Accordion: ghost, small" source="UI/Accordion">
        <Accordion
          items={[
            {
              id: 'act1',
              title: 'Act 1: The Beginning',
              icon: <FileText />,
              content: (
                <div className="space-y-1">
                  {['Scene 1: Arrival', 'Scene 2: Discovery', 'Scene 3: Conflict'].map((s) => (
                    <div key={s} className="px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-800/40 rounded cursor-pointer">
                      {s}
                    </div>
                  ))}
                </div>
              ),
            },
            {
              id: 'act2',
              title: 'Act 2: The Journey',
              icon: <FileText />,
              content: <p className="text-xs text-slate-400">Scenes...</p>,
            },
          ]}
          defaultOpen={['act1']}
          variant="ghost"
          size="sm"
        />
      </ShowcaseItem>

      {/* Feature-local panel variants */}
      <ShowcaseItem label="CollapsibleSection (existing)" source="components/UI/CollapsibleSection.tsx">
        <div className="relative group bg-slate-900/50 backdrop-blur-sm rounded-lg overflow-hidden border border-blue-500/20">
          <button className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-blue-400" />
              <h3 className="text-base font-semibold text-gray-100">Characters</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">12</span>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </button>
          <div className="border-t border-gray-700/30 px-4 py-3">
            <p className="text-sm text-slate-400">Expanded content...</p>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="SectionWrapper (existing)" source="components/UI/SectionWrapper.tsx">
        <div className="relative group bg-slate-900/50 backdrop-blur-sm rounded-lg p-4 border border-green-500/20">
          <p className="text-sm text-slate-300">Content wrapped in a colored-border section</p>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Outline sidebar sections" source="features/story/OutlineSidebar.tsx">
        <div className="space-y-1 bg-slate-950/80 rounded-lg p-2 border border-slate-800/60">
          {['Act 1', 'Act 2', 'Act 3'].map((act, i) => (
            <div key={act}>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-left hover:bg-slate-800/40 rounded">
                {i === 0 ? (
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                ) : (
                  <ChevronRight className="w-3 h-3 text-slate-500" />
                )}
                <FolderOpen className="w-3 h-3 text-slate-500" />
                <span className="text-slate-300">{act}</span>
                <span className="ml-auto text-[10px] text-slate-600">3</span>
              </button>
              {i === 0 && (
                <div className="ml-5 space-y-0.5">
                  {['Scene 1', 'Scene 2', 'Scene 3'].map((scene) => (
                    <button
                      key={scene}
                      className="w-full flex items-center gap-2 px-2 py-1 text-[11px] text-slate-400 hover:bg-slate-800/40 rounded"
                    >
                      <FileText className="w-3 h-3" />
                      {scene}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Section header with actions" source="features/ (multiple)">
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-medium text-slate-200 uppercase tracking-wide">Faction Members</h4>
              <span className="text-[10px] text-slate-500">(5)</span>
            </div>
            <button className="text-xs text-cyan-400 hover:text-cyan-300">+ Add</button>
          </div>
          <div className="border-t border-slate-800/40" />
          <p className="text-xs text-slate-500 px-1">Member list content...</p>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
