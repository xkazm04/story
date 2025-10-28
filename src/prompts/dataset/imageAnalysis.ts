import { PromptTemplate } from '../index';

/**
 * Image Analysis Prompt
 *
 * Analyzes images and generates descriptions for dataset organization
 */
export const imageAnalysisPrompt: PromptTemplate = {
  system: `You are an image analysis specialist who creates detailed, structured descriptions of visual content.
Descriptions should be objective, thorough, and useful for categorization and retrieval.
Focus on composition, subject matter, style, mood, and technical qualities.`,

  user: (context) => {
    const { imageName, existingDescription, purpose, projectContext } = context;

    let prompt = `Analyze this image`;

    if (imageName) {
      prompt += `: "${imageName}"`;
    }

    if (existingDescription) {
      prompt += `\n\nCurrent Description: ${existingDescription}`;
      prompt += `\nTask: Expand and enhance this description.`;
    }

    if (purpose) {
      prompt += `\n\nIntended Purpose: ${purpose}`;
    }

    if (projectContext) {
      prompt += `\nProject Context: ${projectContext}`;
    }

    prompt += `\n\nProvide a structured analysis including:`;
    prompt += `\n1. Main Subject: What is the primary focus?`;
    prompt += `\n2. Composition: Layout, framing, perspective`;
    prompt += `\n3. Visual Style: Art style, color palette, mood`;
    prompt += `\n4. Technical Quality: Resolution, lighting, clarity`;
    prompt += `\n5. Potential Uses: How could this be used in the project?`;
    prompt += `\n6. Suggested Tags: 5-7 relevant searchable tags`;

    prompt += `\n\nFormat as structured JSON with these fields.`;

    return prompt;
  }
};
