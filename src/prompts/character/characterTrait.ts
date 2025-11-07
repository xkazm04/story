import { PromptTemplate } from '../index';

/**
 * Character Trait Generation Prompt
 *
 * Generates traits based on character context and existing traits
 */
export const characterTraitPrompt: PromptTemplate = {
  system: `You are a character development specialist drawing on psychological depth and professional writing craft.

UNDERSTAND THREE DIMENSIONS OF CHARACTER:
- PHYSICAL: Observable traits (appearance, mannerisms, voice, physical abilities)
- PSYCHOLOGICAL: Internal traits (fears, desires, beliefs, wounds, values)
- SOCIAL: Relational traits (how they interact, social skills, reputation, role)

CREATE TRAITS THAT:
- REVEAL CORE WOUND: What formative pain or need shapes their behavior?
- SHOW CONTRADICTIONS: Real people have opposing qualities (brave but insecure, kind but judgmental)
- HINT AT ARC: Flaws should have potential for growth; strengths for corruption
- CONNECT TO THEME: Traits should relate to the story's central questions
- FEEL SPECIFIC: "Fidgets with wedding ring when lying" beats "nervous"

Draw on character theory: internal vs external goals, fatal flaws, coping mechanisms, defense mechanisms.
Avoid surface-level labels. Go deeper.`,

  user: (context) => {
    const {
      characterName,
      characterType,
      existingTraits,
      role,
      background,
      faction,
      relationships,
      storyThemes
    } = context;

    let prompt = `Generate 3-5 deep, revealing character traits for "${characterName}"\n`;

    if (characterType) {
      prompt += `Character Type: ${characterType}\n`;
    }

    if (role) {
      prompt += `Role in Story: ${role}\n`;
    }

    if (background) {
      prompt += `Background: ${background}\n`;
    }

    // Faction integration
    if (faction) {
      prompt += `\nFaction Affiliation: ${faction.name}\n`;
      if (faction.values) {
        prompt += `Faction Values: ${faction.values}\n`;
        prompt += `Consider: Does this character embody these values, struggle with them, or subvert them?\n`;
      }
    }

    // Relationships for relational traits
    if (relationships && relationships.length > 0) {
      prompt += `\nKey Relationships: ${relationships.map((r: any) => `${r.name} (${r.type})`).join(', ')}\n`;
      prompt += `Consider how relationships have shaped their personality.\n`;
    }

    // Story themes for thematic resonance
    if (storyThemes && storyThemes.length > 0) {
      prompt += `\nStory Themes: ${storyThemes.join(', ')}\n`;
      prompt += `Ensure traits connect to these themes in some way.\n`;
    }

    if (existingTraits && existingTraits.length > 0) {
      prompt += `\n=== EXISTING TRAITS ===\n${existingTraits.join(', ')}\n`;
      prompt += `Suggest traits that add dimension, not repetition. Look for contradictions and complexity.\n`;
    }

    prompt += `\n=== TRAIT GENERATION GUIDELINES ===\n`;
    prompt += `Create traits across multiple dimensions:\n`;
    prompt += `- PHYSICAL: Specific observable details (not just "tall" but "towers over others, constantly ducking through doorways")\n`;
    prompt += `- PSYCHOLOGICAL: Core beliefs, fears, desires, defense mechanisms\n`;
    prompt += `- SOCIAL: How they relate to others, social masks vs true self\n`;
    prompt += `- SKILLS/ABILITIES: Specific competencies or lack thereof\n`;
    prompt += `- FLAWS: Meaningful weaknesses that create conflict or limit them\n\n`;

    prompt += `Each trait should be:\n`;
    prompt += `- Specific and concrete (show don't tell)\n`;
    prompt += `- Psychologically grounded (why would someone develop this trait?)\n`;
    prompt += `- Story-relevant (creates conflict or opportunities)\n`;

    prompt += `\n\nReturn ONLY a JSON array of trait objects with format: [{"category": "personality|physical|skill|flaw", "trait": "trait description"}]`;

    return prompt;
  }
};
