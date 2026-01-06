import { PromptTemplate } from '../index';
import type {
  CharacterInfo,
  ProjectContextInfo,
  StoryContextInfo,
  SceneContextInfo,
} from '../types';

/**
 * Smart Scene Generation (Context-Aware)
 *
 * Generates scenes that naturally flow from the story, characters, and previous scenes.
 * Leverages character relationships, story beats, and narrative continuity.
 */
export const smartSceneGenerationPrompt: PromptTemplate = {
  system: `You are an expert screenwriter and scene designer.
Create scenes that flow naturally from the story's progression.
Consider character relationships, emotional arcs, story beats, and narrative continuity.
Every scene should advance the plot, develop characters, or explore themes.`,

  user: (context: {
    sceneTitle: string;
    sceneLocation?: string;
    projectContext?: ProjectContextInfo;
    storyContext?: StoryContextInfo;
    sceneContext?: SceneContextInfo;
    characters?: CharacterInfo[];
  }) => {
    const { sceneTitle, sceneLocation, projectContext, storyContext, sceneContext, characters } = context;

    let prompt = `Create a detailed scene:\n`;
    prompt += `Title: "${sceneTitle}"\n`;
    if (sceneLocation) prompt += `Location: ${sceneLocation}\n`;

    // Project context
    if (projectContext) {
      prompt += `\n=== STORY CONTEXT ===\n`;
      prompt += `Project: "${projectContext.title}"\n`;
      if (projectContext.themes?.length) prompt += `Themes: ${projectContext.themes.join(', ')}\n`;
      if (projectContext.tone) prompt += `Tone: ${projectContext.tone}\n`;
    }

    // Story progression context
    if (storyContext) {
      prompt += `\n=== STORY PROGRESSION ===\n`;
      if (storyContext.currentActName) prompt += `Current Act: ${storyContext.currentActName}\n`;
      if (storyContext.beats && storyContext.beats.length > 0) {
        prompt += `Relevant Story Beats:\n`;
        storyContext.beats.slice(-5).forEach((beat) => {
          prompt += `- ${beat.name}: ${beat.description || 'Advance the narrative'}\n`;
        });
      }
    }

    // Scene continuity context
    if (sceneContext) {
      if (sceneContext.previousScene) {
        prompt += `\n=== PREVIOUS SCENE ===\n`;
        prompt += `"${sceneContext.previousScene.title}"\n`;
        if (sceneContext.previousScene.description) {
          prompt += `${sceneContext.previousScene.description}\n`;
        }
      }
      if (sceneContext.nextScene) {
        prompt += `\n=== UPCOMING SCENE ===\n`;
        prompt += `"${sceneContext.nextScene.title}"\n`;
        prompt += `(This scene should lead naturally into it)\n`;
      }
    }

    // Character context
    if (characters && characters.length > 0) {
      prompt += `\n=== CHARACTERS IN SCENE ===\n`;
      characters.forEach((char) => {
        prompt += `\n${char.name}${char.role ? ` (${char.role})` : ''}\n`;
        if (char.traits?.length) prompt += `  Traits: ${char.traits.join(', ')}\n`;
        if (char.personality) prompt += `  Personality: ${char.personality}\n`;
        if (char.background) prompt += `  Background: ${char.background.substring(0, 150)}...\n`;

        // Show relationships between characters in the scene
        if (char.relationships && char.relationships.length > 0) {
          const relevantRels = char.relationships.filter((r) =>
            characters.some((c) => c.id === r.targetCharacterId)
          );
          if (relevantRels.length > 0) {
            prompt += `  Relationships:\n`;
            relevantRels.forEach((rel) => {
              prompt += `    - ${rel.relationshipType} with ${rel.targetCharacterName}`;
              if (rel.description) prompt += `: ${rel.description}`;
              prompt += `\n`;
            });
          }
        }
      });
    }

    prompt += `\n=== GENERATE SCENE ===\n`;
    prompt += `Create a compelling scene that:\n`;
    prompt += `1. **Advances the Story**: Moves the plot forward or explores themes\n`;
    prompt += `2. **Develops Characters**: Shows character growth through their interactions\n`;
    prompt += `3. **Uses Relationships**: Leverages the established character dynamics\n`;
    prompt += `4. **Maintains Continuity**: Flows naturally from previous scene\n`;
    prompt += `5. **Creates Tension**: Includes conflict, stakes, or emotional depth\n`;
    prompt += `6. **Sets Up Future**: Plants seeds for upcoming developments\n`;

    prompt += `\nProvide:\n`;
    prompt += `1. **Scene Description** (vivid, sensory, atmospheric - 150-250 words)\n`;
    prompt += `2. **Action Summary** (what happens, beat by beat)\n`;
    prompt += `3. **Character Dynamics** (how characters interact, emotional undercurrents)\n`;
    prompt += `4. **Dialogue Direction** (tone, subtext, key exchanges)\n`;
    prompt += `5. **Visual Moments** (memorable images or actions)\n`;
    prompt += `6. **Scene Purpose** (what this scene accomplishes in the story)\n`;
    prompt += `7. **Emotional Arc** (how characters feel at start vs end)\n`;

    return prompt;
  }
};
