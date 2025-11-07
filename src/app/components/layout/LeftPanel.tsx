'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MoveLeft } from 'lucide-react';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import ProjectOverview from '@/app/features/projectOverview/ProjectOverview';

interface LeftPanelProps {
  isHiding?: boolean;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ isHiding = false }) => {
  const { selectedProject, setSelectedProject, setShowLanding } = useProjectStore();

  const contentVariants = {
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4 },
    },
    hidden: {
      opacity: 0,
      x: -60,
      scale: 0.8,
      transition: { duration: 0.3 },
    },
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setShowLanding(true);
  };

  return (
    <div className="bg-gradient-to-b from-gray-900/70 via-gray-800 to-gray-900/70 h-full w-full text-white flex flex-col relative overflow-hidden">
      <motion.div
        className="w-full h-full flex flex-col"
        initial="visible"
        animate={isHiding ? 'hidden' : 'visible'}
        variants={contentVariants}
      >
        {/* Project Overview */}
        <div className="flex-1 overflow-hidden">
          <ProjectOverview />
        </div>

        {/* Back to Projects Button */}
        {selectedProject && (
          <div className="absolute bottom-4 right-4 z-10">
            <button
              onClick={handleBackToProjects}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-lg transition-all cursor-pointer text-gray-300 hover:text-white"
            >
              <MoveLeft size={16} />
              Back to Projects
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LeftPanel;
