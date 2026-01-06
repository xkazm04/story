import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, validateRequiredParams, HTTP_STATUS, API_CONSTANTS } from '@/app/utils/apiErrorHandling';

/**
 * Image Extraction API - Gemini Vision
 * Extracts structured data from images using Google's Gemini Vision API
 */

/**
 * Validates API configuration and returns error response if invalid
 */
function validateApiKey(apiKey: string | undefined): NextResponse | null {
  if (!apiKey) {
    return createErrorResponse('Gemini API key not configured', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
  return null;
}

/**
 * Calls Gemini Vision API with the provided image and prompt
 */
async function callGeminiVisionApi(apiKey: string, image: string, prompt: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              text: prompt,
            },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: image,
              },
            },
          ],
        }],
        generationConfig: {
          temperature: API_CONSTANTS.GEMINI_TEMPERATURE,
          topK: API_CONSTANTS.GEMINI_TOP_K,
          topP: 1,
          maxOutputTokens: API_CONSTANTS.GEMINI_MAX_OUTPUT_TOKENS,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
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
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const apiKeyError = validateApiKey(GEMINI_API_KEY);
    if (apiKeyError) {
      return apiKeyError;
    }

    // Call Gemini Vision API
    const result = await callGeminiVisionApi(GEMINI_API_KEY!, image, prompt);

    // Extract text from Gemini's response
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse JSON response
    const parseResult = parseAiJsonResponse(text);
    if (!parseResult.success) {
      const errorText = parseResult.error;
      return createErrorResponse(
        'Failed to parse Gemini response as JSON',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        undefined,
        { rawResponse: errorText }
      );
    }

    const parsedData = parseResult.data;
    return NextResponse.json({
      data: parsedData,
      confidence: API_CONSTANTS.GEMINI_DEFAULT_CONFIDENCE,
    });

  } catch (error) {
    logger.apiError('/api/image-extraction/gemini', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Unknown error occurred',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
