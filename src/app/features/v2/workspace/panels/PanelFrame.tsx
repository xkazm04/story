'use client';

import React from 'react';
import { X, Minus } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface PanelFrameProps {
  title: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function PanelFrame({
  title,
  icon: Icon,
  actions,
  onClose,
  onMinimize,
  children,
  className,
}: PanelFrameProps) {
  return (
    <div
      className={cn(
        'flex flex-col h-full bg-slate-950/90 border border-slate-800/60 rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Header — 28px */}
      <div className="flex items-center gap-2 h-7 px-3 bg-slate-900/80 border-b border-slate-800/50 shrink-0">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
        <span className="text-[11px] font-medium text-slate-300 truncate">{title}</span>

        {/* Custom actions */}
        {actions && <div className="flex items-center gap-1 ml-auto">{actions}</div>}

        {/* Spacer if no actions */}
        {!actions && <div className="flex-1" />}

        {/* Minimize */}
        {onMinimize && (
          <button
            onClick={onMinimize}
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
        )}

        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
