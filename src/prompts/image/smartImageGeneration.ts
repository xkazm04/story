import { PromptTemplate } from '../index';

/**
 * Smart Image Generation (Context-Aware)
 *
 * Generates images with visual consistency across characters, scenes, and style.
 * References existing visual assets to maintain coherent look and feel.
 */
export const smartImageGenerationPrompt: PromptTemplate = {
  system: `You are an expert at creating visually consistent image generation prompts.
Maintain visual continuity with established characters, locations, and artistic style.
Ensure characters look the same across different images and scenes maintain consistent atmosphere.`,

  user: (context) => {
    const {
      basicPrompt,
      imageType, // 'character', 'scene', 'concept'
      projectContext,
      visualStyleContext,
      characters,
      sceneContext
    } = context;

    let prompt = `Create an optimized image generation prompt for:\n`;
    prompt += `${basicPrompt}\n`;
    prompt += `Type: ${imageType || 'general'}\n`;

    // Visual style consistency
    if (visualStyleContext) {
      prompt += `\n=== ESTABLISHED VISUAL STYLE ===\n`;
      if (visualStyleContext.projectStyle) {
        prompt += `Project Style: ${visualStyleContext.projectStyle}\n`;
      }
      if (visualStyleContext.colorPalette && visualStyleContext.colorPalette.length > 0) {
        prompt += `Color Palette: ${visualStyleContext.colorPalette.join(', ')}\n`;
        prompt += `(Use these colors prominently in the image)\n`;
      }
      if (visualStyleContext.artisticStyle) {
        prompt += `Artistic Style: ${visualStyleContext.artisticStyle}\n`;
      }
    }

    // Character appearance consistency
    if (imageType === 'character' && characters && characters.length > 0) {
      prompt += `\n=== CHARACTER REFERENCES ===\n`;
      characters.forEach((char: any) => {
        prompt += `\n${char.name}:\n`;
        if (char.appearance) {
          prompt += `Established Appearance: ${char.appearance}\n`;
        }
        if (char.traits && char.traits.length > 0) {
          prompt += `Personality Traits (reflect visually): ${char.traits.join(', ')}\n`;
        }
        if (char.age) prompt += `Age: ${char.age}\n`;
        if (char.gender) prompt += `Gender: ${char.gender}\n`;

        // Reference existing images
        if (visualStyleContext?.characterAppearances) {
          const charVisuals = visualStyleContext.characterAppearances.find(
            (ca: any) => ca.characterId === char.id
          );
          if (charVisuals && charVisuals.imageUrls && charVisuals.imageUrls.length > 0) {
            prompt += `Previous Images: ${charVisuals.imageUrls.length} reference images available\n`;
            prompt += `(Maintain consistency with established look)\n`;
          }
        }
      });
    }

    // Scene context for setting consistency
    if (imageType === 'scene' && sceneContext) {
      prompt += `\n=== SCENE CONTEXT ===\n`;
      prompt += `Scene: "${sceneContext.title}"\n`;
      if (sceneContext.description) prompt += `Description: ${sceneContext.description}\n`;
      if (sceneContext.location) prompt += `Location: ${sceneContext.location}\n`;
      if (sceneContext.timeOfDay) prompt += `Time: ${sceneContext.timeOfDay}\n`;
      if (sceneContext.mood) prompt += `Mood: ${sceneContext.mood}\n`;
      if (sceneContext.actName) prompt += `Act: ${sceneContext.actName}\n`;

      // Characters in scene
      if (sceneContext.characters && sceneContext.characters.length > 0) {
        prompt += `Characters Present:\n`;
        sceneContext.characters.forEach((char: any) => {
          prompt += `- ${char.name}${char.role ? ` (${char.role})` : ''}\n`;
        });
      }

      // Reference existing scene visuals
      if (visualStyleContext?.sceneVisuals) {
        const sceneVisuals = visualStyleContext.sceneVisuals.find(
          (sv: any) => sv.sceneId === sceneContext.id
        );
        if (sceneVisuals) {
          if (sceneVisuals.imageUrls && sceneVisuals.imageUrls.length > 0) {
            prompt += `Previous Scene Images: ${sceneVisuals.imageUrls.length} references\n`;
          }
        }
      }
    }

    // Project tone
    if (projectContext) {
      prompt += `\n=== STORY TONE ===\n`;
      if (projectContext.tone) prompt += `Overall Tone: ${projectContext.tone}\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.themes && projectContext.themes.length > 0) {
        prompt += `Themes to reflect: ${projectContext.themes.join(', ')}\n`;
      }
    }

    prompt += `\n=== GENERATE PROMPT ===\n`;
    prompt += `Create a detailed image generation prompt that:\n\n`;

    prompt += `1. **Maintains Visual Consistency**:\n`;
    prompt += `   - Characters look the same as in previous images\n`;
    prompt += `   - Locations have consistent architecture and atmosphere\n`;
    prompt += `   - Style matches established artistic direction\n\n`;

    prompt += `2. **Uses Established Elements**:\n`;
    prompt += `   - Incorporates the color palette\n`;
    prompt += `   - Matches the project's visual style\n`;
    prompt += `   - Reflects character personalities visually\n\n`;

    prompt += `3. **Includes Technical Details**:\n`;
    prompt += `   - Specific visual elements (clothing, architecture, lighting)\n`;
    prompt += `   - Camera angle and composition\n`;
    prompt += `   - Artistic style tags\n`;
    prompt += `   - Quality tags (4K, detailed, professional)\n\n`;

    prompt += `4. **Conveys Story Context**:\n`;
    prompt += `   - Scene mood and atmosphere\n`;
    prompt += `   - Character emotional states\n`;
    prompt += `   - Story tone and genre\n\n`;

    prompt += `Return ONLY the optimized image generation prompt (60-100 words).`;
    prompt += `Focus on visual details that ensure consistency with existing project assets.`;

    return prompt;
  }
};
