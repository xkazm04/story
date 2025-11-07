'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { IconButton } from './Button';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'sm' | 'md' | 'lg' | 'xl';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  side?: DrawerSide;
  size?: DrawerSize;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  closeOnBackdropClick?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const sizeClasses: Record<DrawerSide, Record<DrawerSize, string>> = {
  left: {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[42rem]',
  },
  right: {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[32rem]',
    xl: 'w-[42rem]',
  },
  top: {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
    xl: 'h-[32rem]',
  },
  bottom: {
    sm: 'h-64',
    md: 'h-80',
    lg: 'h-96',
    xl: 'h-[32rem]',
  },
};

const positionClasses: Record<DrawerSide, string> = {
  left: 'left-0 top-0 bottom-0',
  right: 'right-0 top-0 bottom-0',
  top: 'top-0 left-0 right-0',
  bottom: 'bottom-0 left-0 right-0',
};

const borderClasses: Record<DrawerSide, string> = {
  left: 'border-r-2',
  right: 'border-l-2',
  top: 'border-b-2',
  bottom: 'border-t-2',
};

const animationVariants: Record<DrawerSide, any> = {
  left: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
  },
  right: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
  },
  top: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
  },
  bottom: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
  },
};

export function Drawer({
  isOpen,
  onClose,
  side = 'right',
  size = 'md',
  title,
  subtitle,
  icon,
  children,
  footer,
  closeOnBackdropClick = true,
  showCloseButton = true,
  className,
}: DrawerProps) {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const isVertical = side === 'left' || side === 'right';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeOnBackdropClick ? onClose : undefined}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          />

          {/* Drawer Container */}
          <motion.div
            {...animationVariants[side]}
            transition={{ type: 'spring', damping: 30, stiffness: 250, mass: 0.8 }}
            className={clsx(
              'fixed z-50',
              'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900',
              'border-cyan-500/30 shadow-2xl shadow-cyan-500/20',
              'flex flex-col',
              positionClasses[side],
              borderClasses[side],
              sizeClasses[side][size],
              isVertical ? 'overflow-y-auto' : 'overflow-x-auto',
              className
            )}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50 flex-shrink-0">
                <div className="flex items-center gap-2.5">
                  {icon && (
                    <div className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <span className="w-4 h-4 text-cyan-400 flex items-center justify-center">
                        {icon}
                      </span>
                    </div>
                  )}
                  {title && (
                    <div>
                      <h2 className="text-base font-semibold text-white">{title}</h2>
                      {subtitle && (
                        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
                      )}
                    </div>
                  )}
                </div>
                {showCloseButton && (
                  <IconButton
                    icon={<X />}
                    size="sm"
                    variant="ghost"
                    onClick={onClose}
                    aria-label="Close drawer"
                  />
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 p-4 overflow-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-700/50 bg-gray-800/50 flex-shrink-0">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
