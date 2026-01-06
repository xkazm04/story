/**
 * Glass Noir Design - Modular Character Creator
 * Main orchestrator component
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

import { CreatorProvider, useCreator } from './context/CreatorContext';
import { Header, LeftSidebar, RightSidebar, Viewport, BottomPanel } from './components/layout';
import { CommandPalette, ToastContainer, GenerationProgress } from './components/overlays';
import { GENERATION_STEPS } from './constants';

// Inner component that uses context
function GlassNoirInner() {
  const {
    state,
    setZoom,
    startGeneration,
    updateGeneration,
    finishGeneration,
    addToast,
  } = useCreator();

  const { ui } = state;
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette: Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        setZoom(Math.min(200, ui.zoom + 25));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoom(Math.max(25, ui.zoom - 25));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setZoom, ui.zoom]);

  // Command handler
  const handleCommand = useCallback(
    (commandId: string) => {
      switch (commandId) {
        case 'generate':
          handleGenerate();
          break;
        case 'zoom-in':
          setZoom(Math.min(200, ui.zoom + 25));
          break;
        case 'zoom-out':
          setZoom(Math.max(25, ui.zoom - 25));
          break;
        case 'zoom-fit':
          setZoom(100);
          break;
        default:
          console.log('Command:', commandId);
      }
    },
    [setZoom, ui.zoom]
  );

  // Simulated generation process
  const handleGenerate = useCallback(() => {
    startGeneration();

    let currentStep = 0;
    const runStep = () => {
      if (currentStep >= GENERATION_STEPS.length) {
        finishGeneration();
        addToast('Character generated successfully!', 'success');
        return;
      }

      updateGeneration(currentStep, 0);

      const stepDuration = GENERATION_STEPS[currentStep].duration;
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 100 / (stepDuration / 50);
        if (progress >= 100) {
          clearInterval(progressInterval);
          currentStep++;
          setTimeout(runStep, 200);
        } else {
          updateGeneration(currentStep, Math.min(100, progress));
        }
      }, 50);
    };

    runStep();
  }, [startGeneration, updateGeneration, finishGeneration, addToast]);

  return (
    <main className="h-screen w-full bg-[#030303] text-slate-200 font-sans flex flex-col overflow-hidden relative">
      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelect={handleCommand}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[900px] h-[900px] bg-slate-800/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] left-[-15%] w-[700px] h-[700px] bg-amber-900/5 rounded-full blur-[120px]" />
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-900/5 rounded-full blur-[100px]"
        />
      </div>

      {/* Header */}
      <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <LeftSidebar />

        {/* Center - Viewport */}
        <div className="flex-1 flex flex-col relative">
          <Viewport onGenerate={handleGenerate} />

          {/* Bottom Panel - Assets, History, Layers */}
          <BottomPanel />

          {/* Generation Progress Overlay */}
          <GenerationProgress />
        </div>

        {/* Right Sidebar */}
        <RightSidebar />
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </main>
  );
}

// Main export with provider wrapper
export default function GlassNoirCreator() {
  return (
    <CreatorProvider>
      <GlassNoirInner />
    </CreatorProvider>
  );
}
