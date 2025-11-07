import { PromptTemplate } from '../index';

/**
 * Faction Relationship Description Prompt
 *
 * Develops complex, dynamic relationships between factions.
 * Relationships should be multifaceted: alliances can have tensions,
 * enemies can have common interests, neutrality can be fragile.
 */
export const factionRelationshipPrompt: PromptTemplate = {
  system: `You are an expert in political dynamics and inter-group relations.
Create faction relationships that are:
- COMPLEX: Real relationships are rarely simple. Allies disagree, enemies cooperate when convenient
- HISTORICALLY GROUNDED: Current relations stem from past events
- DRAMATICALLY RICH: Relationships should create story opportunities and tensions
- EVOLVING: Hint at how relations might shift based on events

Think of real-world geopolitics: alliances of convenience, cold wars, proxy conflicts, cultural exchanges despite political tensions.
The best faction relationships create difficult choices and moral ambiguity.`,

  user: (context) => {
    const {
      factionA,
      factionB,
      currentRelationship,
      relationshipType,
      historicalEvents,
      sharedCharacters,
      projectContext
    } = context;

    let prompt = `Describe the relationship between two factions:\n`;
    prompt += `"${factionA.name}" and "${factionB.name}"\n`;

    if (currentRelationship) {
      prompt += `\nCurrent Relationship: ${currentRelationship}`;
      prompt += `\nTask: Deepen and add nuance to this relationship.\n`;
    } else {
      prompt += `\nTask: Establish their relationship.\n`;
    }

    // Faction identities
    prompt += `\n=== FACTION A: ${factionA.name} ===\n`;
    if (factionA.description) prompt += `${factionA.description}\n`;
    if (factionA.values) prompt += `Core Values: ${factionA.values}\n`;
    if (factionA.goals) prompt += `Goals: ${factionA.goals}\n`;

    prompt += `\n=== FACTION B: ${factionB.name} ===\n`;
    if (factionB.description) prompt += `${factionB.description}\n`;
    if (factionB.values) prompt += `Core Values: ${factionB.values}\n`;
    if (factionB.goals) prompt += `Goals: ${factionB.goals}\n`;

    // Historical context
    if (historicalEvents && historicalEvents.length > 0) {
      prompt += `\n=== SHARED HISTORY ===\n`;
      historicalEvents.forEach((event: any) => {
        prompt += `- ${event.title}: ${event.description}\n`;
      });
    }

    // Characters connecting them
    if (sharedCharacters && sharedCharacters.length > 0) {
      prompt += `\n=== CONNECTING CHARACTERS ===\n`;
      sharedCharacters.forEach((char: any) => {
        prompt += `- ${char.name} (affiliated with both factions)\n`;
      });
    }

    // Relationship type guidance
    if (relationshipType) {
      prompt += `\n=== RELATIONSHIP TYPE ===\n`;
      prompt += `Suggested dynamic: ${relationshipType}\n`;
      prompt += `(But add complexity and nuance beyond this simple label)\n`;
    }

    prompt += `\n=== RELATIONSHIP DESCRIPTION REQUIREMENTS ===\n`;
    prompt += `Write 2-3 paragraphs (150-300 words) covering:\n\n`;

    prompt += `1. **Surface Dynamic**\n`;
    prompt += `   - How do these factions publicly interact?\n`;
    prompt += `   - What's the official stance each has toward the other?\n`;
    prompt += `   - How do their members typically behave when they encounter each other?\n\n`;

    prompt += `2. **Historical Roots**\n`;
    prompt += `   - What events shaped this relationship?\n`;
    prompt += `   - Are there old wounds, debts, or betrayals?\n`;
    prompt += `   - What moments of cooperation or conflict define their history?\n\n`;

    prompt += `3. **Underlying Complexity**\n`;
    prompt += `   - What tensions exist beneath the surface?\n`;
    prompt += `   - Are there factions within factions that disagree on this relationship?\n`;
    prompt += `   - What common ground exists despite differences?\n`;
    prompt += `   - What could shift this relationship (for better or worse)?\n\n`;

    prompt += `4. **Story Potential**\n`;
    prompt += `   - What conflicts or opportunities does this relationship create?\n`;
    prompt += `   - How might characters be caught between these factions?\n`;
    prompt += `   - What decisions or events could change everything?\n\n`;

    prompt += `Avoid simple labels like "enemies" or "allies" - show the messy reality of political relationships.`;

    return prompt;
  }
};
