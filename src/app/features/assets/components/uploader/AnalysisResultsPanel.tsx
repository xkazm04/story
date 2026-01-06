'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Package, Clock, AlertCircle, Sparkles, Tag } from 'lucide-react';
import type { AnalysisResult, DetectedAsset } from '../../types';

interface AnalysisResultsPanelProps {
  results: AnalysisResult[];
  isLoading?: boolean;
}

function AssetCard({ asset, index }: { asset: DetectedAsset; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.2 }}
      className="group relative p-3 rounded-lg bg-slate-900/50 border border-slate-800/60
        hover:border-cyan-500/30 hover:bg-slate-900/70 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-slate-200 truncate flex-1">
          {asset.name}
        </h4>
        {asset.confidence && (
          <span className="text-[10px] text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
            {Math.round(asset.confidence * 100)}%
          </span>
        )}
      </div>

      {/* Description */}
      {asset.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-2">
          {asset.description}
        </p>
      )}

      {/* Category badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <Package className="w-3 h-3 text-slate-500" />
        <span className="text-[11px] text-slate-400">{asset.category}</span>
      </div>

      {/* Tags */}
      {asset.tags && asset.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {asset.tags.slice(0, 4).map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px]
                text-slate-400 bg-slate-800/60 rounded"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {asset.tags.length > 4 && (
            <span className="text-[10px] text-slate-500">
              +{asset.tags.length - 4}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ModelSection({ result }: { result: AnalysisResult }) {
  const modelColors: Record<string, string> = {
    gemini: 'text-blue-400',
    groq: 'text-orange-400',
    openai: 'text-green-400',
  };

  return (
    <div className="space-y-3">
      {/* Model header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 ${modelColors[result.model] || 'text-slate-400'}`} />
          <span className="text-sm font-medium text-slate-200 capitalize">
            {result.model}
          </span>
          <span className="text-[10px] text-slate-500 bg-slate-800/60 px-1.5 py-0.5 rounded">
            {result.assets.length} detected
          </span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500">
          <Clock className="w-3 h-3" />
          {result.processingTime}ms
        </div>
      </div>

      {/* Error state */}
      {result.error && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{result.error}</p>
        </div>
      )}

      {/* Assets grid */}
      {result.assets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {result.assets.map((asset, index) => (
            <AssetCard key={`${result.model}-${index}`} asset={asset} index={index} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {result.assets.length === 0 && !result.error && (
        <p className="text-xs text-slate-500 italic">No assets detected</p>
      )}
    </div>
  );
}

export default function AnalysisResultsPanel({
  results,
  isLoading = false,
}: AnalysisResultsPanelProps) {
  const hasResults = results.length > 0;
  const totalAssets = results.reduce((sum, r) => sum + r.assets.length, 0);

  return (
    <AnimatePresence mode="wait">
      {(hasResults || isLoading) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="overflow-hidden"
        >
          <div className="pt-4 border-t border-slate-800/50">
            {/* Results header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-slate-200 flex items-center gap-2">
                <Package className="w-4 h-4 text-cyan-400" />
                Analysis Results
              </h3>
              {totalAssets > 0 && (
                <span className="text-xs text-slate-400">
                  {totalAssets} assets found
                </span>
              )}
            </div>

            {/* Loading state */}
            {isLoading && (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-900/30 border border-slate-800/40">
                <div className="w-5 h-5 border-2 border-cyan-500/40 border-t-cyan-500 rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Analyzing image...</span>
              </div>
            )}

            {/* Results by model */}
            {!isLoading && hasResults && (
              <div className="space-y-6">
                {results.map((result) => (
                  <ModelSection key={result.model} result={result} />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
