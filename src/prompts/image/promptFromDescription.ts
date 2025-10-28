import { PromptTemplate } from '../index';

/**
 * Convert Description to Image Prompt
 *
 * Converts natural language scene descriptions into optimized image generation prompts
 */
export const promptFromDescriptionPrompt: PromptTemplate = {
  system: `You are an expert at converting natural language descriptions into effective AI image generation prompts.
Transform casual scene descriptions into detailed, technically-optimized prompts that will produce great results.
Focus on visual elements, composition, lighting, and style.`,

  user: (context) => {
    const { description, targetStyle, mood, characters } = context;

    let prompt = `Convert this scene description into an optimized image generation prompt:`;

    if (description) {
      prompt += `\n\n"${description}"`;
    }

    if (targetStyle) {
      prompt += `\n\nTarget Style: ${targetStyle}`;
    }

    if (mood) {
      prompt += `\nMood/Atmosphere: ${mood}`;
    }

    if (characters && characters.length > 0) {
      prompt += `\n\nCharacters Involved:`;
      characters.forEach((char: any) => {
        prompt += `\n- ${char.name}`;
        if (char.appearance) prompt += `: ${char.appearance}`;
      });
    }

    prompt += `\n\nCreate a detailed prompt that includes:`;
    prompt += `\n1. Main subject and action`;
    prompt += `\n2. Setting and environment`;
    prompt += `\n3. Lighting and atmosphere`;
    prompt += `\n4. Visual style and quality tags`;
    prompt += `\n5. Color palette and mood`;

    prompt += `\n\nReturn ONLY the optimized prompt (60-100 words), formatted for image generation.`;

    return prompt;
  }
};
