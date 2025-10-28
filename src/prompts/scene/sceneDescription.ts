import { PromptTemplate } from '../index';

/**
 * Scene Description Prompt
 *
 * Generates or enhances scene descriptions
 */
export const sceneDescriptionPrompt: PromptTemplate = {
  system: `You are a scene writing specialist who crafts vivid, purposeful scene descriptions.
Descriptions should set the mood, establish the setting, and hint at the emotional stakes.
Use sensory details and active language. Avoid overwriting - be evocative but concise.`,

  user: (context) => {
    const { sceneName, currentDescription, location, timeOfDay, characters, mood, purpose } = context;

    let prompt = `Create a scene description for: "${sceneName}"`;

    if (currentDescription) {
      prompt += `\n\nCurrent Description: ${currentDescription}`;
      prompt += `\nTask: Enhance this scene description with more vivid detail and atmosphere.`;
    } else {
      prompt += `\nTask: Write a compelling scene description.`;
    }

    if (location) {
      prompt += `\n\nLocation: ${location}`;
    }

    if (timeOfDay) {
      prompt += `\nTime: ${timeOfDay}`;
    }

    if (mood) {
      prompt += `\nMood/Tone: ${mood}`;
    }

    if (characters && characters.length > 0) {
      prompt += `\n\nCharacters Present: ${characters.join(', ')}`;
    }

    if (purpose) {
      prompt += `\n\nScene Purpose: ${purpose}`;
    }

    prompt += `\n\nWrite 2-4 sentences that:`;
    prompt += `\n1. Establish the setting with sensory details`;
    prompt += `\n2. Create atmosphere that matches the scene's emotional tone`;
    prompt += `\n3. Hint at what's at stake in this moment`;

    return prompt;
  }
};
