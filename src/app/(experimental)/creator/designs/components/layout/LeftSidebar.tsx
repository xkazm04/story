/**
 * LeftSidebar - Unified category navigation
 * Vertical group tabs + horizontal category tabs within groups
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Sparkles, Users, Image, ChevronLeft, Star,
  Scissors, Eye, CircleDot, Smile, Palette, Flame,
  Crown, Droplet, Clock, Sun,
} from 'lucide-react';
import { useCreator } from '../../context/CreatorContext';
import { CATEGORY_GROUPS, getCategoriesByGroup } from '../../constants/categories';
import { Tooltip } from '../common/Tooltip';
import type { CategoryId, Category } from '../../types';

// Icon mapping
const ICONS: Record<string, React.ElementType> = {
  User, Sparkles, Users, Image, Scissors, Eye, CircleDot,
  Smile, Palette, Flame, Crown, Droplet, Clock, Sun,
};

const GROUP_ICONS: Record<string, React.ElementType> = {
  face: User,
  features: Sparkles,
  body: Users,
  environment: Image,
};

export function LeftSidebar() {
  const { state, setActiveCategory, toggleLeftSidebar } = useCreator();
  const { ui, character } = state;
  const [activeGroup, setActiveGroup] = React.useState<string>('face');

  const categoriesInGroup = getCategoriesByGroup(activeGroup as Category['group']);

  // Check if category has selection
  const hasSelection = (catId: CategoryId) => {
    const sel = character.selections[catId];
    return sel && (sel.optionId !== null || sel.isCustom);
  };

  return (
    <motion.div
      initial={false}
      animate={{
        width: ui.leftSidebarOpen ? 280 : 56,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className="border-r border-white/[0.04] flex flex-col bg-[#080808]/80 backdrop-blur-xl relative z-10 shrink-0"
    >
      {/* Sidebar Toggle */}
      <button
        onClick={toggleLeftSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-[#0a0a0a] border border-white/10 rounded-r-lg flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
      >
        <motion.div animate={{ rotate: ui.leftSidebarOpen ? 0 : 180 }}>
          <ChevronLeft size={14} />
        </motion.div>
      </button>

      <div className="flex h-full">
        {/* Vertical Group Navigation */}
        <nav className="w-14 border-r border-white/[0.04] flex flex-col items-center py-4 gap-2 bg-black/40 shrink-0">
          {CATEGORY_GROUPS.map((group) => {
            const Icon = GROUP_ICONS[group.id];
            const isActive = activeGroup === group.id;
            const groupCategories = getCategoriesByGroup(group.id);
            const hasAnySelection = groupCategories.some((c) => hasSelection(c.id));

            return (
              <Tooltip key={group.id} content={group.label} position="right">
                <button
                  onClick={() => {
                    setActiveGroup(group.id);
                    // Select first category in group
                    const first = getCategoriesByGroup(group.id)[0];
                    if (first) setActiveCategory(first.id);
                  }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 relative
                    ${isActive
                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                      : 'text-slate-600 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <Icon size={18} strokeWidth={1.5} />
                  {isActive && (
                    <motion.div
                      layoutId="groupIndicator"
                      className="absolute -left-[1px] top-1/2 -translate-y-1/2 w-[2px] h-5 bg-amber-500 rounded-r-full"
                    />
                  )}
                  {hasAnySelection && !isActive && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-full" />
                  )}
                </button>
              </Tooltip>
            );
          })}

          <div className="flex-1" />

          <Tooltip content="Favorites" position="right">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 hover:text-amber-400 hover:bg-white/5 transition-all">
              <Star size={18} strokeWidth={1.5} />
            </button>
          </Tooltip>
        </nav>

        {/* Category Content */}
        <AnimatePresence mode="wait">
          {ui.leftSidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {/* Group Title */}
              <div className="px-4 pt-4 pb-2">
                <span className="text-xs uppercase tracking-wider text-slate-500">
                  {CATEGORY_GROUPS.find((g) => g.id === activeGroup)?.label}
                </span>
              </div>

              {/* Horizontal Category Tabs */}
              <div className="px-3 pb-3">
                <div className="flex flex-wrap gap-1.5">
                  {categoriesInGroup.map((cat) => {
                    const Icon = ICONS[cat.icon] || User;
                    const isActive = ui.activeCategory === cat.id;
                    const selected = hasSelection(cat.id);

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-medium
                          ${isActive
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : selected
                              ? 'bg-white/[0.06] text-slate-300 border border-white/10'
                              : 'bg-white/[0.02] text-slate-500 border border-transparent hover:bg-white/[0.05] hover:text-slate-300'
                          }`}
                      >
                        <Icon size={14} />
                        <span>{cat.label}</span>
                        {selected && !isActive && (
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selection Info */}
              <div className="flex-1 px-4 overflow-y-auto custom-scrollbar">
                {ui.activeCategory && (
                  <CategoryInfo categoryId={ui.activeCategory} />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Category info panel showing current selection
function CategoryInfo({ categoryId }: { categoryId: CategoryId }) {
  const { state, clearCustomPrompt } = useCreator();
  const selection = state.character.selections[categoryId];

  if (!selection) return null;

  const hasValue = selection.optionId !== null || selection.isCustom;

  return (
    <div className="space-y-4">
      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider text-slate-500">Current</span>
          {hasValue && (
            <button
              onClick={() => clearCustomPrompt(categoryId)}
              className="text-xs text-slate-500 hover:text-amber-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <p className="text-sm text-slate-300">
          {selection.isCustom && selection.customPrompt
            ? selection.customPrompt
            : selection.optionId !== null
              ? `Option ${selection.optionId} selected`
              : 'Not defined'}
        </p>
      </div>

      <p className="text-xs text-slate-600 italic">
        Select an option from the right panel, or enter a custom prompt in the editor above.
      </p>
    </div>
  );
}
