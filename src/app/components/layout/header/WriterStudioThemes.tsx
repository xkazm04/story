'use client';

/**
 * WriterStudioThemes - Clean Manuscript theme for the writer studio
 *
 * Design Philosophy:
 * - Sans-serif fonts with monospace accents
 * - Notebook ruled lines + dot grid background patterns
 * - Cyan accent colors on slate/zinc backgrounds
 * - Rounded elements (rounded-md, rounded-lg)
 * - Clean, sharp UI with subtle depth
 */

import React from 'react';
import { PenTool, Type } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WriterTheme = 'modern';

interface ThemeConfig {
  id: WriterTheme;
  name: string;
  description: string;
  bgClass: string;
  accentClass: string;
  textClass: string;
}

// Clean Manuscript: Notebook with clean lines and dot grid
const ManuscriptDecorations = () => (
  <>
    {/* Notebook ruled lines */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.03]" preserveAspectRatio="none">
      <defs>
        <pattern id="notebook-lines-bg" width="100%" height="20" patternUnits="userSpaceOnUse">
          <line x1="0" y1="19" x2="100%" y2="19" stroke="#0891b2" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#notebook-lines-bg)" />
    </svg>

    {/* Dot grid overlay */}
    <svg className="absolute inset-0 w-full h-full opacity-[0.02]" preserveAspectRatio="none">
      <defs>
        <pattern id="dot-grid-bg" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.5" fill="#0891b2" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid-bg)" />
    </svg>

    {/* Margin line accent */}
    <div className="absolute left-[8%] top-0 bottom-0 w-px bg-cyan-500/[0.05]" />

    {/* Subtle typography elements */}
    <PenTool className="absolute top-4 right-[10%] w-5 h-5 text-cyan-500/[0.06]" />
    <Type className="absolute bottom-5 left-[15%] w-4 h-4 text-slate-500/[0.04]" />

    {/* Clean gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-slate-950/30 pointer-events-none" />
  </>
);

// Theme configuration
const THEME_CONFIG: ThemeConfig = {
  id: 'modern',
  name: 'Clean Manuscript',
  description: 'Sans-serif with notebook lines and dot grid',
  bgClass: 'bg-gradient-to-br from-gray-950 via-zinc-950 to-gray-950',
  accentClass: 'text-cyan-400',
  textClass: 'text-slate-100',
};

// Export the theme background component for use in AppShell
export const WriterStudioBackground: React.FC<{ theme?: WriterTheme }> = () => {
  return (
    <div className={cn('fixed inset-0 -z-10', THEME_CONFIG.bgClass)}>
      <ManuscriptDecorations />
    </div>
  );
};

// Export theme config for external use
export const getThemeConfig = () => THEME_CONFIG;

// Design tokens for consistent styling across components
export const designTokens = {
  // Colors
  accent: {
    primary: 'cyan-500',
    hover: 'cyan-400',
    muted: 'cyan-600',
    bg: 'cyan-500/10',
    border: 'cyan-500/30',
  },
  surface: {
    base: 'slate-950',
    elevated: 'slate-900',
    hover: 'slate-800',
    border: 'slate-700',
    borderSubtle: 'slate-800',
  },
  text: {
    primary: 'slate-100',
    secondary: 'slate-300',
    muted: 'slate-400',
    accent: 'cyan-400',
  },

  // Typography
  font: {
    primary: 'font-sans',
    mono: 'font-mono',
    heading: 'font-sans font-semibold',
    label: 'font-mono text-xs uppercase tracking-wider',
  },

  // Spacing & Radius
  radius: {
    sm: 'rounded',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  },

  // Common component classes
  components: {
    card: 'bg-slate-900/80 border border-slate-700/50 rounded-lg backdrop-blur-sm',
    cardHover: 'hover:bg-slate-800/80 hover:border-slate-600/50',
    input: 'bg-slate-900/50 border border-slate-700/50 rounded-md text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20',
    button: {
      primary: 'bg-cyan-600 hover:bg-cyan-500 text-white rounded-md font-medium shadow-sm',
      secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-md border border-slate-600/50',
      ghost: 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-md',
    },
    badge: 'bg-slate-800/80 text-slate-300 border border-slate-700/50 rounded-md font-mono text-xs',
    badgeAccent: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 rounded-md font-mono text-xs',
  },
};

export default WriterStudioBackground;
