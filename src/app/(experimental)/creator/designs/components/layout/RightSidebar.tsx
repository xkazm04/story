'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Search } from 'lucide-react';
import { useCreatorUIStore } from '../../store/creatorUIStore';
import { useCreatorCharacterStore, selectActiveSelectionCount } from '../../store/creatorCharacterStore';
import { getCategoryById } from '../../constants';
import { OptionsList } from '../options/OptionsList';
import { PromptPreview } from '../options/PromptPreview';
import { CategoryHeader } from '../options/CategoryHeader';

export function RightSidebar() {
  const rightSidebarOpen = useCreatorUIStore((s) => s.rightSidebarOpen);
  const toggleRightSidebar = useCreatorUIStore((s) => s.toggleRightSidebar);
  const activeCategory = useCreatorUIStore((s) => s.activeCategory);
  const selectionCount = useCreatorCharacterStore(selectActiveSelectionCount);
  const [searchQuery, setSearchQuery] = React.useState('');

  const category = activeCategory ? getCategoryById(activeCategory) : null;

  return (
    <motion.div
      initial={false}
      animate={{
        width: rightSidebarOpen ? 320 : 0,
        opacity: rightSidebarOpen ? 1 : 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className="border-l border-white/[0.04] bg-[#080808]/90 backdrop-blur-xl overflow-hidden shrink-0 relative"
    >
      {/* Toggle */}
      <button
        onClick={toggleRightSidebar}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-[#0a0a0a] border border-white/10 rounded-l-lg flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
      >
        <motion.div animate={{ rotate: rightSidebarOpen ? 0 : 180 }}>
          <ChevronRight size={14} />
        </motion.div>
      </button>

      <div className="w-[320px] h-full flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-200">
              {category?.label ?? 'Options'}
            </span>
            <span className="text-xs text-slate-600">{selectionCount} defined</span>
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter options..."
              className="w-full pl-9 pr-3 py-1.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/30"
            />
          </div>
        </div>

        {/* Category header with current selection */}
        <CategoryHeader />

        {/* Options list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <OptionsList searchQuery={searchQuery} />
        </div>

        {/* Prompt preview + Generate */}
        <PromptPreview />
      </div>
    </motion.div>
  );
}
