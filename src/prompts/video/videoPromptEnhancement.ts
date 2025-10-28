import { PromptTemplate } from '../index';

/**
 * Video Prompt Enhancement
 *
 * Enhances basic video prompts with motion, camera movement, and temporal details
 */
export const videoPromptEnhancementPrompt: PromptTemplate = {
  system: `You are an expert at crafting prompts for AI video generation.
Transform basic video descriptions into detailed, technically-optimized prompts that produce engaging videos.
Focus on motion, camera movement, temporal progression, and cinematic elements.`,

  user: (context) => {
    const { currentPrompt, duration, motionStrength, style } = context;

    let prompt = `Enhance this video generation prompt:\n\n"${currentPrompt}"`;

    if (duration) {
      prompt += `\n\nVideo Duration: ${duration} seconds`;
    }

    if (motionStrength) {
      prompt += `\nMotion Level: ${motionStrength > 0.7 ? 'High' : motionStrength > 0.4 ? 'Moderate' : 'Subtle'}`;
    }

    if (style) {
      prompt += `\nStyle: ${style}`;
    }

    prompt += `\n\nCreate an enhanced prompt that includes:`;
    prompt += `\n1. Main subject and scene`;
    prompt += `\n2. Camera movement (pan, zoom, dolly, tilt, tracking)`;
    prompt += `\n3. Subject motion and action`;
    prompt += `\n4. Lighting and atmosphere changes`;
    prompt += `\n5. Temporal progression (beginning to end state)`;
    prompt += `\n6. Technical quality tags`;

    prompt += `\n\nReturn ONLY the enhanced video prompt (50-100 words), formatted for video generation.`;
    prompt += `\nDescribe the motion and progression clearly.`;

    return prompt;
  }
};
