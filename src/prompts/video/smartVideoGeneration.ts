import { PromptTemplate } from '../index';
import type {
  CharacterInfo,
  ProjectContextInfo,
  SceneInfo,
  VisualStyleContextInfo,
  PreviousShot,
} from '../types';

/**
 * Smart Video Generation (Context-Aware)
 *
 * Generates videos that maintain visual and narrative consistency.
 * Uses scene context, character dynamics, and established visual style.
 */
export const smartVideoGenerationPrompt: PromptTemplate = {
  system: `You are an expert cinematographer and director.
Create video generation prompts that maintain visual consistency and narrative flow.
Consider character appearances, scene continuity, and established visual style.
Every shot should serve the story and maintain the established look.`,

  user: (context: {
    basicPrompt: string;
    projectContext?: ProjectContextInfo;
    sceneContext?: SceneInfo & {
      previousScene?: SceneInfo;
    };
    characters?: CharacterInfo[];
    visualStyleContext?: VisualStyleContextInfo;
    duration?: number;
    previousShots?: PreviousShot[];
  }) => {
    const {
      basicPrompt,
      projectContext,
      sceneContext,
      characters,
      visualStyleContext,
      duration,
      previousShots,
    } = context;

    let prompt = `Create a video generation prompt for:\n`;
    prompt += `${basicPrompt}\n`;
    if (duration) prompt += `Duration: ${duration} seconds\n`;

    // Project context
    if (projectContext) {
      prompt += `\n=== PROJECT STYLE ===\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.tone) prompt += `Tone: ${projectContext.tone}\n`;
    }

    // Visual consistency
    if (visualStyleContext) {
      prompt += `\n=== VISUAL CONTINUITY ===\n`;
      if (visualStyleContext.projectStyle) {
        prompt += `Established Style: ${visualStyleContext.projectStyle}\n`;
      }
      if (visualStyleContext.colorPalette && visualStyleContext.colorPalette.length > 0) {
        prompt += `Color Palette: ${visualStyleContext.colorPalette.join(', ')}\n`;
      }
    }

    // Scene context
    if (sceneContext) {
      prompt += `\n=== SCENE CONTEXT ===\n`;
      prompt += `Scene: "${sceneContext.title}"\n`;
      if (sceneContext.description) prompt += `${sceneContext.description}\n`;
      if (sceneContext.location) prompt += `Location: ${sceneContext.location}\n`;
      if (sceneContext.timeOfDay) prompt += `Time: ${sceneContext.timeOfDay}\n`;
      if (sceneContext.mood) prompt += `Mood: ${sceneContext.mood}\n`;

      // Previous and next scenes for flow
      if (sceneContext.previousScene) {
        prompt += `\nPrevious Scene: "${sceneContext.previousScene.title}"\n`;
        prompt += `(Shot should flow from previous context)\n`;
      }
    }

    // Characters in shot
    if (characters && characters.length > 0) {
      prompt += `\n=== CHARACTERS ===\n`;
      characters.forEach((char) => {
        prompt += `\n${char.name}:\n`;
        if (char.appearance) prompt += `  Appearance: ${char.appearance}\n`;
        if (char.traits && char.traits.length > 0) {
          prompt += `  Traits (inform behavior): ${char.traits.join(', ')}\n`;
        }

        // Character dynamics
        if (char.relationships && char.relationships.length > 0) {
          const relevantRels = char.relationships.filter((r) =>
            characters.some((c) => c.id === r.targetCharacterId)
          );
          if (relevantRels.length > 0) {
            prompt += `  Dynamics: `;
            prompt += relevantRels
              .map((r) => `${r.relationshipType} with ${r.targetCharacterName}`)
              .join('; ');
            prompt += `\n`;
          }
        }
      });
    }

    // Shot continuity
    if (previousShots && previousShots.length > 0) {
      prompt += `\n=== PREVIOUS SHOTS ===\n`;
      previousShots.slice(-3).forEach((shot, idx) => {
        prompt += `Shot ${idx + 1}: ${shot.prompt || shot.description}\n`;
      });
      prompt += `(Maintain visual and narrative continuity)\n`;
    }

    prompt += `\n=== GENERATE VIDEO PROMPT ===\n`;
    prompt += `Create a detailed video generation prompt that:\n\n`;

    prompt += `1. **Visual Consistency**:\n`;
    prompt += `   - Characters match established appearances\n`;
    prompt += `   - Location matches scene description\n`;
    prompt += `   - Style consistent with project\n`;
    prompt += `   - Color palette maintained\n\n`;

    prompt += `2. **Camera Work**:\n`;
    prompt += `   - Specific camera movement (pan, tilt, dolly, zoom, static)\n`;
    prompt += `   - Camera angle (eye level, high, low, dutch, POV)\n`;
    prompt += `   - Shot type (close-up, medium, wide, establishing)\n`;
    prompt += `   - Composition rules\n\n`;

    prompt += `3. **Motion & Action**:\n`;
    prompt += `   - Character movement and gestures\n`;
    prompt += `   - Environmental motion (wind, water, light)\n`;
    prompt += `   - Pacing and timing\n`;
    prompt += `   - Emotional dynamics between characters\n\n`;

    prompt += `4. **Lighting & Atmosphere**:\n`;
    prompt += `   - Lighting setup (natural, dramatic, soft, etc.)\n`;
    prompt += `   - Time of day effects\n`;
    prompt += `   - Mood and atmosphere\n`;
    prompt += `   - Visual effects\n\n`;

    prompt += `5. **Narrative Flow**:\n`;
    prompt += `   - How it connects to previous shots\n`;
    prompt += `   - What story information it conveys\n`;
    prompt += `   - Emotional progression\n`;
    prompt += `   - Transition considerations\n\n`;

    prompt += `Return a comprehensive video generation prompt (80-120 words).`;
    prompt += `Include camera movement, subject motion, lighting changes, and temporal progression.`;
    prompt += `Ensure consistency with established visual style and character appearances.`;

    return prompt;
  }
};
