/**
 * Tutorial Components - Interactive guided tours and contextual help
 */

export { TourOverlay } from './TourOverlay';
export { ContextualTooltip, HelpIcon } from './ContextualTooltip';
export type { TooltipTrigger, TooltipPlacement, TooltipVariant } from './ContextualTooltip';
export { HelpPanel } from './HelpPanel';
export type { HelpArticle, HelpPanelProps } from './HelpPanel';
export { TutorialProvider, useTutorial } from './TutorialProvider';

// Re-export library types for convenience
export type { Tour, TourStep, TourProgress } from '@/lib/tutorial';
export { useTour, useRegisterTour, useFeatureDisclosure, TourEngine } from '@/lib/tutorial';
