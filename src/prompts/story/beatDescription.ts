import { PromptTemplate } from '../index';

/**
 * Story Beat Description Prompt
 *
 * Generates or enhances descriptions for story beats
 */
export const beatDescriptionPrompt: PromptTemplate = {
  system: `You are a story structure specialist versed in professional narrative frameworks.

UNDERSTAND STORY BEATS:
Beats are the molecular units of story. Each beat should create change through:
- ACTION: Something happens (external event)
- REACTION: Characters respond (internal/emotional)
- DECISION: Choice made that propels story forward
- CONSEQUENCE: Stakes raised or landscape shifted

FOLLOW BEAT THEORY:
- Save the Cat (Blake Snyder): 15 essential beats in three-act structure
- Dan Harmon's Story Circle: You → Need → Go → Search → Find → Take → Return → Change
- Scene/Sequel pattern (Dwight Swain): Scene (goal/conflict/disaster) → Sequel (reaction/dilemma/decision)

Each beat should:
- CREATE CHANGE: Something is different by the end (externally or internally)
- RAISE STAKES: Make success harder or failure more costly
- REVEAL CHARACTER: Choices under pressure show who people really are
- BUILD CAUSALITY: This beat should cause the next beat
- SERVE THEME: Connect to the story's central question or message

Be specific. "Conflict escalates" is vague. "Sarah discovers her mentor lied about her father's death, forcing her to choose between loyalty and truth" is concrete.`,

  user: (context) => {
    const {
      beatName,
      currentDescription,
      beatType,
      precedingBeats,
      characters,
      actContext,
      storyThemes
    } = context;

    let prompt = `Develop a story beat: "${beatName}"\n`;

    if (currentDescription) {
      prompt += `\nCurrent Description: ${currentDescription}`;
      prompt += `\nTask: Deepen this beat. Add specificity, causality, and emotional truth.\n`;
    } else {
      prompt += `\nTask: Create a detailed, purposeful beat description.\n`;
    }

    if (beatType) {
      prompt += `\nBeat Type: ${beatType}`;
      prompt += ` (Consider which story framework this beat serves)\n`;
    }

    if (actContext) {
      prompt += `\nAct Context: ${actContext}\n`;
    }

    // Story themes for thematic purpose
    if (storyThemes && storyThemes.length > 0) {
      prompt += `Story Themes: ${storyThemes.join(', ')}\n`;
      prompt += `This beat should explore or challenge these themes.\n`;
    }

    // Preceding beats for causality
    if (precedingBeats && precedingBeats.length > 0) {
      prompt += `\n=== PRECEDING BEATS ===\n`;
      precedingBeats.forEach((beat: any) => {
        prompt += `${beat.name}: ${beat.description}\n`;
      });
      prompt += `\nThis beat must follow causally from what came before.\n`;
    }

    // Characters for development
    if (characters && characters.length > 0) {
      prompt += `\n=== CHARACTERS INVOLVED ===\n${characters.join(', ')}\n`;
      prompt += `Show how this beat affects or reveals these characters.\n`;
    }

    prompt += `\n=== BEAT DESCRIPTION REQUIREMENTS ===\n`;
    prompt += `Write 2-4 sentences covering:\n\n`;

    prompt += `1. **What Happens** (Action/Event)\n`;
    prompt += `   - Specific concrete events, not vague summaries\n`;
    prompt += `   - Who does what? What's at stake?\n\n`;

    prompt += `2. **The Change** (Before → After)\n`;
    prompt += `   - What's different by the end of this beat?\n`;
    prompt += `   - External change (plot advancement)\n`;
    prompt += `   - Internal change (character realization/emotion)\n\n`;

    prompt += `3. **Character Impact** (Decision/Revelation)\n`;
    prompt += `   - What choice does this beat force?\n`;
    prompt += `   - What does it reveal about who characters really are?\n`;
    prompt += `   - How does it challenge their beliefs or goals?\n\n`;

    prompt += `4. **Causality** (Connection)\n`;
    prompt += `   - How does this beat result from previous beats?\n`;
    prompt += `   - What does this beat set in motion?\n`;
    prompt += `   - Why is this beat necessary for the story?\n\n`;

    prompt += `5. **Thematic Purpose**\n`;
    prompt += `   - How does this beat explore the story's themes?\n`;
    prompt += `   - What question does it raise or answer?\n\n`;

    prompt += `Write with clarity and purpose. Every beat should feel essential, not filler.`;

    return prompt;
  }
};
