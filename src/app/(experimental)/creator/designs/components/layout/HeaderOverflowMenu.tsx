'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Undo2, Redo2, RotateCcw, Eye, Columns2, GitCompare,
  Share2, Download, Save, Keyboard, HelpCircle, Settings,
} from 'lucide-react';
import { useCreatorCharacterStore } from '../../store/creatorCharacterStore';

interface HeaderOverflowMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCommandPalette: () => void;
}

const SECTIONS = [
  {
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', icon: Undo2, shortcut: 'Ctrl+Z' },
      { id: 'redo', label: 'Redo', icon: Redo2, shortcut: 'Ctrl+Shift+Z' },
      { id: 'reset', label: 'Reset Character', icon: RotateCcw },
    ],
  },
  {
    label: 'View',
    items: [
      { id: 'view-edit', label: 'Edit Mode', icon: Eye },
      { id: 'view-preview', label: 'Preview Mode', icon: Columns2 },
      { id: 'view-compare', label: 'Compare Mode', icon: GitCompare },
    ],
  },
  {
    label: 'Export',
    items: [
      { id: 'share', label: 'Share', icon: Share2 },
      { id: 'download', label: 'Download', icon: Download },
      { id: 'save', label: 'Save', icon: Save, shortcut: 'Ctrl+S' },
    ],
  },
  {
    label: 'Settings',
    items: [
      { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
      { id: 'help', label: 'Help', icon: HelpCircle },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

export function HeaderOverflowMenu({ isOpen, onClose, onOpenCommandPalette }: HeaderOverflowMenuProps) {
  const ref = useRef<HTMLDivElement>(null);
  const resetCharacter = useCreatorCharacterStore((s) => s.resetCharacter);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  const handleAction = (id: string) => {
    onClose();
    if (id === 'reset') resetCharacter();
    if (id === 'shortcuts') onOpenCommandPalette();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 w-56 bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
        >
          {SECTIONS.map((section) => (
            <div key={section.label} className="py-1">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-600 font-medium">
                {section.label}
              </div>
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAction(item.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-300 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  <item.icon size={15} className="text-slate-500" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.shortcut && (
                    <kbd className="text-[10px] text-slate-600 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                      {item.shortcut}
                    </kbd>
                  )}
                </button>
              ))}
              {section !== SECTIONS[SECTIONS.length - 1] && (
                <div className="mx-3 my-1 h-px bg-white/[0.06]" />
              )}
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
