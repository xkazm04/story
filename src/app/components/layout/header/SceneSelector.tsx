'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { Scene } from '@/app/types/Scene';

const SceneSelector: React.FC = () => {
  const { selectedProject, selectedAct, selectedScene, setSelectedScene } = useProjectStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: scenes = [] } = sceneApi.useScenesByProjectAndAct(
    selectedProject?.id || '',
    selectedAct?.id || '',
    !!selectedProject && !!selectedAct
  );

  // Sort scenes by order ascending
  const sortedScenes = [...scenes].sort((a, b) => (a.order || 0) - (b.order || 0));

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

  const handleSceneSelect = (scene: Scene) => {
    setSelectedScene(scene);
    setIsOpen(false);
  };

  if (!selectedAct) {
    return null;
  }

  if (!selectedScene) {
    return (
      <span className="text-sm text-gray-500 italic">No scene selected</span>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 transition-all text-sm text-gray-200 hover:text-white"
      >
        <span className="text-gray-400 font-mono text-xs">
          {selectedScene.order !== undefined ? `#${selectedScene.order + 1}` : ''}
        </span>
        <span className="font-medium">{selectedScene.name}</span>
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
            className="absolute top-full mt-2 left-0 min-w-[250px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="max-h-[400px] overflow-y-auto">
              {sortedScenes.map((scene: Scene) => (
                <button
                  key={scene.id}
                  onClick={() => handleSceneSelect(scene)}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                    scene.id === selectedScene.id
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
              ))}
              {sortedScenes.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  No scenes in this act
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SceneSelector;
