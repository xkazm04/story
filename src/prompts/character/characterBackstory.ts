import { PromptTemplate } from '../index';

/**
 * Character Backstory Enhancement Prompt
 *
 * Expands or improves character backstory based on existing information
 */
export const characterBackstoryPrompt: PromptTemplate = {
  system: `You are a character backstory specialist using principles from professional screenwriting and novel writing.

Every compelling backstory includes:
- THE GHOST/WOUND: A formative painful experience that still haunts them
- THE LIE THEY BELIEVE: A false belief stemming from the wound that limits them
- DEFINING MOMENTS: 2-3 specific events that shaped who they are now
- WANT vs NEED: Surface goal (want) vs deeper psychological need
- RELATIONSHIPS THAT FORMED THEM: Who shaped their worldview?

Your backstories should:
- EXPLAIN PRESENT BEHAVIOR: Why do they act this way? What are they protecting?
- PLANT SEEDS FOR ARC: The wound should be healable; the lie should be challengeable
- SHOW CAUSE AND EFFECT: Connect past events to present traits and behaviors
- BE SPECIFIC: "Watched father betray his partner" beats "had a difficult childhood"
- AVOID TRAUMA PORN: Pain should serve character development, not shock value

Draw on principles from:
- "The Anatomy of Story" (John Truby): moral weakness, psychological need
- "The Negative Trait Thesaurus": how wounds create flaws
- Character arc theory: where they start determines where they can go

Write in vivid narrative prose. Make us feel the formative moments.`,

  user: (context) => {
    const {
      characterName,
      currentBackstory,
      traits,
      age,
      occupation,
      relationships,
      faction,
      storyRole,
      storyThemes
    } = context;

    let prompt = `Create a psychologically rich backstory for "${characterName}"\n`;

    if (currentBackstory) {
      prompt += `\nCurrent Backstory: ${currentBackstory}`;
      prompt += `\nTask: Deepen this backstory. Add the ghost/wound, defining moments, and psychological complexity.\n`;
    } else {
      prompt += `\nTask: Create a compelling backstory from scratch.\n`;
    }

    if (age) prompt += `Age: ${age}\n`;
    if (occupation) prompt += `Current Occupation: ${occupation}\n`;
    if (storyRole) prompt += `Role in Story: ${storyRole}\n`;

    // Traits inform the wound
    if (traits && traits.length > 0) {
      prompt += `\n=== CHARACTER TRAITS ===\n${traits.join(', ')}\n`;
      prompt += `The backstory must explain WHY they have these traits. What experiences created them?\n`;
    }

    // Faction context
    if (faction) {
      prompt += `\n=== FACTION CONTEXT ===\n`;
      prompt += `Affiliated with: ${faction.name}\n`;
      if (faction.description) prompt += `${faction.description}\n`;
      if (faction.values) prompt += `Faction Values: ${faction.values}\n`;
      prompt += `\nConsider:\n`;
      prompt += `- How did they join this faction? (birth, choice, desperation?)\n`;
      prompt += `- Do they truly believe in its values or are they using it?\n`;
      prompt += `- Has the faction shaped their identity or vice versa?\n`;
    }

    // Relationships
    if (relationships && relationships.length > 0) {
      prompt += `\n=== KEY RELATIONSHIPS ===\n`;
      relationships.forEach((r: any) => {
        prompt += `- ${r.name} (${r.type})\n`;
      });
      prompt += `Weave these relationships into the backstory. How did these connections form?\n`;
    }

    // Story themes
    if (storyThemes && storyThemes.length > 0) {
      prompt += `\n=== STORY THEMES ===\n${storyThemes.join(', ')}\n`;
      prompt += `The backstory should connect to these themes in some way.\n`;
    }

    prompt += `\n=== BACKSTORY REQUIREMENTS ===\n`;
    prompt += `Write 2-4 paragraphs (200-350 words) covering:\n\n`;

    prompt += `1. **The Ghost/Wound** (the formative painful experience)\n`;
    prompt += `   - What happened that still affects them today?\n`;
    prompt += `   - Be specific: who, what, when, where\n`;
    prompt += `   - Show the emotional impact\n\n`;

    prompt += `2. **The Lie They Believe** (stemming from the wound)\n`;
    prompt += `   - What false belief did they adopt to cope?\n`;
    prompt += `   - Examples: "Trust is weakness," "I must be perfect to be loved," "Power is all that matters"\n`;
    prompt += `   - This lie should limit them and be central to their arc\n\n`;

    prompt += `3. **Defining Moments** (2-3 specific events)\n`;
    prompt += `   - Key experiences that shaped their worldview\n`;
    prompt += `   - How they joined their faction (if applicable)\n`;
    prompt += `   - Moments that explain their current traits and behaviors\n\n`;

    prompt += `4. **Relationships That Formed Them**\n`;
    prompt += `   - Who were the influential figures in their past?\n`;
    prompt += `   - Mentors, betrayers, losses, first loves\n`;
    prompt += `   - How do past relationships echo in present ones?\n\n`;

    prompt += `5. **Want vs Need** (setup for character arc)\n`;
    prompt += `   - Want: What they consciously pursue (often tied to the lie)\n`;
    prompt += `   - Need: What they actually need to heal/grow (often means confronting the wound)\n\n`;

    prompt += `Write in vivid, emotional narrative prose. Make us understand and empathize with why they are who they are.`;
    prompt += `The best backstories make the present character feel inevitable.`;

    return prompt;
  }
};
