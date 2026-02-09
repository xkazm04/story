/**
 * CompletionSummary - Results display after autoplay completion
 * Shows image gallery, lightbox, stats, retry controls
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { cn } from '@/app/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Image,
  RefreshCw,
  Loader2,
  AlertCircle,
  Wand2,
  CheckCircle,
  Sparkles,
  Maximize2,
  Copy,
  Check,
  Clock,
} from 'lucide-react';
import { PhaseProgress, AutoplayLogEntry } from './types';
import { SavedImageInfo, ImageCategory } from './types';
import { useCopyFeedback } from '../../../hooks/useCopyFeedback';

export interface CompletionSummaryProps {
  sketchProgress: PhaseProgress;
  gameplayProgress: PhaseProgress;
  posterSelected: boolean;
  hudGenerated: number;
  hudTarget: number;
  error?: string;
  errorPhase?: string;
  textEvents: AutoplayLogEntry[];
  imageEvents: AutoplayLogEntry[];
  onRetry?: () => void;
  isExpanded: boolean;
}

/**
 * Completion Summary - Shows results when autoplay finishes
 */
export function CompletionSummary({
  sketchProgress,
  gameplayProgress,
  posterSelected,
  hudGenerated,
  hudTarget,
  error,
  errorPhase,
  textEvents,
  imageEvents,
  onRetry,
  isExpanded,
}: CompletionSummaryProps) {
  const totalSaved = sketchProgress.saved + gameplayProgress.saved;
  const totalTarget = sketchProgress.target + gameplayProgress.target;
  const rejectedCount = imageEvents.filter(e => e.type === 'image_rejected').length;
  const polishCount = imageEvents.filter(e => e.type === 'image_polished').length;
  const isSuccess = !error && totalSaved >= totalTarget;

  // Duration calculation from events
  const allEvents = [...textEvents, ...imageEvents];
  const firstEvent = allEvents.length > 0 ? allEvents.reduce((a, b) => a.timestamp < b.timestamp ? a : b) : null;
  const lastEvent = allEvents.length > 0 ? allEvents.reduce((a, b) => a.timestamp > b.timestamp ? a : b) : null;
  const durationMs = firstEvent && lastEvent ? lastEvent.timestamp.getTime() - firstEvent.timestamp.getTime() : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);
  const durationStr = durationMin > 0 ? `${durationMin}m ${durationSec}s` : `${durationSec}s`;

  // Extract actually saved images from image_saved events (with URLs)
  const savedImages: SavedImageInfo[] = imageEvents
    .filter(e => e.type === 'image_saved' && e.details?.imageUrl)
    .map(e => {
      const polished = imageEvents.some(
        pe => pe.type === 'image_polished' && pe.details?.promptId === e.details?.promptId
      );
      return {
        imageUrl: e.details!.imageUrl!,
        promptText: e.details?.promptText,
        promptId: e.details?.promptId,
        phase: e.details?.phase,
        score: e.details?.score,
        isPolished: polished,
      };
    });

  // Extract rejected images (no URLs typically, but track for count)
  const rejectedImages: SavedImageInfo[] = imageEvents
    .filter(e => e.type === 'image_rejected')
    .map(e => ({
      imageUrl: '',
      promptText: e.message,
      promptId: e.details?.promptId,
      phase: e.details?.phase,
      score: e.details?.score,
      isPolished: false,
    }));

  // Category filter state
  const [activeCategory, setActiveCategory] = useState<ImageCategory>('all');

  // Filter images by category
  const filteredImages = (() => {
    switch (activeCategory) {
      case 'sketch': return savedImages.filter(img => img.phase === 'sketch');
      case 'gameplay': return savedImages.filter(img => img.phase === 'gameplay');
      case 'polished': return savedImages.filter(img => img.isPolished);
      case 'rejected': return rejectedImages;
      default: return savedImages;
    }
  })();

  // Category tabs config
  const sketchSaved = savedImages.filter(img => img.phase === 'sketch');
  const gameplaySaved = savedImages.filter(img => img.phase === 'gameplay');
  const polishedSaved = savedImages.filter(img => img.isPolished);

  const categories: { id: ImageCategory; label: string; count: number; color: string; activeColor: string }[] = [
    ...(sketchSaved.length > 0 ? [{
      id: 'sketch' as ImageCategory, label: 'Sketches', count: sketchSaved.length,
      color: 'text-blue-400 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5',
      activeColor: 'text-blue-300 border-blue-500/50 bg-blue-500/15',
    }] : []),
    ...(gameplaySaved.length > 0 ? [{
      id: 'gameplay' as ImageCategory, label: 'Gameplay', count: gameplaySaved.length,
      color: 'text-purple-400 border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/5',
      activeColor: 'text-purple-300 border-purple-500/50 bg-purple-500/15',
    }] : []),
    ...(polishedSaved.length > 0 ? [{
      id: 'polished' as ImageCategory, label: 'Polished', count: polishedSaved.length,
      color: 'text-amber-400 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5',
      activeColor: 'text-amber-300 border-amber-500/50 bg-amber-500/15',
    }] : []),
    ...(rejectedCount > 0 ? [{
      id: 'rejected' as ImageCategory, label: 'Rejected', count: rejectedCount,
      color: 'text-red-400 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5',
      activeColor: 'text-red-300 border-red-500/50 bg-red-500/15',
    }] : []),
  ];

  // Lightbox state -- track both URL and prompt for copy
  const [lightboxImage, setLightboxImage] = useState<{ url: string; prompt?: string } | null>(null);
  const lightboxCopy = useCopyFeedback();

  const handleCopyLightboxPrompt = useCallback(async () => {
    if (!lightboxImage?.prompt) return;
    try {
      await navigator.clipboard.writeText(lightboxImage.prompt);
      lightboxCopy.triggerCopy();
    } catch {
      // Clipboard API may fail
    }
  }, [lightboxImage, lightboxCopy]);

  // Detect API-related errors for auto-retry
  const isApiError = error && (
    /rate.?limit/i.test(error) ||
    /timeout/i.test(error) ||
    /429/i.test(error) ||
    /503/i.test(error) ||
    /network/i.test(error)
  );

  // Auto-retry countdown for API errors
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startCountdown = useCallback((seconds: number) => {
    setCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = null;
          onRetry?.();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, [onRetry]);

  const cancelCountdown = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = null;
    setCountdown(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {/* Row 1: Compact status with inline stats */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={cn('flex items-center gap-3 px-3 py-2.5 rounded-lg border',
          isSuccess
            ? 'border-green-500/30 bg-green-500/5'
            : error
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-amber-500/30 bg-amber-500/5'
        )}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 20 }}
          className={cn('relative shrink-0',
            isSuccess ? 'text-green-400' : error ? 'text-red-400' : 'text-amber-400'
          )}
        >
          {isSuccess ? (
            <>
              <CheckCircle size={18} />
              <motion.div
                className="absolute -top-1 -right-1 text-green-400"
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.5, delay: 0.4, repeat: 2 }}
              >
                <Sparkles size={8} />
              </motion.div>
            </>
          ) : (
            <AlertCircle size={18} />
          )}
        </motion.div>

        <div className="flex-1 min-w-0">
          <span className={cn('text-xs font-medium',
            isSuccess ? 'text-green-300' : error ? 'text-red-300' : 'text-amber-300'
          )}>
            {isSuccess ? 'Autoplay Complete' : error ? 'Stopped with Error' : 'Partially Complete'}
          </span>
          {error && !errorPhase && (
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{error}</p>
          )}
          {error && errorPhase && (
            <p className="text-[10px] text-red-400/70 mt-0.5">
              Failed during <span className="font-mono uppercase">{errorPhase}</span>
              {totalSaved > 0 && ` \u00b7 ${totalSaved} saved before error`}
            </p>
          )}
        </div>

        {/* Inline stats */}
        <div className="flex items-center gap-3 shrink-0 text-[11px] font-mono">
          <span className="flex items-center gap-1 text-cyan-400">
            <Image size={10} />
            {totalSaved}/{totalTarget}
          </span>
          <span className="flex items-center gap-1 text-slate-500">
            <Clock size={10} />
            {durationStr}
          </span>
        </div>
      </motion.div>

      {/* Auto-retry for API errors */}
      {isApiError && onRetry && (
        <div className="flex items-center gap-2 p-2 rounded border border-amber-500/20 bg-amber-500/5">
          {countdown !== null ? (
            <>
              <Loader2 size={12} className="text-amber-400 animate-spin" />
              <span className="text-[11px] text-amber-300 flex-1">
                Auto-retrying in {countdown}s...
              </span>
              <button
                onClick={cancelCountdown}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <RefreshCw size={12} className="text-amber-400" />
              <span className="text-[11px] text-amber-300 flex-1">
                Temporary API error.
              </span>
              <button
                onClick={() => startCountdown(10)}
                className="text-[10px] text-amber-400 hover:text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 hover:bg-amber-500/10 transition-colors"
              >
                Auto-retry (10s)
              </button>
            </>
          )}
        </div>
      )}

      {/* Row 2: Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn('px-2.5 py-1 rounded border text-[11px] font-medium transition-all',
              activeCategory === 'all'
                ? 'text-cyan-300 border-cyan-500/50 bg-cyan-500/15'
                : 'text-slate-400 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
            )}
          >
            All ({savedImages.length})
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn('px-2.5 py-1 rounded border text-[11px] font-medium transition-all',
                activeCategory === cat.id ? cat.activeColor : cat.color
              )}
            >
              {cat.label} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {/* Image gallery -- from actual save events */}
      {filteredImages.length > 0 && filteredImages[0].imageUrl ? (
        <div className={cn('grid gap-2', isExpanded ? 'grid-cols-6' : 'grid-cols-4')}>
          {filteredImages.filter(img => img.imageUrl).map((img, i) => (
            <motion.button
              key={`${img.promptId || i}-${i}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setLightboxImage({ url: img.imageUrl, prompt: img.promptText })}
              className="relative aspect-[3/2] rounded-md overflow-hidden border border-slate-700/50 hover:border-cyan-500/50 transition-all group"
            >
              <img src={img.imageUrl} alt={`${img.phase || 'Image'} ${i + 1}`} className="w-full h-full object-cover" />
              {/* Phase badge */}
              {img.phase && (
                <span className={cn('absolute top-1 left-1 px-1 py-0.5 rounded text-[8px] font-mono uppercase',
                  img.phase === 'sketch' ? 'bg-blue-500/80 text-white' : 'bg-purple-500/80 text-white'
                )}>
                  {img.phase.slice(0, 3)}
                </span>
              )}
              {/* Polish indicator */}
              {img.isPolished && (
                <span className="absolute top-1 right-1 px-1 py-0.5 rounded text-[8px] bg-amber-500/80 text-white">
                  <Wand2 size={8} className="inline" />
                </span>
              )}
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <Maximize2 size={14} className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
              </div>
            </motion.button>
          ))}
        </div>
      ) : activeCategory === 'rejected' && rejectedCount > 0 ? (
        /* Rejected images - no URLs, show as text list */
        <div className="space-y-1">
          {rejectedImages.map((img, i) => (
            <div key={i} className="px-2 py-1.5 rounded bg-red-500/5 border border-red-500/10 text-[10px] text-red-400/80 truncate">
              {img.score !== undefined && <span className="font-mono mr-1.5">Score: {img.score}</span>}
              {img.promptText}
            </div>
          ))}
        </div>
      ) : savedImages.length === 0 && (
        <div className="py-6 text-center text-[11px] text-slate-600">
          No images saved during this session
        </div>
      )}

      {/* Image lightbox with copy prompt */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[10000] bg-black/90 flex items-center justify-center p-8"
            onClick={() => { setLightboxImage(null); lightboxCopy.reset(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-[85vw] max-h-[85vh] flex flex-col items-center gap-3"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={lightboxImage.url}
                alt="Full size"
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              {/* Prompt + copy below image */}
              {lightboxImage.prompt && (
                <button
                  onClick={handleCopyLightboxPrompt}
                  className="flex items-center gap-2 px-3 py-2 rounded-md bg-black/60 border border-slate-700/50 hover:border-cyan-500/30 transition-colors max-w-[600px] group"
                  title="Click to copy prompt"
                >
                  <span className="shrink-0">
                    {lightboxCopy.isCopied
                      ? <Check size={12} className="text-green-400" />
                      : <Copy size={12} className="text-slate-500 group-hover:text-cyan-400 transition-colors" />
                    }
                  </span>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-300 transition-colors truncate text-left">
                    {lightboxCopy.isCopied ? 'Copied to clipboard!' : lightboxImage.prompt}
                  </span>
                </button>
              )}
            </motion.div>
            <button
              onClick={() => { setLightboxImage(null); lightboxCopy.reset(); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
