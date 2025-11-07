import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import {
  characterNameSuggestionsPrompt,
  sceneNameSuggestionsPrompt,
  beatNameSuggestionsPrompt,
} from '@/prompts';

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

export async function POST(request: NextRequest) {
  try {
    const body: NameSuggestionsRequest = await request.json();

    if (!body.entityType) {
      return NextResponse.json(
        {
          error: 'Entity type is required',
          success: false,
        },
        { status: 400 }
      );
    }

    // Select the appropriate prompt based on entity type
    let promptTemplate;
    switch (body.entityType) {
      case 'character':
        promptTemplate = characterNameSuggestionsPrompt;
        break;
      case 'scene':
        promptTemplate = sceneNameSuggestionsPrompt;
        break;
      case 'beat':
        promptTemplate = beatNameSuggestionsPrompt;
        break;
      case 'faction':
        // Use character prompt as fallback for faction
        promptTemplate = characterNameSuggestionsPrompt;
        break;
      case 'location':
        // Use scene prompt as fallback for location
        promptTemplate = sceneNameSuggestionsPrompt;
        break;
      default:
        return NextResponse.json(
          {
            error: 'Invalid entity type',
            success: false,
          },
          { status: 400 }
        );
    }

    // Build the context for the prompt
    const promptContext = {
      partialName: body.partialName || '',
      entityType: body.entityType,
      ...(body.context || {}),
    };

    // Generate the prompt
    const systemPrompt = promptTemplate.system;
    const userPrompt = promptTemplate.user(promptContext);

    // Call Groq API for fast inference
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

    // Parse the JSON response
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
    const validatedSuggestions = suggestions
      .filter((s) => s.name && s.description)
      .slice(0, 5)
      .map((s) => ({
        name: s.name,
        description: s.description,
        reasoning: s.reasoning || '',
      }));

    return NextResponse.json({
      suggestions: validatedSuggestions,
      success: true,
    });
  } catch (error) {
    console.error('Error generating name suggestions:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate name suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}
