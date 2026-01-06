/**
 * Tooltip - Hover tooltip component
 */

import React from 'react';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const positions = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
};

export function Tooltip({ children, content, position = 'top' }: TooltipProps) {
  return (
    <div className="relative group contents-wrapper">
      {children}
      <div
        className={`absolute ${positions[position]} px-3 py-1.5 bg-black/90 text-sm text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 z-50`}
      >
        {content}
      </div>
    </div>
  );
}

// Note: parent element should have 'relative' positioning for tooltip to display correctly
