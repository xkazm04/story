/**
 * API Route: Compose Cover Prompt
 * Uses Groq LLM to compose an optimized image prompt for story cover generation
 */

import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function GET() {
  const available = !!process.env.GROQ_API_KEY;
  return NextResponse.json({ available });
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { storyConcept, storyName, storyDescription, artStyle, genre, mood } = body;

    // Build context
    const contextParts: string[] = [];
    if (storyName) contextParts.push(`Story title: ${storyName}`);
    if (storyDescription) contextParts.push(`Synopsis: ${storyDescription}`);
    if (storyConcept) contextParts.push(`Concept: ${storyConcept}`);
    if (genre) contextParts.push(`Genre: ${genre}`);
    if (mood) contextParts.push(`Mood: ${mood}`);

    const storyContext = contextParts.join('\n') || 'An adventure story';

    const prompt = `Create an image generation prompt for a story cover based on this story:

${storyContext}

${artStyle ? `Art style to use: ${artStyle}` : ''}

Requirements for the cover prompt:
1. Focus on a single compelling scene or symbolic image that represents the story
2. Include composition details (e.g., "centered composition", "dramatic angle")
3. Specify lighting and atmosphere that matches the story mood
4. No text, titles, or words should be in the image
5. Cinematic quality, suitable for a book or game cover
6. Should evoke emotion and intrigue without revealing plot

Generate a detailed image prompt of 50-100 words that would create an eye-catching cover.

Respond with ONLY the image prompt, no labels or explanation.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at writing image generation prompts. Create vivid, detailed prompts that result in stunning, professional-quality cover art.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 300,
    });

    const generatedPrompt = completion.choices[0]?.message?.content?.trim() || '';

    return NextResponse.json({ prompt: generatedPrompt });
  } catch (error) {
    console.error('Error composing cover prompt:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to compose cover prompt' },
      { status: 500 }
    );
  }
}
