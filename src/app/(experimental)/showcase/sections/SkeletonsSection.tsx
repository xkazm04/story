'use client';

import { Loader2, RefreshCw } from 'lucide-react';
import { Skeleton, SkeletonGroup, Spinner, LoadingOverlay } from '@/app/components/UI/Skeleton';
import { ShowcaseSection, ShowcaseItem } from '../components/ShowcaseSection';

export function SkeletonsSection() {
  return (
    <ShowcaseSection
      id="skeletons"
      title="Loading & Skeletons"
      description="Skeleton placeholders, spinners, and overlay loading"
      count={18}
    >
      {/* Extracted primitives */}
      <ShowcaseItem label="Skeleton: text" source="UI/Skeleton">
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Skeleton: circular" source="UI/Skeleton">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" size={32} />
          <Skeleton variant="circular" size={48} />
          <Skeleton variant="circular" size={64} />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Skeleton: rectangular" source="UI/Skeleton">
        <Skeleton variant="rectangular" height={120} className="w-full" />
      </ShowcaseItem>

      <ShowcaseItem label="Skeleton: card" source="UI/Skeleton">
        <Skeleton variant="card" height={100} className="w-full" />
      </ShowcaseItem>

      <ShowcaseItem label="Skeleton: shimmer text" source="UI/Skeleton (shimmer)">
        <div className="space-y-2">
          <Skeleton variant="text" width="80%" shimmer />
          <Skeleton variant="text" width="60%" shimmer />
          <Skeleton variant="text" width="40%" shimmer />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Skeleton: shimmer card" source="UI/Skeleton (shimmer)">
        <Skeleton variant="card" height={100} className="w-full" shimmer />
      </ShowcaseItem>

      <ShowcaseItem label="SkeletonGroup: list" source="UI/Skeleton">
        <SkeletonGroup count={3} gap="sm">
          <div className="flex items-center gap-3">
            <Skeleton variant="circular" size={40} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </div>
          </div>
        </SkeletonGroup>
      </ShowcaseItem>

      <ShowcaseItem label="Spinner sizes" source="UI/Skeleton">
        <div className="flex items-center gap-6">
          <Spinner size="xs" label="xs" />
          <Spinner size="sm" label="sm" />
          <Spinner size="md" label="md" />
          <Spinner size="lg" label="lg" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Spinner colors" source="UI/Skeleton">
        <div className="flex items-center gap-6">
          <Spinner color="cyan" label="cyan" />
          <Spinner color="blue" label="blue" />
          <Spinner color="amber" label="amber" />
          <Spinner color="emerald" label="emerald" />
          <Spinner color="white" label="white" />
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="LoadingOverlay" source="UI/Skeleton">
        <LoadingOverlay label="Processing..." />
      </ShowcaseItem>

      {/* Feature-local variants */}
      <ShowcaseItem label="Project card skeleton" source="features/projects/ProjectCardSkeleton.tsx">
        <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 overflow-hidden">
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <div className="flex items-start gap-4">
            <div className="p-3 bg-gray-700/50 rounded-lg animate-pulse">
              <div className="w-6 h-6 bg-gray-600/50 rounded" />
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-gray-700/50 rounded animate-pulse w-3/4" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-700/30 rounded animate-pulse w-full" />
                <div className="h-3 bg-gray-700/30 rounded animate-pulse w-5/6" />
              </div>
            </div>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Character card skeleton" source="features/characters/CharacterCardSkeleton.tsx">
        <div className="relative bg-gray-900 rounded-lg overflow-hidden border border-gray-800 max-w-[200px]">
          <div className="aspect-square relative bg-gray-800">
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-gray-700 animate-pulse" />
            </div>
          </div>
          <div className="p-4 space-y-2">
            <div className="h-5 bg-gray-800 rounded-md w-3/4 animate-pulse" />
            <div className="h-6 bg-gray-700 rounded w-20 animate-pulse" />
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Voice list skeleton" source="features/voice/VoiceList.tsx:15-22">
        <div className="flex flex-col space-y-4 p-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Loader2 spinner (common)" source="40+ feature files">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span className="text-xs text-slate-400">w-4 cyan</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
            <span className="text-xs text-slate-400">w-5 slate</span>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="text-xs text-slate-400">w-8 gray</span>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Border spinner (common)" source="15+ feature files">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-cyan-500/50 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-slate-500">cyan</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-5 h-5 border-2 border-amber-500/50 border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] text-slate-500">amber</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-[10px] text-slate-500">large</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
            <span className="text-[10px] text-slate-500">xl</span>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="RefreshCw spinner" source="7+ feature files">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            <span className="text-xs text-slate-400">Refreshing...</span>
          </div>
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
            <span className="text-xs text-slate-400">Syncing...</span>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="Pulse dot indicators" source="features/voice, collaboration, assets">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-slate-400">Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs text-slate-400">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-xs text-slate-400">Preview</span>
          </div>
        </div>
      </ShowcaseItem>

      <ShowcaseItem label="LoadingOverlay: overlay mode (replaces ModalLoadingFallback)" source="UI/Skeleton">
        <div className="relative rounded-lg overflow-hidden">
          <div className="flex items-center justify-center bg-black/50 backdrop-blur-sm py-12 rounded-lg">
            <div className="flex items-center gap-3 px-6 py-4 bg-slate-800 rounded-lg border border-slate-700">
              <Spinner size="sm" />
              <span className="font-mono text-sm text-slate-300">Loading...</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-600 mt-2 text-center">
            Usage: &lt;LoadingOverlay overlay /&gt; — used in SimulatorFeature for lazy modal loading
          </p>
        </div>
      </ShowcaseItem>
    </ShowcaseSection>
  );
}
