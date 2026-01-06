'use client';

import React, { useState } from 'react';
import {
    Scissors, Eye, Smile, Share2, Save, RotateCcw,
    Undo2, Redo2, Download, Layers, Palette, Plus, Sparkles
} from 'lucide-react';

// --- Types & Data ---

type Category = 'Preset' | 'Head' | 'Body' | 'Preview';
type SubCategory = 'Hair' | 'Eye' | 'Nose' | 'Mouth' | 'Make Up';

// Exact color palette mapping from the reference image
const COLOR_PALETTE = [
    { id: 1, type: 'solid', val: '#1a1a1a' },   // Black (Selected)
    { id: 2, type: 'solid', val: '#5b21b6' },   // Deep Purple
    { id: 3, type: 'solid', val: '#4ade80' },   // Green
    { id: 4, type: 'solid', val: '#db2777' },   // Pink
    { id: 5, type: 'solid', val: '#e2e8f0' },   // White/Grey
    { id: 6, type: 'solid', val: '#9333ea' },   // Purple
    { id: 7, type: 'gradient', val: 'linear-gradient(135deg, #a855f7, #ec4899)' }, // Purple/Pink Grad
    { id: 8, type: 'solid', val: '#22c55e' },   // Green
    { id: 9, type: 'solid', val: '#3f1810' },   // Dark Brown/Red
    { id: 10, type: 'solid', val: '#57534e' },  // Grey/Brown
    { id: 11, type: 'solid', val: '#f97316' },  // Orange
    { id: 12, type: 'conic', val: 'conic-gradient(from 180deg, red, yellow, lime, cyan, blue, magenta, red)' }, // RGB Wheel
];

