/**
 * IconButton - Reusable icon button with optional label
 */

import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  label?: string;
  onClick?: () => void;
  active?: boolean;
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  shortcut?: string;
  disabled?: boolean;
}

const sizes = {
  sm: { button: 'w-8 h-8', icon: 14 },
  md: { button: 'w-9 h-9', icon: 16 },
  lg: { button: 'w-11 h-11', icon: 18 },
};

export function IconButton({
  icon: Icon,
  label,
  onClick,
  active = false,
  size = 'md',
  tooltip,
  shortcut,
  disabled = false,
}: IconButtonProps) {
  const { button, icon } = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex flex-col items-center gap-1 relative"
      title={tooltip}
    >
      <div
        className={`${button} rounded-xl flex items-center justify-center transition-all duration-300
          ${active
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
            : 'bg-white/[0.03] text-slate-400 border border-transparent hover:bg-white/[0.08] hover:text-slate-200 hover:border-white/10'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Icon size={icon} strokeWidth={1.5} />
      </div>
      {label && (
        <span
          className={`text-xs font-medium transition-colors ${
            active ? 'text-amber-400' : 'text-slate-500 group-hover:text-slate-300'
          }`}
        >
          {label}
        </span>
      )}
      {shortcut && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-600 bg-black/80 px-2 py-1 rounded border border-white/10">
            {shortcut}
          </span>
        </div>
      )}
    </button>
  );
}
