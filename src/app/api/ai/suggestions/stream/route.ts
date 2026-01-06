import { NextRequest } from 'next/server';
import { gatherProjectContext, gatherCharacterContext } from '@/prompts';
import { logger } from '@/app/utils/apiErrorHandling';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama2';

interface StreamRequest {
  project_id: string;
  character_id?: string;
  context_type: 'trait' | 'relationship' | 'backstory' | 'dialogue';
  current_text: string;
  field_type?: string;
}

/**
 * Builds a streaming prompt for AI suggestions
 */
function buildStreamPrompt(
  contextType: string,
  currentText: string,
  contextData: any,
  fieldType?: string
): string {
  const characterName = contextData.characterName || contextData.name || 'the character';

  const prompts = {
    trait: `As a creative writing assistant, analyze this character trait for ${characterName} and provide 3 concise enhancement suggestions.

Current text: "${currentText}"

Character context:
- Name: ${characterName}
- Type: ${contextData.type || 'character'}
${contextData.traits ? `- Existing traits: ${contextData.traits.map((t: any) => t.type).join(', ')}` : ''}

Field: ${fieldType || 'general trait'}

Provide suggestions in this JSON format:
[
  {
    "type": "enhancement",
    "title": "Brief title (3-5 words)",
    "suggestion": "Detailed suggestion text (1-2 sentences)",
    "reasoning": "Why this improves the trait (1 sentence)"
  }
]

Focus on:
1. Character depth and authenticity
2. Story consistency
3. Avoiding clichés

Return ONLY valid JSON array.`,

    relationship: `As a creative writing assistant, analyze this character relationship and provide 3 concise suggestions to deepen it.

Current text: "${currentText}"

Character: ${characterName}
Project: ${contextData.projectName || 'Untitled'}

Provide suggestions in this JSON format:
[
  {
    "type": "relationship_depth",
    "title": "Brief title (3-5 words)",
    "suggestion": "Detailed suggestion (1-2 sentences)",
    "reasoning": "Why this strengthens the relationship (1 sentence)"
  }
]

Focus on:
1. Emotional complexity
2. Conflict and tension
3. Character growth opportunities

Return ONLY valid JSON array.`,

    backstory: `As a creative writing assistant, analyze this character backstory for ${characterName} and provide 3 creative expansion ideas.

Current text: "${currentText}"

Character: ${characterName}
Genre: ${contextData.genre || 'general fiction'}

Provide suggestions in this JSON format:
[
  {
    "type": "backstory_expansion",
    "title": "Brief title (3-5 words)",
    "suggestion": "Detailed expansion idea (2-3 sentences)",
    "reasoning": "How this enriches the character (1 sentence)"
  }
]

Focus on:
1. Formative experiences
2. Hidden motivations
3. Compelling narrative hooks

Return ONLY valid JSON array.`,

    dialogue: `As a creative writing assistant, analyze this dialogue style and provide 3 suggestions to make it more distinctive.

Current text: "${currentText}"

Character: ${characterName}
Context: ${contextData.description || 'general story'}

Provide suggestions in this JSON format:
[
  {
    "type": "dialogue_style",
    "title": "Brief title (3-5 words)",
    "suggestion": "Style suggestion with example (2-3 sentences)",
    "reasoning": "Why this fits the character (1 sentence)"
  }
]

Focus on:
1. Unique voice
2. Speech patterns
3. Character-specific vocabulary

Return ONLY valid JSON array.`,
  };

  return prompts[contextType as keyof typeof prompts] || prompts.trait;
}

/**
 * POST /api/ai/suggestions/stream
 *
 * Streams AI suggestions as Server-Sent Events (SSE)
 * Using SSE instead of WebSocket for better Next.js compatibility
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: StreamRequest = await request.json();
    const {
      project_id,
      character_id,
      context_type,
      current_text,
      field_type,
    } = body;

    if (!project_id || !current_text || current_text.length < 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Minimum 10 characters required.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Gather context
    let contextData: any = await gatherProjectContext(project_id);

    if (character_id) {
      const charContext = await gatherCharacterContext(character_id);
      contextData = { ...contextData, ...charContext };
    }

    // Build prompt
    const prompt = buildStreamPrompt(context_type, current_text, contextData, field_type);

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Call Ollama with streaming
          const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: DEFAULT_MODEL,
              prompt,
              temperature: 0.7,
              stream: true,
            }),
          });

          if (!response.ok) {
            throw new Error(`Ollama error: ${response.statusText}`);
          }

          const reader = response.body?.getReader();
          if (!reader) {
            throw new Error('No response stream available');
          }

          let accumulatedResponse = '';

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              // Parse final response
              try {
                const jsonMatch = accumulatedResponse.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                  const suggestions = JSON.parse(jsonMatch[0]);

                  // Send complete event
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'complete',
                      suggestions,
                      processingTime: Date.now() - startTime,
                    })}\n\n`)
                  );
                } else {
                  // Fallback suggestion
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'complete',
                      suggestions: [{
                        type: 'enhancement',
                        title: 'AI Suggestion',
                        suggestion: accumulatedResponse.substring(0, 200),
                        reasoning: 'Generated from context',
                      }],
                      processingTime: Date.now() - startTime,
                    })}\n\n`)
                  );
                }
              } catch (parseError) {
                logger.error('Stream parsing error', parseError);
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({
                    type: 'error',
                    message: 'Failed to parse suggestions',
                  })}\n\n`)
                );
              }
              break;
            }

            // Decode chunk
            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n').filter(line => line.trim());

            for (const line of lines) {
              try {
                const data = JSON.parse(line);
                if (data.response) {
                  accumulatedResponse += data.response;

                  // Send progress event
                  controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify({
                      type: 'progress',
                      content: data.response,
                    })}\n\n`)
                  );
                }
              } catch {
                // Ignore invalid JSON chunks
              }
            }
          }

          controller.close();
        } catch (error) {
          logger.error('Stream generation error', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Stream failed',
            })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    logger.error('Stream endpoint error', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
