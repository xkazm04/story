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
  system: `You are a master character architect using principles from professional screenwriting and literary fiction.

Create characters using these frameworks:
- CHARACTER FUNCTION: Every character needs a narrative purpose (protagonist, antagonist, mentor, threshold guardian, shapeshifter, trickster)
- THREE DIMENSIONS: Physical (appearance, voice), Psychological (wound, need, lie they believe), Social (relationships, status, role)
- DRAMATIC OPPOSITION: Characters should create or embody conflict through competing values/goals
- THEMATIC RESONANCE: Characters should explore different facets of the story's themes
- INTERNAL VS EXTERNAL: Surface goals (what they want) vs deep needs (what they need to heal)

Your characters should:
- FILL A NARRATIVE GAP: What role does this character play that others don't?
- CHALLENGE THE PROTAGONIST: How do they force growth or reveal truth?
- EMBODY CONTRADICTION: Complex characters have opposing qualities
- HAVE CLEAR WANT/NEED: External goal + internal wound to heal
- CONNECT ORGANICALLY: Natural relationships with existing characters

Draw on:
- Hero's Journey archetypes (mentor, shadow, herald, shapeshifter)
- The Anatomy of Story: moral weakness, psychological need, moral argument
- Character triangle: protagonist/antagonist/relationship character
- "Save the Cat": character types that serve story beats

Avoid clichés and stereotypes. Every character should surprise us while feeling inevitable.`,

  user: (context) => {
    const {
      characterName,
      characterRole,
      projectContext,
      storyContext,
      existingCharacters,
      existingFactions,
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
        prompt += `${char.name}${char.role ? ` (${char.role})` : ''}${char.faction ? ` [${char.faction}]` : ''}\n`;
        if (char.traits && char.traits.length > 0) {
          prompt += `  Traits: ${char.traits.join(', ')}\n`;
        }
        if (char.relationships && char.relationships.length > 0) {
          prompt += `  Connected to: ${char.relationships.map((r: any) => r.targetCharacterName).join(', ')}\n`;
        }
      });
    }

    // Existing factions context
    if (existingFactions && existingFactions.length > 0) {
      prompt += `\n=== EXISTING FACTIONS ===\n`;
      existingFactions.forEach((faction: any) => {
        prompt += `${faction.name}`;
        if (faction.description) prompt += `: ${faction.description.substring(0, 100)}...`;
        prompt += `\n`;
        if (faction.values) prompt += `  Values: ${faction.values}\n`;
        if (faction.memberCount) prompt += `  Members: ${faction.memberCount}\n`;
      });
      prompt += `\nConsider which faction (if any) this character might belong to.\n`;
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

    prompt += `\n=== COMPREHENSIVE CHARACTER PROFILE ===\n`;
    prompt += `Provide the following sections:\n\n`;

    prompt += `1. **Core Identity & Function**\n`;
    prompt += `   - Narrative role (protagonist/antagonist/mentor/etc.)\n`;
    prompt += `   - What gap in the story does this character fill?\n`;
    prompt += `   - How do they challenge or support the protagonist?\n\n`;

    prompt += `2. **The Ghost/Wound**\n`;
    prompt += `   - Formative painful experience that shaped them\n`;
    prompt += `   - The lie they believe because of it\n`;
    prompt += `   - How this wound manifests in behavior\n\n`;

    prompt += `3. **Want vs Need**\n`;
    prompt += `   - WANT: External goal they consciously pursue\n`;
    prompt += `   - NEED: Internal thing they must learn/heal to be whole\n`;
    prompt += `   - How these conflict to create internal drama\n\n`;

    prompt += `4. **Core Traits** (5-7 specific, revealing traits)\n`;
    prompt += `   - Physical: Observable details (not just "tall")\n`;
    prompt += `   - Psychological: Beliefs, fears, defense mechanisms\n`;
    prompt += `   - Social: How they relate to others\n`;
    prompt += `   - Contradictions: Opposing qualities that create complexity\n\n`;

    prompt += `5. **Background & Faction**\n`;
    prompt += `   - Brief formative history (2-3 defining moments)\n`;
    prompt += `   - Faction affiliation (if any) and how they joined\n`;
    prompt += `   - Do they embody faction values or struggle with them?\n`;
    prompt += `   - How their past connects to existing characters\n\n`;

    prompt += `6. **Personality & Voice**\n`;
    prompt += `   - Distinctive behavior patterns and mannerisms\n`;
    prompt += `   - Speech patterns, vocabulary, tone\n`;
    prompt += `   - Social masks vs true self\n`;
    prompt += `   - What they reveal vs conceal\n\n`;

    prompt += `7. **Appearance** (matching established visual style)\n`;
    prompt += `   - Specific physical details that reveal character\n`;
    prompt += `   - How appearance reflects personality or masks it\n`;
    prompt += `   - Distinctive visual elements\n\n`;

    prompt += `8. **Relationships**\n`;
    prompt += `   - Natural connections to existing characters (how did they meet?)\n`;
    prompt += `   - What do they bring out in each other?\n`;
    prompt += `   - Potential conflicts or alliances\n`;
    prompt += `   - How relationships serve the story\n\n`;

    prompt += `9. **Thematic Purpose**\n`;
    prompt += `   - Which story theme does this character explore?\n`;
    prompt += `   - What question or perspective do they represent?\n`;
    prompt += `   - How do they contribute to the story's "argument"?\n\n`;

    prompt += `10. **Character Arc**\n`;
    prompt += `   - Where they start (the lie they believe)\n`;
    prompt += `   - Potential growth trajectory (confronting the wound)\n`;
    prompt += `   - Possible story beats involving their transformation\n`;
    prompt += `   - Alternative: if they're a flat/steadfast character, how they test others\n\n`;

    prompt += `Format as clear, organized sections. Write in vivid prose that brings the character to life.`;
    prompt += `Create someone complex, contradictory, and essential to the story.`;

    return prompt;
  }
};
