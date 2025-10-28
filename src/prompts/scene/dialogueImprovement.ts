import { PromptTemplate } from '../index';

/**
 * Dialogue Improvement Prompt
 *
 * Improves existing scene dialogue for naturalness and character consistency
 */
export const dialogueImprovementPrompt: PromptTemplate = {
  system: `You are a dialogue editor who refines conversations to sound natural and character-consistent.
Remove exposition, eliminate "on-the-nose" dialogue, add subtext, and ensure each character has a distinct voice.
Dialogue should reveal character and advance the story simultaneously.`,

  user: (context) => {
    const { dialogue, characters, sceneContext, emotionalState, targetTone } = context;

    let prompt = `Improve the following dialogue:`;

    if (dialogue) {
      prompt += `\n\n${dialogue}`;
    }

    if (sceneContext) {
      prompt += `\n\nScene Context: ${sceneContext}`;
    }

    if (characters && characters.length > 0) {
      prompt += `\n\nCharacters:`;
      characters.forEach((char: any) => {
        prompt += `\n- ${char.name}`;
        if (char.traits) prompt += `: ${char.traits.join(', ')}`;
      });
    }

    if (emotionalState) {
      prompt += `\n\nEmotional State: ${emotionalState}`;
    }

    if (targetTone) {
      prompt += `\nTarget Tone: ${targetTone}`;
    }

    prompt += `\n\nImprove this dialogue by:`;
    prompt += `\n1. Making it sound more natural and less expository`;
    prompt += `\n2. Ensuring each character's voice is distinct`;
    prompt += `\n3. Adding subtext where appropriate`;
    prompt += `\n4. Tightening wordiness without losing meaning`;

    prompt += `\n\nReturn the improved dialogue in the same format.`;

    return prompt;
  }
};
