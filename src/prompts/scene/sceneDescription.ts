import { PromptTemplate } from '../index';

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

  user: (context) => {
    const {
      sceneName,
      currentDescription,
      location,
      timeOfDay,
      characters,
      mood,
      purpose,
      povCharacter,
      emotionalState,
      storyThemes
    } = context;

    let prompt = `Create a vivid scene description for: "${sceneName}"\n`;

    if (currentDescription) {
      prompt += `\nCurrent Description: ${currentDescription}`;
      prompt += `\nTask: Enrich with specific sensory details, emotional filtering, and atmospheric depth.\n`;
    } else {
      prompt += `\nTask: Write a compelling scene description from scratch.\n`;
    }

    // POV character for filtering
    if (povCharacter) {
      prompt += `\nPOV Character: ${povCharacter}`;
      prompt += `\nFilter description through their perspective and emotional state.\n`;
    }

    if (location) {
      prompt += `\nLocation: ${location}\n`;
    }

    if (timeOfDay) {
      prompt += `Time: ${timeOfDay}\n`;
    }

    // Mood/tone for atmosphere
    if (mood) {
      prompt += `\nMood/Tone: ${mood}`;
      prompt += ` (Setting details should reinforce or ironically contrast this)\n`;
    }

    // Emotional state affects what characters notice
    if (emotionalState) {
      prompt += `\nEmotional State: ${emotionalState}`;
      prompt += `\nDetails noticed should reflect this emotional lens.\n`;
    }

    // Characters present
    if (characters && characters.length > 0) {
      prompt += `\nCharacters Present: ${characters.join(', ')}\n`;
    }

    // Scene purpose for thematic details
    if (purpose) {
      prompt += `\nScene Purpose: ${purpose}\n`;
    }

    // Themes for symbolic details
    if (storyThemes && storyThemes.length > 0) {
      prompt += `\nStory Themes: ${storyThemes.join(', ')}`;
      prompt += `\nConsider details that subtly echo these themes.\n`;
    }

    prompt += `\n=== SCENE DESCRIPTION REQUIREMENTS ===\n`;
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
};
