import { PromptTemplate } from '../index';

/**
 * Voice Characterization Prompt
 *
 * Suggests voice characteristics for a character based on their profile
 */
export const voiceCharacterizationPrompt: PromptTemplate = {
  system: `You are a casting director who suggests ideal voice characteristics for characters.
Consider the character's personality, background, and role when suggesting vocal qualities.
Provide specific, actionable voice direction that goes beyond stereotypes.`,

  user: (context) => {
    const { characterName, traits, background, age, occupation, role, emotionalRange } = context;

    let prompt = `Suggest voice characteristics for character "${characterName}"`;

    if (traits && traits.length > 0) {
      prompt += `\n\nPersonality Traits: ${traits.join(', ')}`;
    }

    if (background) {
      prompt += `\nBackground: ${background}`;
    }

    if (age) {
      prompt += `\nAge: ${age}`;
    }

    if (occupation) {
      prompt += `\nOccupation: ${occupation}`;
    }

    if (role) {
      prompt += `\nRole in Story: ${role}`;
    }

    if (emotionalRange) {
      prompt += `\n\nEmotional Range: ${emotionalRange}`;
    }

    prompt += `\n\nProvide voice direction suggestions including:`;
    prompt += `\n1. Pitch and tone quality`;
    prompt += `\n2. Speaking pace and rhythm`;
    prompt += `\n3. Accent or regional influence (if applicable)`;
    prompt += `\n4. Unique vocal characteristics or quirks`;
    prompt += `\n5. How the voice should change in different emotional states`;

    prompt += `\n\nFormat as a short paragraph suitable for voice direction.`;

    return prompt;
  }
};
