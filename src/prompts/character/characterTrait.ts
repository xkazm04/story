import { PromptTemplate } from '../index';

/**
 * Character Trait Generation Prompt
 *
 * Generates traits based on character context and existing traits
 */
export const characterTraitPrompt: PromptTemplate = {
  system: `You are a creative writing assistant specialized in character development.
Your task is to generate compelling, nuanced character traits that feel authentic and add depth to the character.
Consider the character's background, role, and existing traits when suggesting new ones.
Keep traits concise (1-5 words) and avoid clichés.`,

  user: (context) => {
    const { characterName, characterType, existingTraits, role, background } = context;

    let prompt = `Generate 3-5 unique character traits for "${characterName}"`;

    if (characterType) {
      prompt += `\nCharacter Type: ${characterType}`;
    }

    if (role) {
      prompt += `\nRole in Story: ${role}`;
    }

    if (background) {
      prompt += `\nBackground: ${background}`;
    }

    if (existingTraits && existingTraits.length > 0) {
      prompt += `\n\nExisting Traits: ${existingTraits.join(', ')}`;
      prompt += `\nSuggest traits that complement but don't repeat these.`;
    }

    prompt += `\n\nReturn ONLY a JSON array of trait objects with format: [{"category": "personality|physical|skill|flaw", "trait": "trait description"}]`;

    return prompt;
  }
};
