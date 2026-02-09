'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Sparkles, Loader2 } from 'lucide-react';
import { useCreatorCharacterStore, selectComposedPrompt, selectActiveSelectionCount } from '../../store/creatorCharacterStore';
import { useCreatorUIStore } from '../../store/creatorUIStore';

export function PromptPreview() {
  const composedPrompt = useCreatorCharacterStore(selectComposedPrompt);
  const selectionCount = useCreatorCharacterStore(selectActiveSelectionCount);
  const isGenerating = useCreatorUIStore((s) => s.isGenerating);
  const startGeneration = useCreatorUIStore((s) => s.startGeneration);
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-t border-white/[0.04]">
      {/* Collapsible prompt section */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-400">Prompt Preview</span>
          {selectionCount > 0 && (
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded-full">
              {selectionCount}
            </span>
          )}
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }}>
          <ChevronUp size={14} className="text-slate-500" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3">
              <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
                <p className="text-xs text-slate-400 leading-relaxed whitespace-pre-wrap">
                  {composedPrompt}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate button */}
      <div className="px-4 pb-4">
        <button
          onClick={startGeneration}
          disabled={isGenerating}
          className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 text-white text-sm uppercase tracking-wide font-semibold shadow-lg transition-all ${
            isGenerating
              ? 'bg-slate-700 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/30'
          }`}
        >
          {isGenerating ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generate Character
            </>
          )}
        </button>
      </div>
    </div>
  );
}
