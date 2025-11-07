import { PromptTemplate } from '../index';

/**
 * Project Story Inspiration Prompt
 *
 * Generates story inspiration and thematic ideas based on user's initial thoughts.
 * Helps writers develop their concept into a more detailed and compelling description.
 */
export const projectInspirationPrompt: PromptTemplate = {
  system: `You are a creative writing consultant and story development expert.
Your role is to take a writer's initial story ideas and help them develop those thoughts into an inspiring, detailed project description.
You excel at identifying themes, potential conflicts, and interesting story directions from brief concepts.
Your suggestions are imaginative yet grounded, helping writers see the full potential of their ideas.`,

  user: (context) => {
    const { currentDescription, projectName, genre, existingElements } = context;

    let prompt = `Project Name: ${projectName || 'Untitled Project'}\n\n`;

    if (currentDescription && currentDescription.trim()) {
      prompt += `The writer has these initial thoughts about their story:\n"${currentDescription}"\n\n`;
      prompt += `Task: Expand on these initial ideas to create an inspiring and detailed project description. `;
      prompt += `Identify the core themes, potential conflicts, and story hooks. `;
      prompt += `Help the writer see the full potential of their concept.\n\n`;
    } else {
      prompt += `The writer is starting a new story project but hasn't written a description yet.\n\n`;
      prompt += `Task: Generate an inspiring story concept that could serve as a foundation for this project. `;
      prompt += `Be creative and provide a rich, engaging description that sparks imagination.\n\n`;
    }

    if (genre) {
      prompt += `Genre/Type: ${genre}\n`;
    }

    if (existingElements && Object.keys(existingElements).length > 0) {
      prompt += `\nExisting Project Elements:\n`;
      if (existingElements.characterCount > 0) {
        prompt += `- ${existingElements.characterCount} character(s) created\n`;
      }
      if (existingElements.actCount > 0) {
        prompt += `- ${existingElements.actCount} act(s) outlined\n`;
      }
      if (existingElements.sceneCount > 0) {
        prompt += `- ${existingElements.sceneCount} scene(s) planned\n`;
      }
    }

    prompt += `\nGuidelines:
- Write 2-4 paragraphs (150-300 words total)
- Identify the central conflict or driving force
- Highlight what makes this story unique and compelling
- Suggest potential themes or deeper meanings
- Make it inspiring and motivational for the writer
- Write in an engaging, professional tone
- Return ONLY the description text, no preamble or explanations

Generate the enhanced project description:`;

    return prompt;
  }
};
