import { PromptTemplate } from '../index';

/**
 * Act Summary Prompt
 *
 * Generates or improves act summaries based on beats and scenes
 */
export const actSummaryPrompt: PromptTemplate = {
  system: `You are a story structure specialist who creates clear, compelling act summaries.
Summaries should capture the essence of the act while highlighting the key turning points and character development.
Focus on the journey, conflicts, and how the act moves the story forward.`,

  user: (context) => {
    const { actNumber, actName, currentSummary, beats, scenes, characters } = context;

    let prompt = `Create a summary for Act ${actNumber}${actName ? `: "${actName}"` : ''}`;

    if (currentSummary) {
      prompt += `\n\nCurrent Summary: ${currentSummary}`;
      prompt += `\nTask: Refine and enhance this act summary.`;
    } else {
      prompt += `\nTask: Create a compelling act summary based on the following information.`;
    }

    if (beats && beats.length > 0) {
      prompt += `\n\nKey Story Beats:`;
      beats.forEach((beat: any) => {
        prompt += `\n- ${beat.name}: ${beat.description}`;
      });
    }

    if (scenes && scenes.length > 0) {
      prompt += `\n\nNumber of Scenes: ${scenes.length}`;
      if (scenes.length <= 5) {
        prompt += `\nScenes:`;
        scenes.forEach((scene: any) => {
          prompt += `\n- ${scene.name}`;
        });
      }
    }

    if (characters && characters.length > 0) {
      prompt += `\n\nMain Characters in This Act: ${characters.join(', ')}`;
    }

    prompt += `\n\nWrite a 3-4 sentence summary that captures:`;
    prompt += `\n1. The main events and conflicts of this act`;
    prompt += `\n2. Character development and changes`;
    prompt += `\n3. How it sets up the next act or resolves the story`;

    return prompt;
  }
};
