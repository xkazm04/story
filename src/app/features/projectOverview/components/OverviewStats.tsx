'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '@/app/store/slices/projectSlice';
import { actApi } from '@/app/hooks/integration/useActs';
import { sceneApi } from '@/app/hooks/integration/useScenes';
import { beatApi } from '@/app/hooks/integration/useBeats';

interface StatBarProps {
  label: string;
  current: number;
  target: number;
  color: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, current, target, color }) => {
  const percentage = Math.min((current / target) * 100, 100);
  const isComplete = current >= target;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-300 font-medium">{label}</span>
        <span className={`text-xs font-mono ${isComplete ? 'text-green-400' : 'text-gray-400'}`}>
          {current} / {target}
        </span>
      </div>
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 rounded-full ${color}`}
        />
        {/* Glow effect */}
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: `${percentage}%`, opacity: isComplete ? 0.4 : 0.3 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className={`absolute inset-y-0 left-0 rounded-full blur-sm ${color}`}
        />
      </div>
    </div>
  );
};

const OverviewStats: React.FC = () => {
  const { selectedProject } = useProjectStore();

  const { data: acts = [] } = actApi.useProjectActs(
    selectedProject?.id || '',
    !!selectedProject
  );

  const { data: scenes = [] } = sceneApi.useProjectScenes(
    selectedProject?.id || '',
    !!selectedProject
  );

  const { data: beats = [] } = beatApi.useGetBeats(
    selectedProject?.id,
    !!selectedProject
  );

  const completedBeats = beats.filter(beat => beat.completed).length;
  const totalBeats = beats.length;

  // Hardcoded targets as specified
  const TARGET_ACTS = 3;
  const TARGET_SCENES = 10;

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
        No project selected
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-gray-800/40 via-gray-800/30 to-gray-900/40 rounded-lg border border-gray-700/50 p-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Project Overview</h3>
        <div className="text-xs text-gray-500 font-mono">
          {selectedProject.name}
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-5">
        <StatBar
          label="Acts"
          current={acts.length}
          target={TARGET_ACTS}
          color="bg-blue-500"
        />

        <StatBar
          label="Scenes"
          current={scenes.length}
          target={TARGET_SCENES}
          color="bg-purple-500"
        />

        <StatBar
          label="Completed Beats"
          current={completedBeats}
          target={totalBeats || 1}
          color="bg-green-500"
        />
      </div>

      {/* Summary */}
      <div className="pt-4 border-t border-gray-700/50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-400">{acts.length}</div>
            <div className="text-xs text-gray-500 mt-1">Acts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">{scenes.length}</div>
            <div className="text-xs text-gray-500 mt-1">Scenes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0}%
            </div>
            <div className="text-xs text-gray-500 mt-1">Complete</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OverviewStats;
