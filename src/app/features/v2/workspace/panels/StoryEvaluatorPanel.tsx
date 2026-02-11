'use client';

import React from 'react';
import { BarChart3 } from 'lucide-react';
import PanelFrame from './PanelFrame';
import ActOverview from '@/app/features/story/components/ActOverview';

interface StoryEvaluatorPanelProps {
  onClose?: () => void;
}

export default function StoryEvaluatorPanel({ onClose }: StoryEvaluatorPanelProps) {
  return (
    <PanelFrame title="Evaluator" icon={BarChart3} onClose={onClose}>
      <ActOverview />
    </PanelFrame>
  );
}
