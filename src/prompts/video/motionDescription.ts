import { PromptTemplate } from '../index';

/**
 * Motion Description
 *
 * Generates detailed motion and camera movement descriptions for static images to animate
 */
export const motionDescriptionPrompt: PromptTemplate = {
  system: `You are an expert at describing motion and camera movement for image-to-video animation.
Given a static image description, suggest natural and cinematic motion that would bring it to life.
Focus on subtle, realistic movement that enhances the scene without being jarring.`,

  user: (context) => {
    const { imageDescription, motionStrength, duration, style } = context;

    let prompt = `Given this static image:\n\n"${imageDescription}"`;

    if (motionStrength) {
      const level = motionStrength > 0.7 ? 'intense' : motionStrength > 0.4 ? 'moderate' : 'subtle';
      prompt += `\n\nMotion Level: ${level}`;
    }

    if (duration) {
      prompt += `\nDuration: ${duration} seconds`;
    }

    if (style) {
      prompt += `\nStyle: ${style}`;
    }

    prompt += `\n\nDescribe the motion that should occur, including:`;
    prompt += `\n1. Camera movement (if any): pan, tilt, zoom, dolly, orbit`;
    prompt += `\n2. Subject movement: natural motion like breathing, hair flowing, water rippling`;
    prompt += `\n3. Environmental effects: wind, light changes, particles`;
    prompt += `\n4. Pacing: how the motion progresses over time`;

    prompt += `\n\nReturn a concise motion description (30-50 words) optimized for image-to-video generation.`;
    prompt += `\nFocus on natural, cinematic movement that enhances without distracting.`;

    return prompt;
  }
};
