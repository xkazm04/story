/**
 * AutoplaySetup - Reusable form UI components (Counter, Toggle, PresetSelector)
 */

'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  Settings2,
  Crown,
} from 'lucide-react';
import { AutoplayPreset } from './types';
import { DEFAULT_POLISH_CONFIG } from '../../../types';

// ============================================================================
// PRESETS
// ============================================================================

export const AUTOPLAY_PRESETS: AutoplayPreset[] = [
  {
    id: 'quick',
    label: 'Quick',
    description: '2 gameplay, fast results',
    icon: <Zap size={12} />,
    config: {
      sketchCount: 0,
      gameplayCount: 2,
      posterEnabled: false,
      hudEnabled: false,
      maxIterationsPerImage: 2,
      polish: { rescueEnabled: true, rescueFloor: DEFAULT_POLISH_CONFIG.rescueFloor },
    },
  },
  {
    id: 'standard',
    label: 'Standard',
    description: '2 sketch + 3 gameplay + poster',
    icon: <Settings2 size={12} />,
    config: {
      sketchCount: 2,
      gameplayCount: 3,
      posterEnabled: true,
      hudEnabled: false,
      maxIterationsPerImage: 2,
      polish: { rescueEnabled: true, rescueFloor: DEFAULT_POLISH_CONFIG.rescueFloor },
    },
  },
  {
    id: 'full',
    label: 'Full Suite',
    description: 'Everything enabled',
    icon: <Crown size={12} />,
    config: {
      sketchCount: 2,
      gameplayCount: 4,
      posterEnabled: true,
      hudEnabled: true,
      maxIterationsPerImage: 3,
      polish: { rescueEnabled: true, rescueFloor: DEFAULT_POLISH_CONFIG.rescueFloor },
    },
  },
];

// ============================================================================
// Counter Component
// ============================================================================

export interface CounterProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function Counter({ value, min, max, onChange, disabled, label, icon, description }: CounterProps) {
  return (
    <div className="flex items-center justify-between py-1.5 px-2 bg-black/30 border border-slate-800/60 rounded">
      <div className="flex items-center gap-2">
        <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
          {icon}
        </div>
        <div>
          <div className="text-xs font-medium text-slate-200">{label}</div>
          <div className="text-[10px] text-slate-500">{description}</div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={disabled || value <= min}
          className={cn('p-1 rounded border transition-colors',
            disabled || value <= min
              ? 'border-slate-800 text-slate-700 cursor-not-allowed'
              : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-cyan-400'
          )}
        >
          <ChevronLeft size={12} />
        </button>
        <span className="font-mono text-sm w-6 text-center text-cyan-400">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={disabled || value >= max}
          className={cn('p-1 rounded border transition-colors',
            disabled || value >= max
              ? 'border-slate-800 text-slate-700 cursor-not-allowed'
              : 'border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-cyan-400'
          )}
        >
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// Toggle Component
// ============================================================================

export interface ToggleProps {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  disabled?: boolean;
  label: string;
  icon: React.ReactNode;
  description: string;
}

export function Toggle({ enabled, onChange, disabled, label, icon, description }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!enabled)}
      disabled={disabled}
      className={cn('w-full flex items-center justify-between py-1.5 px-2 rounded border transition-all text-left',
        disabled
          ? 'border-slate-800/40 bg-black/20 cursor-not-allowed opacity-40'
          : enabled
            ? 'border-purple-500/40 bg-purple-500/10'
            : 'border-slate-800/60 bg-black/30 hover:border-slate-700'
      )}
    >
      <div className="flex items-center gap-2">
        <div className={cn('p-1 rounded', enabled ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800/50 text-slate-500')}>
          {icon}
        </div>
        <div>
          <div className={cn('text-xs font-medium', enabled ? 'text-purple-300' : 'text-slate-300')}>{label}</div>
          <div className="text-[10px] text-slate-500">{description}</div>
        </div>
      </div>
      <div className={cn('w-8 h-4 rounded-full p-0.5 transition-colors', enabled ? 'bg-purple-500' : 'bg-slate-700')}>
        <div className={cn('w-3 h-3 rounded-full bg-white transition-transform', enabled ? 'translate-x-4' : 'translate-x-0')} />
      </div>
    </button>
  );
}

// ============================================================================
// PresetSelector Component
// ============================================================================

export interface PresetSelectorProps {
  activePreset: string | null;
  onSelect: (preset: AutoplayPreset) => void;
  disabled: boolean;
}

/**
 * Preset Selector - Quick configuration buttons
 */
export function PresetSelector({ activePreset, onSelect, disabled }: PresetSelectorProps) {
  return (
    <div className="flex gap-1.5">
      {AUTOPLAY_PRESETS.map((preset) => {
        const isActive = activePreset === preset.id;
        return (
          <button
            key={preset.id}
            onClick={() => onSelect(preset)}
            disabled={disabled}
            title={preset.description}
            className={cn('flex-1 flex flex-col items-center justify-center gap-0.5 py-2 px-3 rounded border text-xs font-medium transition-all',
              disabled
                ? 'border-slate-800/40 text-slate-700 cursor-not-allowed'
                : isActive
                  ? 'border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.1)]'
                  : 'border-slate-800/60 bg-black/20 text-slate-400 hover:border-slate-700 hover:text-slate-300'
            )}
          >
            <div className="flex items-center gap-1.5">
              <span className={isActive ? 'text-cyan-400' : 'text-slate-500'}>{preset.icon}</span>
              {preset.label}
            </div>
            <span className="text-[10px] text-slate-600 font-normal">{preset.description}</span>
          </button>
        );
      })}
    </div>
  );
}
