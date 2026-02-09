'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Grid3X3 } from 'lucide-react';
import { useCreatorUIStore } from '../../store/creatorUIStore';
import { useCreatorCharacterStore } from '../../store/creatorCharacterStore';
import { getOptionsForCategory, getCategoryById } from '../../constants';
import { OptionCard } from './OptionCard';

interface OptionsListProps {
  searchQuery: string;
}

export function OptionsList({ searchQuery }: OptionsListProps) {
  const activeCategory = useCreatorUIStore((s) => s.activeCategory);
  const selections = useCreatorCharacterStore((s) => s.selections);
  const setSelection = useCreatorCharacterStore((s) => s.setSelection);

  if (!activeCategory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-600 p-8">
        <Grid3X3 size={32} className="mb-3 opacity-50" />
        <p className="text-sm text-center">Select a category from the left panel</p>
      </div>
    );
  }

  const category = getCategoryById(activeCategory);
  const options = getOptionsForCategory(activeCategory);
  const currentSelection = selections[activeCategory]?.optionId ?? null;

  const filtered = searchQuery.trim()
    ? options.filter(
        (o) =>
          o.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (o.description && o.description.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : options;

  if (!category) return null;

  return (
    <motion.div
      key={activeCategory}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="p-3"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider text-slate-500">
          {category.label} Options
        </span>
        <span className="text-xs text-slate-600">{filtered.length} available</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {filtered.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={currentSelection === option.id}
            onSelect={() => setSelection(activeCategory, option.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && searchQuery && (
        <p className="text-sm text-slate-600 text-center py-8">No matching options</p>
      )}
    </motion.div>
  );
}
