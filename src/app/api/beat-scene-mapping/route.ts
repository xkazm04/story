import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { beatToSceneMappingPrompt } from '@/prompts';
import { BeatSceneSuggestion } from '@/app/types/Beat';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      beatName,
      beatDescription,
      beatType,
      existingScenes = [],
      projectContext,
      maxSuggestions = 3,
      includeNewScenes = true,
    } = body;

    if (!beatName) {
      return NextResponse.json(
        { error: 'Beat name is required' },
        { status: 400 }
      );
    }

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

    // Parse the JSON response
    let suggestions: BeatSceneSuggestion[];
    try {
      const parsed = JSON.parse(responseText);
      // Handle both array and object with suggestions array
      suggestions = Array.isArray(parsed) ? parsed : parsed.suggestions || [];
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Response text:', responseText);
      suggestions = [];
    }

    return NextResponse.json({
      suggestions,
      model: 'gpt-4o-mini',
    });
  } catch (error) {
    console.error('Error generating scene suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate scene suggestions' },
      { status: 500 }
    );
  }
}
