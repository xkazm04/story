'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { actApi } from '@/app/hooks/integration/useActs';
import { Act } from '@/app/types/Act';

const ActSelector: React.FC = () => {
  const { selectedProject, selectedAct, setSelectedAct } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: acts = [] } = actApi.useProjectActs(
    selectedProject?.id || '',
    !!selectedProject
  );

  // Pre-select first act when none is selected
  useEffect(() => {
    if (acts && acts.length > 0 && !selectedAct) {
      setSelectedAct(acts[0]);
    }
  }, [acts, selectedAct, setSelectedAct]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActSelect = (act: Act) => {
    setSelectedAct(act);
    setIsOpen(false);
  };

  if (!selectedAct) {
    return (
      <span className="text-sm text-gray-500 italic">No act selected</span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-all text-sm text-gray-200 hover:text-white"
      >
        <span className="font-medium">{selectedAct.name}</span>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 left-0 min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="max-h-[300px] overflow-y-auto">
              {acts.map((act: Act) => (
                <button
                  key={act.id}
                  onClick={() => handleActSelect(act)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    act.id === selectedAct.id
                      ? 'bg-blue-900/50 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  <div className="font-medium">{act.name}</div>
                  {act.description && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {act.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ActSelector;
