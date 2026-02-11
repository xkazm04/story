'use client';

import { useState } from 'react';
import { cn } from '@/app/lib/utils';
import {
  Inbox, Loader2, Tag, LayoutGrid, PanelLeft, Layers, MousePointer, FormInput
} from 'lucide-react';
import { EmptyStatesSection } from './sections/EmptyStatesSection';
import { SkeletonsSection } from './sections/SkeletonsSection';
import { BadgesSection } from './sections/BadgesSection';
import { TabsSection } from './sections/TabsSection';
import { CardsSection } from './sections/CardsSection';
import { PanelsSection } from './sections/PanelsSection';
import { OverlaysSection } from './sections/OverlaysSection';
import { FormsSection } from './sections/FormsSection';

const categories = [
  { id: 'empty-states', label: 'Empty States', icon: Inbox },
  { id: 'skeletons', label: 'Skeletons', icon: Loader2 },
  { id: 'badges', label: 'Badges & Tags', icon: Tag },
  { id: 'tabs', label: 'Tabs & Filters', icon: LayoutGrid },
  { id: 'cards', label: 'Feature Cards', icon: Layers },
  { id: 'panels', label: 'Panels & Sections', icon: PanelLeft },
  { id: 'overlays', label: 'Overlays', icon: MousePointer },
  { id: 'forms', label: 'Forms & Editing', icon: FormInput },
];

export default function ShowcasePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const scrollTo = (id: string) => {
    setActiveCategory(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex min-h-screen">
      {/* Sidebar navigation */}
      <nav className="w-56 shrink-0 border-r border-slate-800 bg-slate-950/80 p-4 sticky top-0 h-screen overflow-y-auto">
        <h1 className="text-sm font-bold text-white mb-1">UI Showcase</h1>
        <p className="text-[10px] text-slate-500 mb-6 font-mono">style unification</p>
        <ul className="space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <li key={cat.id}>
                <button
                  onClick={() => scrollTo(cat.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-all text-left',
                    activeCategory === cat.id
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  {cat.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main content */}
      <main className="flex-1 p-8 max-w-[1400px]">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Component Showcase</h1>
          <p className="text-sm text-slate-400 mt-1">
            Side-by-side comparison of UI patterns extracted from features.
            Extracted components (top) vs feature-local variants (below).
          </p>
        </div>

        <EmptyStatesSection />
        <SkeletonsSection />
        <BadgesSection />
        <TabsSection />
        <CardsSection />
        <PanelsSection />
        <OverlaysSection />
        <FormsSection />
      </main>
    </div>
  );
}
