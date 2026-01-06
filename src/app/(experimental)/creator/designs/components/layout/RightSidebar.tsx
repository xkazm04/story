/**
 * RightSidebar - Dynamic options palette for selected category
 * Also shows prompt preview when toggled
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Check, FileText, Grid3X3, Sparkles, Loader2 } from 'lucide-react';
import { useCreator } from '../../context/CreatorContext';
import { getOptionsForCategory, getCategoryById } from '../../constants';
import type { CategoryOption } from '../../types';

export function RightSidebar() {
  const {
    state,
    setSelection,
    toggleRightSidebar,
    togglePromptPreview,
    startGeneration,
    composedPrompt,
    activeSelectionCount,
  } = useCreator();

  const { ui } = state;
  const activeCategory = ui.activeCategory;
  const options = activeCategory ? getOptionsForCategory(activeCategory) : [];
  const category = activeCategory ? getCategoryById(activeCategory) : null;
  const currentSelection = activeCategory ? state.character.selections[activeCategory] : null;

  return (
    <motion.div
      initial={false}
      animate={{
        width: ui.rightSidebarOpen ? 320 : 0,
        opacity: ui.rightSidebarOpen ? 1 : 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className="border-l border-white/[0.04] bg-[#080808]/90 backdrop-blur-xl overflow-hidden shrink-0 relative"
    >
      {/* Sidebar Toggle */}
      <button
        onClick={toggleRightSidebar}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-[#0a0a0a] border border-white/10 rounded-l-lg flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
      >
        <motion.div animate={{ rotate: ui.rightSidebarOpen ? 0 : 180 }}>
          <ChevronRight size={14} />
        </motion.div>
      </button>

      <div className="w-[320px] h-full flex flex-col">
        {/* Header with view toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => ui.showPromptPreview && togglePromptPreview()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${!ui.showPromptPreview
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Grid3X3 size={14} />
              Options
            </button>
            <button
              onClick={() => !ui.showPromptPreview && togglePromptPreview()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${ui.showPromptPreview
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <FileText size={14} />
              Prompt
            </button>
          </div>
          <span className="text-xs text-slate-600">
            {activeSelectionCount} defined
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {ui.showPromptPreview ? (
            <PromptPreviewPanel key="prompt" prompt={composedPrompt} />
          ) : (
            <OptionsPalette
              key={`options-${activeCategory || 'none'}`}
              options={options}
              category={category}
              currentSelection={currentSelection?.optionId}
              onSelect={(optionId) => activeCategory && setSelection(activeCategory, optionId)}
            />
          )}
        </div>

        {/* Generate Button */}
        <div className="p-4 border-t border-white/[0.04]">
          <motion.button
            onClick={startGeneration}
            disabled={ui.isGenerating}
            whileHover={{ scale: ui.isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: ui.isGenerating ? 1 : 0.98 }}
            className={`w-full py-3.5 rounded-xl flex items-center justify-center gap-2 text-white text-sm uppercase tracking-wide font-semibold shadow-lg transition-all ${
              ui.isGenerating
                ? 'bg-slate-700 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-amber-600/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/30'
            }`}
          >
            {ui.isGenerating ? (
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
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// Options palette grid
function OptionsPalette({
  options,
  category,
  currentSelection,
  onSelect,
}: {
  options: CategoryOption[];
  category: ReturnType<typeof getCategoryById> | null;
  currentSelection: string | number | null | undefined;
  onSelect: (optionId: string | number) => void;
}) {
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-600 p-8">
        <Grid3X3 size={32} className="mb-3 opacity-50" />
        <p className="text-sm text-center">Select a category from the left panel</p>
      </div>
    );
  }

  return (
    <motion.div
      key={category.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-slate-500">
          {category.label} Options
        </span>
        <span className="text-xs text-slate-600">{options.length} available</span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option) => {
          const isSelected = currentSelection === option.id;
          const isEmpty = option.promptValue === '';

          return (
            <motion.button
              key={option.id}
              onClick={() => onSelect(option.id)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              title={option.description || option.name}
              className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all duration-300 bg-gradient-to-br from-slate-800/50 to-slate-900/50
                ${isSelected
                  ? 'border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : isEmpty
                    ? 'border-white/5 opacity-60 hover:opacity-100 hover:border-white/20'
                    : 'border-white/5 hover:border-white/20'
                }`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
                <span className="text-2xl mb-1">{option.preview}</span>
                <span className="text-xs font-medium text-slate-300 text-center leading-tight">
                  {option.name}
                </span>
              </div>
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-1 right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
                >
                  <Check size={10} className="text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}

// Prompt preview panel
function PromptPreviewPanel({ prompt }: { prompt: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs uppercase tracking-wider text-slate-500">
          Composed Prompt
        </span>
      </div>

      <div className="p-4 bg-white/[0.02] rounded-xl border border-white/5">
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
          {prompt}
        </p>
      </div>

      <p className="mt-4 text-xs text-slate-600 italic">
        This prompt is automatically composed from your selections. Categories without
        selections are not included.
      </p>
    </motion.div>
  );
}
