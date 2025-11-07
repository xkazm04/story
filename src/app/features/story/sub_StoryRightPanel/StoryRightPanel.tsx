'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, ChevronDown, ChevronUp, CheckCircle, Circle, BookOpen, Sparkles } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { beatApi } from '@/app/hooks/integration/useBeats';
import { AIAssistantPanel } from '@/app/features/assistant/AIAssistantPanel';
import type { Beat } from '@/app/types/Beat';

const StoryRightPanel: React.FC = () => {
  const { activeProjectId } = useProjectStore();
  const { data: beats, isLoading } = beatApi.useGetBeats(activeProjectId || '');

  const [showCompleted, setShowCompleted] = useState(true);
  const [completedBeats, setCompletedBeats] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    act: true,
    story: true,
    assistant: true,
  });

  const toggleBeatCompletion = (beatId: string) => {
    setCompletedBeats((prev) => ({
      ...prev,
      [beatId]: !prev[beatId],
    }));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-gray-500">Loading beats...</div>
      </div>
    );
  }

  if (!beats || beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <BookOpen className="w-12 h-12 mb-2 opacity-50" />
        <p className="text-sm text-center">No beats yet</p>
        <p className="text-xs text-center mt-1">Create beats in the Story tab</p>
      </div>
    );
  }

  // Filter beats by type
  const actBeats = beats.filter((beat) => beat.type === 'act');
  const storyBeats = beats.filter((beat) => beat.type === 'story');

  // Calculate completion
  const completedCount = Object.values(completedBeats).filter(Boolean).length;
  const totalCount = beats.length;
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filteredBeats = showCompleted
    ? beats
    : beats.filter((beat) => !completedBeats[beat.id]);

  const sectionVariants = {
    open: {
      height: 'auto',
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
        duration: 0.2,
      },
    },
    closed: {
      height: 0,
      opacity: 0,
      transition: {
        staggerChildren: 0.03,
        staggerDirection: -1,
        duration: 0.15,
      },
    },
  };

  const itemVariants = {
    open: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
    closed: { y: 20, opacity: 0 },
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-white">Beats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`
                text-xs px-2 py-1 rounded transition-colors
                ${showCompleted
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-800 text-gray-400'
                }
              `}
            >
              {showCompleted ? 'Hide Done' : 'Show Done'}
            </button>
            <button className="p-2 bg-amber-600 hover:bg-amber-700 rounded-lg text-white shadow-lg transition-colors">
              <PlusIcon size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-amber-600 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="flex justify-end mt-1">
          <span className="text-xs text-gray-500">
            {completedCount}/{totalCount} completed
          </span>
        </div>
      </div>

      {/* Beats List */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* Act Beats Section */}
        {actBeats.length > 0 && (
          <div className="mb-3">
            <button
              className="w-full px-3 py-2 flex justify-between items-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => toggleSection('act')}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Act Beats ({actBeats.length})
              </span>
              {expandedSections.act ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {expandedSections.act && (
                <motion.ul
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                  className="overflow-hidden"
                >
                  {actBeats.map((beat) => (
                    <motion.li
                      key={beat.id}
                      variants={itemVariants}
                      className={`
                        pl-6 pr-2 py-2 my-1 mx-1 rounded-lg group hover:bg-gray-800 flex items-start
                        transition-all cursor-pointer
                        ${completedBeats[beat.id] ? 'opacity-50' : ''}
                      `}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBeatCompletion(beat.id);
                        }}
                        className="mt-0.5 mr-2 shrink-0"
                      >
                        {completedBeats[beat.id] ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-amber-500"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Circle className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${
                            completedBeats[beat.id] ? 'line-through text-gray-500' : 'text-white'
                          }`}
                        >
                          {beat.name}
                        </div>
                        {beat.description && (
                          <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                            {beat.description}
                          </div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Story Beats Section */}
        {storyBeats.length > 0 && (
          <div className="mb-3">
            <button
              className="w-full px-3 py-2 flex justify-between items-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => toggleSection('story')}
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                Story Beats ({storyBeats.length})
              </span>
              {expandedSections.story ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {expandedSections.story && (
                <motion.ul
                  initial="closed"
                  animate="open"
                  exit="closed"
                  variants={sectionVariants}
                  className="overflow-hidden"
                >
                  {storyBeats.map((beat) => (
                    <motion.li
                      key={beat.id}
                      variants={itemVariants}
                      className={`
                        pl-6 pr-2 py-2 my-1 mx-1 rounded-lg group hover:bg-gray-800 flex items-start
                        transition-all cursor-pointer
                        ${completedBeats[beat.id] ? 'opacity-50' : ''}
                      `}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBeatCompletion(beat.id);
                        }}
                        className="mt-0.5 mr-2 shrink-0"
                      >
                        {completedBeats[beat.id] ? (
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className="text-purple-500"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Circle className="h-4 w-4 text-gray-500" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium ${
                            completedBeats[beat.id] ? 'line-through text-gray-500' : 'text-white'
                          }`}
                        >
                          {beat.name}
                        </div>
                        {beat.description && (
                          <div className="text-xs text-gray-400 line-clamp-2 mt-1">
                            {beat.description}
                          </div>
                        )}
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* AI Assistant Section */}
        <div className="mb-3">
          <button
            className="w-full px-3 py-2 flex justify-between items-center text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
            onClick={() => toggleSection('assistant')}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-purple-400" />
              AI Assistant
            </span>
            {expandedSections.assistant ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>

          <AnimatePresence initial={false}>
            {expandedSections.assistant && (
              <motion.div
                initial="closed"
                animate="open"
                exit="closed"
                variants={sectionVariants}
                className="overflow-hidden"
              >
                <div className="mt-2">
                  <AIAssistantPanel
                    projectId={activeProjectId || undefined}
                    contextType="beat"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default StoryRightPanel;
