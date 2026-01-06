import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, validateRequiredParams, HTTP_STATUS, API_CONSTANTS } from '@/app/utils/apiErrorHandling';

/**
 * Image Extraction API - Groq Vision
 * Extracts structured data from images using Groq's Vision API (Llama 3.2 Vision)
 */

/**
 * Validates API configuration and returns error response if invalid
 */
function validateApiKey(apiKey: string | undefined): NextResponse | null {
  if (!apiKey) {
    return createErrorResponse('Groq API key not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  return null;
}

/**
 * Calls Groq Vision API with the provided image and prompt
 */
async function callGroqVisionApi(apiKey: string, image: string, prompt: string) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
      temperature: API_CONSTANTS.GROQ_TEMPERATURE,
      max_tokens: API_CONSTANTS.GROQ_MAX_TOKENS,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * Parses JSON response from AI, handling markdown code blocks
 */
function parseAiJsonResponse(text: string): { success: true; data: unknown } | { success: false; error: string } {
  try {
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const data = JSON.parse(cleanText);
    return { success: true, data };
  } catch (e) {
    return { success: false, error: text };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, prompt, schema } = body;

    // Validate required parameters
    const validationError = validateRequiredParams(body, ['image', 'prompt', 'schema']);
    if (validationError) {
      return validationError;
    }

    // Validate API key
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const apiKeyError = validateApiKey(GROQ_API_KEY);
    if (apiKeyError) {
      return apiKeyError;
    }

    // Call Groq Vision API
    const result = await callGroqVisionApi(GROQ_API_KEY!, image, prompt);

    // Extract text from Groq's response
    const text = result.choices?.[0]?.message?.content || '';

    // Parse JSON response
    const parseResult = parseAiJsonResponse(text);
    if (!parseResult.success) {
      const errorText = parseResult.error;
      return createErrorResponse(
        'Failed to parse Groq response as JSON',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        undefined,
        { rawResponse: errorText }
      );
    }

    const parsedData = parseResult.data;
    return NextResponse.json({
      data: parsedData,
      confidence: API_CONSTANTS.GROQ_DEFAULT_CONFIDENCE,
    });

  } catch (error) {
    logger.apiError('/api/image-extraction/groq', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