const PRESETS = [
    { id: 1, src: 'https://images.unsplash.com/photo-1630325902095-2605e56d784a?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 2, src: 'https://images.unsplash.com/photo-1598214886806-c87b84b7078b?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 3, src: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150' }, // Selected
    { id: 4, src: 'https://images.unsplash.com/photo-1616782229232-2a78604314c4?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 5, src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 6, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 7, src: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 8, src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150' },
    { id: 9, src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150&h=150' },
];

// --- Components ---

const GlassPanel = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/5 shadow-2xl rounded-2xl ${className}`}>
        {children}
    </div>
);

const PrecisionSlider = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col gap-3 mb-5 group cursor-pointer">
        <div className="flex justify-between text-[11px] font-medium tracking-wide text-slate-400 group-hover:text-slate-200 transition-colors">
            <span>{label}</span>
            <span>{value}</span>
        </div>
        <div className="relative w-full h-[2px] bg-white/10 rounded-full flex items-center">
            {/* Active Track */}
            <div
                className="absolute h-full bg-amber-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                style={{ width: `${value}%` }}
            />
            {/* Thumb */}
            <div
                className="absolute w-3 h-3 bg-white rounded-full shadow-lg border border-slate-300 transform hover:scale-125 transition-transform"
                style={{ left: `${value}%`, transform: 'translateX(-50%)' }}
            >
                <div className="absolute inset-0 m-auto w-1 h-1 bg-slate-300 rounded-full opacity-50"></div>
            </div>
        </div>
    </div>
);

export default function CharacterCreator() {
    const [activeTab, setActiveTab] = useState<Category>('Preset');
    const [activeSubTab, setActiveSubTab] = useState<SubCategory>('Hair');
    const [selectedPreset, setSelectedPreset] = useState<number>(3);
    const [selectedColor, setSelectedColor] = useState<number>(1); // Black selected by default
    const [colorMode, setColorMode] = useState<'Hair' | 'Second'>('Hair');

    return (
        <main className="min-h-screen w-full bg-[#050505] text-slate-200 font-sans flex items-center justify-center p-2 lg:p-6 overflow-hidden relative">

            {/* Ambient Background */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top Right Light */}
                <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-[120px] opacity-40" />
                {/* Bottom Left Warmth */}
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-amber-900/10 rounded-full blur-[100px]" />
            </div>

            <GlassPanel className="w-full max-w-[1400px] h-[90vh] lg:h-[800px] relative z-10 flex flex-col overflow-hidden ring-1 ring-white/5">

                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-black/20">
                    <div className="flex items-center gap-4">
                        <button className="hover:text-amber-400 transition-colors text-slate-400">
                            <Undo2 size={18} />
                        </button>
                        <h1 className="text-sm font-medium tracking-wide text-white">Creating Character</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        {[
                            { icon: Share2, label: 'Share' },
                            { icon: Save, label: 'Save' },
                            { icon: RotateCcw, label: 'Reset' },
                            { icon: Undo2, label: 'Retrace' },
                            { icon: Redo2, label: 'Restore' },
                        ].map((item, idx) => (
                            <button key={idx} className="flex flex-col items-center gap-1 group">
                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-amber-500/10 group-hover:text-amber-400 transition-all border border-transparent group-hover:border-amber-500/20">
                                    <item.icon size={14} strokeWidth={2} />
                                </div>
                                <span className="text-[9px] text-slate-500 font-medium group-hover:text-slate-300">{item.label}</span>
                            </button>
                        ))}
                    </div>
                </header>

                {/* Workspace */}
                <div className="flex flex-1 overflow-hidden">

                    {/* 1. Navigation Rails */}
                    <nav className="w-14 border-r border-white/5 flex flex-col items-center py-6 gap-8 bg-black/30">
                        {['Preset', 'Head', 'Body', 'Preview'].map((tab) => (
                            <div key={tab} className="flex flex-col items-center gap-2 relative group cursor-pointer" onClick={() => setActiveTab(tab as Category)}>
                                <div className={`
                  text-[10px] uppercase tracking-widest vertical-rl 
                  ${activeTab === tab ? 'text-amber-400 font-bold' : 'text-slate-500 group-hover:text-slate-300'}
                  transition-all duration-300
                `}>
                                    <span className="rotate-180 block pb-2">{tab}</span>
                                </div>
                                {activeTab === tab && (
                                    <div className="absolute -left-[2px] top-1/2 -translate-y-1/2 w-[3px] h-6 bg-amber-500 rounded-r-md shadow-[0_0_12px_rgba(245,158,11,0.8)]" />
                                )}
                            </div>
                        ))}
                    </nav>

                    {/* 2. Tool Selector */}
                    <div className="w-20 border-r border-white/5 flex flex-col py-6 gap-2 bg-black/20">
                        {[
                            { id: 'Hair', icon: Scissors },
                            { id: 'Eye', icon: Eye },
                            { id: 'Nose', icon: Layers },
                            { id: 'Mouth', icon: Smile },
                            { id: 'Make Up', icon: Palette },
                        ].map((tool) => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveSubTab(tool.id as SubCategory)}
                                className={`
                  w-12 h-12 mx-auto rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300
                  ${activeSubTab === tool.id
                                        ? 'bg-gradient-to-br from-white/10 to-transparent text-amber-400 border-t border-l border-white/10 shadow-lg'
                                        : 'text-slate-600 hover:text-slate-300 hover:bg-white/5'}
                `}
                            >
                                <tool.icon size={18} strokeWidth={1.5} />
                                <span className="text-[8px] font-medium tracking-wide">{tool.id}</span>
                            </button>
                        ))}
                    </div>

                    {/* 3. Preset Grid */}
                    <div className="w-64 border-r border-white/5 p-4 flex flex-col bg-[#0b0b0d]">
                        <div className="grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar content-start">
                            {PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    onClick={() => setSelectedPreset(preset.id)}
                                    className={`
                      aspect-[3/4] rounded-md overflow-hidden border relative group transition-all
                      ${selectedPreset === preset.id
                                            ? 'border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                                            : 'border-transparent hover:border-white/20 opacity-60 hover:opacity-100'}
                    `}
                                >
                                    <img src={preset.src} alt="preset" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. Main Viewport */}
                    <div className="flex-1 relative flex items-center justify-center bg-gradient-to-b from-[#15151a] to-black">
                        {/* Background Texture/Particles */}
                        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-slate-700/10 rounded-full blur-[80px]" />
                        <div className="absolute top-20 right-20 w-1 h-1 bg-white/40 rounded-full blur-[1px]" />
                        <div className="absolute top-40 right-40 w-1 h-1 bg-white/20 rounded-full blur-[1px]" />

                        {/* Character */}
                        <div className="relative h-[95%] aspect-[3/4] z-10 select-none pointer-events-none">
                            <img
                                src="https://images.unsplash.com/photo-1620442721626-a07727c9751e?q=80&w=1000&auto=format&fit=crop"
                                alt="Character"
                                className="w-full h-full object-cover rounded-sm drop-shadow-2xl"
                                style={{
                                    maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)',
                                    WebkitMaskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)'
                                }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
                        </div>

                        {/* Asset Download - Bottom Left */}
                        <button className="absolute bottom-6 left-6 flex flex-col items-center gap-2 group z-20 cursor-pointer">
                            <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-black/60 backdrop-blur-md group-hover:border-amber-500/50 transition-all">
                                <Download size={16} className="text-slate-400 group-hover:text-amber-400" />
                            </div>
                            <span className="text-[9px] text-slate-500 text-center leading-tight">Assets<br />Download</span>
                        </button>
                    </div>

                    {/* 5. RIGHT PANEL - HIGH FIDELITY RECREATION */}
                    <div className="w-[340px] border-l border-white/5 p-6 flex flex-col bg-[#0b0b0d]/90 backdrop-blur-xl relative">

                        {/* Tab Switcher */}
                        <div className="flex gap-4 mb-8">
                            {/* Active Tab */}
                            <button
                                onClick={() => setColorMode('Hair')}
                                className="flex-1 relative pb-2 text-xs font-medium text-white flex items-center gap-2 border border-white/10 bg-white/5 rounded-lg py-2 px-3 transition-all hover:bg-white/10"
                            >
                                <Sparkles size={12} className="text-amber-500 fill-amber-500" />
                                <span>Hair Color</span>
                                {/* Small indicator on the left side of the button often seen in game UIs */}
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-amber-500 rounded-r-full" />
                            </button>

                            {/* Inactive Tab */}
                            <button
                                onClick={() => setColorMode('Second')}
                                className="flex-1 pb-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors py-2 px-3 border border-transparent"
                            >
                                Second Color
                            </button>
                        </div>

                        {/* Color Grid */}
                        <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-10">
                            {COLOR_PALETTE.map((color) => {
                                const isSelected = selectedColor === color.id;
                                return (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color.id)}
                                        className="group relative flex items-center justify-center outline-none"
                                    >
                                        {/* The Color Circle */}
                                        <div
                                            className={`
                        w-14 h-14 rounded-full shadow-inner
                        transition-transform duration-200 ease-out group-hover:scale-105
                      `}
                                            style={{ background: color.val }}
                                        />

                                        {/* Selected State Ring (Outer Glow) */}
                                        {isSelected && (
                                            <div className="absolute inset-[-4px] rounded-full border border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.4)] animate-pulse-slow" />
                                        )}

                                        {/* Hover State Ring */}
                                        {!isSelected && (
                                            <div className="absolute inset-[-4px] rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Sliders */}
                        <div className="flex-1 space-y-2">
                            <PrecisionSlider label="Shade" value={58} />
                            <PrecisionSlider label="Transparent" value={18} />
                            <PrecisionSlider label="Texture/detail" value={88} />
                        </div>

                        {/* Footer Action Button */}
                        <div className="mt-auto">
                            <button className="
                w-full py-3.5 
                bg-gradient-to-r from-transparent via-white/5 to-transparent
                border border-amber-500/30 
                rounded-lg 
                flex items-center justify-center gap-2
                text-slate-200 text-xs uppercase tracking-widest font-semibold
                hover:border-amber-500 hover:text-amber-400 hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]
                active:scale-[0.98]
                transition-all duration-300 group
              ">
                                <Plus size={14} className="text-amber-500 group-hover:rotate-90 transition-transform duration-300" />
                                <span>Create Character</span>
                            </button>
                        </div>

                    </div>
                </div>
            </GlassPanel>

            {/* Global Styles */}
            <style jsx global>{`
        .vertical-rl {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
        </main>
    );
}