import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import {
  characterNameSuggestionsPrompt,
  sceneNameSuggestionsPrompt,
  beatNameSuggestionsPrompt,
} from '@/prompts';
import {
  logger,
  handleUnexpectedError,
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface NameSuggestion {
  name: string;
  description: string;
  reasoning: string;
}

export type EntityType = 'character' | 'scene' | 'beat' | 'faction' | 'location';

export interface NameSuggestionsRequest {
  entityType: EntityType;
  partialName?: string;
  context?: Record<string, any>;
}

interface PromptTemplate {
  system: string;
  user: (context: any) => string;
}

/**
 * Selects appropriate prompt template based on entity type
 */
function selectPromptTemplate(entityType: EntityType): PromptTemplate {
  switch (entityType) {
    case 'character':
      return characterNameSuggestionsPrompt;
    case 'scene':
      return sceneNameSuggestionsPrompt;
    case 'beat':
      return beatNameSuggestionsPrompt;
    case 'faction':
      // Use character prompt as fallback for faction
      return characterNameSuggestionsPrompt;
    case 'location':
      // Use scene prompt as fallback for location
      return sceneNameSuggestionsPrompt;
    default:
      throw new Error('Invalid entity type');
  }
}

/**
 * Builds prompt context from request data
 */
function buildPromptContext(body: NameSuggestionsRequest) {
  return {
    partialName: body.partialName || '',
    entityType: body.entityType,
    ...(body.context || {}),
  };
}

/**
 * Calls Groq API for name suggestions
 */
async function callGroqAPI(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile', // Fast model for low latency
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.8,
    max_tokens: 1500,
    response_format: { type: 'json_object' },
  });

  const responseText = completion.choices[0]?.message?.content;

  if (!responseText) {
    throw new Error('No response from AI model');
  }

  return responseText;
}

/**
 * Parses and validates AI response into name suggestions
 */
function parseAndValidateSuggestions(responseText: string): NameSuggestion[] {
  const parsedResponse = JSON.parse(responseText);

  // Handle both array responses and object with suggestions array
  let suggestions: NameSuggestion[];
  if (Array.isArray(parsedResponse)) {
    suggestions = parsedResponse;
  } else if (parsedResponse.suggestions && Array.isArray(parsedResponse.suggestions)) {
    suggestions = parsedResponse.suggestions;
  } else {
    throw new Error('Invalid response format from AI model');
  }

  // Validate suggestions
  if (!suggestions || suggestions.length === 0) {
    throw new Error('No suggestions generated');
  }

  // Ensure each suggestion has required fields
  return suggestions
    .filter((s) => s.name && s.description)
    .slice(0, API_CONSTANTS.MAX_SUGGESTIONS_LIMIT)
    .map((s) => ({
      name: s.name,
      description: s.description,
      reasoning: s.reasoning || '',
    }));
}

/**
 * POST /api/name-suggestions
 * Generate AI-powered name suggestions for entities
 */
export async function POST(request: NextRequest) {
  try {
    const body: NameSuggestionsRequest = await request.json();

    if (!body.entityType) {
      return createErrorResponse(
        'Entity type is required',
        400
      );
    }

    // Select the appropriate prompt based on entity type
    const promptTemplate = selectPromptTemplate(body.entityType);

    // Build the context for the prompt
    const promptContext = buildPromptContext(body);

    // Generate the prompt
    const systemPrompt = promptTemplate.system;
    const userPrompt = promptTemplate.user(promptContext);

    // Call Groq API for fast inference
    const responseText = await callGroqAPI(systemPrompt, userPrompt);

    // Parse and validate suggestions
    const validatedSuggestions = parseAndValidateSuggestions(responseText);

    return NextResponse.json({
      suggestions: validatedSuggestions,
      success: true,
    });
  } catch (error) {
    logger.error('Name suggestions API error', error, {
      endpoint: '/api/name-suggestions',
    });

    return NextResponse.json(
      {
        error: 'Failed to generate name suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
