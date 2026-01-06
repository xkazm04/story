import { PromptTemplate } from '../index';

export const generateDialoguePrompt: PromptTemplate = {
    system: `You are an expert screenwriter and dialogue writer. Your task is to generate realistic, character-driven dialogue based on a scene script.
  
  Output the dialogue in a JSON format:
  {
    "lines": [
      {
        "speaker": "CHARACTER NAME",
        "text": "The dialogue line.",
        "emotion": "optional emotion or delivery instruction"
      }
    ]
  }
  
  Ensure the dialogue flows naturally and reflects the characters' personalities and the scene's context.`,
    user: (context) => `
    Scene Title: ${context.sceneTitle}
    Scene Description: ${context.sceneDescription}
    
    Current Script:
    ${context.script}
    
    Characters in Scene:
    ${context.characters.map((c: any) => `- ${c.name}: ${c.role}`).join('\n')}
    
    Generate dialogue for this scene based on the script above.
  `
};
