/**
 * Prompt Variations API Route
 * Generate variations of an image prompt using Groq LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';

interface PromptVariation {
  variation: string;
  focusArea: string;
}

const VARIATION_SYSTEM_PROMPT = `You are an expert visual prompt engineer specializing in creating variations of image generation prompts.
Your task is to take a core prompt and create subtle yet distinct variations that explore different aspects or interpretations of the same scene.

Guidelines for creating variations:
1. Keep the core artistic style and main subject intact
2. Vary secondary elements like:
   - Lighting angle or intensity
   - Time of day or atmospheric conditions
   - Camera angle or perspective
   - Detail emphasis (foreground vs background)
   - Subtle mood shifts within the same theme
3. Each variation should be complete and self-contained
4. Keep variations relatively similar in length to the original
5. Do NOT change the fundamental art style or medium

IMPORTANT: You MUST respond with valid JSON only. No markdown, no explanations, just the JSON object.`;

/**
 * Call Groq LLM API for prompt variation generation
 */
async function callGroqLLM(
  userPrompt: string,
  systemPrompt: string
): Promise<string> {
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
        max_tokens: 4096,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

/**
 * Parse the JSON response from LLM
 */
function parseVariationResponse(response: string): { variations: PromptVariation[] } {
  // Try to extract JSON from the response
  let jsonStr = response.trim();

  // If the response is wrapped in markdown code blocks, extract the JSON
  const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Try to find JSON object in the response
  const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    jsonStr = objectMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    if (!parsed.variations || !Array.isArray(parsed.variations)) {
      throw new Error('Invalid response structure: missing variations array');
    }

    // Validate each variation
    const validVariations = parsed.variations
      .filter(
        (v: unknown): v is PromptVariation =>
          typeof v === 'object' &&
          v !== null &&
          typeof (v as PromptVariation).variation === 'string' &&
          (v as PromptVariation).variation.length > 0
      )
      .map((v: PromptVariation) => ({
        variation: v.variation,
        focusArea: v.focusArea || 'Variation',
      }));

    return { variations: validVariations };
  } catch (error) {
    logger.error('Failed to parse variation response', error);
    throw new Error('Failed to parse AI response');
  }
}

/**
 * POST /api/ai/prompt-variations
 * Generate prompt variations
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { prompt, count = 3 } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return createErrorResponse('Prompt is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Clamp count between 1 and 4
    const variationCount = Math.min(Math.max(count, 1), 4);

    const userPrompt = `Create exactly ${variationCount} variations of this image generation prompt.

Original prompt:
${prompt.trim()}

Respond with ONLY a valid JSON object in this exact format:
{
  "variations": [
    {
      "variation": "the complete varied prompt text here",
      "focusArea": "brief 2-4 word description of what makes this variation unique"
    }
  ]
}

Make each variation subtly different while maintaining the core artistic vision.`;

    // Get variations from LLM
    const response = await callGroqLLM(userPrompt, VARIATION_SYSTEM_PROMPT);

    // Parse the response
    const parsed = parseVariationResponse(response);

    // Ensure we have the right number of variations
    while (parsed.variations.length < variationCount) {
      parsed.variations.push({
        variation: prompt,
        focusArea: 'Original',
      });
    }

    // Trim if we got too many
    parsed.variations = parsed.variations.slice(0, variationCount);

    return NextResponse.json({
      success: true,
      variations: parsed.variations,
      originalPrompt: prompt,
    });
  } catch (error) {
    logger.apiError('/api/ai/prompt-variations', error);

    return createErrorResponse(
      'Failed to generate prompt variations',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/ai/prompt-variations
 * Check if prompt variation generation is available
 */
export async function GET() {
  const available = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    available,
    service: 'groq',
    model: 'llama-3.3-70b-versatile',
  });
}
