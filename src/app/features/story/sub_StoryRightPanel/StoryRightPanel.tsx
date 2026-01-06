'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, ChevronDown, ChevronUp, CheckCircle, Circle, BookOpen, Sparkles } from 'lucide-react';
import { useProjectStore } from '@/app/store/projectStore';
import { beatApi } from '@/app/hooks/integration/useBeats';
import { AIAssistantPanel } from '@/app/features/assistant/AIAssistantPanel';
import type { Beat } from '@/app/types/Beat';

const StoryRightPanel: React.FC = () => {
  const { selectedProject } = useProjectStore();
  const { data: beats, isLoading } = beatApi.useGetBeats(selectedProject?.id || '');

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
      <div className="flex items-center justify-center h-full text-sm text-slate-400">
        Loading beats...
      </div>
    );
  }

  if (!beats || beats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-4 text-sm">
        <BookOpen className="w-10 h-10 mb-2 opacity-60" />
        <p className="text-center text-slate-300">No beats yet</p>
        <p className="text-xs text-center mt-1">Create beats in the Story tab.</p>
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
      transition: { type: 'spring' as const, stiffness: 300, damping: 24 },
    },
    closed: { y: 20, opacity: 0 },
  };

  return (
    <div className="flex flex-col h-full text-sm text-slate-200">
      {/* Header */}
      <div className="p-3 border-b border-slate-800/70 bg-slate-950/95">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-semibold text-slate-50 tracking-tight">Beats</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`
                text-[11px] px-2 py-1 rounded-lg border transition-colors
                ${showCompleted
                  ? 'bg-slate-900/80 text-slate-50 border-cyan-500/40'
                  : 'bg-slate-950/80 text-slate-400 border-slate-800 hover:bg-slate-900'
                }
              `}
            >
              {showCompleted ? 'Hide Done' : 'Show Done'}
            </button>
            <button className="p-1.5 bg-cyan-600/20 hover:bg-cyan-600/30 rounded-lg text-slate-50 border border-cyan-500/40 shadow-sm shadow-cyan-500/30">
              <PlusIcon size={16} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${completionPercentage}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>

        <div className="flex justify-end mt-1">
          <span className="text-xs text-slate-500">
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
              className="w-full px-3 py-2 flex justify-between items-center text-xs font-medium rounded-lg hover:bg-slate-900 transition-colors text-slate-200"
              onClick={() => toggleSection('act')}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                Act Beats ({actBeats.length})
              </span>
              {expandedSections.act ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
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
                        pl-6 pr-2 py-1.5 my-1 mx-1 rounded-lg group hover:bg-slate-900 flex items-start
                        transition-all cursor-pointer
                        ${completedBeats[beat.id] ? 'opacity-60' : ''}
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
                            className="text-cyan-400"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </motion.div>
                        ) : (
                          <Circle className="h-4 w-4 text-slate-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium ${
                            completedBeats[beat.id] ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {beat.name}
                        </div>
                        {beat.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
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
              className="w-full px-3 py-2 flex justify-between items-center text-xs font-medium rounded-lg hover:bg-slate-900 transition-colors text-slate-200"
              onClick={() => toggleSection('story')}
            >
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                Story Beats ({storyBeats.length})
              </span>
              {expandedSections.story ? (
                <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
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
                        pl-6 pr-2 py-1.5 my-1 mx-1 rounded-lg group hover:bg-slate-900 flex items-start
                        transition-all cursor-pointer
                        ${completedBeats[beat.id] ? 'opacity-60' : ''}
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
                          <Circle className="h-4 w-4 text-slate-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs font-medium ${
                            completedBeats[beat.id] ? 'line-through text-slate-500' : 'text-slate-100'
                          }`}
                        >
                          {beat.name}
                        </div>
                        {beat.description && (
                          <div className="text-[11px] text-slate-400 line-clamp-2 mt-1">
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
            className="w-full px-3 py-2 flex justify-between items-center text-xs font-medium rounded-lg hover:bg-slate-900 transition-colors text-slate-200"
            onClick={() => toggleSection('assistant')}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              AI Assistant
            </span>
            {expandedSections.assistant ? (
              <ChevronUp className="h-3.5 w-3.5 text-slate-500" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
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
                    projectId={selectedProject?.id}
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
