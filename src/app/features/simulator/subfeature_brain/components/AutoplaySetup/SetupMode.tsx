/**
 * SetupMode - Configuration form content (vision input, presets, count controls, toggles)
 */

'use client';

import React from 'react';
import { cn } from '@/app/lib/utils';
import {
  Image,
  Gamepad2,
  RefreshCw,
  AlertCircle,
  Wand2,
  Frame,
  Layers,
  Sparkles,
} from 'lucide-react';
import { ExtendedAutoplayConfig, AutoplayPreset } from './types';
import { Counter, Toggle, PresetSelector } from './FormComponents';

export interface SetupModeContentProps {
  config: ExtendedAutoplayConfig;
  setConfig: (config: ExtendedAutoplayConfig) => void;
  hasContent: boolean;
  visionSentence: string;
  onVisionSentenceChange: (value: string) => void;
  isRunning: boolean;
  isProcessingBreakdown: boolean;
  breakdownError: string | null;
  setBreakdownError: (error: string | null) => void;
  hasGameplay: boolean;
  activePreset: string | null;
  onPresetSelect: (preset: AutoplayPreset) => void;
}

/**
 * Setup Mode Content - Configuration form (compact)
 */
export function SetupModeContent({
  config,
  setConfig,
  hasContent,
  visionSentence,
  onVisionSentenceChange,
  isRunning,
  isProcessingBreakdown,
  breakdownError,
  setBreakdownError,
  hasGameplay,
  activePreset,
  onPresetSelect,
}: SetupModeContentProps) {
  const hasPromptIdea = Boolean(visionSentence?.trim());

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-3">
      {/* Vision Input - prominent header field */}
      <div className="space-y-1">
        <label className="flex items-center gap-1.5 text-[10px] font-medium text-purple-400 uppercase tracking-wider">
          <Sparkles size={10} />
          Vision {!hasContent && !hasPromptIdea && <span className="text-amber-400 normal-case">(Required)</span>}
        </label>
        <textarea
          rows={3}
          value={visionSentence}
          onChange={(e) => {
            onVisionSentenceChange(e.target.value);
            setBreakdownError(null);
          }}
          placeholder="e.g., &quot;Baldur's Gate but in Star Wars with modern graphics&quot;"
          className={cn('w-full px-3 py-2.5 bg-slate-900/60 border rounded-md text-sm text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:ring-1 transition-all resize-none',
                    !hasContent && !hasPromptIdea
                      ? 'border-amber-500/40 focus:border-amber-500/50 focus:ring-amber-500/30'
                      : 'border-purple-500/30 focus:border-purple-500/60 focus:ring-purple-500/20'
          )}
          disabled={isRunning || isProcessingBreakdown}
        />
        {breakdownError && (
          <p className="text-[10px] text-red-400 flex items-center gap-1">
            <AlertCircle size={10} />
            {breakdownError}
          </p>
        )}
      </div>

      {/* Preset Selector - larger buttons */}
      <PresetSelector
        activePreset={activePreset}
        onSelect={onPresetSelect}
        disabled={isRunning || isProcessingBreakdown}
      />

      {/* Two-column layout for counts and toggles */}
      <div className="grid grid-cols-2 gap-2">
        {/* Left column: Image counts */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Generation</h3>
          <Counter
            value={config.sketchCount}
            min={0}
            max={4}
            onChange={(v) => setConfig({ ...config, sketchCount: v })}
            disabled={isRunning}
            label="Sketches"
            icon={<Image size={12} />}
            description="Concept art"
          />
          <Counter
            value={config.gameplayCount}
            min={0}
            max={4}
            onChange={(v) => setConfig({ ...config, gameplayCount: v })}
            disabled={isRunning}
            label="Gameplay"
            icon={<Gamepad2 size={12} />}
            description="With UI"
          />
          <Counter
            value={config.maxIterationsPerImage}
            min={1}
            max={3}
            onChange={(v) => setConfig({ ...config, maxIterationsPerImage: v })}
            disabled={isRunning}
            label="Iterations"
            icon={<RefreshCw size={12} />}
            description="Per image"
          />
        </div>

        {/* Right column: Toggles */}
        <div className="space-y-1.5">
          <h3 className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Options</h3>
          <Toggle
            enabled={config.polish?.rescueEnabled ?? true}
            onChange={(v) => setConfig({
              ...config,
              polish: { ...config.polish, rescueEnabled: v }
            })}
            disabled={isRunning}
            label="AI Polish"
            icon={<Wand2 size={12} />}
            description="Improve borderline images"
          />
          <Toggle
            enabled={config.posterEnabled}
            onChange={(v) => setConfig({ ...config, posterEnabled: v })}
            disabled={isRunning}
            label="Auto Poster"
            icon={<Frame size={12} />}
            description="Generate & select"
          />
          <Toggle
            enabled={config.hudEnabled && hasGameplay}
            onChange={(v) => setConfig({ ...config, hudEnabled: v })}
            disabled={isRunning || !hasGameplay}
            label="Auto HUD"
            icon={<Layers size={12} />}
            description={hasGameplay ? 'Add overlays' : 'Need gameplay'}
          />
        </div>
      </div>
    </div>
  );
}
