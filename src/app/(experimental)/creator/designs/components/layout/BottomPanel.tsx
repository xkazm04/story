/**
 * BottomPanel - Assets, History, and Layers tabs
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderOpen, History, Layers, ChevronUp, Plus,
  Image, Wand2, Copy, Trash2,
} from 'lucide-react';

const RECENT_ASSETS = [
  { id: 1, type: 'hair', name: 'Long Wavy', timestamp: '2m ago' },
  { id: 2, type: 'eyes', name: 'Almond Blue', timestamp: '5m ago' },
  { id: 3, type: 'outfit', name: 'Royal Armor', timestamp: '12m ago' },
  { id: 4, type: 'accessory', name: 'Crown', timestamp: '15m ago' },
];

const HISTORY_ITEMS = [
  { id: 1, action: 'Changed hair color', timestamp: '1m ago' },
  { id: 2, action: 'Applied preset: Warrior', timestamp: '3m ago' },
  { id: 3, action: 'Adjusted eye shape', timestamp: '5m ago' },
  { id: 4, action: 'Changed skin tone', timestamp: '8m ago' },
];

const LAYER_NAMES = ['Background', 'Body', 'Clothing', 'Hair', 'Accessories', 'Effects'];

type TabId = 'assets' | 'history' | 'layers';

export function BottomPanel() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>('assets');

  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? 180 : 40,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      }}
      className="border-t border-white/[0.04] bg-[#080808]/90 backdrop-blur-xl shrink-0"
    >
      {/* Panel Header */}
      <div className="h-10 flex items-center justify-between px-4 border-b border-white/[0.04]">
        <div className="flex items-center gap-4">
          {[
            { id: 'assets' as const, label: 'Assets', icon: FolderOpen },
            { id: 'history' as const, label: 'History', icon: History },
            { id: 'layers' as const, label: 'Layers', icon: Layers },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsOpen(true);
              }}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                activeTab === tab.id && isOpen
                  ? 'text-amber-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
            <ChevronUp size={16} />
          </motion.div>
        </button>
      </div>

      {/* Panel Content */}
      <AnimatePresence mode="wait">
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-[140px] p-3 overflow-hidden"
          >
            {/* Assets Tab */}
            {activeTab === 'assets' && (
              <div className="h-full flex gap-4">
                {/* Recent Assets */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs uppercase tracking-wider text-slate-500">Recent Assets</span>
                    <button className="text-xs text-amber-500 hover:text-amber-400">Browse All</button>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {RECENT_ASSETS.map((asset) => (
                      <div
                        key={asset.id}
                        className="shrink-0 w-24 p-2 bg-white/[0.03] rounded-lg border border-white/[0.04] hover:border-amber-500/30 hover:bg-white/[0.05] transition-all cursor-pointer group"
                      >
                        <div className="w-full aspect-square rounded-md bg-gradient-to-br from-slate-800 to-slate-900 mb-2 flex items-center justify-center">
                          <Image size={20} className="text-slate-600 group-hover:text-amber-400 transition-colors" />
                        </div>
                        <p className="text-xs text-slate-300 truncate">{asset.name}</p>
                        <p className="text-xs text-slate-600">{asset.timestamp}</p>
                      </div>
                    ))}
                    <button className="shrink-0 w-24 aspect-[4/5] rounded-lg border-2 border-dashed border-white/10 hover:border-amber-500/30 flex flex-col items-center justify-center text-slate-600 hover:text-amber-400 transition-all">
                      <Plus size={20} />
                      <span className="text-xs mt-1">Import</span>
                    </button>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-px bg-white/[0.06]" />

                {/* Quick Actions */}
                <div className="w-52">
                  <span className="text-xs uppercase tracking-wider text-slate-500 block mb-2">Quick Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: Wand2, label: 'AI Generate' },
                      { icon: Copy, label: 'Duplicate' },
                      { icon: Image, label: 'From Image' },
                      { icon: Trash2, label: 'Clear All' },
                    ].map((action, idx) => (
                      <button
                        key={idx}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-md bg-white/[0.03] border border-white/[0.04] text-xs text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
                      >
                        <action.icon size={14} />
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="h-full">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {HISTORY_ITEMS.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`shrink-0 px-4 py-2.5 rounded-lg border transition-all cursor-pointer ${
                        idx === 0
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-white/[0.03] border-white/[0.04] text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <p className="text-xs font-medium">{item.action}</p>
                      <p className="text-xs opacity-60">{item.timestamp}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Layers Tab */}
            {activeTab === 'layers' && (
              <div className="h-full flex gap-2">
                {LAYER_NAMES.map((layer) => (
                  <div
                    key={layer}
                    className="shrink-0 w-24 p-2 bg-white/[0.03] rounded-lg border border-white/[0.04] hover:border-amber-500/30 transition-all cursor-pointer"
                  >
                    <div className="w-full aspect-square rounded-md bg-gradient-to-br from-slate-800 to-slate-900 mb-2 flex items-center justify-center">
                      <Layers size={18} className="text-slate-600" />
                    </div>
                    <p className="text-xs text-slate-400 text-center truncate">{layer}</p>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
