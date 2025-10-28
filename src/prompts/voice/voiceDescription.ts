import { PromptTemplate } from '../index';

/**
 * Voice Description Prompt
 *
 * Creates descriptions for voice profiles based on audio characteristics
 */
export const voiceDescriptionPrompt: PromptTemplate = {
  system: `You are a voice direction specialist who creates clear, evocative voice descriptions.
Descriptions should help voice actors or voice synthesis understand the character's vocal qualities.
Use concrete, specific language about pitch, pace, tone, accent, and unique vocal characteristics.`,

  user: (context) => {
    const { voiceName, characterName, audioFeatures, currentDescription, age, gender, personality } = context;

    let prompt = `Create a voice description for "${voiceName || characterName}"`;

    if (currentDescription) {
      prompt += `\n\nCurrent Description: ${currentDescription}`;
      prompt += `\nTask: Enhance this voice description with more specific details.`;
    } else {
      prompt += `\nTask: Create a detailed voice description.`;
    }

    if (characterName) {
      prompt += `\n\nCharacter: ${characterName}`;
    }

    if (age) {
      prompt += `\nAge: ${age}`;
    }

    if (gender) {
      prompt += `\nGender: ${gender}`;
    }

    if (personality && personality.length > 0) {
      prompt += `\nPersonality: ${personality.join(', ')}`;
    }

    if (audioFeatures) {
      prompt += `\n\nDetected Audio Features:`;
      if (audioFeatures.pitch) prompt += `\n- Pitch: ${audioFeatures.pitch}`;
      if (audioFeatures.tempo) prompt += `\n- Tempo: ${audioFeatures.tempo}`;
      if (audioFeatures.tone) prompt += `\n- Tone: ${audioFeatures.tone}`;
    }

    prompt += `\n\nWrite a 2-3 sentence description covering:`;
    prompt += `\n1. Pitch range and quality (deep, light, raspy, smooth, etc.)`;
    prompt += `\n2. Speaking pace and rhythm`;
    prompt += `\n3. Distinctive characteristics (accent, inflection, quirks)`;
    prompt += `\n4. Emotional texture and how it reflects personality`;

    return prompt;
  }
};
