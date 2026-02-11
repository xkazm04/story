'use client';

import React from 'react';
import { Terminal, Clapperboard, Users, BookOpen } from 'lucide-react';
import { cn } from '@/app/lib/utils';

const QUICK_ACTIONS = [
  {
    icon: Clapperboard,
    label: 'Generate a scene',
    description: 'Create scene content with dialogue and action',
    color: 'text-amber-400',
    borderColor: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    icon: Users,
    label: 'Explore characters',
    description: 'View and develop your story characters',
    color: 'text-purple-400',
    borderColor: 'border-purple-500/20 hover:border-purple-500/40',
  },
  {
    icon: BookOpen,
    label: 'View story structure',
    description: 'See acts, beats, and scene connections',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-500/20 hover:border-cyan-500/40',
  },
];

export default function EmptyWelcomePanel() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 select-none">
      {/* Terminal icon with pulse */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-slate-900/60 border border-slate-800/50 flex items-center justify-center">
          <Terminal className="w-8 h-8 text-slate-500" />
        </div>
        <div className="absolute inset-0 w-16 h-16 rounded-2xl border border-cyan-500/20 animate-pulse" />
      </div>

      {/* Heading */}
      <h2 className="text-base font-semibold text-slate-200 mb-1">Dynamic Workspace</h2>
      <p className="text-xs text-slate-500 mb-8 text-center max-w-[280px]">
        Start by typing a command in the terminal below. Panels will appear based on your task.
      </p>

      {/* Quick action cards */}
      <div className="grid gap-3 w-full max-w-[400px]">
        {QUICK_ACTIONS.map((action) => (
          <div
            key={action.label}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900/40 border transition-colors cursor-default',
              action.borderColor
            )}
          >
            <action.icon className={cn('w-5 h-5 shrink-0', action.color)} />
            <div>
              <p className="text-xs font-medium text-slate-300">{action.label}</p>
              <p className="text-[10px] text-slate-600">{action.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
