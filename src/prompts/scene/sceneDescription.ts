import { PromptTemplate } from '../index';

interface SceneDescriptionContext {
  sceneName: string;
  currentDescription?: string;
  location?: string;
  timeOfDay?: string;
  characters?: string[];
  mood?: string;
  purpose?: string;
  povCharacter?: string;
  emotionalState?: string;
  storyThemes?: string[];
}

/**
 * Build scene context section of the prompt
 */
function buildSceneContext(context: SceneDescriptionContext): string {
  let prompt = `Create a vivid scene description for: "${context.sceneName}"\n`;

  if (context.currentDescription) {
    prompt += `\nCurrent Description: ${context.currentDescription}`;
    prompt += `\nTask: Enrich with specific sensory details, emotional filtering, and atmospheric depth.\n`;
  } else {
    prompt += `\nTask: Write a compelling scene description from scratch.\n`;
  }

  if (context.povCharacter) {
    prompt += `\nPOV Character: ${context.povCharacter}`;
    prompt += `\nFilter description through their perspective and emotional state.\n`;
  }

  if (context.location) {
    prompt += `\nLocation: ${context.location}\n`;
  }

  if (context.timeOfDay) {
    prompt += `Time: ${context.timeOfDay}\n`;
  }

  return prompt;
}

/**
 * Build mood and emotional state section
 */
function buildMoodContext(context: SceneDescriptionContext): string {
  let prompt = '';

  if (context.mood) {
    prompt += `\nMood/Tone: ${context.mood}`;
    prompt += ` (Setting details should reinforce or ironically contrast this)\n`;
  }

  if (context.emotionalState) {
    prompt += `\nEmotional State: ${context.emotionalState}`;
    prompt += `\nDetails noticed should reflect this emotional lens.\n`;
  }

  if (context.characters && context.characters.length > 0) {
    prompt += `\nCharacters Present: ${context.characters.join(', ')}\n`;
  }

  return prompt;
}

/**
 * Build purpose and theme context
 */
function buildPurposeContext(context: SceneDescriptionContext): string {
  let prompt = '';

  if (context.purpose) {
    prompt += `\nScene Purpose: ${context.purpose}\n`;
  }

  if (context.storyThemes && context.storyThemes.length > 0) {
    prompt += `\nStory Themes: ${context.storyThemes.join(', ')}`;
    prompt += `\nConsider details that subtly echo these themes.\n`;
  }

  return prompt;
}

/**
 * Build requirements section
 */
function buildRequirements(): string {
  let prompt = `\n=== SCENE DESCRIPTION REQUIREMENTS ===\n`;
  prompt += `Write 2-4 sentences (150-250 words) that:\n\n`;

  prompt += `1. **Establish Setting Through POV**\n`;
  prompt += `   - What would the POV character notice in this moment?\n`;
  prompt += `   - Choose 2-3 specific sensory details (not all senses, just evocative ones)\n`;
  prompt += `   - Make details concrete and specific, never generic\n\n`;

  prompt += `2. **Create Atmosphere**\n`;
  prompt += `   - Use description to establish mood\n`;
  prompt += `   - Consider light, sound, temperature, texture\n`;
  prompt += `   - Avoid clichéd descriptors - find fresh ways to evoke feeling\n\n`;

  prompt += `3. **Reflect Emotional State**\n`;
  prompt += `   - A nervous character notices different things than a confident one\n`;
  prompt += `   - Setting can mirror, amplify, or ironically contrast emotion\n`;
  prompt += `   - Use active description - things in motion, in relation to characters\n\n`;

  prompt += `4. **Hint at Stakes/Subtext**\n`;
  prompt += `   - What's beneath the surface of this scene?\n`;
  prompt += `   - Details should create tension or anticipation\n`;
  prompt += `   - What's unseen but felt?\n\n`;

  prompt += `5. **Serve Theme**\n`;
  prompt += `   - Can any details subtly reinforce thematic concerns?\n`;
  prompt += `   - Symbolic elements should feel organic, not forced\n\n`;

  prompt += `Write in vivid, economical prose. Every detail should earn its place by doing emotional or narrative work.`;
  prompt += `Think cinematically: What's the shot? What's in focus? How does the camera move?`;

  return prompt;
}

/**
 * Scene Description Prompt
 *
 * Generates or enhances scene descriptions
 */
export const sceneDescriptionPrompt: PromptTemplate = {
  system: `You are a scene craft specialist drawing on cinematic and literary techniques.

UNDERSTAND SCENE DYNAMICS:
Scenes are where story actually happens. Great scene descriptions:
- ESTABLISH POV: Through whose eyes/emotions do we experience this?
- REVEAL THROUGH DETAIL: Setting details should reflect character state or theme
- CREATE ATMOSPHERE: Mood should match or ironically contrast the emotional content
- HINT AT SUBTEXT: What's beneath the surface? What's not being said?
- GROUND THE READER: Use specific sensory details (not all five senses, but chosen ones)

WRITING PRINCIPLES:
- SHOW DON'T TELL: "The cup trembled in her hands" beats "she was nervous"
- ACTIVE DESCRIPTION: Describe things in motion, in relation to characters
- EMOTIONAL FILTERING: Details noticed reflect character's emotional state
- SPECIFIC BEATS GENERAL: "The smell of burnt coffee and old paper" beats "the office was messy"
- ECONOMY: Every word should work (evoke mood, reveal character, or advance plot)

AVOID:
- Laundry lists of details with no emotional weight
- Generic descriptors ("beautiful sunset", "dark alley")
- Description that stops the story cold
- Describing things characters wouldn't notice in this emotional moment

Think like a cinematographer: What's in focus? What's in shadow? Where's the camera? How does the environment reflect the internal landscape?`,

  user: (context: SceneDescriptionContext) => {
    let prompt = buildSceneContext(context);
    prompt += buildMoodContext(context);
    prompt += buildPurposeContext(context);
    prompt += buildRequirements();

    return prompt;
  },
};
