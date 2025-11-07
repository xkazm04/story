import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Extraction API - Groq Vision
 * Extracts structured data from images using Groq's Vision API (Llama 3.2 Vision)
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, prompt, schema } = body;

    if (!image || !prompt || !schema) {
      return NextResponse.json(
        { error: 'Missing required fields: image, prompt, schema' },
        { status: 400 }
      );
    }

    // TODO: Implement Groq Vision API call
    // This is a placeholder implementation
    // You'll need to add your Groq API key and implement the actual API call

    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      );
    }

    // Groq Vision API call using Llama 3.2 Vision
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${image}`,
                },
              },
            ],
          },
        ],
        temperature: 0.4,
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    // Extract text from Groq's response
    const text = result.choices?.[0]?.message?.content || '';
    
    // Try to parse as JSON
    let data;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      data = JSON.parse(cleanText);
    } catch (e) {
      return NextResponse.json(
        { error: 'Failed to parse Groq response as JSON', rawResponse: text },
        { status: 500 }
      );
    }

    return NextResponse.json({
      data,
      confidence: 0.80, // Groq doesn't provide confidence scores, using a default
    });

  } catch (error) {
    console.error('Groq extraction error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

