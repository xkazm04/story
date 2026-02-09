'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';

import { useCreatorUIStore } from './store/creatorUIStore';
import { useCreatorToastStore } from './store/creatorToastStore';
import { Header, LeftSidebar, RightSidebar, Viewport, BottomPanel } from './components/layout';
import { CommandPalette, ToastContainer, GenerationProgress } from './components/overlays';
import { GENERATION_STEPS } from './constants';

export default function GlassNoirCreator() {
  const zoom = useCreatorUIStore((s) => s.zoom);
  const setZoom = useCreatorUIStore((s) => s.setZoom);
  const startGeneration = useCreatorUIStore((s) => s.startGeneration);
  const updateGeneration = useCreatorUIStore((s) => s.updateGeneration);
  const finishGeneration = useCreatorUIStore((s) => s.finishGeneration);
  const addToast = useCreatorToastStore((s) => s.addToast);

  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '=') {
        e.preventDefault();
        setZoom(Math.min(200, zoom + 25));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        setZoom(Math.max(25, zoom - 25));
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoom(100);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setZoom, zoom]);

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

  const handleCommand = useCallback(
    (commandId: string) => {
      switch (commandId) {
        case 'generate':
          handleGenerate();
          break;
        case 'zoom-in':
          setZoom(Math.min(200, zoom + 25));
          break;
        case 'zoom-out':
          setZoom(Math.max(25, zoom - 25));
          break;
        case 'zoom-fit':
          setZoom(100);
          break;
        default:
          console.log('Command:', commandId);
      }
    },
    [setZoom, zoom, handleGenerate]
  );

  return (
    <main className="h-screen w-full bg-[#030303] text-slate-200 font-sans flex flex-col overflow-hidden relative">
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelect={handleCommand}
      />
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

      <Header onOpenCommandPalette={() => setCommandPaletteOpen(true)} />

      <div className="flex-1 flex overflow-hidden relative">
        <LeftSidebar />
        <div className="flex-1 flex flex-col relative">
          <Viewport onGenerate={handleGenerate} />
          <BottomPanel />
          <GenerationProgress />
        </div>
        <RightSidebar />
      </div>
    </main>
  );
}
