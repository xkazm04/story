/**
 * Scene Prompt API Route
 * Generate an image prompt from content description using Groq LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';

/**
 * System prompt for converting content description to image generation prompt
 */
const SCENE_PROMPT_SYSTEM_PROMPT = `You are an expert at synthesizing story content into highly descriptive image generation prompts.

Your task is to take a story scene description (which may be a structured breakdown or a narrative description) and convert it into a single, cohesive, and highly descriptive paragraph prompt suitable for a high-end text-to-image generation model.

RULES:
1. The prompt length MUST NOT exceed 1500 characters
2. If an art style is provided, establish it immediately at the beginning of the prompt
3. Use rich, descriptive adjectives to define textures, lighting, and mood
4. Connect the subjects and actions fluently rather than just listing them
5. Maximize detail to use a high character count for precision
6. Do not include any meta-instructions in the final output, just the prompt itself
7. Output ONLY the image generation prompt text, nothing else

STYLE GUIDELINES:
- Start with the artistic style/medium description
- Follow with the main subjects and their details
- Describe the action and composition
- Include environment and atmosphere
- End with mood and lighting details`;

/**
 * Call Groq LLM API for scene prompt generation
 */
async function callGroqLLM(
  userPrompt: string,
  systemPrompt: string
): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: API_CONSTANTS.GROQ_TEMPERATURE,
        max_tokens: 1024,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return { content, model: data.model };
}

/**
 * POST /api/ai/scene-prompt
 * Generate an image prompt from content description
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { contentDescription, artStylePrompt, moodPrompt } = body;

    if (!contentDescription) {
      return createErrorResponse(
        'Content description is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Build the user prompt
    let userPrompt =
      'Convert the following story scene description into a text-to-image generation prompt.\n\n';

    if (artStylePrompt) {
      userPrompt += `Art Style to use:\n${artStylePrompt}\n\n`;
    }

    userPrompt += `Scene Content:\n${contentDescription}\n\n`;

    if (moodPrompt) {
      userPrompt += `Mood Enhancement:\n${moodPrompt}\n\n`;
    }

    userPrompt +=
      'Generate a cohesive image generation prompt (max 1500 characters) that captures this scene. Output ONLY the prompt text.';

    // Use Groq LLM to generate the image prompt
    const result = await callGroqLLM(userPrompt, SCENE_PROMPT_SYSTEM_PROMPT);

    if (!result.content) {
      return createErrorResponse(
        'Failed to generate scene prompt',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Clean up the response
    let generatedPrompt = result.content.trim();

    // Remove any markdown formatting or quotes if present
    generatedPrompt = generatedPrompt
      .replace(/^```[\w]*\n?/g, '')
      .replace(/\n?```$/g, '')
      .replace(/^["']|["']$/g, '')
      .replace(/^Here is the (?:prompt|image prompt)[^:]*:\s*/i, '')
      .trim();

    // Ensure we don't exceed 1500 characters
    if (generatedPrompt.length > 1500) {
      generatedPrompt = generatedPrompt.substring(0, 1497) + '...';
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      provider: 'groq',
      model: result.model,
    });
  } catch (error) {
    logger.apiError('/api/ai/scene-prompt', error);

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to generate scene prompt',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/ai/scene-prompt
 * Check if scene prompt generation is available
 */
export async function GET() {
  const available = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    available,
    service: 'groq',
    model: 'llama-3.3-70b-versatile',
  });
}
