import { PromptTemplate } from '../index';

/**
 * Character Dialogue Style Prompt
 *
 * Generates dialogue samples or improves existing dialogue for character consistency
 */
export const characterDialoguePrompt: PromptTemplate = {
  system: `You are a dialogue specialist who helps writers create authentic, character-specific speech patterns.
Consider the character's background, personality, education level, and emotional state.
Avoid on-the-nose dialogue and exposition dumps. Show personality through word choice, rhythm, and subtext.`,

  user: (context) => {
    const { characterName, traits, background, situation, currentDialogue, tone } = context;

    let prompt = `Generate or improve dialogue for "${characterName}"`;

    if (situation) {
      prompt += `\n\nSituation: ${situation}`;
    }

    if (traits && traits.length > 0) {
      prompt += `\n\nPersonality Traits: ${traits.join(', ')}`;
    }

    if (background) {
      prompt += `\nBackground: ${background}`;
    }

    if (tone) {
      prompt += `\nDesired Tone: ${tone}`;
    }

    if (currentDialogue) {
      prompt += `\n\nCurrent Dialogue: "${currentDialogue}"`;
      prompt += `\nTask: Rewrite this dialogue to better match the character's voice and situation.`;
    } else {
      prompt += `\nTask: Write 2-3 example dialogue lines this character might say in this situation.`;
    }

    prompt += `\n\nFocus on distinctive speech patterns, vocabulary, and rhythm that reflect this character's unique voice.`;

    return prompt;
  }
};
