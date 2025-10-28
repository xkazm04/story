import { PromptTemplate } from '../index';

/**
 * Personality Extraction from Audio/Text Prompt
 *
 * Analyzes transcribed audio to extract personality traits and speaking style
 */
export const personalityExtractionPrompt: PromptTemplate = {
  system: `You are a character psychology analyst who extracts personality insights from speech patterns.
Analyze word choice, sentence structure, emotional tone, topics discussed, and communication style.
Be specific and evidence-based, quoting relevant passages to support your analysis.`,

  user: (context) => {
    const { transcriptionText, characterName, additionalContext } = context;

    let prompt = `Analyze this transcribed speech to extract personality characteristics:`;

    if (transcriptionText) {
      prompt += `\n\nTranscription:\n${transcriptionText}`;
    }

    if (characterName) {
      prompt += `\n\nCharacter Name: ${characterName}`;
    }

    if (additionalContext) {
      prompt += `\nAdditional Context: ${additionalContext}`;
    }

    prompt += `\n\nProvide a detailed analysis in the following JSON format:`;
    prompt += `\n{`;
    prompt += `\n  "personality_summary": "2-3 paragraph overview of personality",`;
    prompt += `\n  "traits": ["trait1", "trait2", ...],`;
    prompt += `\n  "speaking_style": "Description of how they speak (formal/casual, direct/indirect, etc.)",`;
    prompt += `\n  "emotional_range": "Description of emotional expressiveness",`;
    prompt += `\n  "key_values": ["value1", "value2", ...],`;
    prompt += `\n  "communication_patterns": "How they communicate and interact",`;
    prompt += `\n  "notable_quotes": ["quote1", "quote2", ...],`;
    prompt += `\n  "confidence_score": 0.0-1.0`;
    prompt += `\n}`;

    prompt += `\n\nBase your analysis on:`;
    prompt += `\n1. Word choice and vocabulary level`;
    prompt += `\n2. Sentence structure and complexity`;
    prompt += `\n3. Topics and interests`;
    prompt += `\n4. Emotional expression`;
    prompt += `\n5. Communication patterns`;
    prompt += `\n6. Values and beliefs expressed`;

    return prompt;
  }
};
