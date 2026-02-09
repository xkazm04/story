'use client';

import React from 'react';
import { Wand2, MoreHorizontal, Sparkles, Loader2 } from 'lucide-react';
import { useCreatorCharacterStore } from '../../store/creatorCharacterStore';
import { useCreatorUIStore } from '../../store/creatorUIStore';
import { PromptEditor } from '../prompt/PromptEditor';
import { HeaderOverflowMenu } from './HeaderOverflowMenu';

interface HeaderProps {
  onOpenCommandPalette: () => void;
}

export function Header({ onOpenCommandPalette }: HeaderProps) {
  const name = useCreatorCharacterStore((s) => s.name);
  const setCharacterName = useCreatorCharacterStore((s) => s.setCharacterName);
  const isGenerating = useCreatorUIStore((s) => s.isGenerating);
  const startGeneration = useCreatorUIStore((s) => s.startGeneration);
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <header className="h-14 border-b border-white/[0.04] flex items-center justify-between px-4 shrink-0 bg-black/40 backdrop-blur-xl z-20 relative">
      {/* Left: Logo + Character Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <Wand2 size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold tracking-wide">Character Forge</span>
        </div>

        <div className="h-6 w-px bg-white/10" />

        <input
          type="text"
          value={name}
          onChange={(e) => setCharacterName(e.target.value)}
          className="bg-transparent text-base text-white font-medium focus:outline-none border-b border-transparent focus:border-amber-500/50 px-1 py-0.5 w-48"
        />
      </div>

      {/* Center: Prompt Editor */}
      <div className="flex-1 max-w-xl mx-8">
        <PromptEditor />
      </div>

      {/* Right: Generate + Overflow */}
      <div className="flex items-center gap-3">
        <button
          onClick={startGeneration}
          disabled={isGenerating}
          className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 rounded-lg text-xs font-semibold text-white shadow-lg shadow-amber-900/30 transition-all hover:shadow-amber-900/50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={14} />
              Generate
            </>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all border border-transparent hover:border-white/10"
          >
            <MoreHorizontal size={18} />
          </button>
          <HeaderOverflowMenu
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onOpenCommandPalette={onOpenCommandPalette}
          />
        </div>
      </div>
    </header>
  );
}
