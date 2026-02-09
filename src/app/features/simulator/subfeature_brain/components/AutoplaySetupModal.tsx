/**
 * AutoplaySetupModal - Configuration and activity modal for multi-phase autoplay
 *
 * Two modes:
 * 1. Setup Mode (default): Configuration form for setting up autoplay
 * 2. Activity Mode: Real-time activity monitor showing logs and progress
 *
 * Provides user interface for configuring:
 * - Prompt idea (REQUIRED if no content exists - triggers Smart Breakdown)
 * - Concept image count (1-4)
 * - Gameplay image count (1-4)
 * - Poster generation toggle
 * - HUD overlay toggle (enabled when gameplay > 0)
 * - Max iterations per image
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { cn } from '@/app/lib/utils';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Loader2,
  Square,
  RotateCcw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { ExtendedAutoplayConfig } from '../../types';
import { modalContent, transitions } from '../../lib/motion';

import {
  AutoplayModalMode,
  AutoplaySetupModalProps,
  DEFAULT_CONFIG,
  loadSavedConfig,
  saveConfigToStorage,
  detectActivePreset,
  SetupModeContent,
  CompletionSummary,
  ActivityModeContent,
} from './AutoplaySetup';
import type { AutoplayPreset } from './AutoplaySetup';

// Re-export types so existing consumers continue to work
export type { AutoplayModalMode, AutoplaySetupModalProps } from './AutoplaySetup';

export function AutoplaySetupModal({
  isOpen,
  onClose,
  onStart,
  hasContent,
  onSmartBreakdown,
  visionSentence: visionSentenceProp,
  onVisionSentenceChange,
  canStart,
  canStartReason,
  isRunning,
  // Activity mode props
  mode = 'setup',
  currentPhase = 'idle',
  sketchProgress = { saved: 0, target: 0 },
  gameplayProgress = { saved: 0, target: 0 },
  posterSelected = false,
  hudGenerated = 0,
  hudTarget = 0,
  error,
  textEvents = [],
  imageEvents = [],
  onStop,
  onReset,
  onRetry,
  errorPhase,
  // Iteration tracking
  currentIteration,
  maxIterations,
  // Live preview
  activePrompts,
  activeImages,
  // Step-level tracking
  currentImageInPhase,
  phaseTarget,
  singlePhaseStatus,
}: AutoplaySetupModalProps) {
  const [config, setConfig] = useState<ExtendedAutoplayConfig>(() => loadSavedConfig() || DEFAULT_CONFIG);
  const [isProcessingBreakdown, setIsProcessingBreakdown] = useState(false);
  const [breakdownError, setBreakdownError] = useState<string | null>(null);
  // Local state to track if we just started (forces activity mode)
  const [justStarted, setJustStarted] = useState(false);
  // Expandable full-screen mode
  const [isExpanded, setIsExpanded] = useState(false);

  const totalImages = config.sketchCount + config.gameplayCount;
  const hasGameplay = config.gameplayCount > 0;
  const activePreset = detectActivePreset(config);

  // Derive vision sentence (prop takes priority, fallback to empty string)
  const visionSentence = visionSentenceProp ?? '';

  // Validation: need either existing content OR a vision sentence
  const hasPromptIdea = Boolean(visionSentence.trim());
  const canProceed = hasContent || hasPromptIdea;

  // Apply a preset (preserves promptIdea)
  const handlePresetSelect = useCallback((preset: AutoplayPreset) => {
    setConfig(prev => ({ ...preset.config, promptIdea: prev.promptIdea }));
  }, []);

  // Determine effective mode - switch to activity when running OR just started
  const effectiveMode: AutoplayModalMode = (isRunning || justStarted) ? 'activity' : mode;

  // Reset justStarted when modal is closed (isOpen becomes false)
  // This ensures fresh state when modal is reopened
  useEffect(() => {
    if (!isOpen) {
      setJustStarted(false);
      setIsExpanded(false);
    }
  }, [isOpen]);

  const handleStart = useCallback(async () => {
    setBreakdownError(null);

    // If no content exists but we have a vision sentence, trigger Smart Breakdown first
    if (!hasContent && hasPromptIdea && onSmartBreakdown) {
      setIsProcessingBreakdown(true);
      try {
        const success = await onSmartBreakdown(visionSentence.trim());
        if (!success) {
          setBreakdownError('Smart Breakdown failed. Please try a different idea or add content manually.');
          setIsProcessingBreakdown(false);
          return;
        }
      } catch (err) {
        console.error('[AutoplayModal] Smart Breakdown error:', err);
        setBreakdownError('An error occurred during Smart Breakdown.');
        setIsProcessingBreakdown(false);
        return;
      }
      setIsProcessingBreakdown(false);
    }

    // Persist config for next session
    saveConfigToStorage(config);

    // Set local flag to switch to activity mode immediately
    setJustStarted(true);

    // Start autoplay - pass visionSentence as promptIdea for the orchestrator
    onStart({ ...config, promptIdea: visionSentence.trim() });
  }, [config, visionSentence, onStart, hasContent, hasPromptIdea, onSmartBreakdown]);

  if (!isOpen) return null;

  // Modal dimensions based on mode
  const isActivityMode = effectiveMode === 'activity';

  // Guard against SSR -- document.body doesn't exist during server rendering
  if (typeof document === 'undefined') return null;

  // Portal to document.body to escape backdrop-filter containing blocks
  // (backdrop-blur on parent CentralBrain creates a new containing block
  // that traps position:fixed elements)
  return createPortal(
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
        }}
      >
        {/* Click-away layer (transparent -- no overlay shading so side panels stay visible) */}
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            inset: 0,
          }}
        />

        {/* Modal Content */}
        <motion.div
          variants={modalContent}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitions.normal}
          layout
          style={{
            position: 'relative',
            width: isActivityMode
              ? isExpanded ? '96vw' : 'min(96vw, 960px)'
              : 'min(92vw, 600px)',
            maxWidth: isActivityMode
              ? isExpanded ? 'none' : '960px'
              : '600px',
            height: isActivityMode
              ? isExpanded ? '92vh' : 'min(85vh, 650px)'
              : 'auto',
            maxHeight: isActivityMode
              ? isExpanded ? 'none' : '650px'
              : '85vh',
            background: 'linear-gradient(180deg, #0c0c14 0%, #080810 100%)',
            border: '1px solid rgba(56, 189, 248, 0.15)',
            borderRadius: '0.375rem',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 0 30px rgba(0, 0, 0, 0.5), 0 0 60px rgba(56, 189, 248, 0.05)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header - with phase-colored accent */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800/50 bg-black/40 shrink-0 relative overflow-hidden">
            {/* Phase-colored top edge glow */}
            {isActivityMode && currentPhase !== 'idle' && currentPhase !== 'complete' && currentPhase !== 'error' && (
              <div className={cn('absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r',
                currentPhase === 'sketch' ? 'from-blue-400 to-cyan-500' :
                currentPhase === 'poster' ? 'from-rose-400 to-pink-500' :
                currentPhase === 'hud' ? 'from-amber-400 to-orange-500' :
                'from-cyan-500 to-purple-500'
              )} />
            )}
            <div className="flex items-center gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full', isActivityMode ? 'bg-purple-500 shadow-[0_0_6px_rgba(168,85,247,0.6)]' : 'bg-cyan-500 shadow-[0_0_6px_rgba(6,182,212,0.6)]')} />
              <span className="text-xs uppercase tracking-widest text-white font-medium">
                {isActivityMode ? 'Activity' : 'Autoplay'}
              </span>
              {isActivityMode && currentPhase !== 'idle' && (
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] font-mono',
                  currentPhase === 'complete'
                    ? 'bg-green-500/20 text-green-400'
                    : currentPhase === 'error'
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-purple-500/20 text-purple-400'
                )}>
                  {currentPhase.toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {isActivityMode && (
                <button
                  onClick={() => setIsExpanded(prev => !prev)}
                  className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Body - switches based on mode */}
          {isActivityMode ? (
            (currentPhase === 'complete' || currentPhase === 'error') && !isRunning ? (
              <CompletionSummary
                sketchProgress={sketchProgress}
                gameplayProgress={gameplayProgress}
                posterSelected={posterSelected}
                hudGenerated={hudGenerated}
                hudTarget={hudTarget}
                error={error}
                errorPhase={errorPhase}
                textEvents={textEvents}
                imageEvents={imageEvents}
                onRetry={onRetry}
                isExpanded={isExpanded}
              />
            ) : (
              <ActivityModeContent
                currentPhase={currentPhase}
                sketchProgress={sketchProgress}
                gameplayProgress={gameplayProgress}
                posterSelected={posterSelected}
                hudGenerated={hudGenerated}
                hudTarget={hudTarget}
                error={error}
                textEvents={textEvents}
                imageEvents={imageEvents}
                currentIteration={currentIteration}
                maxIterations={maxIterations}
                activePrompts={activePrompts}
                activeImages={activeImages}
                currentImageInPhase={currentImageInPhase}
                phaseTarget={phaseTarget}
                singlePhaseStatus={singlePhaseStatus}
                isExpanded={isExpanded}
              />
            )
          ) : (
            <SetupModeContent
              config={config}
              setConfig={setConfig}
              hasContent={hasContent}
              visionSentence={visionSentence}
              onVisionSentenceChange={onVisionSentenceChange ?? (() => {})}
              isRunning={isRunning}
              isProcessingBreakdown={isProcessingBreakdown}
              breakdownError={breakdownError}
              setBreakdownError={setBreakdownError}
              hasGameplay={hasGameplay}
              activePreset={activePreset}
              onPresetSelect={handlePresetSelect}
            />
          )}

          {/* Footer - compact */}
          <div className="px-3 py-2 border-t border-slate-800/50 bg-black/40 flex items-center justify-between shrink-0">
            {isActivityMode ? (
              <>
                <div className="flex items-center gap-2">
                  {onStop && isRunning && currentPhase !== 'complete' && currentPhase !== 'error' && (
                    <button
                      onClick={onStop}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs
                        border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Square size={10} />
                      Stop
                    </button>
                  )}
                  {(currentPhase === 'complete' || currentPhase === 'error') && (
                    <>
                      {onRetry && currentPhase === 'error' && (
                        <button
                          onClick={onRetry}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs
                            border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                        >
                          <RotateCcw size={10} />
                          Retry from {errorPhase || 'here'}
                        </button>
                      )}
                      {onReset && (
                        <button
                          onClick={() => {
                            onReset();
                            setJustStarted(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs
                            border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 transition-colors"
                        >
                          <Play size={10} />
                          Run Again
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs
                          border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors"
                      >
                        Close
                      </button>
                    </>
                  )}
                </div>
                {isRunning && (
                  <div className="text-[10px] text-slate-500 font-mono">
                    {sketchProgress.saved + gameplayProgress.saved}/{sketchProgress.target + gameplayProgress.target} saved
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <button
                    onClick={onClose}
                    disabled={isProcessingBreakdown}
                    className="px-3 py-1.5 rounded border text-xs border-slate-700 text-slate-400 hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <span className="font-mono text-xs text-cyan-400">{totalImages} <span className="text-slate-500">images</span></span>
                </div>

                <button
                  onClick={handleStart}
                  disabled={!canStart || totalImages === 0 || isRunning || isProcessingBreakdown || !canProceed}
                  title={
                    !canStart && canStartReason ? canStartReason :
                    totalImages === 0 ? 'Add at least one image' :
                    !canProceed ? 'Enter a core idea to start' :
                    undefined
                  }
                  className={cn('flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-medium transition-all',
                    !canStart || totalImages === 0 || isRunning || isProcessingBreakdown || !canProceed
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:brightness-110 shadow-lg shadow-cyan-500/20'
                  )}
                >
                  {isProcessingBreakdown ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Play size={12} />
                      {!hasContent && hasPromptIdea ? 'Analyze & Start' : 'Start'}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body,
  );
}

export default AutoplaySetupModal;
