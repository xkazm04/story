'use client';

import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/app/components/UI/Card';
import { Button } from '@/app/components/UI/Button';
import { BeatTableItem } from './BeatsOverview';
import { Sparkles, CheckCircle2, Circle, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

interface BeatSummaryCardProps {
  beat: BeatTableItem;
  index: number;
  summary?: string;
  isGenerating?: boolean;
  onGenerateSummary?: (beatId: string) => void;
  onToggleCompletion?: (beatId: string) => void;
  onEdit?: (beatId: string) => void;
}

/**
 * Visual Beat Summary Card Component
 *
 * Displays compact, illustrated summary cards for story beats
 * Features:
 * - AI-generated concise narrative overview
 * - Visual indicators for beat type and completion
 * - Context-appropriate icons
 * - Expandable details
 * - Drag and drop support (when integrated)
 */
export function BeatSummaryCard({
  beat,
  index,
  summary,
  isGenerating = false,
  onGenerateSummary,
  onToggleCompletion,
  onEdit,
}: BeatSummaryCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate color based on beat type
  const typeColors = {
    story: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    act: 'from-cyan-500/20 to-cyan-600/20 border-cyan-500/30',
  };

  const typeIconColors = {
    story: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    act: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
  };

  const gradientClass = typeColors[beat.type as keyof typeof typeColors] || typeColors.act;
  const iconColorClass = typeIconColors[beat.type as keyof typeof typeIconColors] || typeIconColors.act;

  // Estimate reading time based on description length
  const estimatedMinutes = beat.estimated_duration
    ? Math.round(beat.estimated_duration / 60)
    : beat.description
    ? Math.max(1, Math.round(beat.description.length / 100))
    : 1;

  return (
    <Card
      variant="gradient"
      padding="none"
      hoverable
      className={clsx(
        'group relative overflow-hidden transition-all duration-300',
        'bg-gradient-to-br',
        gradientClass,
        isExpanded && 'ring-2 ring-cyan-500/30'
      )}
      data-testid={`beat-summary-card-${beat.id}`}
    >
      {/* Header with icon, title, and sequence number */}
      <div className="p-3 pb-2">
        <CardHeader
          className="mb-0"
          icon={
            <div className={clsx(
              'w-8 h-8 rounded flex items-center justify-center border',
              iconColorClass
            )}>
              <span className="text-xs font-bold">#{index + 1}</span>
            </div>
          }
          action={
            <div className="flex items-center gap-1.5">
              {/* Duration indicator */}
              {estimatedMinutes > 0 && (
                <div
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800/50 border border-gray-700/50"
                  title="Estimated duration"
                >
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-[10px] text-gray-400">{estimatedMinutes}m</span>
                </div>
              )}

              {/* Completion toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCompletion?.(beat.id);
                }}
                className="transition-colors"
                data-testid={`beat-card-complete-btn-${beat.id}`}
                title={beat.completed ? 'Mark incomplete' : 'Mark complete'}
              >
                {beat.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-500 hover:text-gray-400" />
                )}
              </button>
            </div>
          }
        >
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate group-hover:text-cyan-300 transition-colors">
              {beat.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={clsx(
                'text-[10px] uppercase font-medium px-1.5 py-0.5 rounded',
                beat.type === 'story' ? 'text-purple-300 bg-purple-500/20' : 'text-cyan-300 bg-cyan-500/20'
              )}>
                {beat.type}
              </span>
              {beat.pacing_score && (
                <span className="text-[10px] text-gray-400">
                  Pace: {beat.pacing_score}/10
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </div>

      {/* Summary content */}
      <div className="px-3 pb-3">
        <CardContent className="space-y-2">
          {/* AI-generated summary */}
          {isGenerating ? (
            <div className="flex items-center gap-2 py-2 text-xs text-gray-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span className="animate-pulse">Generating summary...</span>
            </div>
          ) : summary ? (
            <p className="text-xs text-gray-300 leading-relaxed">
              {summary}
            </p>
          ) : (
            <div className="py-1">
              <p className="text-xs text-gray-400 italic">
                {beat.description
                  ? beat.description.substring(0, 100) + (beat.description.length > 100 ? '...' : '')
                  : 'No summary available'}
              </p>
              {onGenerateSummary && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onGenerateSummary(beat.id);
                  }}
                  className="mt-2 text-xs flex items-center gap-1.5"
                  data-testid={`beat-card-generate-summary-btn-${beat.id}`}
                >
                  <Sparkles className="w-3 h-3" />
                  Generate Summary
                </Button>
              )}
            </div>
          )}

          {/* Expandable full description */}
          {beat.description && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors"
              data-testid={`beat-card-expand-btn-${beat.id}`}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  Show full description
                </>
              )}
            </button>
          )}

          {/* Expanded description */}
          <AnimatePresence>
            {isExpanded && beat.description && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-2 mt-2 border-t border-gray-700/50">
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {beat.description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </div>

      {/* Footer with metadata */}
      {(beat.paragraph_title || onEdit) && (
        <CardFooter className="px-3 pb-3 pt-0 mt-0 border-t-0">
          <div className="flex items-center justify-between w-full">
            {beat.paragraph_title && (
              <span className="text-[10px] text-gray-500 truncate max-w-[60%]">
                {beat.paragraph_title}
              </span>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(beat.id);
                }}
                className="text-xs px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity"
                data-testid={`beat-card-edit-btn-${beat.id}`}
              >
                Edit
              </Button>
            )}
          </div>
        </CardFooter>
      )}

      {/* Completion overlay */}
      {beat.completed && (
        <div className="absolute inset-0 bg-green-500/5 pointer-events-none" />
      )}
    </Card>
  );
}

/**
 * Loading skeleton for beat summary cards
 */
export function BeatSummaryCardSkeleton({ index }: { index: number }) {
  return (
    <Card
      variant="gradient"
      padding="none"
      className="bg-gradient-to-br from-gray-800/20 to-gray-900/20 border-gray-700/30 animate-pulse"
      data-testid={`beat-summary-card-skeleton-${index}`}
    >
      <div className="p-3 space-y-2">
        <div className="flex items-start gap-2">
          <div className="w-8 h-8 rounded bg-gray-700/50" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-700/50 rounded w-3/4" />
            <div className="h-3 bg-gray-700/30 rounded w-1/4" />
          </div>
        </div>
        <div className="space-y-1.5 pt-2">
          <div className="h-3 bg-gray-700/30 rounded w-full" />
          <div className="h-3 bg-gray-700/30 rounded w-5/6" />
        </div>
      </div>
    </Card>
  );
}
