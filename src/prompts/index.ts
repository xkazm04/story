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
export { characterNameSuggestionsPrompt } from './character/characterNameSuggestions';

// Faction prompts
export { factionDescriptionPrompt } from './faction/factionDescription';
export { factionLorePrompt } from './faction/factionLore';
export { factionRelationshipPrompt } from './faction/factionRelationship';
export { smartFactionCreationPrompt } from './faction/smartFactionCreation';

// Project prompts
export { projectInspirationPrompt } from './project/projectInspiration';

// Story prompts
export { storyDescriptionPrompt } from './story/storyDescription';
export { beatDescriptionPrompt } from './story/beatDescription';
export { beatSummaryPrompt } from './story/beatSummary';
export { beatNameSuggestionsPrompt } from './story/beatNameSuggestions';
export { beatToSceneMappingPrompt } from './story/beatToSceneMapping';
export { actSummaryPrompt } from './story/actSummary';
export { actDescriptionRecommendationPrompt } from './story/actDescriptionRecommendation';

// Scene prompts
export { sceneDescriptionPrompt } from './scene/sceneDescription';
export { dialogueImprovementPrompt } from './scene/dialogueImprovement';
export { sceneNameSuggestionsPrompt } from './scene/sceneNameSuggestions';
export { generateDialoguePrompt } from './scene/generateDialogue';
export { generateOverviewPrompt } from './scene/generateOverview';

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

// AI Assistant prompts
export {
  narrativeAssistantPrompt,
  quickSceneHookPrompt,
  quickDialoguePrompt,
  quickBeatOutlinePrompt
} from './assistant/narrativeAssistant';

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
 * Using 'any' for context to allow flexibility in prompt implementations
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PromptTemplate<T = any> {
  system: string;
  user: (context: T) => string;
}

export const createPrompt = <T>(template: PromptTemplate<T>, context: T): string => {
  return `${template.system}\n\n${template.user(context)}`;
};
