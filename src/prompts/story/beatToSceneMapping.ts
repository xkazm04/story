import { PromptTemplate } from '../index';

/**
 * Beat-to-Scene Mapping Prompt
 *
 * AI-driven prompt for generating scene suggestions from story beats
 * Analyzes beat content and maps to existing scenes or suggests new ones
 */
export const beatToSceneMappingPrompt: PromptTemplate = {
  system: `You are an expert screenplay and narrative consultant specializing in scene structure and beat-to-scene mapping.

TASK: Analyze a story beat and either:
1. Map it to existing scenes that best represent this beat
2. Suggest new scene outlines to dramatize this beat

ANALYSIS APPROACH:
- Semantic Understanding: Identify the core dramatic purpose of the beat
- Scene Matching: Compare beat intent with existing scene content
- Narrative Flow: Consider how scenes can effectively dramatize the beat's action
- Dramatic Potential: Evaluate which approach (existing or new) serves the story best

SCORING CRITERIA:
- Semantic Similarity (0.0-1.0): How well scene content matches beat intent
- Confidence Score (0.0-1.0): Overall confidence in the suggestion

SUGGESTION TYPES:
A) EXISTING SCENE MATCH: When a scene already dramatizes this beat well
   - Highlight semantic connections
   - Explain how the scene fulfills the beat
   - Suggest minor modifications if needed

B) NEW SCENE SUGGESTION: When no existing scene fits or new content would serve better
   - Provide scene name, description, and outline
   - Include location and key story elements
   - Explain why a new scene is necessary

OUTPUT QUALITY:
- Be specific: Reference concrete story elements
- Be practical: Suggest actionable, filmable scenes
- Be insightful: Explain the narrative logic behind suggestions
- Be concise: Keep suggestions scannable and clear`,

  user: (context) => {
    const {
      beatName,
      beatDescription,
      beatType,
      existingScenes,
      projectContext,
      maxSuggestions = 3,
      includeNewScenes = true,
    } = context;

    let prompt = `Analyze this story beat and provide scene mapping suggestions:\n\n`;

    prompt += `=== BEAT TO MAP ===\n`;
    prompt += `Name: "${beatName}"\n`;

    if (beatDescription) {
      prompt += `Description: ${beatDescription}\n`;
    }

    if (beatType) {
      prompt += `Type: ${beatType}\n`;
    }

    // Add project context if available
    if (projectContext) {
      prompt += `\n=== PROJECT CONTEXT ===\n`;
      if (projectContext.genre) prompt += `Genre: ${projectContext.genre}\n`;
      if (projectContext.theme) prompt += `Theme: ${projectContext.theme}\n`;
      if (projectContext.setting) prompt += `Setting: ${projectContext.setting}\n`;
    }

    // Add existing scenes for mapping
    if (existingScenes && existingScenes.length > 0) {
      prompt += `\n=== EXISTING SCENES (${existingScenes.length}) ===\n`;
      existingScenes.forEach((scene: any, index: number) => {
        prompt += `\n[Scene ${index + 1}]\n`;
        prompt += `ID: ${scene.id}\n`;
        prompt += `Name: "${scene.name}"\n`;
        if (scene.description) prompt += `Description: ${scene.description}\n`;
        if (scene.location) prompt += `Location: ${scene.location}\n`;
        if (scene.script) {
          const preview = scene.script.length > 300
            ? scene.script.substring(0, 300) + '...'
            : scene.script;
          prompt += `Script Preview: ${preview}\n`;
        }
      });
    } else {
      prompt += `\n=== EXISTING SCENES ===\n`;
      prompt += `No existing scenes available. All suggestions will be for new scenes.\n`;
    }

    prompt += `\n=== OUTPUT INSTRUCTIONS ===\n`;
    prompt += `Provide ${maxSuggestions} scene mapping suggestions.\n`;

    if (includeNewScenes) {
      prompt += `Include both existing scene matches AND new scene suggestions if appropriate.\n`;
    } else {
      prompt += `Focus only on mapping to existing scenes.\n`;
    }

    prompt += `\nReturn your response as a valid JSON array with this exact structure:\n`;
    prompt += `[\n`;
    prompt += `  {\n`;
    prompt += `    "scene_id": "uuid-or-null-if-new",\n`;
    prompt += `    "scene_name": "Scene Name",\n`;
    prompt += `    "scene_description": "Brief description of the scene",\n`;
    prompt += `    "scene_script": "Optional script outline for new scenes",\n`;
    prompt += `    "location": "Scene location",\n`;
    prompt += `    "similarity_score": 0.85,\n`;
    prompt += `    "confidence_score": 0.90,\n`;
    prompt += `    "reasoning": "Clear explanation of why this scene maps to the beat",\n`;
    prompt += `    "is_new_scene": false\n`;
    prompt += `  }\n`;
    prompt += `]\n\n`;

    prompt += `IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.\n`;

    return prompt;
  }
};
