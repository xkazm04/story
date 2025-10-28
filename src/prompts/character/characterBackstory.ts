import { PromptTemplate } from '../index';

/**
 * Character Backstory Enhancement Prompt
 *
 * Expands or improves character backstory based on existing information
 */
export const characterBackstoryPrompt: PromptTemplate = {
  system: `You are a creative writing assistant specialized in crafting compelling character backstories.
Your backstories should be concise yet rich with detail, focusing on formative experiences that shaped the character.
Write in an engaging narrative style, avoid purple prose, and ensure consistency with the character's current traits and role.`,

  user: (context) => {
    const { characterName, currentBackstory, traits, age, occupation, relationships } = context;

    let prompt = `Create an enhanced backstory for "${characterName}"`;

    if (currentBackstory) {
      prompt += `\n\nCurrent Backstory: ${currentBackstory}`;
      prompt += `\nTask: Expand and enrich this backstory with more detail and depth.`;
    } else {
      prompt += `\nTask: Create a compelling backstory from scratch.`;
    }

    if (traits && traits.length > 0) {
      prompt += `\n\nCharacter Traits: ${traits.join(', ')}`;
      prompt += `\nEnsure the backstory explains or connects to these traits.`;
    }

    if (age) prompt += `\nAge: ${age}`;
    if (occupation) prompt += `\nOccupation: ${occupation}`;

    if (relationships && relationships.length > 0) {
      prompt += `\n\nKey Relationships: ${relationships.map((r: any) => `${r.name} (${r.type})`).join(', ')}`;
    }

    prompt += `\n\nWrite 2-3 paragraphs (150-250 words). Focus on formative events, motivations, and what drives this character.`;

    return prompt;
  }
};
