'use client';

import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { sceneApi } from '@/app/api/scenes';
import { Scene } from '@/app/types/Scene';

const ScenesList: React.FC = () => {
  const { selectedProject, selectedAct, selectedSceneId, setSelectedSceneId, setScenes } = useProjectStore();
  const { data: scenes = [], refetch } = sceneApi.useScenesByProjectAndAct(
    selectedProject?.id || '',
    selectedAct?.id || '',
    !!selectedProject && !!selectedAct
  );

  const [editingSceneId, setEditingSceneId] = useState<string | null>(null);
  const [newSceneName, setNewSceneName] = useState('');

  // Update store scenes when data changes
  useEffect(() => {
    setScenes(scenes);
  }, [scenes, setScenes]);

  // Select last scene when new scene is created
  useEffect(() => {
    if (scenes && scenes.length > 0 && !selectedSceneId) {
      const lastScene = scenes[scenes.length - 1];
      setSelectedSceneId(lastScene.id);
    }
  }, [scenes, selectedSceneId, setSelectedSceneId]);

  const handleRename = (scene: Scene) => {
    setEditingSceneId(scene.id);
    setNewSceneName(scene.name);
  };

  const confirmRename = async (id: string) => {
    if (!newSceneName.trim() || !scenes) return;
    
    const scene = scenes.find((s) => s.id === id);
    if (scene?.name === newSceneName) {
      setEditingSceneId(null);
      return;
    }

    try {
      await sceneApi.renameScene(id, newSceneName);
      setEditingSceneId(null);
      refetch();
    } catch (error) {
      console.error('Error renaming scene:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this scene?')) return;

    try {
      await sceneApi.deleteScene(id);
      refetch();
    } catch (error) {
      console.error('Error deleting scene:', error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination || !scenes) return;

    const reorderedScenes = Array.from(scenes);
    const [movedItem] = reorderedScenes.splice(result.source.index, 1);
    reorderedScenes.splice(result.destination.index, 0, movedItem);

    setScenes(reorderedScenes);

    try {
      await sceneApi.reorderScene(movedItem.id, result.destination.index + 1);
    } catch (error) {
      console.error('Error reordering scene:', error);
      refetch();
    }
  };

  if (!scenes || scenes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No scenes yet. Add your first scene below.</p>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="scenes-list">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="space-y-2 py-3 bg-gray-900/20 rounded-lg"
          >
            {scenes.map((scene, index) => (
              <Draggable key={scene.id} draggableId={scene.id} index={index}>
                {(provided, snapshot) => (
                  <motion.div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex justify-between items-center px-4 py-2 mx-2 rounded-lg cursor-pointer transition-all ${
                      selectedSceneId === scene.id
                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg'
                        : 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                    } ${snapshot.isDragging ? 'shadow-2xl scale-105 opacity-80' : ''}`}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      handleRename(scene);
                    }}
                    onClick={() => setSelectedSceneId(scene.id)}
                  >
                    {editingSceneId === scene.id ? (
                      <input
                        type="text"
                        maxLength={50}
                        value={newSceneName}
                        onChange={(e) => setNewSceneName(e.target.value)}
                        onBlur={() => confirmRename(scene.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmRename(scene.id);
                          if (e.key === 'Escape') setEditingSceneId(null);
                        }}
                        className="flex-1 bg-gray-900 border border-gray-600 px-2 py-1 rounded text-white outline-none"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span className="flex-1 text-sm font-medium">
                        {scene.order}. {scene.name}
                      </span>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(scene.id);
                      }}
                      className="ml-2 p-1.5 hover:bg-red-600/50 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ScenesList;

