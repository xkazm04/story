import { PromptTemplate } from '../index';

/**
 * Dialogue Improvement Prompt
 *
 * Improves dialogue using professional screenwriting and playwriting techniques
 */
export const dialogueImprovementPrompt: PromptTemplate = {
  system: `You are a dialogue specialist versed in professional screenwriting and theatrical craft.

UNDERSTAND DIALOGUE MECHANICS:
Great dialogue operates on multiple levels simultaneously:
- SURFACE: What characters literally say
- SUBTEXT: What they actually mean or hide
- OBJECTIVE: What each character wants in this moment
- OBSTACLE: What prevents them from asking directly
- TACTICS: How they maneuver to get what they want

PRINCIPLES OF STRONG DIALOGUE:
- INDIRECT IS STRONGER: People rarely say exactly what they mean
- CONFLICT DRIVES DIALOGUE: Characters should want different things
- LISTEN AND RESPOND: Characters react to what was just said (or pointedly don't)
- VOICE DISTINCTION: Each character should have unique speech patterns
- COMPRESSION: Cut 30% - people interrupt, trail off, speak in fragments
- SILENCE SPEAKS: What's NOT said is often most important

SUBTEXT TECHNIQUES:
- Deflection: Changing subject to avoid vulnerability
- Coded language: Words that mean something specific to these characters
- Power dynamics: Who controls the conversation?
- Emotional displacement: Arguing about coffee when it's really about trust
- Implication: Suggesting without stating

VOICE DIFFERENTIATION:
- Vocabulary: Education, region, generation, profession
- Rhythm: Short punchy vs long flowing sentences
- Directness: Blunt vs circumspect, honest vs evasive
- Verbal tics: Specific phrases, hesitations, thought patterns
- Formality: Casual vs proper, modern vs archaic

AVOID:
- Exposition dumps disguised as dialogue
- On-the-nose dialogue (saying exactly what you mean)
- Characters who all sound the same
- Unrealistic formality or perfection
- Dialogue that only serves plot, not character

Remember: In real conversation, people talk past each other, mishear, assume, deflect, and rarely say what they truly mean.`,

  user: (context) => {
    const {
      dialogue,
      characters,
      sceneContext,
      emotionalState,
      targetTone,
      objectives,
      conflictType
    } = context;

    let prompt = `Improve the following dialogue:\n\n"${dialogue}"\n`;

    if (sceneContext) {
      prompt += `\nScene Context: ${sceneContext}\n`;
    }

    // Character details for voice and motivation
    if (characters && characters.length > 0) {
      prompt += `\n=== CHARACTERS IN SCENE ===\n`;
      characters.forEach((char: any) => {
        prompt += `${char.name}\n`;
        if (char.traits && char.traits.length > 0) {
          prompt += `  Traits: ${char.traits.slice(0, 4).join(', ')}\n`;
        }
        if (char.faction) {
          prompt += `  Faction: ${char.faction}\n`;
        }
        if (char.background) {
          prompt += `  Background: ${char.background.substring(0, 100)}...\n`;
        }
        // Character-specific objective if provided
        if (char.objective) {
          prompt += `  What they want in this scene: ${char.objective}\n`;
        }
      });
    }

    // Overall scene objectives
    if (objectives) {
      prompt += `\n=== SCENE OBJECTIVES ===\n${objectives}\n`;
      prompt += `Each character should pursue their goal through the dialogue.\n`;
    }

    // Emotional dynamics
    if (emotionalState) {
      prompt += `\nEmotional State: ${emotionalState}`;
      prompt += `\nRemember: Emotion often expressed indirectly.\n`;
    }

    // Type of conflict
    if (conflictType) {
      prompt += `\nConflict Type: ${conflictType}`;
      prompt += `\nDialogue should embody this conflict through opposing wants/tactics.\n`;
    }

    // Tone
    if (targetTone) {
      prompt += `\nTarget Tone: ${targetTone}\n`;
    }

    prompt += `\n=== DIALOGUE IMPROVEMENT REQUIREMENTS ===\n`;
    prompt += `Rewrite the dialogue to:\n\n`;

    prompt += `1. **Add Subtext**\n`;
    prompt += `   - What's being said vs what's actually meant\n`;
    prompt += `   - What are characters avoiding or hiding?\n`;
    prompt += `   - Use indirection, implication, deflection\n\n`;

    prompt += `2. **Clarify Objectives**\n`;
    prompt += `   - What does each character want in this moment?\n`;
    prompt += `   - What tactics do they use to get it?\n`;
    prompt += `   - How do obstacles force creative approaches?\n\n`;

    prompt += `3. **Differentiate Voices**\n`;
    prompt += `   - Give each character distinct speech patterns\n`;
    prompt += `   - Reflect personality, background, faction in how they speak\n`;
    prompt += `   - Consider vocabulary, rhythm, formality, directness\n\n`;

    prompt += `4. **Increase Naturalism**\n`;
    prompt += `   - Cut unnecessary words\n`;
    prompt += `   - Add interruptions, trailing off, fragments\n`;
    prompt += `   - People talk past each other, mishear, assume\n`;
    prompt += `   - Use contractions, colloquialisms (if appropriate)\n\n`;

    prompt += `5. **Enhance Conflict**\n`;
    prompt += `   - Characters should want different things\n`;
    prompt += `   - Show power dynamics shifting\n`;
    prompt += `   - Build tension through escalation or evasion\n\n`;

    prompt += `6. **Show Don't Tell**\n`;
    prompt += `   - Avoid exposition dumps\n`;
    prompt += `   - Reveal through implication, not explanation\n`;
    prompt += `   - Trust the reader to infer meaning\n\n`;

    prompt += `Provide the improved dialogue with character tags. Add brief stage direction in [brackets] if it clarifies subtext or helps actors/readers understand the moment.`;

    return prompt;
  }
};
