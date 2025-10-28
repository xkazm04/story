import { PromptTemplate } from '../index';

/**
 * Dataset Tagging Prompt
 *
 * Generates relevant tags for dataset items (images, audio, etc.)
 */
export const datasetTaggingPrompt: PromptTemplate = {
  system: `You are a data organization specialist who creates consistent, searchable tags for assets.
Tags should be specific, relevant, and follow a consistent taxonomy.
Include both descriptive tags (what it is) and functional tags (how it might be used).`,

  user: (context) => {
    const { itemType, itemName, description, existingTags, projectContext } = context;

    let prompt = `Generate tags for ${itemType}: "${itemName}"`;

    if (description) {
      prompt += `\n\nDescription: ${description}`;
    }

    if (existingTags && existingTags.length > 0) {
      prompt += `\n\nExisting Tags: ${existingTags.join(', ')}`;
      prompt += `\nSuggest additional complementary tags.`;
    }

    if (projectContext) {
      prompt += `\n\nProject Context: ${projectContext}`;
    }

    prompt += `\n\nGenerate 5-10 relevant tags following these categories:`;
    prompt += `\n1. Content descriptors (what's in it)`;
    prompt += `\n2. Style/mood descriptors`;
    prompt += `\n3. Use case tags (where/how it might be used)`;
    prompt += `\n4. Technical tags (format, quality, etc.)`;

    prompt += `\n\nReturn ONLY a JSON array of tag strings: ["tag1", "tag2", ...]`;

    return prompt;
  }
};
