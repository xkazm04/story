/**
 * Viewport - Main character preview area
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ZoomIn, ZoomOut, Maximize2, User, Play, Pause,
  Download, Copy, Sparkles,
} from 'lucide-react';
import { useCreator } from '../../context/CreatorContext';
import { Tooltip } from '../common/Tooltip';

interface ViewportProps {
  onGenerate: () => void;
}

export function Viewport({ onGenerate }: ViewportProps) {
  const { state, setZoom } = useCreator();
  const { ui } = state;
  const [isPlaying, setIsPlaying] = React.useState(false);

  return (
    <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-[#0c0c0e] to-[#050506] overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-slate-700/5 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-amber-900/5 rounded-full blur-[60px]" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Zoom Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-lg p-1.5 border border-white/10">
        <button
          onClick={() => setZoom(Math.max(25, ui.zoom - 25))}
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-slate-400 w-12 text-center font-mono">{ui.zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, ui.zoom + 25))}
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ZoomIn size={16} />
        </button>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => setZoom(100)}
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* Character Preview */}
      <motion.div
        className="relative select-none"
        style={{
          transform: `scale(${ui.zoom / 100})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative h-[500px] aspect-[3/4] rounded-2xl overflow-hidden">
          {/* Character Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800/30 to-slate-900/50 border border-white/5 flex items-center justify-center">
            <div className="text-center">
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <User className="w-28 h-28 text-slate-700/50 mx-auto mb-4" />
              </motion.div>
              <p className="text-slate-600 text-sm font-medium">Character Preview</p>
              <p className="text-slate-700 text-xs mt-1">Select options to customize</p>
            </div>
          </div>

          {/* Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Corner Markers */}
          <div className="absolute top-3 left-3 w-4 h-4 border-l-2 border-t-2 border-amber-500/30 rounded-tl" />
          <div className="absolute top-3 right-3 w-4 h-4 border-r-2 border-t-2 border-amber-500/30 rounded-tr" />
          <div className="absolute bottom-3 left-3 w-4 h-4 border-l-2 border-b-2 border-amber-500/30 rounded-bl" />
          <div className="absolute bottom-3 right-3 w-4 h-4 border-r-2 border-b-2 border-amber-500/30 rounded-br" />
        </div>

        {/* Preview Controls */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-all"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <span className="text-xs text-slate-400">Rotate Preview</span>
        </div>
      </motion.div>

      {/* Quick Actions - Bottom Left */}
      <div className="absolute bottom-4 left-4 flex flex-col gap-2">
        <Tooltip content="Download Assets" position="right">
          <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-black/60 backdrop-blur-md text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all">
            <Download size={16} />
          </button>
        </Tooltip>
        <Tooltip content="Copy to Clipboard" position="right">
          <button className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-black/60 backdrop-blur-md text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all">
            <Copy size={16} />
          </button>
        </Tooltip>
      </div>

      {/* Floating Generate Button */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 bottom-20 z-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onGenerate}
          disabled={ui.isGenerating}
          className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full text-sm font-semibold text-white flex items-center gap-2 hover:from-amber-500 hover:to-orange-500 transition-all shadow-xl shadow-amber-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Sparkles size={16} />
          Generate
        </button>
      </motion.div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-md border-t border-white/5 flex items-center justify-between px-4 text-sm z-10">
        <div className="flex items-center gap-6 text-slate-500">
          <span>Zoom: <span className="text-slate-300">{ui.zoom}%</span></span>
          <span>Category: <span className="text-slate-300">{ui.activeCategory || 'None'}</span></span>
        </div>
        <span className="text-slate-600">v0.2.0-alpha</span>
      </div>
    </div>
  );
}
