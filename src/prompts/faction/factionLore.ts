import { PromptTemplate } from '../index';

/**
 * Faction Lore Generation Prompt
 *
 * Creates rich lore entries for factions covering:
 * - Historical events and turning points
 * - Cultural practices and beliefs
 * - Notable figures and heroes
 * - Conflicts and rivalries
 */
export const factionLorePrompt: PromptTemplate = {
  system: `You are a lore specialist who crafts rich historical and cultural content for fictional factions.
Your lore should:
- REVEAL CHARACTER: What does this history tell us about who they are now?
- CREATE DEPTH: Layer in details that make the world feel lived-in
- PLANT SEEDS: Include elements that could become plot points
- MAINTAIN CONSISTENCY: Align with established faction identity and world rules

Think like a historian writing about real cultures - specific, grounded, consequential.
Avoid generic fantasy lore. Every detail should serve characterization or plot potential.`,

  user: (context) => {
    const {
      factionName,
      loreCategory,
      currentLore,
      factionDescription,
      projectContext,
      existingLore,
      relatedFactions,
      timelinePosition
    } = context;

    let prompt = `Create a lore entry for faction: "${factionName}"\n`;
    prompt += `Category: ${loreCategory || 'General lore'}\n`;

    if (currentLore) {
      prompt += `\nCurrent Lore: ${currentLore}`;
      prompt += `\nTask: Expand and enrich this lore with specific details and dramatic depth.\n`;
    } else {
      prompt += `\nTask: Create new lore content.\n`;
    }

    // Faction identity
    if (factionDescription) {
      prompt += `\n=== FACTION IDENTITY ===\n`;
      prompt += `${factionDescription}\n`;
    }

    // Project/world context
    if (projectContext) {
      prompt += `\n=== WORLD CONTEXT ===\n`;
      if (projectContext.title) prompt += `Story World: "${projectContext.title}"\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.timeline) prompt += `Timeline: ${projectContext.timeline}\n`;
    }

    // Related factions for conflict/alliance context
    if (relatedFactions && relatedFactions.length > 0) {
      prompt += `\n=== RELATED FACTIONS ===\n`;
      relatedFactions.forEach((faction: any) => {
        prompt += `- ${faction.name} (${faction.relationshipType || 'unknown relationship'})\n`;
      });
    }

    // Existing lore for consistency
    if (existingLore && existingLore.length > 0) {
      prompt += `\n=== EXISTING LORE ===\n`;
      existingLore.forEach((lore: any) => {
        prompt += `${lore.category}: ${lore.title}\n`;
      });
      prompt += `\nMaintain consistency with established lore.\n`;
    }

    // Category-specific guidance
    prompt += `\n=== LORE DEVELOPMENT GUIDANCE ===\n`;

    if (loreCategory === 'history') {
      prompt += `Focus on HISTORICAL EVENTS:\n`;
      prompt += `- Founding moment: What catalyzed this faction's creation?\n`;
      prompt += `- Defining conflicts: What battles, betrayals, or triumphs shaped them?\n`;
      prompt += `- Turning points: When did their philosophy or structure change?\n`;
      prompt += `- Legacy: What past events still echo in present-day tensions?\n`;
    } else if (loreCategory === 'culture') {
      prompt += `Focus on CULTURAL PRACTICES:\n`;
      prompt += `- Rituals and ceremonies: How do they mark important moments?\n`;
      prompt += `- Symbols and iconography: What imagery represents their values?\n`;
      prompt += `- Taboos and sacred rules: What must never be done or said?\n`;
      prompt += `- Art and expression: How do they tell stories, make music, create?\n`;
    } else if (loreCategory === 'notable-figures') {
      prompt += `Focus on LEGENDARY FIGURES:\n`;
      prompt += `- Heroes and founders: Who embodies their highest ideals?\n`;
      prompt += `- Villains and traitors: Who betrayed or threatened them?\n`;
      prompt += `- Complex figures: Who represents internal contradictions?\n`;
      prompt += `- Living legacy: How do these figures influence current members?\n`;
    } else if (loreCategory === 'conflicts') {
      prompt += `Focus on CONFLICTS AND RIVALRIES:\n`;
      prompt += `- Root causes: What sparked the conflict? (resources, ideology, revenge?)\n`;
      prompt += `- Escalation: How did minor disputes become major wars?\n`;
      prompt += `- Casualties and costs: What did they lose? What scars remain?\n`;
      prompt += `- Unresolved tensions: What could reignite at any moment?\n`;
    } else {
      prompt += `Create general lore covering any compelling aspect of the faction.\n`;
    }

    prompt += `\n=== OUTPUT REQUIREMENTS ===\n`;
    prompt += `Write 3-5 paragraphs (250-400 words) of rich, specific lore.\n`;
    prompt += `Include:\n`;
    prompt += `- Specific names, dates, and places (make them memorable)\n`;
    prompt += `- Concrete details that make the world feel real\n`;
    prompt += `- Seeds for potential story conflicts or character backstories\n`;
    prompt += `- Emotional resonance - why does this matter to faction members?\n\n`;

    prompt += `Write in a rich narrative style, like a historian recounting events that shaped a real civilization.`;

    return prompt;
  }
};
