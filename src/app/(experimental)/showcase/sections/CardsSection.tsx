'use client';

import {
  Users, Folder, X, Edit, Trash2, Film, BookOpen, MessageSquare,
  Lightbulb, Speaker, Settings, Play, Mic, ChevronDown,
  Sparkles, ImageIcon, Wand2, Copy
} from 'lucide-react';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function CardsSection() {
  return (
    <ShowcaseSection
      id="cards"
      title="Feature Cards"
      description="Domain-specific card patterns from features, shown with mock data"
      count={10}
    >
      {/* CharacterCard pattern */}
      <ShowcaseItem label="CharacterCard" source="features/characters/CharacterCard.tsx">
        <div className="max-w-[180px]">
          <div className="relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border border-slate-700/50 bg-slate-900/80 hover:border-slate-600 hover:bg-slate-800/80">
            <div className="aspect-square relative bg-slate-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-slate-600">E</span>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            </div>
            <div className="p-3">
              <p className="font-medium text-slate-100 text-sm truncate">Elena Voss</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide bg-slate-800/80 text-slate-400 border border-slate-700/50 rounded">
                protagonist
              </span>
            </div>
            <button className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-500 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      </ShowcaseItem>

      {/* CharacterCard selected */}
      <ShowcaseItem label="CharacterCard (selected)" source="features/characters/CharacterCard.tsx">
        <div className="max-w-[180px]">
          <div className="relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-200 border border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <div className="aspect-square relative bg-slate-800 flex items-center justify-center">
              <span className="text-3xl font-bold text-cyan-400">M</span>
              <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
            </div>
            <div className="p-3">
              <p className="font-medium text-slate-100 text-sm truncate">Marcus Chen</p>
              <span className="inline-block mt-1 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide bg-slate-800/80 text-slate-400 border border-slate-700/50 rounded">
                antagonist
              </span>
            </div>
          </div>
        </div>
      </ShowcaseItem>

      {/* ProjectCard pattern */}
      <ShowcaseItem label="ProjectCard" source="features/projects/ProjectCard.tsx">
        <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
              <Folder className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                The Last Kingdom
              </h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                A medieval fantasy saga about warring kingdoms and ancient prophecies.
              </p>
            </div>
          </div>
          <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </div>
      </ShowcaseItem>

      {/* ProjectCard with overlay */}
      <ShowcaseItem label="ProjectCard (hover overlay)" source="features/projects/ProjectCard.tsx">
        <div className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Folder className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-white mb-2">Neon Shadows</h3>
              <p className="text-sm text-gray-400 line-clamp-2">A cyberpunk thriller...</p>
            </div>
          </div>
          {/* Simulated hover state */}
          <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center gap-4">
            <button className="p-4 bg-blue-600/80 hover:bg-blue-600 rounded-lg transition-transform hover:scale-110">
              <Edit className="w-6 h-6 text-white" />
            </button>
            <button className="p-4 bg-red-600/80 hover:bg-red-600 rounded-lg transition-transform hover:scale-110">
              <Trash2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </ShowcaseItem>

      {/* SuggestionCard pattern */}
      <ShowcaseItem label="SuggestionCard" source="features/assistant/SuggestionCard.tsx">
        <div className="rounded-lg border border-blue-600/30 bg-slate-900/80 p-3">
          <div className="flex items-start gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-600/20 border border-blue-600/30">
              <Film className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">Scene Hook: Midnight Arrival</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">Scene Hook</span>
                <span className="text-xs text-green-400">85%</span>
              </div>
            </div>
            <button className="p-1 hover:bg-gray-700 rounded transition-colors">
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">
            The rain-slicked streets reflected neon signs as Elena stepped off the midnight train...
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs text-white">
              <Copy className="w-3 h-3" /> Copy
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white">
              <Lightbulb className="w-3 h-3" /> Insert
            </button>
          </div>
        </div>
      </ShowcaseItem>

      {/* SuggestionCard type variants */}
      <ShowcaseItem label="SuggestionCard types" source="features/assistant/SuggestionCard.tsx">
        <div className="space-y-2">
          {[
            { icon: BookOpen, label: 'Beat Outline', color: 'purple' },
            { icon: MessageSquare, label: 'Dialogue', color: 'green' },
            { icon: Lightbulb, label: 'Plot Twist', color: 'red' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className={`flex items-center gap-2 p-2 rounded-lg border border-${color}-600/30 bg-slate-900/80`}>
              <div className={`p-1.5 rounded bg-${color}-600/20`}>
                <Icon className={`w-3 h-3 text-${color}-400`} />
              </div>
              <span className="text-xs text-slate-300">{label}</span>
              <span className="text-[10px] text-green-400 ml-auto">92%</span>
            </div>
          ))}
        </div>
      </ShowcaseItem>

      {/* VoiceRow pattern */}
      <ShowcaseItem label="VoiceRow" source="features/voice/VoiceRow.tsx" className="md:col-span-2">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700/50">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800">
                <Speaker className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1">
                <p className="text-base font-semibold text-gray-100">Elena - Narrator</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-gray-500">ElevenLabs</span>
                  <span className="text-xs text-gray-500">English</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-lg bg-purple-900/30 text-purple-300 hover:bg-purple-900/50">
                <Wand2 className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700">
                <Settings className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-emerald-900 text-emerald-200">
                <Play className="w-4 h-4" />
              </button>
              <button className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </ShowcaseItem>

      {/* VoiceRow playing state */}
      <ShowcaseItem label="VoiceRow (playing)" source="features/voice/VoiceRow.tsx">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700/50">
          <div className="px-5 py-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-800 animate-pulse">
              <Mic className="w-5 h-5 text-emerald-200" />
            </div>
            <div className="flex-1">
              <p className="text-base font-semibold text-gray-100">Marcus - Villain</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-emerald-400">Playing...</span>
              </div>
            </div>
          </div>
        </div>
      </ShowcaseItem>

      {/* DimensionCard pattern */}
      <ShowcaseItem label="DimensionCard" source="features/simulator/DimensionCard.tsx">
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-slate-200">Art Style</span>
          </div>
          <input
            type="text"
            placeholder="e.g. watercolor, photorealistic..."
            defaultValue="cinematic photorealistic"
            className="w-full px-2 py-1.5 text-xs bg-slate-800/50 border border-slate-700/50 rounded text-slate-200 placeholder:text-slate-600"
          />
        </div>
      </ShowcaseItem>

      {/* PromptCard pattern */}
      <ShowcaseItem label="PromptCard" source="features/simulator/PromptCard.tsx">
        <div className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-200">Prompt #1</span>
            <div className="flex gap-1">
              <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
                <Copy className="w-3 h-3" />
              </button>
              <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
                <ImageIcon className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
            A cinematic photorealistic scene of a medieval castle at sunset, dramatic lighting casting long shadows across the courtyard...
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {['composition', 'lighting', 'style'].map((tag) => (
              <span key={tag} className="px-1.5 py-0.5 text-[9px] rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
