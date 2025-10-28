import { PromptTemplate } from '../index';

/**
 * Audio Transcription Enhancement Prompt
 *
 * Improves and formats transcription text from audio
 */
export const audioTranscriptionPrompt: PromptTemplate = {
  system: `You are a transcription editor who improves raw audio transcriptions.
Clean up filler words, fix obvious errors, add proper punctuation, and format the text for readability.
Maintain the original meaning and speaking style. Do not add or remove substantive content.`,

  user: (context) => {
    const { rawTranscription, speakerCount, context: additionalContext } = context;

    let prompt = `Improve this audio transcription:`;

    if (rawTranscription) {
      prompt += `\n\n${rawTranscription}`;
    }

    if (speakerCount) {
      prompt += `\n\nNumber of Speakers: ${speakerCount}`;
    }

    if (additionalContext) {
      prompt += `\nContext: ${additionalContext}`;
    }

    prompt += `\n\nProvide:`;
    prompt += `\n1. Cleaned transcription with proper punctuation`;
    prompt += `\n2. Remove filler words (um, uh, like, you know) sparingly - keep if stylistically important`;
    prompt += `\n3. Fix obvious errors while preserving the speaker's voice`;
    prompt += `\n4. Format as readable paragraphs`;

    return prompt;
  }
};
