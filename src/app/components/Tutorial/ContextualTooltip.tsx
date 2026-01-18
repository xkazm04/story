'use client';

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Lightbulb, Info } from 'lucide-react';
import { clsx } from 'clsx';
import { IconButton } from '@/app/components/UI/Button';

export type TooltipTrigger = 'hover' | 'click' | 'icon';
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TooltipVariant = 'info' | 'tip' | 'help';

interface ContextualTooltipProps {
  /** Content to show in the tooltip */
  content: ReactNode;
  /** Optional title for the tooltip */
  title?: string;
  /** How the tooltip is triggered */
  trigger?: TooltipTrigger;
  /** Position relative to trigger element */
  placement?: TooltipPlacement;
  /** Visual style variant */
  variant?: TooltipVariant;
  /** Children to wrap (trigger element) */
  children?: ReactNode;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Delay before showing (ms) */
  showDelay?: number;
  /** Delay before hiding (ms) */
  hideDelay?: number;
  /** Additional class names */
  className?: string;
  /** Whether to show dismiss button */
  dismissible?: boolean;
  /** ID for localStorage persistence of dismissed state */
  persistDismiss?: string;
}

const variantStyles: Record<TooltipVariant, { icon: ReactNode; border: string; bg: string }> = {
  info: {
    icon: <Info className="w-4 h-4 text-blue-400" />,
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
  },
  tip: {
    icon: <Lightbulb className="w-4 h-4 text-amber-400" />,
    border: 'border-amber-500/30',
    bg: 'bg-amber-500/10',
  },
  help: {
    icon: <HelpCircle className="w-4 h-4 text-cyan-400" />,
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
  },
};

const DISMISSED_KEY_PREFIX = 'story-tooltip-dismissed-';

/**
 * ContextualTooltip - Contextual help display component
 *
 * Provides context-sensitive help with multiple trigger modes
 * and visual variants for different types of information.
 */
export function ContextualTooltip({
  content,
  title,
  trigger = 'hover',
  placement = 'top',
  variant = 'info',
  children,
  disabled = false,
  showDelay = 200,
  hideDelay = 100,
  className,
  dismissible = false,
  persistDismiss,
}: ContextualTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Check for persisted dismiss state
  useEffect(() => {
    if (persistDismiss && typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(DISMISSED_KEY_PREFIX + persistDismiss);
      if (dismissed === 'true') {
        setIsDismissed(true);
      }
    }
  }, [persistDismiss]);

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const padding = 8;

    let top = 0;
    let left = 0;

    switch (placement) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - padding;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + padding;
        left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
        break;
      case 'left':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.left - tooltipRect.width - padding;
        break;
      case 'right':
        top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
        left = triggerRect.right + padding;
        break;
    }

    // Clamp to viewport
    const viewportPadding = 8;
    top = Math.max(viewportPadding, Math.min(top, window.innerHeight - tooltipRect.height - viewportPadding));
    left = Math.max(viewportPadding, Math.min(left, window.innerWidth - tooltipRect.width - viewportPadding));

    setPosition({ top, left });
  }, [placement]);

  useEffect(() => {
    if (isVisible) {
      calculatePosition();
      window.addEventListener('scroll', calculatePosition, true);
      window.addEventListener('resize', calculatePosition);
      return () => {
        window.removeEventListener('scroll', calculatePosition, true);
        window.removeEventListener('resize', calculatePosition);
      };
    }
  }, [isVisible, calculatePosition]);

  const show = useCallback(() => {
    if (disabled || isDismissed) return;
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    showTimeoutRef.current = setTimeout(() => setIsVisible(true), showDelay);
  }, [disabled, isDismissed, showDelay]);

  const hide = useCallback(() => {
    if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => setIsVisible(false), hideDelay);
  }, [hideDelay]);

  const toggle = useCallback(() => {
    if (disabled || isDismissed) return;
    setIsVisible(prev => !prev);
  }, [disabled, isDismissed]);

  const dismiss = useCallback(() => {
    setIsVisible(false);
    setIsDismissed(true);
    if (persistDismiss && typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY_PREFIX + persistDismiss, 'true');
    }
  }, [persistDismiss]);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (showTimeoutRef.current) clearTimeout(showTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const variantStyle = variantStyles[variant];

  const triggerElement = trigger === 'icon' ? (
    <button
      type="button"
      onClick={toggle}
      className={clsx(
        'inline-flex items-center justify-center w-5 h-5 rounded-full',
        'text-slate-400 hover:text-slate-200 transition-colors',
        variantStyle.bg,
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60'
      )}
      aria-label="Show help"
    >
      {variantStyle.icon}
    </button>
  ) : (
    children
  );

  const hoverProps = trigger === 'hover' ? {
    onMouseEnter: show,
    onMouseLeave: hide,
  } : {};

  const clickProps = trigger === 'click' ? {
    onClick: toggle,
  } : {};

  if (isDismissed && trigger === 'icon') {
    return null;
  }

  return (
    <>
      <div
        ref={triggerRef}
        className={clsx('inline-flex', className)}
        {...hoverProps}
        {...clickProps}
      >
        {triggerElement}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial={{ opacity: 0, scale: 0.95, y: placement === 'top' ? 4 : placement === 'bottom' ? -4 : 0 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={clsx(
              'fixed z-[9998] max-w-xs p-3 rounded-lg',
              'bg-slate-900/95 border backdrop-blur-sm shadow-xl shadow-black/30',
              variantStyle.border
            )}
            style={{ top: position.top, left: position.left }}
            onMouseEnter={trigger === 'hover' ? show : undefined}
            onMouseLeave={trigger === 'hover' ? hide : undefined}
            role="tooltip"
            data-testid="contextual-tooltip"
          >
            {/* Header */}
            {(title || dismissible) && (
              <div className="flex items-start justify-between gap-2 mb-2">
                {title && (
                  <div className="flex items-center gap-2">
                    <div className={clsx('p-1 rounded', variantStyle.bg)}>
                      {variantStyle.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-100">
                      {title}
                    </span>
                  </div>
                )}
                {dismissible && (
                  <IconButton
                    icon={<X className="w-3 h-3" />}
                    size="xs"
                    variant="ghost"
                    onClick={dismiss}
                    aria-label="Dismiss"
                    className="-mr-1 -mt-1"
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className={clsx(
              'text-sm text-slate-300 leading-relaxed',
              !title && 'flex items-start gap-2'
            )}>
              {!title && (
                <span className="shrink-0 mt-0.5">
                  {variantStyle.icon}
                </span>
              )}
              <span>{content}</span>
            </div>

            {/* Arrow */}
            <div
              className={clsx(
                'absolute w-2 h-2 rotate-45 bg-slate-900/95 border',
                variantStyle.border,
                placement === 'top' && 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0',
                placement === 'bottom' && 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0',
                placement === 'left' && 'right-[-5px] top-1/2 -translate-y-1/2 border-t-0 border-l-0',
                placement === 'right' && 'left-[-5px] top-1/2 -translate-y-1/2 border-b-0 border-r-0'
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * HelpIcon - Standalone help icon that shows a tooltip
 */
interface HelpIconProps {
  content: ReactNode;
  title?: string;
  variant?: TooltipVariant;
  placement?: TooltipPlacement;
  className?: string;
}

export function HelpIcon({
  content,
  title,
  variant = 'help',
  placement = 'top',
  className,
}: HelpIconProps) {
  return (
    <ContextualTooltip
      content={content}
      title={title}
      variant={variant}
      placement={placement}
      trigger="icon"
      className={className}
    />
  );
}

export default ContextualTooltip;
