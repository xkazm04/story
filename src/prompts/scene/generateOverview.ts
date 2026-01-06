import { PromptTemplate } from '../index';

export const generateOverviewPrompt: PromptTemplate = {
    system: `You are a script reader and analyst. Your task is to provide a concise but comprehensive overview of a scene script.
  
  Focus on:
  1. What happens (Plot)
  2. Key character moments
  3. Atmosphere and tone
  
  Keep the overview under 200 words.`,
    user: (context) => `
    Scene Title: ${context.sceneTitle}
    
    Script:
    ${context.script}
    
    Provide a summary overview of this scene.
  `
};
