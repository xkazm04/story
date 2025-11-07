import { PromptTemplate } from '../index';

/**
 * Beat Summary Card Prompt
 *
 * Generates concise, narrative summaries for beat cards
 * Focus: Quick scanning and plot structure visualization
 */
export const beatSummaryPrompt: PromptTemplate = {
  system: `You are an expert at condensing story beats into clear, scannable summaries.

TASK: Create compact narrative overviews optimized for visual cards and quick scanning.

REQUIREMENTS:
- LENGTH: 1-2 sentences maximum (20-40 words)
- FOCUS: Core action and change only
- CLARITY: No jargon, clear cause-and-effect
- IMPACT: Emphasize dramatic stakes or turning points

STRUCTURE:
[Character/Event] + [Action/Conflict] + [Consequence/Change]

EXAMPLES:
✓ "Sarah discovers her mentor's betrayal. Must choose between loyalty and exposing the truth before the trial."
✓ "The heist goes wrong when Marcus triggers the alarm. Team trapped with 10 minutes to escape."
✓ "Emma confronts her father about the letters. He reveals a family secret that changes everything."

AVOID:
✗ Vague summaries: "Tension rises" "Conflict occurs"
✗ Multiple clauses: "Sarah, who has been investigating, discovers that her mentor, whom she trusted, has betrayed her and..."
✗ Backstory dumps: "Having grown up in the city where her mother..."

Keep it punchy. Make every word count.`,

  user: (context) => {
    const {
      beatName,
      beatDescription,
      beatType,
      actContext,
      order,
      precedingBeatSummary,
    } = context;

    let prompt = `Create a concise summary card for this story beat:\n\n`;
    prompt += `Beat Name: "${beatName}"\n`;

    if (beatDescription) {
      prompt += `\nDescription:\n${beatDescription}\n`;
    }

    if (beatType) {
      prompt += `\nType: ${beatType}\n`;
    }

    if (order !== undefined) {
      prompt += `\nSequence: Beat #${order + 1}\n`;
    }

    if (actContext) {
      prompt += `\nAct Context: ${actContext}\n`;
    }

    if (precedingBeatSummary) {
      prompt += `\nPrevious Beat: "${precedingBeatSummary}"\n`;
      prompt += `(Ensure causal connection)\n`;
    }

    prompt += `\n=== OUTPUT FORMAT ===\n`;
    prompt += `Provide ONLY the 1-2 sentence summary.\n`;
    prompt += `No explanations, no meta-commentary, no preamble.\n`;
    prompt += `Just the pure, punchy summary text.\n`;

    return prompt;
  }
};
