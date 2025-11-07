import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { beatNameSuggestionsPrompt } from '@/prompts';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface BeatSuggestion {
  name: string;
  description: string;
  reasoning: string;
}

export interface BeatSuggestionsRequest {
  partialName?: string;
  projectTitle?: string;
  projectDescription?: string;
  actName?: string;
  actDescription?: string;
  beatType?: 'story' | 'act';
  existingBeats?: Array<{ name: string; description?: string }>;
  characters?: string[];
  precedingBeats?: Array<{ name: string; description?: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: BeatSuggestionsRequest = await request.json();

    // Build context for the prompt
    const context = {
      partialName: body.partialName || '',
      projectTitle: body.projectTitle || '',
      projectDescription: body.projectDescription || '',
      actName: body.actName || '',
      actDescription: body.actDescription || '',
      beatType: body.beatType || 'story',
      existingBeats: body.existingBeats || [],
      characters: body.characters || [],
      precedingBeats: body.precedingBeats || [],
    };

    // Generate the prompt
    const systemPrompt = beatNameSuggestionsPrompt.system;
    const userPrompt = beatNameSuggestionsPrompt.user(context);

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
    let suggestions: BeatSuggestion[];
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
    console.error('Error generating beat suggestions:', error);

    return NextResponse.json(
      {
        error: 'Failed to generate beat suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      },
      { status: 500 }
    );
  }
}
