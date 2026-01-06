'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Grid3X3, LayoutList, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useAssetManagerStore } from '../../store/assetManagerStore';
import { useAssetFiltersStore } from '../../store/assetFiltersStore';
import AssetSearchBar from './AssetSearchBar';
import AssetTypeFilter from './AssetTypeFilter';
import AssetGridView from './AssetGridView';
import AssetGroupedView from './AssetGroupedView';
import type { PaginatedAsset } from '@/app/types/Asset';

interface ManagerPanelProps {
  className?: string;
}

async function fetchAssets({
  pageParam = 1,
  type,
  subcategory,
  limit = 24,
  sortBy = 'created_at',
  sortOrder = 'desc',
}: {
  pageParam?: number;
  type?: string;
  subcategory?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<PaginatedAsset> {
  const params = new URLSearchParams({
    page: String(pageParam),
    limit: String(limit),
    sortBy,
    sortOrder,
  });

  if (type) {
    params.set('type', type);
  }
  if (subcategory) {
    params.set('subcategory', subcategory);
  }

  const response = await fetch(`/api/assets-manager?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assets');
  }
  return response.json();
}

export default function ManagerPanel({ className = '' }: ManagerPanelProps) {
  const { viewMode, setViewMode } = useAssetManagerStore();
  const { assetType, subcategory, sortBy, sortOrder } = useAssetFiltersStore();

  // Show grouped view when no specific type is selected
  const showGroupedView = !assetType;

  // Fetch assets with infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['assets-manager', assetType, subcategory, sortBy, sortOrder],
    queryFn: ({ pageParam }) =>
      fetchAssets({
        pageParam,
        type: assetType || undefined,
        subcategory: subcategory || undefined,
        sortBy,
        sortOrder,
      }),
    getNextPageParam: (lastPage) =>
      lastPage.current_page < lastPage.total_pages
        ? lastPage.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten assets from all pages
  const allAssets = data?.pages.flatMap((page) => page.assets) || [];
  const totalCount = data?.pages[0]?.total_assets || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex flex-col h-full ${className}`}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-slate-800/50">
        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-medium text-slate-100">Asset Manager</h2>
            {totalCount > 0 && (
              <span className="text-xs text-slate-500 bg-slate-800/60 px-2 py-0.5 rounded-full">
                {totalCount} assets
              </span>
            )}
          </div>

          {/* View toggle - only show when not in grouped view */}
          {!showGroupedView && (
            <div className="flex items-center gap-1 bg-slate-900/60 rounded-lg p-1 border border-slate-800/50">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="List view"
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        <AssetSearchBar />

        {/* Type filter */}
        <div className="mt-3">
          <AssetTypeFilter />
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <p className="text-sm">Loading assets...</p>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex flex-col items-center justify-center h-64 text-red-400">
            <p className="text-sm mb-2">Failed to load assets</p>
            <p className="text-xs text-slate-500">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && allAssets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <Package className="w-12 h-12 mb-3 opacity-40" />
            <p className="text-sm mb-1">No assets found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your filters or upload new assets
            </p>
          </div>
        )}

        {/* Assets display */}
        {!isLoading && !isError && allAssets.length > 0 && (
          <>
            {showGroupedView ? (
              <AssetGroupedView assets={allAssets} />
            ) : (
              <AssetGridView
                assets={allAssets}
                viewMode={viewMode}
                onLoadMore={() => {
                  if (hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                  }
                }}
                hasMore={hasNextPage || false}
                isLoadingMore={isFetchingNextPage}
              />
            )}

            {/* Load more indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
