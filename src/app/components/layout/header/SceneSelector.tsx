'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Plus } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { Scene } from '@/app/types/Scene';
import { useQueryClient } from '@tanstack/react-query';
import { characterApi } from '@/app/api/characters';
import { SmartNameInput } from '@/app/components/UI/SmartNameInput';
import { NameSuggestion } from '@/app/types/NameSuggestion';

const SceneSelector: React.FC = () => {
  const { selectedProject, selectedAct, selectedScene, setSelectedScene } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newSceneName, setNewSceneName] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const queryClient = useQueryClient();

  const { data: scenes = [], refetch } = sceneApi.useScenesByProjectAndAct(
    selectedProject?.id || '',
    selectedAct?.id || '',
    !!selectedProject && !!selectedAct
  );

  const { data: characters = [] } = characterApi.useProjectCharacters(
    selectedProject?.id || '',
    !!selectedProject
  );

  // Sort scenes by order ascending
  const sortedScenes = [...scenes].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Build context for name suggestions
  const nameContext = useMemo(() => ({
    projectTitle: selectedProject?.name,
    projectDescription: selectedProject?.description,
    genre: (selectedProject as any)?.genre,
    actName: selectedAct?.name,
    actDescription: selectedAct?.description,
    existingScenes: scenes.map(s => ({ title: s.name, location: s.location })),
    characters: characters.map(c => c.name),
    previousScene: scenes.length > 0 ? scenes[scenes.length - 1] : undefined,
  }), [selectedProject, selectedAct, scenes, characters]);

  // Update dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX,
        width: Math.max(rect.width, 250),
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
        setNewSceneName('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setIsOpen(false);
    setIsCreating(false);
    setNewSceneName('');
  };

  const handleCreateScene = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedProject || !selectedAct || !newSceneName.trim()) return;

    try {
      const newScene = await sceneApi.createScene({
        name: newSceneName.trim(),
        project_id: selectedProject.id,
        act_id: selectedAct.id,
        order: scenes.length,
      });

      // Invalidate and refetch scenes
      queryClient.invalidateQueries({ 
        queryKey: ['scenes', 'project', selectedProject.id, 'act', selectedAct.id] 
      });
      await refetch();

      // Select the newly created scene
      setSelectedScene(newScene);
      setIsOpen(false);
      setIsCreating(false);
      setNewSceneName('');
    } catch (error) {
      console.error('Error creating scene:', error);
    }
  };

  const handleButtonClick = () => {
    if (!isOpen) {
      setIsCreating(false);
      setNewSceneName('');
    }
    setIsOpen(!isOpen);
  };

  if (!selectedAct) {
    return null;
  }

  // Show button even when no scene is selected, but allow creating
  const displayText = selectedScene 
    ? `#${selectedScene.order !== undefined ? selectedScene.order + 1 : ''} ${selectedScene.name}`
    : 'Select Scene';

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={handleButtonClick}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-all text-sm text-gray-200 hover:text-white"
        >
          {selectedScene ? (
            <>
              <span className="text-gray-400 font-mono text-xs">
                #{selectedScene.order !== undefined ? selectedScene.order + 1 : ''}
              </span>
              <span className="font-medium">{selectedScene.name}</span>
            </>
          ) : (
            <span className="font-medium text-gray-400">{displayText}</span>
          )}
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
            <div className="max-h-[400px] overflow-y-auto">
              {sortedScenes.length > 0 ? (
                sortedScenes.map((scene: Scene) => (
                  <button
                    key={scene.id}
                    onClick={() => handleSceneSelect(scene)}
                    className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                      scene.id === selectedScene?.id
                        ? 'bg-blue-900/50 text-white'
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-mono text-xs">
                        #{scene.order !== undefined ? scene.order + 1 : '?'}
                      </span>
                      <span className="font-medium">{scene.name}</span>
                    </div>
                    {scene.description && (
                      <div className="text-xs text-gray-500 mt-0.5 truncate ml-8">
                        {scene.description}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No scenes in this act
                </div>
              )}

              {/* Divider */}
              {sortedScenes.length > 0 && (
                <div className="h-px bg-gray-700 my-1" />
              )}

              {/* Create Scene Option */}
              {!isCreating ? (
                <button
                  onClick={() => setIsCreating(true)}
                  className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                >
                  <Plus size={14} />
                  <span className="font-medium">Create New Scene</span>
                </button>
              ) : (
                <form onSubmit={handleCreateScene} className="p-3 border-t border-gray-700">
                  <SmartNameInput
                    entityType="scene"
                    context={nameContext}
                    value={newSceneName}
                    onChange={(e) => setNewSceneName(e.target.value)}
                    onSuggestionSelect={(suggestion: NameSuggestion) => {
                      setNewSceneName(suggestion.name);
                    }}
                    placeholder="Enter scene name or let AI suggest..."
                    size="sm"
                    enableSuggestions={true}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="submit"
                      disabled={!newSceneName.trim()}
                      className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm rounded-md transition-colors"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setNewSceneName('');
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

export default SceneSelector;
