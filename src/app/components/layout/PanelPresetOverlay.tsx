'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PANEL_PRESETS, PanelPreset } from '@/app/types/PanelPreset';
import { Layout } from 'lucide-react';

interface PanelPresetOverlayProps {
  isVisible: boolean;
  onPresetSelect: (preset: PanelPreset) => void;
}

/**
 * PanelPresetOverlay - Animated overlay showing preset panel layouts
 * Appears when user is dragging a panel divider, provides visual feedback
 * and allows quick snap-to-preset functionality
 */
export default function PanelPresetOverlay({
  isVisible,
  onPresetSelect,
}: PanelPresetOverlayProps) {
  const [hoveredPreset, setHoveredPreset] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-40 pointer-events-none flex items-center justify-center"
          data-testid="panel-preset-overlay"
        >
          {/* Backdrop with blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Preset Cards Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 pointer-events-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                <Layout className="w-5 h-5 text-cyan-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Choose Layout Preset
              </h3>
            </div>

            {/* Preset Cards Grid */}
            <div className="grid grid-cols-3 gap-4">
              {PANEL_PRESETS.map((preset) => {
                const isHovered = hoveredPreset === preset.id;

                return (
                  <motion.button
                    key={preset.id}
                    data-testid={`preset-${preset.id}`}
                    onClick={() => onPresetSelect(preset)}
                    onMouseEnter={() => setHoveredPreset(preset.id)}
                    onMouseLeave={() => setHoveredPreset(null)}
                    whileHover={{ scale: 1.05, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-40 h-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-2 border-gray-700/50 hover:border-cyan-500/50 rounded-xl shadow-lg transition-all overflow-hidden"
                  >
                    {/* Hover glow effect */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 pointer-events-none"
                        />
                      )}
                    </AnimatePresence>

                    {/* Bounce animation on hover */}
                    <motion.div
                      animate={
                        isHovered
                          ? {
                              y: [0, -8, 0],
                              transition: {
                                duration: 0.6,
                                repeat: Infinity,
                                ease: 'easeInOut',
                              },
                            }
                          : { y: 0 }
                      }
                      className="h-full flex flex-col items-center justify-center p-3"
                    >
                      {/* Visual representation of preset */}
                      <div className="flex items-stretch gap-1 mb-3 h-12">
                        <PresetBar
                          width={preset.sizes.left}
                          isActive={isHovered}
                        />
                        <PresetBar
                          width={preset.sizes.center}
                          isActive={isHovered}
                          isCenter
                        />
                        <PresetBar
                          width={preset.sizes.right}
                          isActive={isHovered}
                        />
                      </div>

                      {/* Preset name */}
                      <h4 className="text-sm font-semibold text-white mb-1">
                        {preset.name}
                      </h4>

                      {/* Size indicator */}
                      <p className="text-xs text-gray-400 font-mono">
                        {preset.sizes.left}/{preset.sizes.center}/
                        {preset.sizes.right}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-gray-500 mt-1 text-center">
                        {preset.description}
                      </p>
                    </motion.div>
                  </motion.button>
                );
              })}
            </div>

            {/* Hint text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-center text-sm text-gray-400 mt-4"
            >
              Click a preset to snap panels, or continue dragging to set custom
              sizes
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface PresetBarProps {
  width: number;
  isActive: boolean;
  isCenter?: boolean;
}

/**
 * Visual bar representation of panel size in preset preview
 */
function PresetBar({ width, isActive, isCenter }: PresetBarProps) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.1 : 1,
        opacity: isActive ? 1 : 0.7,
      }}
      transition={{ duration: 0.2 }}
      className={`rounded ${
        isCenter
          ? 'bg-gradient-to-br from-cyan-500 to-blue-500'
          : 'bg-gray-600'
      }`}
      style={{
        width: `${width}%`,
        minWidth: '8px',
      }}
    />
  );
}
