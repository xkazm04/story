// ============================================================================
// SIMULATOR STATE MACHINE
// ============================================================================
//
// The simulator follows a state machine pattern where AI operations are valid
// only in certain states. This ensures consistent workflow and prevents
// calling actions with inconsistent state.
//
// STATE DIAGRAM:
//
//   +--------------+
//   |    EMPTY    | <- Initial state, no project data
//   +------+------+
//          | SmartBreakdown() OR DescribeImage()
//          v
//   +-----------------+
//   | HAS_DIMENSIONS  | <- Has base image + dimensions, ready to refine or generate
//   +--------+--------+
//          / | \
//         /  |  \ <- ElementToDimension(), LabelToDimension(), FeedbackToDimension()
//        \   |  /   (all loop back to HAS_DIMENSIONS)
//         \  | /
//          \ |/
//           v| GenerateWithFeedback()
//   +-----------------+
//   |   HAS_PROMPTS   | <- Has generated prompts, ready to iterate or refine
//   +--------+--------+
//            | \
//            |  \ <- RefineFeedback() (loops back to HAS_PROMPTS)
//            |  /
//            | /
//            v
//   (Can return to HAS_DIMENSIONS by clearing prompts and editing dimensions)
//
// VALID TRANSITIONS:
// - EMPTY -> HAS_DIMENSIONS: via SmartBreakdown or DescribeImage
// - HAS_DIMENSIONS -> HAS_DIMENSIONS: via dimension refinement operations
// - HAS_DIMENSIONS -> HAS_PROMPTS: via GenerateWithFeedback
// - HAS_PROMPTS -> HAS_PROMPTS: via RefineFeedback iteration
// - HAS_PROMPTS -> HAS_DIMENSIONS: via clearing prompts (implicit)
//
// ============================================================================

import type { DimensionType, OutputMode } from './base';

/**
 * SimulatorState - The current state of the simulator workflow
 */
export type SimulatorState = 'empty' | 'has_dimensions' | 'has_prompts';

/**
 * SimulatorAction - All possible AI-driven actions in the simulator
 */
export type SimulatorAction =
  | 'smart_breakdown'        // Parse vision sentence -> dimensions
  | 'describe_image'         // Analyze image -> base description + dimensions
  | 'element_to_dimension'   // Convert locked elements -> new dimensions
  | 'label_to_dimension'     // Refine dimensions based on accepted element
  | 'feedback_to_dimension'  // Apply preserve/change feedback -> dimension updates
  | 'generate_with_feedback' // Generate prompts from dimensions + feedback
  | 'refine_feedback';       // Iterate on prompts with change feedback

/**
 * StateTransition - Defines valid state transitions for each action
 */
export interface StateTransition {
  action: SimulatorAction;
  fromStates: SimulatorState[];
  toState: SimulatorState;
  description: string;
}

/**
 * SIMULATOR_TRANSITIONS - The complete state machine definition
 * Documents all valid transitions and their effects
 */
export const SIMULATOR_TRANSITIONS: StateTransition[] = [
  {
    action: 'smart_breakdown',
    fromStates: ['empty', 'has_dimensions'], // Can re-parse from any non-prompt state
    toState: 'has_dimensions',
    description: 'Parse a vision sentence into structured dimensions',
  },
  {
    action: 'describe_image',
    fromStates: ['empty', 'has_dimensions'],
    toState: 'has_dimensions',
    description: 'Analyze an uploaded image to extract base description and suggest dimensions',
  },
  {
    action: 'element_to_dimension',
    fromStates: ['has_dimensions', 'has_prompts'],
    toState: 'has_dimensions',
    description: 'Convert locked prompt elements into reusable dimensions',
  },
  {
    action: 'label_to_dimension',
    fromStates: ['has_dimensions', 'has_prompts'],
    toState: 'has_dimensions',
    description: 'Gently refine dimensions based on an accepted element label',
  },
  {
    action: 'feedback_to_dimension',
    fromStates: ['has_dimensions'],
    toState: 'has_dimensions',
    description: 'Apply preserve/change feedback to update dimensions',
  },
  {
    action: 'generate_with_feedback',
    fromStates: ['has_dimensions'],
    toState: 'has_prompts',
    description: 'Generate prompts from current dimensions and feedback',
  },
  {
    action: 'refine_feedback',
    fromStates: ['has_prompts'],
    toState: 'has_prompts',
    description: 'Iterate on generated prompts with refinement feedback',
  },
];

/**
 * Check if an action is valid from the current state
 */
export function isValidTransition(currentState: SimulatorState, action: SimulatorAction): boolean {
  const transition = SIMULATOR_TRANSITIONS.find((t) => t.action === action);
  return transition ? transition.fromStates.includes(currentState) : false;
}

/**
 * Get the resulting state after an action (if valid)
 */
export function getNextState(currentState: SimulatorState, action: SimulatorAction): SimulatorState | null {
  if (!isValidTransition(currentState, action)) {
    return null;
  }
  const transition = SIMULATOR_TRANSITIONS.find((t) => t.action === action);
  return transition ? transition.toState : null;
}

/**
 * Get all valid actions from the current state
 */
export function getValidActions(currentState: SimulatorState): SimulatorAction[] {
  return SIMULATOR_TRANSITIONS
    .filter((t) => t.fromStates.includes(currentState))
    .map((t) => t.action);
}

/**
 * Determine the current state based on simulator data
 */
export function deriveSimulatorState(
  hasDimensions: boolean,
  hasPrompts: boolean
): SimulatorState {
  if (hasPrompts) return 'has_prompts';
  if (hasDimensions) return 'has_dimensions';
  return 'empty';
}

// ============================================================================
// SMART BREAKDOWN TYPES
// ============================================================================

/**
 * SmartBreakdownResult - AI response from parsing a vision sentence
 * Contains the structured breakdown of user's creative intent
 */
export interface SmartBreakdownResult {
  success: boolean;
  baseImage: {
    description: string;
    format: string;
    keyElements: string[];
  };
  dimensions: Array<{
    type: DimensionType;
    reference: string;
    confidence: number;
  }>;
  suggestedOutputMode: OutputMode;
  reasoning: string;
}

/**
 * SmartBreakdownPersisted - Subset of SmartBreakdownResult for database storage
 * Excludes fields that are already persisted separately (dimensions, outputMode)
 * and transient fields (success boolean)
 */
export interface SmartBreakdownPersisted {
  baseImage: {
    format: string;
    keyElements: string[];
  };
  reasoning: string;
}
