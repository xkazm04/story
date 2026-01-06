'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { actApi } from '@/app/hooks/integration/useActs';
import { Act } from '@/app/types/Act';
import { useQueryClient } from '@tanstack/react-query';

const ActSelector: React.FC = () => {
  const { selectedProject, selectedAct, setSelectedAct } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newActName, setNewActName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const queryClient = useQueryClient();

  const { data: acts = [], refetch } = actApi.useProjectActs(
    selectedProject?.id || '',
    !!selectedProject
  );

  // Pre-select first act when none is selected
  useEffect(() => {
    if (acts && acts.length > 0 && !selectedAct) {
      setSelectedAct(acts[0]);
    }
  }, [acts, selectedAct, setSelectedAct]);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 200),
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setIsCreating(false);
        setNewActName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActSelect = (act: Act) => {
    setSelectedAct(act);
    setIsOpen(false);
    setIsCreating(false);
    setNewActName('');
  };

  const handleCreateAct = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedProject || !newActName.trim()) return;

    try {
      const maxOrder = acts && acts.length > 0
        ? Math.max(...acts.map((act: Act) => act.order || 0))
        : -1;

      const newAct = await actApi.createAct({
        name: newActName.trim(),
        project_id: selectedProject.id,
        description: '',
        order: maxOrder + 1,
      });

      // Invalidate and refetch acts
      queryClient.invalidateQueries({ queryKey: ['acts', 'project', selectedProject.id] });
      await refetch();

      // Select the newly created act
      setSelectedAct(newAct);
      setIsOpen(false);
      setIsCreating(false);
      setNewActName('');
    } catch (error) {
      console.error('Error creating act:', error);
    }
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      setIsCreating(false);
      setNewActName('');
    }
    setIsOpen(!isOpen);
  };

  // Show button even when no act is selected, but allow creating
  const displayName = selectedAct?.name || 'Select Act';

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-all text-sm text-gray-200 hover:text-white"
          data-testid="act-selector-btn"
        >
          <span className={`font-medium ${!selectedAct ? 'text-gray-400' : ''}`}>
            {displayName}
          </span>
          <ChevronDown
            size={14}
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>

      {isOpen && typeof window !== 'undefined' && createPortal(
        <AnimatePresence mode="wait">
          <motion.div
            key="dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            ref={dropdownRef}
            className="fixed bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-[9999]"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
            }}
          >
            <div className="max-h-[300px] overflow-y-auto">
              {acts.map((act: Act) => (
                <button
                  key={act.id}
                  onClick={() => handleActSelect(act)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    act.id === selectedAct?.id
                      ? 'bg-blue-900/50 text-white'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  data-testid={`act-item-${act.id}`}
                >
                  <div className="font-medium">{act.name}</div>
                  {act.description && (
                    <div className="text-xs text-gray-500 mt-0.5 truncate">
                      {act.description}
                    </div>
                  )}
                </button>
              ))}

              {/* Divider */}
              {acts.length > 0 && (
                <div className="h-px bg-gray-700 my-1" />
              )}

              {/* Create Act Option */}
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                  data-testid="create-new-act-btn"
                >
                  <Plus size={14} />
                  <span className="font-medium">Create New Act</span>
                </button>
              ) : (
                <form onSubmit={handleCreateAct} className="p-3 border-t border-gray-700">
                  <input
                    type="text"
                    value={newActName}
                    onChange={(e) => setNewActName(e.target.value)}
                    placeholder="Act name..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-md text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    autoFocus
                    data-testid="new-act-name-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setIsCreating(false);
                        setNewActName('');
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={!newActName.trim()}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-md transition-colors"
                      data-testid="submit-create-act-btn"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewActName('');
                      }}
                      className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded-md transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ActSelector;
