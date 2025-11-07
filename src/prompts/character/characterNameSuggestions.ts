import { PromptTemplate } from '../index';

/**
 * Character Name Suggestions Prompt
 *
 * Generates contextually relevant character name suggestions based on story context
 */
export const characterNameSuggestionsPrompt: PromptTemplate = {
  system: `You are a creative naming expert specializing in character names across all genres and cultures.

UNDERSTAND CHARACTER NAMING:
Character names should be:
- MEMORABLE: Easy to pronounce and recall
- GENRE-APPROPRIATE: Match the world and tone (fantasy, sci-fi, historical, contemporary)
- CULTURALLY RELEVANT: Reflect the character's background and setting
- MEANINGFUL: Often hint at personality, role, or destiny
- DISTINCTIVE: Stand out from other characters in the story

CHARACTER NAMING CONVENTIONS BY GENRE:
1. Fantasy: Elvian, Thormund, Lyra Moonwhisper, Kael Stormborn
2. Sci-Fi: Zara Chen, Marcus-7, Nova Stellaris, Jax Vega
3. Historical: Elizabeth Ashford, William Thornton, Katerina Volkov
4. Contemporary: Sarah Martinez, Jake Morrison, Priya Patel
5. Mythology: Artemis, Prometheus, Freya, Anansi

NAMING PATTERNS:
- Protagonists: Strong, relatable names
- Antagonists: Sharp, memorable names (often with harder consonants)
- Supporting: Names that complement but don't overshadow
- Background: Simple, forgettable names

Consider character traits, role, relationships, and story world when suggesting names.`,

  user: (context) => {
    const {
      partialName,
      projectTitle,
      projectDescription,
      genre,
      existingCharacters,
      characterRole,
      characterType,
      characterTraits,
      characterGender,
      characterAge,
      faction,
      relationships,
    } = context;

    let prompt = `Generate 5 contextually relevant character name suggestions.\n\n`;

    // Partial input from user
    if (partialName && partialName.trim().length > 0) {
      prompt += `User is typing: "${partialName}"\n`;
      prompt += `Build on this input with relevant completions.\n\n`;
    }

    // Project context
    if (projectTitle) {
      prompt += `=== PROJECT CONTEXT ===\n`;
      prompt += `Project: ${projectTitle}\n`;
      if (projectDescription) {
        prompt += `Story: ${projectDescription}\n`;
      }
      if (genre) {
        prompt += `Genre: ${genre}\n`;
      }
      prompt += `\n`;
    }

    // Character-specific context
    if (characterRole || characterType || characterGender || characterAge) {
      prompt += `=== CHARACTER DETAILS ===\n`;
      if (characterRole) prompt += `Role: ${characterRole}\n`;
      if (characterType) prompt += `Type: ${characterType}\n`;
      if (characterGender) prompt += `Gender: ${characterGender}\n`;
      if (characterAge) prompt += `Age: ${characterAge}\n`;
      prompt += `\n`;
    }

    // Character traits
    if (characterTraits && characterTraits.length > 0) {
      prompt += `=== CHARACTER TRAITS ===\n`;
      prompt += characterTraits.join(', ') + `\n`;
      prompt += `Names should reflect these personality traits.\n\n`;
    }

    // Faction context
    if (faction) {
      prompt += `=== FACTION ===\n`;
      prompt += `Character belongs to: ${faction}\n`;
      prompt += `Name should fit this faction's culture/style.\n\n`;
    }

    // Relationships
    if (relationships && relationships.length > 0) {
      prompt += `=== KEY RELATIONSHIPS ===\n`;
      relationships.slice(0, 5).forEach((rel: any) => {
        prompt += `- ${rel.type} with ${rel.characterName}\n`;
      });
      prompt += `Consider names that complement these relationships.\n\n`;
    }

    // Existing characters for context
    if (existingCharacters && existingCharacters.length > 0) {
      prompt += `=== EXISTING CHARACTERS ===\n`;
      existingCharacters.slice(0, 15).forEach((char: any) => {
        prompt += `- ${char.name}`;
        if (char.role) {
          prompt += ` (${char.role})`;
        }
        prompt += `\n`;
      });
      prompt += `\nAvoid similar-sounding names. Ensure suggestions fit the naming style.\n\n`;
    }

    // Output format
    prompt += `=== OUTPUT FORMAT ===\n`;
    prompt += `Return a JSON array of 5 suggestions. Each suggestion must have:\n`;
    prompt += `{\n`;
    prompt += `  "name": "Character Name (First and/or Last)",\n`;
    prompt += `  "description": "One-sentence description of why this name fits (15-30 words)",\n`;
    prompt += `  "reasoning": "Cultural origin and meaning if applicable (10-20 words)"\n`;
    prompt += `}\n\n`;

    prompt += `REQUIREMENTS:\n`;
    prompt += `1. Names must be unique and not duplicate existing characters\n`;
    prompt += `2. Names must be pronounceable and memorable\n`;
    prompt += `3. Match the genre and world's naming conventions\n`;
    prompt += `4. Consider character role and traits\n`;
    prompt += `5. Provide variety: different cultural backgrounds, lengths, and styles\n\n`;

    if (partialName && partialName.trim().length > 0) {
      prompt += `6. At least 2-3 suggestions should complete or build on "${partialName}"\n\n`;
    }

    prompt += `Return ONLY valid JSON array. No additional text.`;

    return prompt;
  }
};
