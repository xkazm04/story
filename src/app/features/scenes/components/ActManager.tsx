'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ChevronDown } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { actApi } from '@/app/api/acts';
import { sceneApi } from '@/app/api/scenes';
import { Act } from '@/app/types/Act';
import ActList from './ActList';
import ActTabButton from './ActTabButton';

const ActManager: React.FC = () => {
  const { selectedProject, selectedAct, setSelectedAct } = useProjectStore();
  const { data: acts = [], refetch, isLoading } = actApi.useProjectActs(
    selectedProject?.id || '',
    !!selectedProject
  );
  const { refetch: refetchScenes } = sceneApi.useScenesByProjectAndAct(
    selectedProject?.id || '',
    selectedAct?.id || '',
    !!selectedProject && !!selectedAct
  );

  const [error, setError] = useState<string | null>(null);
  const [showActsList, setShowActsList] = useState(false);
  const moreButtonRef = useRef<HTMLDivElement>(null);
  const actsListRef = useRef<HTMLDivElement>(null);

  // Get visible acts (show max 3)
  const getVisibleActs = () => {
    if (!acts || acts.length === 0) return [];
    if (acts.length <= 3) return acts;
    
    const selectedIndex = acts.findIndex((act) => act.id === selectedAct?.id);
    
    if (selectedIndex === -1) return acts.slice(0, 3);
    if (selectedIndex === 0) return acts.slice(0, 3);
    if (selectedIndex === acts.length - 1) return acts.slice(-3);
    
    return [acts[selectedIndex - 1], acts[selectedIndex], acts[selectedIndex + 1]];
  };

  const visibleActs = getVisibleActs();
  const hasMoreActs = acts && acts.length > 3;

  const handleActChange = (act: Act) => {
    setSelectedAct(act);
    setError(null);
    setShowActsList(false);
    refetchScenes();
  };

  const handleAddAct = async () => {
    if (!selectedProject) return;
    
    setError(null);
    try {
      await actApi.createAct({
        name: `Act ${acts?.length ? acts.length + 1 : 1}`,
        project_id: selectedProject.id,
        description: '',
      });
      refetch();
    } catch (err) {
      setError('Error creating new act. Please try again.');
      console.error('Error creating act:', err);
    }
  };

  // Set first act as selected when acts load
  useEffect(() => {
    if (acts && acts.length > 0 && !selectedAct) {
      handleActChange(acts[0]);
    }
  }, [acts, selectedAct]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showActsList &&
        actsListRef.current &&
        !actsListRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowActsList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActsList]);

  // No acts state
  if ((!acts || acts.length === 0) && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 rounded-lg border-2 border-dashed border-gray-700 bg-gray-800/30 flex flex-col items-center"
      >
        <p className="text-gray-400 font-medium mb-3">No acts available</p>
        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
        <button
          onClick={handleAddAct}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          <Plus size={16} />
          Create First Act
        </button>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col py-2">
      <div className="flex justify-center items-center relative">
        <AnimatePresence mode="popLayout">
          <motion.div
            className="flex items-center justify-center gap-1.5 min-h-[40px] w-full"
            layout
          >
            {visibleActs.map((act: Act) => (
              <div key={act.id} className="flex items-center gap-2">
                <ActTabButton act={act} onSelect={handleActChange} />
                <div className="w-[1px] h-4 bg-gray-700" />
              </div>
            ))}
            
            {hasMoreActs && (
              <motion.div
                ref={moreButtonRef}
                className="inline-flex cursor-pointer px-3 py-2 rounded-md text-sm font-medium items-center gap-1 border border-transparent hover:bg-gray-800 text-gray-400 hover:text-gray-300 transition-colors"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                layout
                onClick={() => setShowActsList(!showActsList)}
              >
                +{acts.length - visibleActs.length}
                <ChevronDown
                  size={14}
                  className={`transition-transform ${showActsList ? 'rotate-180' : ''}`}
                />
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-2 text-center">{error}</p>
      )}

      {/* Acts List Dropdown */}
      <ActList
        showActsList={showActsList}
        setShowActsList={setShowActsList}
        moreButtonRef={moreButtonRef}
        acts={acts}
        actsListRef={actsListRef}
        onActChange={handleActChange}
        onRefetch={refetch}
      />
    </div>
  );
};

export default ActManager;

