/**
 * GlassPanel - Glass morphism container component
 */

import React from 'react';

interface GlassPanelProps {
  children: React.ReactNode;
  className?: string;
}

export function GlassPanel({ children, className = '' }: GlassPanelProps) {
  return (
    <div
      className={`bg-[#0a0a0a]/70 backdrop-blur-2xl border border-white/[0.06] shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}
