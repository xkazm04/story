import { PromptTemplate } from '../index';
import type { SceneInfo } from '../types';

interface ExistingScene {
  title: string;
  location?: string;
}

/**
 * Scene Name Suggestions Prompt
 *
 * Generates contextually relevant scene name suggestions based on story context
 */
export const sceneNameSuggestionsPrompt: PromptTemplate = {
  system: `You are a screenplay and narrative expert specializing in scene titling.

UNDERSTAND SCENE NAMING:
Scene names should be:
- DESCRIPTIVE: Convey location, action, or emotional content
- CLEAR: Easy to identify at a glance
- EVOCATIVE: Create a mood or sense of the scene
- FUNCTIONAL: Help writers track story progression
- CONSISTENT: Match the project's naming style

SCENE NAMING CONVENTIONS:
1. Location-Based: "The Throne Room", "Midnight at the Docks", "Sarah's Apartment"
2. Action-Based: "The Chase", "Breaking and Entering", "First Kiss"
3. Emotional: "Moment of Truth", "Descent Into Madness", "Bittersweet Reunion"
4. Character-Focused: "Marcus Confronts His Father", "Emma's Decision"
5. Structural: "INT. HOSPITAL - DAY", "EXT. FOREST - NIGHT" (screenplay format)
6. Hybrid: "Betrayal at the Castle", "Dawn Meeting in the Garden"

Consider the scene's purpose, location, participants, emotional tone, and story context when suggesting names.`,

  user: (context: {
    partialName?: string;
    projectTitle?: string;
    projectDescription?: string;
    genre?: string;
    actName?: string;
    actDescription?: string;
    existingScenes?: ExistingScene[];
    characters?: string[];
    location?: string;
    timeOfDay?: string;
    mood?: string;
    previousScene?: SceneInfo;
    nextScene?: SceneInfo;
    sceneType?: string;
  }) => {
    const {
      partialName,
      projectTitle,
      projectDescription,
      genre,
      actName,
      actDescription,
      existingScenes,
      characters,
      location,
      timeOfDay,
      mood,
      previousScene,
      nextScene,
      sceneType,
    } = context;

    let prompt = `Generate 5 contextually relevant scene name suggestions.\n\n`;

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
        prompt += `Story: ${projectDescription}\n`;
      }
      if (genre) {
        prompt += `Genre: ${genre}\n`;
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

    // Scene-specific details
    if (location || timeOfDay || mood || sceneType) {
      prompt += `=== SCENE DETAILS ===\n`;
      if (location) prompt += `Location: ${location}\n`;
      if (timeOfDay) prompt += `Time: ${timeOfDay}\n`;
      if (mood) prompt += `Mood: ${mood}\n`;
      if (sceneType) prompt += `Type: ${sceneType}\n`;
      prompt += `\n`;
    }

    // Characters in scene
    if (characters && characters.length > 0) {
      prompt += `=== CHARACTERS IN SCENE ===\n`;
      prompt += characters.slice(0, 8).join(', ') + `\n`;
      prompt += `Scene names can reference these characters.\n\n`;
    }

    // Sequential context
    if (previousScene || nextScene) {
      prompt += `=== SEQUENTIAL CONTEXT ===\n`;
      if (previousScene) {
        prompt += `Previous Scene: ${previousScene.title}`;
        if (previousScene.description) {
          prompt += ` - ${previousScene.description.substring(0, 60)}${previousScene.description.length > 60 ? '...' : ''}`;
        }
        prompt += `\n`;
      }
      if (nextScene) {
        prompt += `Next Scene: ${nextScene.title}`;
        if (nextScene.description) {
          prompt += ` - ${nextScene.description.substring(0, 60)}${nextScene.description.length > 60 ? '...' : ''}`;
        }
        prompt += `\n`;
      }
      prompt += `Scene should fit naturally in this sequence.\n\n`;
    }

    // Existing scenes for context
    if (existingScenes && existingScenes.length > 0) {
      prompt += `=== EXISTING SCENES IN ACT ===\n`;
      existingScenes.slice(0, 12).forEach((scene) => {
        prompt += `- ${scene.title}`;
        if (scene.location) {
          prompt += ` (${scene.location})`;
        }
        prompt += `\n`;
      });
      prompt += `\nAvoid duplicating scene names. Match the naming style.\n\n`;
    }

    // Output format
    prompt += `=== OUTPUT FORMAT ===\n`;
    prompt += `Return a JSON array of 5 suggestions. Each suggestion must have:\n`;
    prompt += `{\n`;
    prompt += `  "name": "Scene Name (2-6 words)",\n`;
    prompt += `  "description": "One-sentence description of what happens (20-40 words)",\n`;
    prompt += `  "reasoning": "Why this name fits the scene's purpose (10-20 words)"\n`;
    prompt += `}\n\n`;

    prompt += `REQUIREMENTS:\n`;
    prompt += `1. Names must be unique and not duplicate existing scenes\n`;
    prompt += `2. Names should be clear and descriptive\n`;
    prompt += `3. Match the project's naming style and conventions\n`;
    prompt += `4. Consider location, characters, and emotional tone\n`;
    prompt += `5. Provide variety: location-based, action-based, emotional, character-focused\n\n`;

    if (partialName && partialName.trim().length > 0) {
      prompt += `6. At least 2-3 suggestions should complete or build on "${partialName}"\n\n`;
    }

    prompt += `Return ONLY valid JSON array. No additional text.`;

    return prompt;
  }
};
