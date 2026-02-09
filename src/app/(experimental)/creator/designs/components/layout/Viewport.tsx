'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, User } from 'lucide-react';
import { useCreatorUIStore } from '../../store/creatorUIStore';

interface ViewportProps {
  onGenerate: () => void;
}

export function Viewport({ onGenerate: _onGenerate }: ViewportProps) {
  const zoom = useCreatorUIStore((s) => s.zoom);
  const setZoom = useCreatorUIStore((s) => s.setZoom);

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
          onClick={() => setZoom(Math.max(25, zoom - 25))}
          className="w-8 h-8 rounded-md flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <ZoomOut size={16} />
        </button>
        <span className="text-sm text-slate-400 w-12 text-center font-mono">{zoom}%</span>
        <button
          onClick={() => setZoom(Math.min(200, zoom + 25))}
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
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'center center',
        }}
      >
        <div className="relative h-[500px] aspect-[3/4] rounded-2xl overflow-hidden">
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
      </motion.div>
    </div>
  );
}
