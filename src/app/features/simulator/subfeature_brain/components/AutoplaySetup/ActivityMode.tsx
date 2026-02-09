/**
 * ActivityMode - Live activity monitoring layout (3-column layout with sidebars + center)
 */

'use client';

import React from 'react';
import {
  AutoplayPhase,
  PhaseProgress,
  AutoplayLogEntry,
  GeneratedPrompt,
  GeneratedImage,
} from './types';
import { ActivityLogSidebar } from '../ActivityLogSidebar';
import { ActivityProgressCenter } from '../ActivityProgressCenter';

export interface ActivityModeContentProps {
  currentPhase: AutoplayPhase;
  sketchProgress: PhaseProgress;
  gameplayProgress: PhaseProgress;
  posterSelected: boolean;
  hudGenerated: number;
  hudTarget: number;
  error?: string;
  textEvents: AutoplayLogEntry[];
  imageEvents: AutoplayLogEntry[];
  currentIteration?: number;
  maxIterations?: number;
  activePrompts?: GeneratedPrompt[];
  activeImages?: GeneratedImage[];
  currentImageInPhase?: number;
  phaseTarget?: number;
  singlePhaseStatus?: string;
  isExpanded: boolean;
}

/**
 * Activity Mode Content - Real-time monitoring (compact layout)
 */
export function ActivityModeContent({
  currentPhase,
  sketchProgress,
  gameplayProgress,
  posterSelected,
  hudGenerated,
  hudTarget,
  error,
  textEvents,
  imageEvents,
  currentIteration,
  maxIterations,
  activePrompts,
  activeImages,
  currentImageInPhase,
  phaseTarget,
  singlePhaseStatus,
  isExpanded,
}: ActivityModeContentProps) {
  const sidebarClass = isExpanded ? 'w-[280px] shrink-0' : 'w-[200px] shrink-0';

  return (
    <div className="flex-1 flex min-h-0">
      {/* Left Sidebar - Text Events */}
      <div className={sidebarClass}>
        <ActivityLogSidebar
          title="Text"
          events={textEvents}
          side="left"
          emptyMessage="Changes here"
        />
      </div>

      {/* Center - Progress Timeline */}
      <div className="flex-1 border-x border-slate-800/50 min-w-[200px]">
        <ActivityProgressCenter
          currentPhase={currentPhase}
          sketchProgress={sketchProgress}
          gameplayProgress={gameplayProgress}
          posterSelected={posterSelected}
          hudGenerated={hudGenerated}
          hudTarget={hudTarget}
          error={error}
          currentIteration={currentIteration}
          maxIterations={maxIterations}
          activePrompts={activePrompts}
          activeImages={activeImages}
          currentImageInPhase={currentImageInPhase}
          phaseTarget={phaseTarget}
          singlePhaseStatus={singlePhaseStatus}
          isExpanded={isExpanded}
        />
      </div>

      {/* Right Sidebar - Image Events */}
      <div className={sidebarClass}>
        <ActivityLogSidebar
          title="Images"
          events={imageEvents}
          side="right"
          emptyMessage="Events here"
        />
      </div>
    </div>
  );
}
