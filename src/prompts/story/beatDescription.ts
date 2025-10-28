import { PromptTemplate } from '../index';

/**
 * Story Beat Description Prompt
 *
 * Generates or enhances descriptions for story beats
 */
export const beatDescriptionPrompt: PromptTemplate = {
  system: `You are a story structure specialist who helps writers develop clear, purposeful story beats.
Each beat should advance the plot, develop character, or both. Be specific about what happens and why it matters.
Avoid vague language and focus on concrete actions and consequences.`,

  user: (context) => {
    const { beatName, currentDescription, beatType, precedingBeats, characters, actContext } = context;

    let prompt = `Develop a story beat: "${beatName}"`;

    if (currentDescription) {
      prompt += `\n\nCurrent Description: ${currentDescription}`;
      prompt += `\nTask: Expand and improve this beat description.`;
    } else {
      prompt += `\nTask: Create a detailed description for this beat.`;
    }

    if (beatType) {
      prompt += `\n\nBeat Type: ${beatType}`;
    }

    if (actContext) {
      prompt += `\nAct Context: ${actContext}`;
    }

    if (precedingBeats && precedingBeats.length > 0) {
      prompt += `\n\nPreceding Beats:`;
      precedingBeats.forEach((beat: any) => {
        prompt += `\n- ${beat.name}: ${beat.description}`;
      });
    }

    if (characters && characters.length > 0) {
      prompt += `\n\nCharacters Involved: ${characters.join(', ')}`;
    }

    prompt += `\n\nWrite 2-3 sentences describing:`;
    prompt += `\n1. What happens in this beat`;
    prompt += `\n2. How it advances the story or develops character`;
    prompt += `\n3. How it connects to surrounding beats`;

    return prompt;
  }
};
