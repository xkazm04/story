/**
 * API Route: Generate Story Details
 * Uses Groq LLM to generate story name and description from user input
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
    const { type, userInput, currentName, currentDescription, genre, audience, timePeriod, concept, setting } = body;

    // Build context from available inputs
    const contextParts: string[] = [];
    if (genre) contextParts.push(`Genre: ${genre}`);
    if (audience) contextParts.push(`Target audience: ${audience}`);
    if (timePeriod) contextParts.push(`Time period: ${timePeriod}`);
    if (concept) contextParts.push(`Story concept: ${concept}`);
    if (setting) contextParts.push(`Setting: ${setting}`);
    if (currentName) contextParts.push(`Current title: ${currentName}`);
    if (currentDescription) contextParts.push(`Current description: ${currentDescription}`);
    if (userInput) contextParts.push(`Additional notes: ${userInput}`);

    const context = contextParts.length > 0
      ? contextParts.join('\n')
      : 'Create an original interactive story';

    let prompt = '';
    if (type === 'name') {
      prompt = `Based on the following story information, generate a compelling and memorable story title.

${context}

Requirements:
- Title should be 2-6 words
- Should be evocative and intriguing
- Should hint at the genre or theme
- Must be original and creative

Respond with ONLY the title, no quotes or explanation.`;
    } else if (type === 'description') {
      prompt = `Based on the following story information, generate a captivating story description/synopsis.

${context}

Requirements:
- 2-4 sentences
- Hook the reader immediately
- Hint at conflict or mystery without spoilers
- Match the tone of the genre
- Include a sense of stakes or urgency

Respond with ONLY the description, no quotes or labels.`;
    } else {
      // Generate both
      prompt = `Based on the following story information, generate both a compelling title and captivating description.

${context}

Requirements for title:
- 2-6 words
- Evocative and intriguing
- Hints at genre/theme

Requirements for description:
- 2-4 sentences
- Hooks the reader
- Hints at conflict without spoilers
- Matches genre tone

Respond in this exact format:
TITLE: [your title here]
DESCRIPTION: [your description here]`;
    }

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a creative writing assistant specializing in interactive fiction and story development. Generate engaging, original content that captures readers\' attention.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.8,
      max_tokens: 300,
    });

    const response = completion.choices[0]?.message?.content?.trim() || '';

    if (type === 'name') {
      return NextResponse.json({ name: response });
    } else if (type === 'description') {
      return NextResponse.json({ description: response });
    } else {
      // Parse both from response
      const titleMatch = response.match(/TITLE:\s*(.+)/i);
      const descMatch = response.match(/DESCRIPTION:\s*([\s\S]+)/i);

      return NextResponse.json({
        name: titleMatch?.[1]?.trim() || 'Untitled Story',
        description: descMatch?.[1]?.trim() || response,
      });
    }
  } catch (error) {
    console.error('Error generating story details:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate story details' },
      { status: 500 }
    );
  }
}
