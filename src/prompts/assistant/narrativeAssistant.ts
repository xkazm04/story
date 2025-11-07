import type { SuggestionType, SuggestionDepth } from '@/app/types/AIAssistant';

interface NarrativeAssistantContext {
  contextType: 'act' | 'beat' | 'character' | 'scene' | 'general';
  projectName?: string;
  projectDescription?: string;
  genre?: string;
  actName?: string;
  actDescription?: string;
  beatName?: string;
  beatDescription?: string;
  characterName?: string;
  characterTraits?: string[];
  sceneName?: string;
  sceneDescription?: string;
  existingBeats?: Array<{ name: string; description?: string }>;
  existingScenes?: Array<{ name: string; description?: string }>;
  suggestionTypes: SuggestionType[];
  depth: SuggestionDepth;
  maxSuggestions: number;
}

const suggestionTypeDescriptions: Record<SuggestionType, string> = {
  scene_hook: 'Compelling scene opening hooks that grab attention and establish atmosphere',
  beat_outline: 'Detailed beat outlines that structure narrative progression',
  dialogue_snippet: 'Character dialogue examples that reveal personality and advance plot',
  character_action: 'Meaningful character actions that drive the story forward',
  plot_twist: 'Unexpected plot developments that add depth and intrigue',
  world_building: 'Rich world-building details that enhance setting and atmosphere',
};

const depthInstructions: Record<SuggestionDepth, string> = {
  brief: 'Keep suggestions concise (1-2 sentences). Focus on the core idea.',
  moderate: 'Provide moderate detail (2-4 sentences). Include context and reasoning.',
  detailed: 'Provide comprehensive suggestions (4-6 sentences). Include examples, reasoning, and implementation guidance.',
};

export const narrativeAssistantPrompt = (context: NarrativeAssistantContext): string => {
  const {
    contextType,
    projectName,
    projectDescription,
    genre,
    actName,
    actDescription,
    beatName,
    beatDescription,
    characterName,
    characterTraits,
    sceneName,
    sceneDescription,
    existingBeats,
    existingScenes,
    suggestionTypes,
    depth,
    maxSuggestions
  } = context;

  let contextDescription = '';

  switch (contextType) {
    case 'act':
      contextDescription = `
Current Act: ${actName || 'Unnamed Act'}
Act Description: ${actDescription || 'No description provided'}
${existingBeats && existingBeats.length > 0 ? `
Existing Beats in This Act:
${existingBeats.map(b => `- ${b.name}${b.description ? ': ' + b.description : ''}`).join('\n')}
` : ''}`;
      break;

    case 'beat':
      contextDescription = `
Current Beat: ${beatName || 'Unnamed Beat'}
Beat Description: ${beatDescription || 'No description provided'}
${actName ? `Part of Act: ${actName}` : ''}`;
      break;

    case 'character':
      contextDescription = `
Character: ${characterName || 'Unnamed Character'}
${characterTraits && characterTraits.length > 0 ? `
Character Traits:
${characterTraits.map(t => `- ${t}`).join('\n')}
` : ''}`;
      break;

    case 'scene':
      contextDescription = `
Current Scene: ${sceneName || 'Unnamed Scene'}
Scene Description: ${sceneDescription || 'No description provided'}
${actName ? `Part of Act: ${actName}` : ''}`;
      break;

    case 'general':
      contextDescription = 'Providing general narrative suggestions for the project.';
      break;
  }

  const requestedSuggestions = suggestionTypes.map(type =>
    `- ${type}: ${suggestionTypeDescriptions[type]}`
  ).join('\n');

  return `You are an expert narrative assistant helping writers develop their stories. Your role is to analyze the current context and provide creative, contextually-relevant suggestions.

PROJECT CONTEXT:
Project: ${projectName || 'Untitled Project'}
${projectDescription ? `Description: ${projectDescription}` : ''}
${genre ? `Genre: ${genre}` : ''}

${contextDescription}

TASK:
Generate up to ${maxSuggestions} creative suggestions for the following types:
${requestedSuggestions}

GUIDELINES:
- ${depthInstructions[depth]}
- Ensure suggestions are consistent with the established project context, genre, and existing narrative elements
- Be creative and original while maintaining coherence with the existing story
- For dialogue snippets, match the character's established personality and voice
- For scene hooks, consider pacing and dramatic timing
- For beat outlines, ensure logical story progression
- Each suggestion should include a clear title and engaging content
- Provide brief reasoning for why each suggestion fits the narrative

OUTPUT FORMAT:
Return a JSON array of suggestions with the following structure:
[
  {
    "type": "suggestion_type",
    "title": "Brief, compelling title",
    "content": "The actual suggestion content",
    "context": "Brief explanation of how this fits the current narrative",
    "confidence": 0.85,
    "reasoning": "Why this suggestion works for this story"
  }
]

IMPORTANT:
- Return ONLY the JSON array, no additional text
- Ensure all JSON is valid and properly formatted
- Confidence should be a number between 0 and 1
- Be specific and actionable in your suggestions
- Consider the ${depth} depth level in your responses

Generate creative, contextually appropriate suggestions now.`;
};

export const quickSceneHookPrompt = (sceneName: string, sceneDescription?: string, genre?: string): string => {
  return `Generate 3 compelling scene opening hooks for:

Scene: ${sceneName}
${sceneDescription ? `Description: ${sceneDescription}` : ''}
${genre ? `Genre: ${genre}` : ''}

Each hook should:
- Be 1-2 sentences
- Immediately grab attention
- Establish atmosphere
- Hint at conflict or intrigue

Return as JSON array:
[
  {
    "type": "scene_hook",
    "title": "Hook title",
    "content": "The hook text",
    "context": "Why this works",
    "confidence": 0.8
  }
]`;
};

export const quickDialoguePrompt = (characterName: string, characterTraits: string[], context: string): string => {
  return `Generate 3 short dialogue snippets for:

Character: ${characterName}
Traits: ${characterTraits.join(', ')}
Context: ${context}

Each snippet should:
- Reveal character personality
- Be 1-2 lines of dialogue
- Feel natural and authentic
- Advance the scene or reveal information

Return as JSON array with type "dialogue_snippet".`;
};

export const quickBeatOutlinePrompt = (actName: string, existingBeats: string[], genre?: string): string => {
  return `Generate 2-3 new beat outlines for:

Act: ${actName}
${genre ? `Genre: ${genre}` : ''}

Existing beats:
${existingBeats.map(b => `- ${b}`).join('\n')}

Each outline should:
- Follow logically from existing beats
- Introduce new developments
- Maintain narrative momentum
- Be 2-3 sentences

Return as JSON array with type "beat_outline".`;
};
