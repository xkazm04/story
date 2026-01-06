/**
 * Header - Top bar with prompt editor, character name, and actions
 */

'use client';

import React, { useState } from 'react';
import {
  Wand2, Undo2, Redo2, Search, Save, Share2, Download,
  Settings, HelpCircle, Keyboard,
} from 'lucide-react';
import { useCreator } from '../../context/CreatorContext';
import { IconButton } from '../common/IconButton';
import { PromptEditor } from '../prompt/PromptEditor';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const { state, setCharacterName } = useCreator();
  const [view, setView] = useState<'edit' | 'preview' | 'compare'>('edit');

  return (
    <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0 bg-black/40 backdrop-blur-xl z-20 relative">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wand2 size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Character Forge</span>
        </div>

        <div className="h-6 w-px bg-white/10" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <IconButton icon={Undo2} size="sm" tooltip="Undo" shortcut="Ctrl+Z" />
          <IconButton icon={Redo2} size="sm" tooltip="Redo" shortcut="Ctrl+Shift+Z" />
        </div>

        <div className="h-6 w-px bg-white/10" />

        {/* Command Palette Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all group"
        >
          <Search size={16} className="text-slate-500 group-hover:text-slate-300" />
          <span className="text-sm text-slate-500 group-hover:text-slate-300">Search...</span>
          <kbd className="text-sm text-slate-600 bg-white/5 px-2 py-0.5 rounded border border-white/10 ml-4">
            Ctrl+K
          </kbd>
        </button>

        <div className="h-6 w-px bg-white/10" />

        {/* Character Name */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={state.character.name}
            onChange={(e) => setCharacterName(e.target.value)}
            className="bg-transparent text-base text-white font-medium focus:outline-none border-b border-transparent focus:border-amber-500/50 px-1 py-0.5 w-48"
          />
          <span className="text-sm text-slate-600 bg-white/5 px-2 py-1 rounded">Draft</span>
        </div>
      </div>

      {/* Center - Prompt Editor */}
      <div className="flex-1 max-w-xl mx-8">
        <PromptEditor />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* View Toggles */}
        <div className="flex items-center gap-1 bg-white/[0.03] rounded-lg p-1 border border-white/[0.04]">
          {(['edit', 'preview', 'compare'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors
                ${view === v
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200'
                }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="h-6 w-px bg-white/10" />

        {/* Utility Icons */}
        <div className="flex items-center gap-2">
          <IconButton icon={Keyboard} size="sm" tooltip="Shortcuts" />
          <IconButton icon={HelpCircle} size="sm" tooltip="Help" />
          <IconButton icon={Settings} size="sm" tooltip="Settings" />
        </div>

        <div className="h-6 w-px bg-white/10" />

        {/* Export Actions */}
        <div className="flex items-center gap-2">
          <IconButton icon={Share2} label="Share" size="sm" />
          <IconButton icon={Download} label="Export" size="sm" />
        </div>

        <button className="ml-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-xs font-semibold text-white shadow-lg shadow-amber-900/30 transition-all hover:shadow-amber-900/50 flex items-center gap-2">
          <Save size={14} />
          Save
        </button>
      </div>
    </header>
  );
}
