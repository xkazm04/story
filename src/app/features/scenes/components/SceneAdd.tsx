'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { sceneApi } from '@/app/api/scenes';

const SceneAdd: React.FC = () => {
  const { selectedProject, selectedAct, scenes } = useProjectStore();
  const { refetch } = sceneApi.useScenesByProjectAndAct(
    selectedProject?.id || '',
    selectedAct?.id || '',
    !!selectedProject && !!selectedAct
  );

  const handleAddScene = async () => {
    if (!selectedProject || !selectedAct) return;
    if (scenes.length >= 10) return;

    try {
      await sceneApi.createScene({
        name: `Scene ${scenes.length + 1}`,
        project_id: selectedProject.id,
        act_id: selectedAct.id,
        order: scenes.length + 1,
      });
      refetch();
    } catch (error) {
      console.error('Error creating scene:', error);
    }
  };

  if (!selectedProject || !selectedAct || scenes.length >= 10) {
    return null;
  }

  return (
    <div className="flex justify-center py-3">
      <button
        onClick={handleAddScene}
        className="flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700 border border-gray-700 hover:border-gray-600 rounded-lg text-gray-400 hover:text-gray-300 transition-all group"
        title="Add Scene"
      >
        <Plus size={24} className="group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium">Add Scene</span>
      </button>
    </div>
  );
};

export default SceneAdd;

