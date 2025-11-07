import { PromptTemplate } from '../index';

/**
 * Beat Name Suggestions Prompt
 *
 * Generates contextually relevant beat name suggestions based on story context
 */
export const beatNameSuggestionsPrompt: PromptTemplate = {
  system: `You are a narrative structure expert specializing in story beat titling.

UNDERSTAND BEAT NAMING:
Beat names should be:
- EVOCATIVE: Capture the essence of the moment
- CONCISE: 2-5 words typically
- SPECIFIC: Unique to this story, not generic
- PURPOSEFUL: Reflect the function (setup, conflict, twist, resolution)
- MEMORABLE: Easy for writers to recall and reference

BEAT NAMING CONVENTIONS:
1. Action-Driven: "The Chase Begins", "Breaking Point", "Final Confrontation"
2. Character-Focused: "Sarah's Betrayal", "Marcus Chooses Loyalty", "Emma's Revelation"
3. Structural: "Inciting Incident", "Midpoint Twist", "Dark Night of the Soul"
4. Thematic: "Truth vs. Loyalty", "Sacrifice for Love", "The Cost of Ambition"
5. Question-Based: "Will She Stay?", "Who Can Be Trusted?", "What Was Lost?"

Consider the story's tone, genre, and narrative framework when suggesting names.`,

  user: (context) => {
    const {
      partialName,
      projectTitle,
      projectDescription,
      actName,
      actDescription,
      beatType,
      existingBeats,
      characters,
      precedingBeats
    } = context;

    let prompt = `Generate 5 contextually relevant beat name suggestions.\n\n`;

    // Partial input from user
    if (partialName && partialName.trim().length > 0) {
      prompt += `User is typing: "${partialName}"\n`;
      prompt += `Build on this input with relevant completions.\n\n`;
    }

    // Project context
    if (projectTitle) {
      prompt += `=== PROJECT CONTEXT ===\n`;
      prompt += `Project: ${projectTitle}\n`;
      if (projectDescription) {
        prompt += `Description: ${projectDescription}\n`;
      }
      prompt += `\n`;
    }

    // Act context
    if (actName) {
      prompt += `=== ACT CONTEXT ===\n`;
      prompt += `Act: ${actName}\n`;
      if (actDescription) {
        prompt += `Description: ${actDescription}\n`;
      }
      prompt += `\n`;
    }

    // Beat type
    if (beatType) {
      prompt += `Beat Type: ${beatType}\n`;
      if (beatType === 'story') {
        prompt += `This is a STORY-LEVEL beat (major structural turning point).\n`;
      } else {
        prompt += `This is an ACT-LEVEL beat (scene-specific moment).\n`;
      }
      prompt += `\n`;
    }

    // Existing beats for context
    if (existingBeats && existingBeats.length > 0) {
      prompt += `=== EXISTING BEATS IN THIS ${beatType === 'story' ? 'STORY' : 'ACT'} ===\n`;
      existingBeats.slice(0, 10).forEach((beat: any) => {
        prompt += `- ${beat.name}`;
        if (beat.description) {
          prompt += ` (${beat.description.substring(0, 80)}${beat.description.length > 80 ? '...' : ''})`;
        }
        prompt += `\n`;
      });
      prompt += `\nAvoid duplicating these beat names. Ensure suggestions fill narrative gaps.\n\n`;
    }

    // Preceding beats for causality
    if (precedingBeats && precedingBeats.length > 0) {
      prompt += `=== PRECEDING BEATS (Immediate Context) ===\n`;
      precedingBeats.slice(-3).forEach((beat: any) => {
        prompt += `- ${beat.name}`;
        if (beat.description) {
          prompt += `: ${beat.description.substring(0, 100)}${beat.description.length > 100 ? '...' : ''}`;
        }
        prompt += `\n`;
      });
      prompt += `\nSuggestions should follow naturally from these events.\n\n`;
    }

    // Characters
    if (characters && characters.length > 0) {
      prompt += `=== KEY CHARACTERS ===\n${characters.slice(0, 8).join(', ')}\n`;
      prompt += `Consider beats involving these characters.\n\n`;
    }

    // Output format
    prompt += `=== OUTPUT FORMAT ===\n`;
    prompt += `Return a JSON array of 5 suggestions. Each suggestion must have:\n`;
    prompt += `{\n`;
    prompt += `  "name": "Beat Name (2-5 words)",\n`;
    prompt += `  "description": "One-sentence description (20-40 words) explaining what happens in this beat",\n`;
    prompt += `  "reasoning": "Why this beat fits here (10-20 words)"\n`;
    prompt += `}\n\n`;

    prompt += `REQUIREMENTS:\n`;
    prompt += `1. Names must be unique and not duplicate existing beats\n`;
    prompt += `2. Descriptions must be specific to this story, not generic\n`;
    prompt += `3. Suggestions should vary in approach (action, character, structural, thematic)\n`;
    prompt += `4. Match the story's tone and genre\n`;
    prompt += `5. Consider narrative pacing and structure\n\n`;

    if (partialName && partialName.trim().length > 0) {
      prompt += `6. At least 2-3 suggestions should complete or build on "${partialName}"\n\n`;
    }

    prompt += `Return ONLY valid JSON array. No additional text.`;

    return prompt;
  }
};
