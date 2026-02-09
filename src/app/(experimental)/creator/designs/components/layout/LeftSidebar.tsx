'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Sparkles, Users, Image, ChevronLeft,
  Scissors, Eye, CircleDot, Smile, Palette, Flame,
  Crown, Droplet, Clock, Sun,
} from 'lucide-react';
import { useCreatorUIStore } from '../../store/creatorUIStore';
import { useCreatorCharacterStore } from '../../store/creatorCharacterStore';
import { CATEGORIES, CATEGORY_GROUPS } from '../../constants/categories';
import type { CategoryId, Category } from '../../types';

const ICONS: Record<string, React.ElementType> = {
  User, Sparkles, Users, Image, Scissors, Eye, CircleDot,
  Smile, Palette, Flame, Crown, Droplet, Clock, Sun,
};

export function LeftSidebar() {
  const activeCategory = useCreatorUIStore((s) => s.activeCategory);
  const leftSidebarOpen = useCreatorUIStore((s) => s.leftSidebarOpen);
  const setActiveCategory = useCreatorUIStore((s) => s.setActiveCategory);
  const toggleLeftSidebar = useCreatorUIStore((s) => s.toggleLeftSidebar);
  const selections = useCreatorCharacterStore((s) => s.selections);

  const hasSelection = (catId: CategoryId) => {
    const sel = selections[catId];
    return sel && (sel.optionId !== null || sel.isCustom);
  };

  const categoriesByGroup = CATEGORY_GROUPS.reduce((acc, group) => {
    acc[group.id] = CATEGORIES.filter((c) => c.group === group.id);
    return acc;
  }, {} as Record<string, Category[]>);

  return (
    <motion.div
      initial={false}
      animate={{
        width: leftSidebarOpen ? 240 : 56,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className="border-r border-white/[0.04] flex flex-col bg-[#080808]/80 backdrop-blur-xl relative z-10 shrink-0"
    >
      {/* Toggle */}
      <button
        onClick={toggleLeftSidebar}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-12 bg-[#0a0a0a] border border-white/10 rounded-r-lg flex items-center justify-center text-slate-500 hover:text-amber-400 hover:border-amber-500/30 transition-all"
      >
        <motion.div animate={{ rotate: leftSidebarOpen ? 0 : 180 }}>
          <ChevronLeft size={14} />
        </motion.div>
      </button>

      {/* Collapsed: icon strip */}
      {!leftSidebarOpen && (
        <nav className="flex flex-col items-center py-4 gap-1 overflow-y-auto custom-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = ICONS[cat.icon] || User;
            const isActive = activeCategory === cat.id;
            const selected = hasSelection(cat.id);

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all relative
                  ${isActive
                    ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    : 'text-slate-600 hover:text-slate-300 hover:bg-white/5 border border-transparent'
                  }`}
                title={cat.label}
              >
                <Icon size={16} strokeWidth={1.5} />
                {selected && !isActive && (
                  <div className="absolute top-0.5 right-0.5 w-2 h-2 bg-amber-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Expanded: grouped list */}
      <AnimatePresence mode="wait">
        {leftSidebarOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex-1 overflow-y-auto custom-scrollbar py-3"
          >
            {CATEGORY_GROUPS.map((group) => (
              <div key={group.id} className="mb-2">
                <div className="px-4 py-2">
                  <span className="text-[10px] uppercase tracking-widest text-slate-600 font-medium">
                    {group.label}
                  </span>
                </div>
                <div className="px-2 space-y-0.5">
                  {categoriesByGroup[group.id]?.map((cat) => {
                    const Icon = ICONS[cat.icon] || User;
                    const isActive = activeCategory === cat.id;
                    const selected = hasSelection(cat.id);

                    return (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-all text-sm
                          ${isActive
                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
                          }`}
                      >
                        <Icon size={16} strokeWidth={1.5} />
                        <span className="flex-1 text-left">{cat.label}</span>
                        {selected && (
                          <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
