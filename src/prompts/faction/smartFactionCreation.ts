import { PromptTemplate } from '../index';
import type { SmartFactionCreationContext, ActInfo, FactionInfo } from '../types';

interface FactionCharacter {
  name: string;
  role?: string;
  faction?: string;
  traits?: string[];
}

/**
 * Smart Faction Creation (Context-Aware)
 *
 * Creates factions that fit seamlessly into existing story world.
 * Considers project themes, existing factions, characters, and story structure
 * to create factions that feel necessary and integrated.
 */
export const smartFactionCreationPrompt: PromptTemplate = {
  system: `You are a master world-builder specializing in creating factions and organizations.
Create factions that feel essential to the story world, not tacked on.

Your factions should:
- FILL A NICHE: What role does this faction play that existing factions don't?
- REFLECT THEMES: How does this faction embody or challenge the story's themes?
- CREATE CONFLICT: What tensions does this faction introduce or intensify?
- FEEL INEVITABLE: In retrospect, this faction should feel like it always belonged

Draw on principles from:
- Tolkien's cultures (distinct identities, languages, histories)
- Martin's houses (complex motivations, internal conflicts)
- Herbert's factions (ideology drives everything)
- Worldbuilding theory: Every faction should have a reason to exist in the narrative ecosystem`,

  user: (context) => {
    const ctx = context as SmartFactionCreationContext;
    const {
      factionName,
      factionRole,
      projectContext,
      storyContext,
      existingFactions,
      characters,
      themes
    } = ctx;

    let prompt = `Create a comprehensive faction profile for:\n`;
    prompt += `Name: ${factionName}\n`;
    if (factionRole) prompt += `Intended Role: ${factionRole}\n`;

    // Project context
    if (projectContext) {
      prompt += `\n=== PROJECT CONTEXT ===\n`;
      prompt += `Story: "${projectContext.title}"\n`;
      if (projectContext.description) prompt += `World: ${projectContext.description}\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.tone) prompt += `Tone: ${projectContext.tone}\n`;
      if (themes?.length) prompt += `Core Themes: ${themes.join(', ')}\n`;
    }

    // Story structure
    if (storyContext) {
      prompt += `\n=== STORY STRUCTURE ===\n`;
      if (storyContext.acts && storyContext.acts.length > 0) {
        prompt += `Acts: ${storyContext.acts.map((a: ActInfo) => a.name).join(', ')}\n`;
      }
      if (storyContext.mainConflict) {
        prompt += `Central Conflict: ${storyContext.mainConflict}\n`;
      }
    }

    // Existing factions - crucial for differentiation
    if (existingFactions && existingFactions.length > 0) {
      prompt += `\n=== EXISTING FACTIONS ===\n`;
      existingFactions.forEach((faction: FactionInfo) => {
        prompt += `\n${faction.name}\n`;
        if (faction.description) prompt += `  ${faction.description.substring(0, 150)}...\n`;
        if (faction.values) prompt += `  Values: ${faction.values}\n`;
        if (faction.memberCount) prompt += `  Members: ${faction.memberCount}\n`;
      });
      prompt += `\nEnsure "${factionName}" has a distinct identity and fills a unique narrative niche.\n`;
    }

    // Characters context
    if (characters && characters.length > 0) {
      prompt += `\n=== EXISTING CHARACTERS ===\n`;
      const affiliated = characters.filter((c: FactionCharacter) => c.faction === factionName);
      const unaffiliated = characters.filter((c: FactionCharacter) => !c.faction || c.faction === 'none');

      if (affiliated.length > 0) {
        prompt += `Members of ${factionName}:\n`;
        affiliated.forEach((char: FactionCharacter) => {
          prompt += `- ${char.name}${char.role ? ` (${char.role})` : ''}\n`;
          if (char.traits) prompt += `  Traits: ${char.traits.slice(0, 3).join(', ')}\n`;
        });
      }

      if (unaffiliated.length > 0) {
        prompt += `\nUnaffiliated characters who might connect to this faction:\n`;
        unaffiliated.slice(0, 5).forEach((char: FactionCharacter) => {
          prompt += `- ${char.name}\n`;
        });
      }
    }

    prompt += `\n=== CREATE FACTION ===\n`;
    prompt += `Based on all context above, create "${factionName}" as a faction that:\n`;
    prompt += `1. Fits organically into this story world\n`;
    prompt += `2. Occupies a unique narrative space\n`;
    prompt += `3. Embodies or challenges the story's themes\n`;
    prompt += `4. Creates meaningful conflicts and alliances\n`;
    prompt += `5. Has clear connections to existing characters and factions\n`;

    prompt += `\n=== COMPREHENSIVE FACTION PROFILE ===\n`;
    prompt += `Provide the following sections:\n\n`;

    prompt += `1. **Core Identity** (2-3 paragraphs)\n`;
    prompt += `   - Founding purpose and origin\n`;
    prompt += `   - What makes them unique and recognizable\n`;
    prompt += `   - Their place in the world's power structure\n\n`;

    prompt += `2. **Values & Philosophy**\n`;
    prompt += `   - Core beliefs and principles\n`;
    prompt += `   - What they're willing to fight or die for\n`;
    prompt += `   - How they justify their actions\n`;
    prompt += `   - Internal contradictions or debates\n\n`;

    prompt += `3. **Structure & Leadership**\n`;
    prompt += `   - Organizational hierarchy\n`;
    prompt += `   - How leaders are chosen or emerge\n`;
    prompt += `   - Key roles and positions\n`;
    prompt += `   - Internal factions or power struggles\n\n`;

    prompt += `4. **Culture & Traditions**\n`;
    prompt += `   - Distinctive rituals or ceremonies\n`;
    prompt += `   - Symbols, colors, or iconography\n`;
    prompt += `   - How members identify themselves\n`;
    prompt += `   - Cultural practices that reveal their values\n\n`;

    prompt += `5. **Goals & Motivations**\n`;
    prompt += `   - Immediate objectives\n`;
    prompt += `   - Long-term vision or utopia\n`;
    prompt += `   - What obstacles stand in their way\n`;
    prompt += `   - How their goals create story conflict\n\n`;

    prompt += `6. **Relationships with Other Factions**\n`;
    prompt += `   - Key allies and why\n`;
    prompt += `   - Primary enemies and the source of conflict\n`;
    prompt += `   - Uneasy truces or complex relationships\n`;
    prompt += `   - How they're perceived by outsiders\n\n`;

    prompt += `7. **Historical Context**\n`;
    prompt += `   - 2-3 defining historical moments\n`;
    prompt += `   - Past conflicts or triumphs that shaped them\n`;
    prompt += `   - How their history influences present-day actions\n\n`;

    prompt += `8. **Narrative Role**\n`;
    prompt += `   - How this faction serves the story's themes\n`;
    prompt += `   - What conflicts or choices they create for characters\n`;
    prompt += `   - Potential character arcs connected to this faction\n`;
    prompt += `   - Story beats where they might be crucial\n\n`;

    prompt += `9. **Suggested Members**\n`;
    prompt += `   - Types of characters who would join\n`;
    prompt += `   - How existing unaffiliated characters might connect\n`;
    prompt += `   - Potential internal conflicts between member types\n\n`;

    prompt += `Format as clear, organized sections. Write in rich, vivid prose that brings the faction to life.`;
    prompt += `Make them complex - every faction should have both admirable and problematic aspects.`;

    return prompt;
  }
};
