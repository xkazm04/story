import { PromptTemplate } from '../index';

/**
 * Faction Description Enhancement Prompt
 *
 * Creates or enhances faction descriptions using world-building principles:
 * - Core identity and values
 * - Collective goals and motivations
 * - Social structure and hierarchy
 * - Cultural distinctiveness
 */
export const factionDescriptionPrompt: PromptTemplate = {
  system: `You are a world-building specialist with expertise in creating compelling factions and organizations.
Your factions should feel like living, breathing societies with:
- CLEAR IDENTITY: What makes them distinct? What do they stand for?
- INTERNAL LOGIC: How do their values, structure, and goals interconnect?
- DRAMATIC POTENTIAL: What conflicts arise from their beliefs? What do they want?
- CULTURAL DEPTH: Rituals, traditions, symbols that make them memorable

Draw on principles from successful world-building (Tolkien's races, Game of Thrones' houses, Star Wars' orders).
Avoid generic fantasy/sci-fi tropes unless they're given fresh treatment.`,

  user: (context) => {
    const {
      factionName,
      currentDescription,
      projectContext,
      existingFactions,
      characters,
      storyThemes
    } = context;

    let prompt = `Create a rich faction description for: "${factionName}"\n`;

    if (currentDescription) {
      prompt += `\nCurrent Description: ${currentDescription}`;
      prompt += `\nTask: Deepen and enhance this description with cultural and dramatic richness.\n`;
    } else {
      prompt += `\nTask: Create a compelling faction from scratch.\n`;
    }

    // Project context
    if (projectContext) {
      prompt += `\n=== WORLD CONTEXT ===\n`;
      if (projectContext.title) prompt += `Story: "${projectContext.title}"\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.description) prompt += `World: ${projectContext.description}\n`;
      if (storyThemes?.length) prompt += `Core Themes: ${storyThemes.join(', ')}\n`;
    }

    // Existing factions for contrast
    if (existingFactions && existingFactions.length > 0) {
      prompt += `\n=== EXISTING FACTIONS ===\n`;
      existingFactions.forEach((faction: any) => {
        prompt += `- ${faction.name}${faction.description ? `: ${faction.description.substring(0, 100)}...` : ''}\n`;
      });
      prompt += `\nEnsure "${factionName}" has a distinct identity that contrasts with these factions.\n`;
    }

    // Character members
    if (characters && characters.length > 0) {
      prompt += `\n=== FACTION MEMBERS ===\n`;
      prompt += `Members: ${characters.map((c: any) => c.name).join(', ')}\n`;
      prompt += `Consider how these individuals reflect and shape the faction's identity.\n`;
    }

    prompt += `\n=== FACTION DESCRIPTION REQUIREMENTS ===\n`;
    prompt += `Write 2-4 paragraphs (200-400 words) covering:\n\n`;

    prompt += `1. **Core Identity**\n`;
    prompt += `   - What fundamental belief or purpose unites them?\n`;
    prompt += `   - What do outsiders immediately recognize them for?\n`;
    prompt += `   - What's their origin story or founding myth?\n\n`;

    prompt += `2. **Values & Culture**\n`;
    prompt += `   - What principles do they uphold? What would they die for?\n`;
    prompt += `   - What rituals, traditions, or symbols define them?\n`;
    prompt += `   - How do they view outsiders and other factions?\n\n`;

    prompt += `3. **Structure & Power**\n`;
    prompt += `   - How is power distributed? (hierarchical, collective, merit-based?)\n`;
    prompt += `   - Who leads and how are leaders chosen?\n`;
    prompt += `   - What internal conflicts or factions exist?\n\n`;

    prompt += `4. **Goals & Conflicts**\n`;
    prompt += `   - What does this faction want? (short-term and long-term)\n`;
    prompt += `   - What obstacles stand in their way?\n`;
    prompt += `   - How do their values create internal or external conflict?\n\n`;

    prompt += `Write in an engaging, vivid style that brings the faction to life. Show their complexity - factions should have both admirable and flawed aspects.`;

    return prompt;
  }
};
