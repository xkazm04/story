import { PromptTemplate } from '../index';

/**
 * Shot Composition
 *
 * Suggests optimal shot composition and framing for a video scene
 */
export const shotCompositionPrompt: PromptTemplate = {
  system: `You are a professional cinematographer specializing in shot composition and framing.
Analyze scenes and suggest the best camera angles, framing, and composition to tell the story effectively.
Consider visual storytelling, emotion, and cinematic principles.`,

  user: (context) => {
    const { sceneContext, mood, characters, action } = context;

    let prompt = `Suggest shot composition for this scene:\n\n${sceneContext}`;

    if (mood) {
      prompt += `\n\nMood: ${mood}`;
    }

    if (characters && characters.length > 0) {
      prompt += `\nCharacters: ${characters.join(', ')}`;
    }

    if (action) {
      prompt += `\nAction: ${action}`;
    }

    prompt += `\n\nProvide recommendations for:`;
    prompt += `\n1. Shot type (close-up, medium, wide, extreme close-up, full shot)`;
    prompt += `\n2. Camera angle (eye level, high angle, low angle, Dutch angle)`;
    prompt += `\n3. Camera movement (static, pan, tilt, dolly, tracking, handheld)`;
    prompt += `\n4. Composition rules (rule of thirds, leading lines, symmetry, etc.)`;
    prompt += `\n5. Focal point and depth of field`;
    prompt += `\n6. Rationale for choices`;

    prompt += `\n\nReturn as JSON:`;
    prompt += `\n{`;
    prompt += `\n  "shotType": "medium shot",`;
    prompt += `\n  "cameraAngle": "slightly low angle",`;
    prompt += `\n  "cameraMovement": "slow push in",`;
    prompt += `\n  "composition": "rule of thirds",`;
    prompt += `\n  "focalPoint": "character's eyes",`;
    prompt += `\n  "rationale": "explanation of choices"`;
    prompt += `\n}`;

    return prompt;
  }
};
