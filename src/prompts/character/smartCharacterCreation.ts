import { PromptTemplate } from '../index';

/**
 * Smart Character Creation (Context-Aware)
 *
 * Creates characters that fit naturally into the existing story world.
 * Leverages project context, existing characters, story structure, and themes.
 *
 * The more data in the project, the better the character fits.
 */
export const smartCharacterCreationPrompt: PromptTemplate = {
  system: `You are an expert character designer for storytelling.
Create characters that fit seamlessly into the existing story world.
Consider the story's themes, tone, existing characters, and narrative needs.
Ensure the new character fills a meaningful role and has natural connections to the existing cast.`,

  user: (context) => {
    const {
      characterName,
      characterRole,
      projectContext,
      storyContext,
      existingCharacters,
      visualStyle
    } = context;

    let prompt = `Create a comprehensive character profile for:\n`;
    prompt += `Name: ${characterName}\n`;
    if (characterRole) prompt += `Intended Role: ${characterRole}\n`;

    // Project context
    if (projectContext) {
      prompt += `\n=== PROJECT CONTEXT ===\n`;
      prompt += `Story: "${projectContext.title}"\n`;
      if (projectContext.description) prompt += `Synopsis: ${projectContext.description}\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.themes?.length) prompt += `Themes: ${projectContext.themes.join(', ')}\n`;
      if (projectContext.tone) prompt += `Tone: ${projectContext.tone}\n`;
      prompt += `Existing Cast: ${projectContext.characterCount} characters\n`;
    }

    // Story structure context
    if (storyContext && storyContext.acts.length > 0) {
      prompt += `\n=== STORY STRUCTURE ===\n`;
      prompt += `Acts: ${storyContext.acts.map((a: any) => `"${a.name}"`).join(', ')}\n`;
      if (storyContext.beats.length > 0) {
        prompt += `Key Beats:\n`;
        storyContext.beats.slice(0, 5).forEach((beat: any) => {
          prompt += `- ${beat.name}: ${beat.description || 'No description'}\n`;
        });
      }
    }

    // Existing characters context
    if (existingCharacters && existingCharacters.length > 0) {
      prompt += `\n=== EXISTING CHARACTERS ===\n`;
      existingCharacters.forEach((char: any) => {
        prompt += `${char.name}${char.role ? ` (${char.role})` : ''}\n`;
        if (char.traits && char.traits.length > 0) {
          prompt += `  Traits: ${char.traits.join(', ')}\n`;
        }
        if (char.relationships && char.relationships.length > 0) {
          prompt += `  Connected to: ${char.relationships.map((r: any) => r.targetCharacterName).join(', ')}\n`;
        }
      });
    }

    // Visual style context
    if (visualStyle) {
      prompt += `\n=== VISUAL STYLE ===\n`;
      if (visualStyle.projectStyle) prompt += `Style: ${visualStyle.projectStyle}\n`;
      if (visualStyle.colorPalette) prompt += `Palette: ${visualStyle.colorPalette.join(', ')}\n`;
    }

    prompt += `\n=== CREATE CHARACTER ===\n`;
    prompt += `Based on all the context above, create "${characterName}" as a character who:\n`;
    prompt += `1. Fits naturally into this story world\n`;
    prompt += `2. Has meaningful connections to existing characters\n`;
    prompt += `3. Serves the story's themes and narrative arc\n`;
    prompt += `4. Brings unique perspective or abilities\n`;
    prompt += `5. Has clear motivations aligned with the story\n`;

    prompt += `\nProvide:\n`;
    prompt += `1. **Core Traits** (5-7 traits that fit the story's tone)\n`;
    prompt += `2. **Background** (how they fit into this world, connections to existing characters)\n`;
    prompt += `3. **Personality** (distinctive voice, behavior patterns)\n`;
    prompt += `4. **Appearance** (visual description matching the established style)\n`;
    prompt += `5. **Motivations** (goals aligned with story themes)\n`;
    prompt += `6. **Relationships** (suggested connections to existing characters)\n`;
    prompt += `7. **Story Role** (how they serve the narrative arc)\n`;
    prompt += `8. **Character Arc** (potential growth trajectory)\n`;

    prompt += `\nFormat as clear, organized sections.`;

    return prompt;
  }
};
