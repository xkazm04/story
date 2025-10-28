import { PromptTemplate } from '../index';

/**
 * Negative Prompt Suggestion
 *
 * Suggests negative prompts to avoid common issues in image generation
 */
export const negativePromptSuggestionPrompt: PromptTemplate = {
  system: `You are an expert at creating negative prompts for AI image generation.
Negative prompts specify what should NOT appear in the generated image.
Suggest relevant negative prompts based on the user's main prompt to avoid common quality issues.`,

  user: (context) => {
    const { mainPrompt, imageType } = context;

    let prompt = `Based on this image generation prompt:`;

    if (mainPrompt) {
      prompt += `\n\n"${mainPrompt}"`;
    }

    if (imageType) {
      prompt += `\n\nImage Type: ${imageType}`;
    }

    prompt += `\n\nSuggest negative prompts to avoid:`;
    prompt += `\n1. Quality issues (blurry, low quality, pixelated, etc.)`;
    prompt += `\n2. Anatomical problems (if portraits/characters)`;
    prompt += `\n3. Unwanted elements specific to this prompt`;
    prompt += `\n4. Common generation artifacts`;

    prompt += `\n\nReturn a comma-separated list of negative prompt terms (15-25 terms).`;
    prompt += `\nExample format: "blurry, low quality, watermark, text, signature, deformed hands, extra fingers"`;

    return prompt;
  }
};
