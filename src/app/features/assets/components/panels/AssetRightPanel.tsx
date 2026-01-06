'use client';

/**
 * AssetRightPanel
 *
 * Detail panel for assets - shows full asset information when selected.
 * Listens to assetManagerStore for activeAsset state.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image as ImageIcon,
  Calendar,
  Tag,
  FileText,
  Layers,
  ExternalLink,
  Copy,
  Check,
  Info,
  Sparkles
} from 'lucide-react';
import { useAssetManagerStore } from '../../store/assetManagerStore';
import { Button } from '@/app/components/UI/Button';
import type { Asset } from '@/app/types/Asset';

interface AssetDetailProps {
  asset: Asset;
  onClose: () => void;
}

function AssetDetail({ asset, onClose }: AssetDetailProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-medium text-slate-200 truncate max-w-[200px]">
            {asset.name}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Image Preview */}
        <div className="p-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-900/50 border border-slate-800/70">
            {asset.image_url && !imageError ? (
              <img
                src={asset.image_url}
                alt={asset.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-slate-700" />
              </div>
            )}

            {/* Type Badge */}
            <div className="absolute top-2 left-2">
              <span className="px-2 py-1 text-[10px] font-medium rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {asset.type}
              </span>
            </div>
          </div>
        </div>

        {/* Metadata Sections */}
        <div className="px-4 pb-4 space-y-4">
          {/* Basic Info */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
              <Info className="w-3.5 h-3.5" />
              Basic Info
            </h3>
            <div className="space-y-2">
              {/* Name */}
              <div className="group flex items-center justify-between p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">Name</span>
                  <p className="text-sm text-slate-200 truncate">{asset.name}</p>
                </div>
                <button
                  onClick={() => handleCopy(asset.name, 'name')}
                  className="p-1 text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedField === 'name' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Type & Subcategory */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">Type</span>
                  <p className="text-sm text-slate-200 flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-cyan-400" />
                    {asset.type}
                  </p>
                </div>
                {asset.subcategory && (
                  <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wide">Subcategory</span>
                    <p className="text-sm text-slate-200 flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-violet-400" />
                      {asset.subcategory}
                    </p>
                  </div>
                )}
              </div>

              {/* Gen/Model */}
              {asset.gen && (
                <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/50">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">Generation</span>
                  <p className="text-sm text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    {asset.gen}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Description */}
          {asset.description && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5" />
                Description
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed p-3 rounded-lg bg-slate-900/30 border border-slate-800/50">
                {asset.description}
              </p>
            </section>
          )}

          {/* Timestamps */}
          <section className="space-y-2">
            <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
              <Calendar className="w-3.5 h-3.5" />
              Timestamps
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {asset.created_at && (
                <div className="p-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                  <span className="text-slate-500">Created</span>
                  <p className="text-slate-300">{formatDate(asset.created_at)}</p>
                </div>
              )}
              {asset.updated_at && (
                <div className="p-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                  <span className="text-slate-500">Updated</span>
                  <p className="text-slate-300">{formatDate(asset.updated_at)}</p>
                </div>
              )}
            </div>
          </section>

          {/* Image URL */}
          {asset.image_url && (
            <section className="space-y-2">
              <h3 className="flex items-center gap-2 text-xs font-medium text-slate-400 uppercase tracking-wide">
                <ExternalLink className="w-3.5 h-3.5" />
                Image URL
              </h3>
              <div className="group flex items-center gap-2 p-2 rounded-lg bg-slate-900/30 border border-slate-800/50">
                <p className="flex-1 text-xs text-slate-400 truncate font-mono">
                  {asset.image_url}
                </p>
                <button
                  onClick={() => handleCopy(asset.image_url || '', 'url')}
                  className="p-1 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {copiedField === 'url' ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-slate-800/70 bg-slate-900/30">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            onClick={() => asset.image_url && window.open(asset.image_url, '_blank')}
            disabled={!asset.image_url}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open Image
          </Button>
          <Button variant="primary" size="sm" className="flex-1 text-xs">
            Use in Project
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AssetRightPanel() {
  const { activeAsset, detailPanelOpen, closeDetail } = useAssetManagerStore();

  // Empty state when no asset is selected
  if (!detailPanelOpen || !activeAsset) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900/50 border border-slate-800/70 flex items-center justify-center mb-4">
          <ImageIcon className="w-8 h-8 text-slate-700" />
        </div>
        <h3 className="text-sm font-medium text-slate-400 mb-1">No Asset Selected</h3>
        <p className="text-xs text-slate-600 max-w-[200px]">
          Click on an asset in the grid to view its details here
        </p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeAsset._id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.2 }}
        className="h-full"
      >
        <AssetDetail asset={activeAsset} onClose={closeDetail} />
      </motion.div>
    </AnimatePresence>
  );
}
