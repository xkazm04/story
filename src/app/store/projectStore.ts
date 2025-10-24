import { create } from 'zustand';
import { Project } from '../types/Project';
import { Scene } from '../types/Scene';
import { Act } from '../types/Act';

interface ProjectState {
  // Projects
  selectedProject: Project | null;
  setSelectedProject: (project: Project | null) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  
  // Acts
  selectedAct: Act | null;
  setSelectedAct: (act: Act | null) => void;
  acts: Act[];
  setActs: (acts: Act[]) => void;
  
  // Scenes
  selectedScene: Scene | null;
  selectedSceneId: string | null;
  setSelectedScene: (scene: Scene | null) => void;
  setSelectedSceneId: (id: string | null) => void;
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  
  // UI State
  showLanding: boolean;
  setShowLanding: (show: boolean) => void;
  
  // Dev helpers
  initializeWithMockProject: (project: Project) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  // Projects
  selectedProject: null,
  setSelectedProject: (project) => set({ selectedProject: project }),
  projects: [],
  setProjects: (projects) => set({ projects: projects }),
  
  // Acts
  selectedAct: null,
  setSelectedAct: (act) => set({ selectedAct: act }),
  acts: [],
  setActs: (acts) => set({ acts: acts }),
  
  // Scenes
  selectedScene: null,
  selectedSceneId: null,
  setSelectedScene: (scene) => set({ selectedScene: scene }),
  setSelectedSceneId: (id) => set({ selectedSceneId: id }),
  scenes: [],
  setScenes: (scenes) => set({ scenes: scenes }),
  
  // UI State
  showLanding: false,
  setShowLanding: (show) => set({ showLanding: show }),
  
  // Dev helpers
  initializeWithMockProject: (project) => set({ 
    selectedProject: project, 
    showLanding: false 
  }),
}));
