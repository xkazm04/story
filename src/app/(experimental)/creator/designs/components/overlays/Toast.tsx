/**
 * Toast - Notification component
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Zap } from 'lucide-react';
import { useCreator } from '../../context/CreatorContext';

export function ToastContainer() {
  const { state, removeToast } = useCreator();

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {state.toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

function Toast({ message, type, onClose }: ToastProps) {
  const icons = {
    success: <Check size={20} className="text-emerald-400" />,
    error: <X size={20} className="text-red-400" />,
    info: <Zap size={20} className="text-amber-400" />,
  };

  const colors = {
    success: 'border-emerald-500/30 bg-emerald-500/10',
    error: 'border-red-500/30 bg-red-500/10',
    info: 'border-amber-500/30 bg-amber-500/10',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border ${colors[type]} backdrop-blur-xl shadow-2xl`}
    >
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
        {icons[type]}
      </div>
      <span className="text-base text-white font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 w-8 h-8 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
      >
        <X size={16} />
      </button>
    </motion.div>
  );
}
