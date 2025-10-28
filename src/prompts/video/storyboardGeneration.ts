import { PromptTemplate } from '../index';

/**
 * Storyboard Generation
 *
 * Generates a video storyboard breakdown from a scene or description
 */
export const storyboardGenerationPrompt: PromptTemplate = {
  system: `You are an expert cinematographer and storyboard artist.
Break down scenes or descriptions into detailed shot-by-shot storyboards for video generation.
Consider pacing, camera angles, transitions, and visual storytelling.`,

  user: (context) => {
    const { sceneDescription, dialogue, duration, shotCount, style } = context;

    let prompt = `Create a video storyboard breakdown for this scene:\n\n"${sceneDescription}"`;

    if (dialogue) {
      prompt += `\n\nDialogue:\n${dialogue}`;
    }

    if (duration) {
      prompt += `\n\nTotal Duration: ${duration} seconds`;
    }

    if (shotCount) {
      prompt += `\nNumber of Shots: ${shotCount}`;
    } else {
      prompt += `\nNumber of Shots: Determine based on scene pacing`;
    }

    if (style) {
      prompt += `\nVisual Style: ${style}`;
    }

    prompt += `\n\nFor each shot, provide:`;
    prompt += `\n1. Shot number`;
    prompt += `\n2. Duration (in seconds)`;
    prompt += `\n3. Shot type (close-up, medium, wide, etc.)`;
    prompt += `\n4. Camera angle and movement`;
    prompt += `\n5. Subject and action`;
    prompt += `\n6. Detailed visual prompt for video generation`;
    prompt += `\n7. Transition to next shot`;

    prompt += `\n\nReturn as a JSON array with this structure:`;
    prompt += `\n[{`;
    prompt += `\n  "shot": 1,`;
    prompt += `\n  "duration": 3,`;
    prompt += `\n  "shotType": "wide shot",`;
    prompt += `\n  "cameraMovement": "slow dolly in",`;
    prompt += `\n  "action": "character enters room",`;
    prompt += `\n  "prompt": "detailed video generation prompt",`;
    prompt += `\n  "transition": "cut"`;
    prompt += `\n}]`;

    return prompt;
  }
};
