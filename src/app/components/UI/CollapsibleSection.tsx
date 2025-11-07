'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, LucideIcon } from 'lucide-react';
import { ReactNode, useState } from 'react';
import ColoredBorder from './ColoredBorder';

interface CollapsibleSectionProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  borderColor?: "blue" | "green" | "purple" | "yellow" | "pink" | "orange" | "gray";
  badge?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  compact?: boolean;
  className?: string;
}

export function CollapsibleSection({
  title,
  icon: Icon,
  iconColor = "text-blue-400",
  borderColor = "blue",
  badge,
  children,
  defaultOpen = false,
  compact = false,
  className = "",
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`relative group bg-gray-850/50 backdrop-blur-sm rounded-lg overflow-hidden ${className}`}>
      <ColoredBorder color={borderColor} />
      
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between hover:bg-gray-800/50 transition-colors ${
          compact ? 'px-3 py-2' : 'px-4 py-3'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {Icon && <Icon className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} ${iconColor}`} />}
          <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold text-gray-100`}>
            {title}
          </h3>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700/50 text-gray-400">
              {badge}
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? (
            <ChevronDown className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
          ) : (
            <ChevronRight className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-gray-400`} />
          )}
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`border-t border-gray-700/30 ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

