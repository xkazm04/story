'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Loader2, Check } from 'lucide-react';
import { useCreatorUIStore } from '../../store/creatorUIStore';
import { GENERATION_STEPS } from '../../constants';

export function GenerationProgress() {
  const isGenerating = useCreatorUIStore((s) => s.isGenerating);
  const generationStep = useCreatorUIStore((s) => s.generationStep);
  const generationProgress = useCreatorUIStore((s) => s.generationProgress);
  const cancelGeneration = useCreatorUIStore((s) => s.cancelGeneration);

  if (!isGenerating) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-30 bg-black/80 backdrop-blur-md flex items-center justify-center"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-[400px] p-6 bg-[#0a0a0a]/90 rounded-2xl border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center"
              >
                <Sparkles size={24} className="text-amber-400" />
              </motion.div>
              <div>
                <h3 className="text-white font-medium text-lg">Generating Character</h3>
                <p className="text-sm text-slate-500">Please wait...</p>
              </div>
            </div>
            <button
              onClick={cancelGeneration}
              className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {GENERATION_STEPS.map((step, idx) => {
              const isActive = idx === generationStep;
              const isComplete = idx < generationStep;
              return (
                <div key={step.id} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      isComplete
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isActive
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-white/5 text-slate-600'
                    }`}
                  >
                    {isComplete ? (
                      <Check size={14} />
                    ) : isActive ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 size={14} />
                      </motion.div>
                    ) : (
                      <span className="text-sm">{step.id}</span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      isComplete
                        ? 'text-emerald-400'
                        : isActive
                          ? 'text-amber-400'
                          : 'text-slate-600'
                    }`}
                  >
                    {step.label}
                  </span>
                  {isActive && (
                    <motion.div
                      className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="h-full bg-amber-500"
                        initial={{ width: 0 }}
                        animate={{ width: `${generationProgress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-slate-500">
              <span>Overall Progress</span>
              <span>{Math.round((generationStep / GENERATION_STEPS.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-amber-600 to-orange-500"
                style={{ width: `${(generationStep / GENERATION_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
