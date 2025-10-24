'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Folder, Plus } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { projectApi } from '@/app/api/projects';
import { MOCK_USER_ID } from '@/app/config/mockUser';

interface ProjectsFeatureProps {
  userId?: string;
}

const ProjectsFeature: React.FC<ProjectsFeatureProps> = ({ userId = MOCK_USER_ID }) => {
  const { data: projects = [], isLoading } = projectApi.useUserProjects(userId, !!userId);
  const { setSelectedProject, setShowLanding } = useProjectStore();

  const handleSelectProject = (project: any) => {
    setSelectedProject(project);
    setShowLanding(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-400">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-white mb-4"
          >
            Your Story Projects
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg"
          >
            Select a project to continue or create a new one
          </motion.p>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleSelectProject(project)}
                className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-800 hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <Folder size={24} className="text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
                      {project.name}
                    </h3>
                    {project.description && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Hover indicator */}
                <div className="absolute inset-0 border-2 border-blue-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </motion.div>
            ))}

            {/* Create New Project Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: projects.length * 0.1 }}
              className="group relative bg-gray-800/30 backdrop-blur-sm border-2 border-dashed border-gray-700 rounded-lg p-6 cursor-pointer hover:bg-gray-800/50 hover:border-blue-500/50 transition-all duration-300"
            >
              <div className="flex flex-col items-center justify-center min-h-[140px] text-center">
                <div className="p-3 bg-gray-700/30 rounded-lg mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Plus size={32} className="text-gray-500 group-hover:text-blue-500 transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-400 group-hover:text-blue-400 transition-colors">
                  Create New Project
                </h3>
              </div>
            </motion.div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
              <Folder size={40} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-4">No Projects Yet</h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Start your storytelling journey by creating your first project
            </p>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2">
              <Plus size={20} />
              Create Your First Project
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProjectsFeature;

