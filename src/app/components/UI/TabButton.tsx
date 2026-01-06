'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { focusRing } from '@/app/utils/focusRing';

interface TabButtonProps {
  id: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick: () => void;
  layoutId?: string;
  activeColor?: string;
  inactiveColor?: string;
  'data-testid'?: string;
}

export const TabButton: React.FC<TabButtonProps> = ({
  id,
  label,
  icon: Icon,
  isActive,
  onClick,
  layoutId = 'activeTab',
  activeColor = 'bg-cyan-600/20 border border-cyan-500/40 text-slate-50',
  inactiveColor = 'bg-slate-900/70 text-slate-400 hover:bg-slate-900 hover:text-slate-100 border border-slate-800',
  'data-testid': dataTestId,
}) => {
  return (
    <button
      key={id}
      onClick={onClick}
      className={`
        relative flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
        transition-all duration-200
        ${isActive ? activeColor : inactiveColor}
      `}
      data-testid={dataTestId || `tab-${id}`}
    >
      <Icon className="w-4 h-4" />
      <span className="tracking-tight">{label}</span>

      {isActive && (
        <motion.div
          layoutId={layoutId}
          className={`absolute inset-0 rounded-lg -z-10`}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
        />
      )}
    </button>
  );
};
