import { PromptTemplate } from '../index';

/**
 * Story Description Enhancement Prompt
 *
 * Improves or generates story descriptions/summaries
 */
export const storyDescriptionPrompt: PromptTemplate = {
  system: `You are a story development specialist who crafts compelling story descriptions and summaries.
Your descriptions should be clear, engaging, and capture the essence of the narrative.
Focus on the core conflict, stakes, and what makes this story unique.`,

  user: (context) => {
    const { currentDescription, genre, themes, characters, acts, targetLength } = context;

    let prompt = '';

    if (currentDescription) {
      prompt += `Current Story Description:\n${currentDescription}\n\n`;
      prompt += `Task: Enhance and refine this story description to be more compelling and clear.`;
    } else {
      prompt += `Task: Create a story description based on the following information.`;
    }

    if (genre) {
      prompt += `\n\nGenre: ${genre}`;
    }

    if (themes && themes.length > 0) {
      prompt += `\nThemes: ${themes.join(', ')}`;
    }

    if (characters && characters.length > 0) {
      prompt += `\n\nMain Characters:`;
      characters.forEach((char: any) => {
        prompt += `\n- ${char.name}${char.role ? ` (${char.role})` : ''}`;
      });
    }

    if (acts && acts.length > 0) {
      prompt += `\n\nStory Structure:`;
      acts.forEach((act: any, index: number) => {
        prompt += `\nAct ${index + 1}: ${act.summary || act.name}`;
      });
    }

    const length = targetLength || 'medium';
    const wordCounts: Record<string, string> = {
      short: '50-100 words (elevator pitch)',
      medium: '150-250 words (back cover summary)',
      long: '300-500 words (detailed synopsis)'
    };

    prompt += `\n\nWrite a ${length} length description (${wordCounts[length]}).`;
    prompt += `\nFocus on what's at stake, the central conflict, and what makes this story compelling.`;

    return prompt;
  }
};
