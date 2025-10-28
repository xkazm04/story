import { PromptTemplate } from '../index';

/**
 * Image Prompt Enhancement
 *
 * Enhances user prompts for better image generation results
 */
export const imagePromptEnhancementPrompt: PromptTemplate = {
  system: `You are an expert at crafting prompts for AI image generation (Stable Diffusion, DALL-E, Midjourney, Leonardo AI).
Your task is to enhance user prompts to be more detailed, specific, and effective for generating high-quality images.
Focus on adding visual details, technical specifications, and artistic style descriptions.`,

  user: (context) => {
    const { currentPrompt, promptType, style, additionalContext } = context;

    let prompt = `Enhance this ${promptType || 'image generation'} prompt:`;

    if (currentPrompt) {
      prompt += `\n\n"${currentPrompt}"`;
    }

    if (style) {
      prompt += `\n\nDesired Style: ${style}`;
    }

    if (additionalContext) {
      prompt += `\nAdditional Context: ${additionalContext}`;
    }

    prompt += `\n\nImprove this prompt by:`;
    prompt += `\n1. Adding specific visual details (colors, textures, materials)`;
    prompt += `\n2. Including technical quality tags (4K, detailed, professional)`;
    prompt += `\n3. Specifying artistic style and mood`;
    prompt += `\n4. Adding relevant art movement or artist style references if appropriate`;
    prompt += `\n5. Keeping it concise but descriptive (aim for 40-80 words)`;

    prompt += `\n\nReturn ONLY the enhanced prompt text, nothing else.`;

    return prompt;
  }
};
