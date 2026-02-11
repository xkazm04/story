'use client';

import {
  Sparkles, CheckCircle2, Archive, Pencil, Hash, X,
  Layers, User, Sword, Shield, AlertCircle, TrendingUp, TrendingDown
} from 'lucide-react';
import { Badge } from '@/app/components/UI/Badge';
import { StatusDot } from '@/app/components/UI/StatusDot';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function BadgesSection() {
  return (
    <ShowcaseSection
      id="badges"
      title="Badges, Tags & Status Indicators"
      description="Status badges, filter pills, count indicators, and status dots"
      count={15}
    >
      {/* Extracted Badge component */}
      <ShowcaseItem label="Badge variants" source="UI/Badge">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default">Default</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="info">Info</Badge>
          <Badge variant="purple">Purple</Badge>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Badge sizes" source="UI/Badge">
        <div className="flex items-center gap-2">
          <Badge size="sm" variant="info">Small</Badge>
          <Badge size="md" variant="info">Medium</Badge>
          <Badge size="lg" variant="info">Large</Badge>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Badge with icon" source="UI/Badge">
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" icon={<Sparkles />}>Active</Badge>
          <Badge variant="success" icon={<CheckCircle2 />}>Complete</Badge>
          <Badge variant="purple" icon={<Archive />}>Archived</Badge>
          <Badge variant="default" icon={<Pencil />}>Draft</Badge>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Badge outline" source="UI/Badge">
        <div className="flex flex-wrap gap-2">
          <Badge variant="info" outline>Outline</Badge>
          <Badge variant="success" outline icon={<CheckCircle2 />}>Done</Badge>
          <Badge variant="warning" outline>Pending</Badge>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Badge with dot" source="UI/Badge">
        <div className="flex flex-wrap gap-2">
          <Badge dot dotColor="bg-emerald-500">Online</Badge>
          <Badge dot dotColor="bg-amber-400">Away</Badge>
          <Badge dot dotColor="bg-red-500">Busy</Badge>
          <Badge dot dotColor="bg-slate-400">Offline</Badge>
        </div>
      </ShowcaseItem>

      {/* Extracted StatusDot component */}
      <ShowcaseItem label="StatusDot colors" source="UI/StatusDot">
        <div className="flex items-center gap-4">
          <StatusDot color="green" label="Online" />
          <StatusDot color="cyan" label="Active" />
          <StatusDot color="amber" label="Away" />
          <StatusDot color="red" label="Error" />
          <StatusDot color="purple" label="Special" />
          <StatusDot color="slate" label="Inactive" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="StatusDot sizes + pulse" source="UI/StatusDot">
        <div className="flex items-center gap-4">
          <StatusDot size="xs" pulse label="xs pulse" />
          <StatusDot size="sm" pulse label="sm pulse" />
          <StatusDot size="md" pulse label="md pulse" />
          <StatusDot size="md" label="md static" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="StatusDot ring + glow" source="UI/StatusDot">
        <div className="flex items-center gap-4">
          <StatusDot color="cyan" ring pulse label="Ring + glow" />
          <StatusDot color="green" ring label="Ring only" />
          <StatusDot color="amber" ring pulse size="md" label="Large" />
          <StatusDot color="red" ring pulse size="md" label="Alert" />
        </div>
      </ShowcaseItem>

      {/* StatusBadge pattern — now uses Badge mono (StatusBadge.tsx deleted) */}
      <ShowcaseItem label="Status badges (mono)" source="UI/Badge (migrated from StatusBadge)">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" size="sm" mono icon={<Pencil />}>Draft</Badge>
          <Badge variant="info" size="sm" mono icon={<Sparkles />}>Active</Badge>
          <Badge variant="success" size="sm" mono icon={<CheckCircle2 />}>Complete</Badge>
          <Badge variant="purple" size="sm" mono icon={<Archive />}>Archived</Badge>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Generation count (mono)" source="UI/Badge (migrated from StatusBadge)">
        <div className="flex items-center gap-3">
          <Badge variant="purple" size="sm" mono icon={<Sparkles />}>3</Badge>
          <Badge variant="purple" size="sm" mono icon={<Sparkles />}>12</Badge>
          <Badge variant="purple" size="sm" mono icon={<Sparkles />}>99+</Badge>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Asset type filter pills" source="features/assets/AssetTypeFilter.tsx:35-97">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { label: 'All', icon: Layers, active: true },
            { label: 'Character', icon: User, active: false },
            { label: 'Weapon', icon: Sword, active: false },
            { label: 'Armor', icon: Shield, active: false },
          ].map((f) => (
            <button
              key={f.label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${
                f.active ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <f.icon className="w-3.5 h-3.5" />
              {f.label}
            </button>
          ))}
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Sketch tag filter" source="features/image/sub_Sketch/TagFilter.tsx:15-100">
        <div className="flex flex-wrap gap-1.5">
          {['portrait', 'landscape', 'concept', 'action'].map((tag, i) => (
            <button
              key={tag}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all border backdrop-blur-sm ${
                i === 0
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm shadow-cyan-500/20'
                  : 'bg-slate-900/40 border-slate-800/60 text-slate-400 hover:border-slate-700 hover:text-slate-300'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Theme keyword tags (migrated to Badge)" source="features/story/ThemeManager.tsx">
        <div className="flex flex-wrap gap-1.5">
          {['revenge', 'redemption', 'love', 'betrayal'].map((tag) => (
            <Badge key={tag} variant="default" size="sm" icon={<Hash className="w-2.5 h-2.5" />} className="gap-1">
              {tag}
              <button className="ml-0.5 hover:text-red-400">
                <X className="w-2.5 h-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Notification badge" source="features/story/SceneEditor.tsx:317">
        <div className="flex items-center gap-6">
          <div className="relative inline-block">
            <button className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <AlertCircle className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-900 text-[9px] font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </div>
          <div className="relative inline-block">
            <button className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <AlertCircle className="w-4 h-4" />
            </button>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              !
            </span>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Trend indicators" source="features/story/NarrativeAnalyticsDashboard.tsx">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" /> +12%
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-amber-400">
            <TrendingDown className="w-3.5 h-3.5" /> -5%
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">
            primary theme
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400">
            secondary
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-800/50 text-slate-400">
            tertiary
          </span>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
