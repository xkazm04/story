/**
 * CommandPalette - Quick command search overlay
 */

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Sparkles, Zap, Wand2, Camera, Download, Copy,
  Undo2, Redo2, RotateCcw, Lock, Unlock, Maximize2, ZoomIn, ZoomOut,
} from 'lucide-react';

interface Command {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut: string;
  category: string;
}

const COMMANDS: Command[] = [
  { id: 'generate', label: 'Generate Character', icon: Sparkles, shortcut: 'Ctrl+G', category: 'AI' },
  { id: 'randomize', label: 'Randomize All', icon: Zap, shortcut: 'Ctrl+R', category: 'AI' },
  { id: 'enhance', label: 'AI Enhance', icon: Wand2, shortcut: 'Ctrl+E', category: 'AI' },
  { id: 'snapshot', label: 'Take Snapshot', icon: Camera, shortcut: 'Ctrl+S', category: 'Export' },
  { id: 'export', label: 'Export Character', icon: Download, shortcut: 'Ctrl+Shift+E', category: 'Export' },
  { id: 'copy', label: 'Copy to Clipboard', icon: Copy, shortcut: 'Ctrl+C', category: 'Export' },
  { id: 'undo', label: 'Undo', icon: Undo2, shortcut: 'Ctrl+Z', category: 'Edit' },
  { id: 'redo', label: 'Redo', icon: Redo2, shortcut: 'Ctrl+Shift+Z', category: 'Edit' },
  { id: 'reset', label: 'Reset to Default', icon: RotateCcw, shortcut: 'Ctrl+Backspace', category: 'Edit' },
  { id: 'lock', label: 'Lock Layer', icon: Lock, shortcut: 'Ctrl+L', category: 'Layers' },
  { id: 'unlock', label: 'Unlock All', icon: Unlock, shortcut: 'Ctrl+Shift+L', category: 'Layers' },
  { id: 'zoom-fit', label: 'Fit to Screen', icon: Maximize2, shortcut: 'Ctrl+0', category: 'View' },
  { id: 'zoom-in', label: 'Zoom In', icon: ZoomIn, shortcut: 'Ctrl++', category: 'View' },
  { id: 'zoom-out', label: 'Zoom Out', icon: ZoomOut, shortcut: 'Ctrl+-', category: 'View' },
];

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (commandId: string) => void;
}

export function CommandPalette({ isOpen, onClose, onSelect }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCommands = useMemo(() =>
    COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.category.toLowerCase().includes(search.toLowerCase())
    ), [search]);

  const groupedCommands = useMemo(() =>
    filteredCommands.reduce((acc, cmd) => {
      if (!acc[cmd.category]) acc[cmd.category] = [];
      acc[cmd.category].push(cmd);
      return acc;
    }, {} as Record<string, Command[]>), [filteredCommands]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
    setSearch('');
    setSelectedIndex(0);
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => Math.min(i + 1, filteredCommands.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        onSelect(filteredCommands[selectedIndex].id);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onSelect, filteredCommands, selectedIndex]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-[560px] bg-[#0c0c0c]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/[0.06]">
            <Search size={20} className="text-slate-500" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              className="flex-1 bg-transparent text-base text-white placeholder-slate-600 focus:outline-none"
            />
            <kbd className="px-2.5 py-1 text-sm text-slate-500 bg-white/5 rounded border border-white/10">
              ESC
            </kbd>
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {Object.entries(groupedCommands).map(([category, commands]) => (
              <div key={category} className="mb-3">
                <div className="px-3 py-2 text-xs uppercase tracking-wider text-slate-600 font-medium">
                  {category}
                </div>
                {commands.map((cmd) => {
                  const Icon = cmd.icon;
                  const globalIndex = filteredCommands.indexOf(cmd);
                  const isSelected = globalIndex === selectedIndex;
                  return (
                    <motion.button
                      key={cmd.id}
                      onClick={() => {
                        onSelect(cmd.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'text-slate-300 hover:bg-white/5'
                      }`}
                      whileHover={{ x: 4 }}
                    >
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected ? 'bg-amber-500/20' : 'bg-white/5'
                        }`}
                      >
                        <Icon size={18} className={isSelected ? 'text-amber-400' : 'text-slate-400'} />
                      </div>
                      <span className="flex-1 text-sm">{cmd.label}</span>
                      <kbd className="px-2.5 py-1 text-sm text-slate-500 bg-white/5 rounded border border-white/10 font-mono">
                        {cmd.shortcut}
                      </kbd>
                    </motion.button>
                  );
                })}
              </div>
            ))}
            {filteredCommands.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-base">No commands found</div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-white/5 rounded">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="px-2 py-0.5 bg-white/5 rounded">↵</kbd> Select
              </span>
            </div>
            <span className="text-sm text-slate-600">{filteredCommands.length} commands</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
