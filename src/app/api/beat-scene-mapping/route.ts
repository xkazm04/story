import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { beatToSceneMappingPrompt } from '@/prompts';
import { BeatSceneSuggestion } from '@/app/types/Beat';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const DEFAULT_MAX_SCENE_SUGGESTIONS = 3;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SceneMappingRequest {
  beatName: string;
  beatDescription?: string;
  beatType?: string;
  existingScenes?: unknown[];
  projectContext?: string;
  maxSuggestions?: number;
  includeNewScenes?: boolean;
}

/**
 * Validates beat name parameter
 */
function validateBeatName(beatName: unknown): NextResponse | null {
  if (!beatName) {
    return NextResponse.json(
      { error: 'Beat name is required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  return null;
}

/**
 * Parses AI response for scene suggestions
 */
function parseSceneSuggestions(responseText: string): BeatSceneSuggestion[] {
  try {
    const parsed = JSON.parse(responseText);
    // Handle both array and object with suggestions array
    return Array.isArray(parsed) ? parsed : parsed.suggestions || [];
  } catch (parseError) {
    logger.error('Failed to parse AI response', parseError, { responseText });
    return [];
  }
}

/**
 * Generates scene mapping suggestions using OpenAI
 */
async function generateSceneMappingSuggestions(
  request: SceneMappingRequest
): Promise<BeatSceneSuggestion[]> {
  const {
    beatName,
    beatDescription,
    beatType,
    existingScenes = [],
    projectContext,
    maxSuggestions = DEFAULT_MAX_SCENE_SUGGESTIONS,
    includeNewScenes = true,
  } = request;

  // Generate prompt using template
  const systemPrompt = beatToSceneMappingPrompt.system;
  const userPrompt = beatToSceneMappingPrompt.user({
    beatName,
    beatDescription,
    beatType,
    existingScenes,
    projectContext,
    maxSuggestions,
    includeNewScenes,
  });

  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content || '[]';

  return parseSceneSuggestions(responseText);
}

/**
 * POST /api/beat-scene-mapping
 *
 * Generates scene mapping suggestions for a beat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate beat name
    const validationError = validateBeatName(body.beatName);
    if (validationError) return validationError;

    // Generate suggestions
    const suggestions = await generateSceneMappingSuggestions(body as SceneMappingRequest);

    return NextResponse.json({
      suggestions,
      model: 'gpt-4o-mini',
    });
  } catch (error) {
    logger.apiError('POST /api/beat-scene-mapping', error);
    return NextResponse.json(
      { error: 'Failed to generate scene suggestions' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
