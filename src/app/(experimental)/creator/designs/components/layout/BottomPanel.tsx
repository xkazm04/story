'use client';

import React from 'react';
import { FolderOpen, History, Layers } from 'lucide-react';

const TABS = [
  { id: 'assets', label: 'Assets', icon: FolderOpen },
  { id: 'history', label: 'History', icon: History },
  { id: 'layers', label: 'Layers', icon: Layers },
] as const;

export function BottomPanel() {
  return (
    <div className="h-8 border-t border-white/[0.04] bg-[#080808]/90 backdrop-blur-xl shrink-0 flex items-center px-4 gap-6">
      {TABS.map((tab) => (
        <div
          key={tab.id}
          className="flex items-center gap-1.5 text-xs text-slate-600 font-medium cursor-default select-none"
        >
          <tab.icon size={13} />
          {tab.label}
        </div>
      ))}
      <div className="flex-1" />
      <span className="text-[10px] text-slate-700 italic">Coming soon</span>
    </div>
  );
}
