/**
 * Centralized prompt management system
 *
 * This file exports all prompts used across the application for LLM interactions.
 * Each prompt is designed to be context-aware and produce consistent results.
 */

// Character prompts
export { characterTraitPrompt } from './character/characterTrait';
export { characterBackstoryPrompt } from './character/characterBackstory';
export { characterDialoguePrompt } from './character/characterDialogue';
export { personalityExtractionPrompt } from './character/personalityExtraction';

// Story prompts
export { storyDescriptionPrompt } from './story/storyDescription';
export { beatDescriptionPrompt } from './story/beatDescription';
export { actSummaryPrompt } from './story/actSummary';

// Scene prompts
export { sceneDescriptionPrompt } from './scene/sceneDescription';
export { dialogueImprovementPrompt } from './scene/dialogueImprovement';

// Voice prompts
export { voiceDescriptionPrompt } from './voice/voiceDescription';
export { voiceCharacterizationPrompt } from './voice/voiceCharacterization';

// Dataset prompts
export { datasetTaggingPrompt } from './dataset/datasetTagging';
export { imageAnalysisPrompt } from './dataset/imageAnalysis';
export { audioTranscriptionPrompt } from './dataset/audioTranscription';

// Image generation prompts
export { imagePromptEnhancementPrompt } from './image/promptEnhancement';
export { negativePromptSuggestionPrompt } from './image/negativePromptSuggestion';
export { promptFromDescriptionPrompt } from './image/promptFromDescription';

// Video generation prompts
export { videoPromptEnhancementPrompt } from './video/videoPromptEnhancement';
export { storyboardGenerationPrompt } from './video/storyboardGeneration';
export { motionDescriptionPrompt } from './video/motionDescription';
export { shotCompositionPrompt } from './video/shotComposition';

// Smart/Context-Aware Generation Prompts
// These prompts leverage rich project context for intelligent generation
// The more data in your project, the better and more consistent the results
export { smartCharacterCreationPrompt } from './character/smartCharacterCreation';
export { smartSceneGenerationPrompt } from './scene/smartSceneGeneration';
export { smartImageGenerationPrompt } from './image/smartImageGeneration';
export { smartVideoGenerationPrompt } from './video/smartVideoGeneration';

// Context gathering utilities (used by smart prompts)
export {
  gatherProjectContext,
  gatherStoryContext,
  gatherCharacterContext,
  gatherSceneContext,
  gatherVisualStyleContext,
  gatherSceneCharacters,
  buildContextSummary,
  type ProjectContext,
  type StoryContext,
  type CharacterContext,
  type SceneContext,
  type VisualStyleContext
} from '../app/lib/contextGathering';

/**
 * Base prompt template utility
 */
export interface PromptTemplate {
  system: string;
  user: (context: Record<string, any>) => string;
}

export const createPrompt = (template: PromptTemplate, context: Record<string, any>): string => {
  return `${template.system}\n\n${template.user(context)}`;
};
