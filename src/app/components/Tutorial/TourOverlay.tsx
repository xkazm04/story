'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';
import { clsx } from 'clsx';
import { useTour, useTargetPosition } from '@/lib/tutorial';
import { Button, IconButton } from '@/app/components/UI/Button';

interface TourOverlayProps {
  className?: string;
}

interface TooltipPosition {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  transformOrigin: string;
}

/**
 * TourOverlay - Visual overlay for guided tours
 *
 * Renders a spotlight effect on target elements with a tooltip
 * containing step information and navigation controls.
 */
export function TourOverlay({ className }: TourOverlayProps) {
  const {
    isRunning,
    activeTour,
    currentStepIndex,
    nextStep,
    prevStep,
    stopTour,
    getCurrentStep,
  } = useTour();

  const targetPosition = useTargetPosition();
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

  const currentStep = getCurrentStep();
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = activeTour ? currentStepIndex === activeTour.steps.length - 1 : false;
  const totalSteps = activeTour?.steps.length ?? 0;

  // Calculate tooltip position based on target and placement
  const calculateTooltipPosition = useCallback(() => {
    if (!targetPosition || !currentStep) {
      // Center tooltip if no target
      return {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        transformOrigin: 'center',
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Approximate

    const placement = currentStep.placement || 'bottom';

    let position: TooltipPosition = { transformOrigin: 'top left' };

    switch (placement) {
      case 'top':
        position = {
          bottom: window.innerHeight - targetPosition.top + padding,
          left: targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2,
          transformOrigin: 'bottom center',
        };
        break;
      case 'bottom':
        position = {
          top: targetPosition.bottom + padding,
          left: targetPosition.left + targetPosition.width / 2 - tooltipWidth / 2,
          transformOrigin: 'top center',
        };
        break;
      case 'left':
        position = {
          top: targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2,
          right: window.innerWidth - targetPosition.left + padding,
          transformOrigin: 'right center',
        };
        break;
      case 'right':
        position = {
          top: targetPosition.top + targetPosition.height / 2 - tooltipHeight / 2,
          left: targetPosition.right + padding,
          transformOrigin: 'left center',
        };
        break;
      case 'center':
        position = {
          top: window.innerHeight / 2 - tooltipHeight / 2,
          left: window.innerWidth / 2 - tooltipWidth / 2,
          transformOrigin: 'center',
        };
        break;
    }

    // Clamp to viewport
    if (position.left !== undefined) {
      position.left = Math.max(padding, Math.min(position.left, window.innerWidth - tooltipWidth - padding));
    }
    if (position.top !== undefined) {
      position.top = Math.max(padding, Math.min(position.top, window.innerHeight - tooltipHeight - padding));
    }

    return position;
  }, [targetPosition, currentStep]);

  useEffect(() => {
    if (isRunning) {
      setTooltipPosition(calculateTooltipPosition());
    }
  }, [isRunning, calculateTooltipPosition]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isRunning) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case 'Enter':
          e.preventDefault();
          nextStep();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevStep();
          break;
        case 'Escape':
          e.preventDefault();
          stopTour(true);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, nextStep, prevStep, stopTour]);

  if (!isRunning || !currentStep) return null;

  const spotlightPadding = 8;
  const spotlight = targetPosition
    ? {
        x: targetPosition.left - spotlightPadding,
        y: targetPosition.top - spotlightPadding,
        width: targetPosition.width + spotlightPadding * 2,
        height: targetPosition.height + spotlightPadding * 2,
      }
    : null;

  return (
    <AnimatePresence>
      <div
        className={clsx('fixed inset-0 z-[9999]', className)}
        data-testid="tour-overlay"
      >
        {/* Dark overlay with spotlight cutout */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 1 }}
        >
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {spotlight && currentStep.highlight !== false && (
                <motion.rect
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  x={spotlight.x}
                  y={spotlight.y}
                  width={spotlight.width}
                  height={spotlight.height}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.75)"
            mask="url(#spotlight-mask)"
          />
        </svg>

        {/* Spotlight border glow */}
        {spotlight && currentStep.highlight !== false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute rounded-lg ring-2 ring-cyan-400/50 ring-offset-2 ring-offset-transparent pointer-events-none"
            style={{
              left: spotlight.x,
              top: spotlight.y,
              width: spotlight.width,
              height: spotlight.height,
              zIndex: 2,
              boxShadow: '0 0 20px rgba(34, 211, 238, 0.3)',
            }}
          />
        )}

        {/* Click blocker (except on allowed interaction areas) */}
        {!currentStep.allowInteraction && (
          <div
            className="absolute inset-0"
            style={{ zIndex: 3 }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Tooltip */}
        {tooltipPosition && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute w-80 bg-slate-900/95 border border-slate-700/80 rounded-xl shadow-2xl shadow-black/50 backdrop-blur-sm"
            style={{
              ...tooltipPosition,
              zIndex: 10,
            }}
            data-testid="tour-tooltip"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs text-slate-400 font-medium">
                  Step {currentStepIndex + 1} of {totalSteps}
                </span>
              </div>
              <IconButton
                icon={<X className="w-4 h-4" />}
                size="xs"
                variant="ghost"
                onClick={() => stopTour(true)}
                aria-label="Close tour"
              />
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-slate-50 mb-2">
                {currentStep.title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                {currentStep.content}
              </p>
            </div>

            {/* Progress bar */}
            <div className="px-4 pb-2">
              <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentStepIndex + 1) / totalSteps) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50 bg-slate-900/50 rounded-b-xl">
              <div className="flex gap-2">
                {currentStep.showSkip !== false && !isLastStep && (
                  <Button
                    size="xs"
                    variant="ghost"
                    onClick={() => stopTour(true)}
                    icon={<SkipForward className="w-3 h-3" />}
                  >
                    Skip tour
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                {!isFirstStep && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => prevStep()}
                    icon={<ChevronLeft className="w-4 h-4" />}
                  >
                    {currentStep.prevLabel || 'Back'}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => nextStep()}
                  icon={<ChevronRight className="w-4 h-4" />}
                  iconPosition="right"
                >
                  {isLastStep
                    ? 'Finish'
                    : currentStep.nextLabel || 'Next'}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AnimatePresence>
  );
}

export default TourOverlay;
