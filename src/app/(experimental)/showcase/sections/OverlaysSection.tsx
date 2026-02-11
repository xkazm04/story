'use client';

import {
  Copy, Trash2, Edit, Download, ZoomIn, Eye, ImageIcon, X, ArrowLeft, ArrowRight
} from 'lucide-react';
import { OverlayActions } from '@/app/components/UI/OverlayActions';
import { Tooltip } from '@/app/components/UI/Tooltip';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function OverlaysSection() {
  return (
    <ShowcaseSection
      id="overlays"
      title="Overlays & Lightbox"
      description="Hover overlays, lightbox layouts, and tooltip patterns"
      count={10}
    >
      {/* Extracted OverlayActions */}
      <ShowcaseItem label="OverlayActions: center (hover)" source="UI/OverlayActions">
        <div className="relative group w-full h-40 bg-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center h-full text-slate-600">
            <ImageIcon className="w-10 h-10" />
          </div>
          <OverlayActions position="center">
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 text-white">
              <ZoomIn className="w-4 h-4" />
            </button>
            <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm border border-white/20 text-white">
              <Edit className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg backdrop-blur-sm border border-red-500/30 text-red-300">
              <Trash2 className="w-4 h-4" />
            </button>
          </OverlayActions>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="OverlayActions: bottom (hover)" source="UI/OverlayActions">
        <div className="relative group w-full h-40 bg-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center h-full text-slate-600">
            <ImageIcon className="w-10 h-10" />
          </div>
          <OverlayActions position="bottom">
            <button className="px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded backdrop-blur-sm text-white">
              View
            </button>
            <button className="px-3 py-1.5 text-xs bg-cyan-500/20 hover:bg-cyan-500/40 rounded backdrop-blur-sm text-cyan-300">
              Use as Reference
            </button>
          </OverlayActions>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="OverlayActions: top-right (hover)" source="UI/OverlayActions">
        <div className="relative group w-full h-40 bg-slate-800 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center h-full text-slate-600">
            <ImageIcon className="w-10 h-10" />
          </div>
          <OverlayActions position="top-right">
            <button className="p-1.5 bg-slate-900/80 hover:bg-slate-800 rounded-md text-slate-300 border border-slate-700/50">
              <Copy className="w-3 h-3" />
            </button>
            <button className="p-1.5 bg-red-600/80 hover:bg-red-500 rounded-md text-white">
              <Trash2 className="w-3 h-3" />
            </button>
          </OverlayActions>
        </div>
      </ShowcaseItem>

      {/* Extracted Tooltip */}
      <ShowcaseItem label="Tooltip positions" source="UI/Tooltip">
        <div className="flex items-center justify-center gap-8 py-8">
          <Tooltip content="Top tooltip" position="top">
            <button className="px-3 py-1.5 text-xs bg-slate-800 rounded border border-slate-700 text-slate-300">
              Top
            </button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" position="bottom">
            <button className="px-3 py-1.5 text-xs bg-slate-800 rounded border border-slate-700 text-slate-300">
              Bottom
            </button>
          </Tooltip>
          <Tooltip content="Left tooltip" position="left">
            <button className="px-3 py-1.5 text-xs bg-slate-800 rounded border border-slate-700 text-slate-300">
              Left
            </button>
          </Tooltip>
          <Tooltip content="Right tooltip" position="right">
            <button className="px-3 py-1.5 text-xs bg-slate-800 rounded border border-slate-700 text-slate-300">
              Right
            </button>
          </Tooltip>
        </div>
      </ShowcaseItem>

      {/* Feature-local overlay variants */}
      <ShowcaseItem label="CharacterCard overlay" source="features/characters/CharacterCard.tsx">
        <div className="relative group max-w-[180px] rounded-lg overflow-hidden bg-slate-900 border border-slate-700/50">
          <div className="aspect-square bg-slate-800 flex items-center justify-center">
            <span className="text-3xl font-bold text-slate-600">E</span>
          </div>
          <div className="p-3">
            <p className="text-sm text-slate-200">Elena Voss</p>
          </div>
          {/* Simulated hover state */}
          <button className="absolute top-2 right-2 p-1.5 bg-red-600/80 hover:bg-red-500 rounded-md text-white opacity-70">
            <X className="w-3 h-3" />
          </button>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="ProjectCard full overlay" source="features/projects/ProjectCard.tsx">
        <div className="relative rounded-lg bg-gray-800/50 border border-gray-700 p-6">
          <p className="text-sm text-gray-400">Card content below overlay</p>
          {/* Simulated overlay */}
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

      <ShowcaseItem label="Image lightbox mock" source="features/image/ImageGallery.tsx:120-237" className="md:col-span-2">
        <div className="flex gap-4 rounded-lg bg-black/40 p-4 border border-slate-800/60">
          {/* Image side */}
          <div className="flex-1 bg-slate-800 rounded-lg aspect-video flex items-center justify-center relative">
            <ImageIcon className="w-12 h-12 text-slate-600" />
            <button className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 rounded-full text-white/60 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 rounded-full text-white/60 hover:text-white">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {/* Details side */}
          <div className="w-48 space-y-3">
            <h3 className="text-sm font-semibold text-white">Image Details</h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div><span className="text-slate-500">Provider:</span> Gemini</div>
              <div><span className="text-slate-500">Size:</span> 1344x768</div>
              <div><span className="text-slate-500">Created:</span> 2m ago</div>
            </div>
            <div className="flex gap-2">
              <button className="p-1.5 bg-slate-800 rounded hover:bg-slate-700">
                <Download className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button className="p-1.5 bg-slate-800 rounded hover:bg-slate-700">
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button className="p-1.5 bg-red-900/30 rounded hover:bg-red-900/50">
                <Trash2 className="w-3.5 h-3.5 text-red-400" />
              </button>
            </div>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Before/After comparison" source="features/simulator/subfeature_comparison">
        <div className="flex gap-2 rounded-lg bg-slate-900/60 p-3 border border-slate-800/60">
          <div className="flex-1 text-center">
            <div className="bg-slate-800 rounded aspect-square flex items-center justify-center mb-2">
              <ImageIcon className="w-6 h-6 text-slate-600" />
            </div>
            <span className="text-[10px] font-mono text-slate-500">BEFORE</span>
          </div>
          <div className="w-px bg-slate-700/50" />
          <div className="flex-1 text-center">
            <div className="bg-slate-800 rounded aspect-square flex items-center justify-center mb-2 border border-cyan-500/20">
              <ImageIcon className="w-6 h-6 text-cyan-600" />
            </div>
            <span className="text-[10px] font-mono text-cyan-500">AFTER</span>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Asset grid item overlay" source="features/assets/AssetGridItem.tsx">
        <div className="relative group w-32 rounded-lg overflow-hidden bg-slate-800 border border-slate-700/50">
          <div className="aspect-square flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-600" />
          </div>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
            <div className="flex gap-1">
              <button className="p-1 bg-white/10 rounded text-white/80 hover:bg-white/20">
                <Eye className="w-3 h-3" />
              </button>
              <button className="p-1 bg-white/10 rounded text-white/80 hover:bg-white/20">
                <Download className="w-3 h-3" />
              </button>
            </div>
          </div>
          <p className="px-2 py-1.5 text-[10px] text-slate-400 truncate">character_01.png</p>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Regeneration modal" source="features/simulator/ImageRegenerationModal.tsx">
        <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white">Regenerate Image</h3>
            <button className="p-1 hover:bg-slate-800 rounded text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="bg-slate-800 rounded-lg aspect-video flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-slate-600" />
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded text-slate-300">
              Cancel
            </button>
            <button className="flex-1 py-2 text-xs bg-cyan-600 hover:bg-cyan-500 rounded text-white">
              Regenerate
            </button>
          </div>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
