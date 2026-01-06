/**
 * Art Style Extraction API Route
 * Extracts visual art style from uploaded images using Groq Vision API
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';
import {
  ART_STYLE_EXTRACTION_PROMPT,
  ART_STYLE_EXTRACTION_SYSTEM_PROMPT,
} from '@/app/features/story/sub_StoryArtstyle/lib/artStyleService';

/**
 * Validates API configuration and returns error response if invalid
 */
function validateApiKey(apiKey: string | undefined): NextResponse | null {
  if (!apiKey) {
    return createErrorResponse(
      'Groq API key not configured',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
  return null;
}

/**
 * Extracts base64 data from a data URL
 */
function extractBase64FromDataUrl(dataUrl: string): string {
  // Handle data:image/...;base64,... format
  const base64Match = dataUrl.match(/^data:image\/[^;]+;base64,(.+)$/);
  if (base64Match) {
    return base64Match[1];
  }
  // Already base64 or URL
  return dataUrl;
}

/**
 * Calls Groq Vision API with the provided image for art style extraction
 */
async function callGroqVisionApi(apiKey: string, imageUrl: string) {
  // Check if it's a data URL (base64)
  const isDataUrl = imageUrl.startsWith('data:');
  const imageContent = isDataUrl
    ? {
        type: 'image_url' as const,
        image_url: {
          url: imageUrl,
        },
      }
    : {
        type: 'image_url' as const,
        image_url: {
          url: imageUrl,
        },
      };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        {
          role: 'system',
          content: ART_STYLE_EXTRACTION_SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: ART_STYLE_EXTRACTION_PROMPT,
            },
            imageContent,
          ],
        },
      ],
      temperature: 0.3,
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
 * Extracts the style prompt from the AI response
 */
function parseStylePrompt(text: string): string | null {
  // Look for <STYLE_PROMPT> tags
  const match = text.match(/<STYLE_PROMPT>\s*([\s\S]*?)\s*<\/STYLE_PROMPT>/i);
  if (match && match[1]) {
    return match[1].trim();
  }

  // Fallback: if no tags, try to use the entire response (cleaned up)
  const cleaned = text
    .replace(/^(Here'?s?|The art style|This image|The visual style)[^:]*:\s*/i, '')
    .trim();

  if (cleaned.length > 50 && cleaned.length < 600) {
    return cleaned;
  }

  return null;
}

/**
 * GET - Check if art style extraction is available
 */
export async function GET() {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  return NextResponse.json({
    available: !!GROQ_API_KEY,
    service: 'groq-vision',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  });
}

/**
 * POST - Extract art style from an image
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    // Validate required parameter
    if (!imageUrl) {
      return createErrorResponse(
        'Missing required parameter: imageUrl',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate API key
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    const apiKeyError = validateApiKey(GROQ_API_KEY);
    if (apiKeyError) {
      return apiKeyError;
    }

    // Call Groq Vision API
    const result = await callGroqVisionApi(GROQ_API_KEY!, imageUrl);

    // Extract text from response
    const text = result.choices?.[0]?.message?.content || '';

    // Parse style prompt from response
    const prompt = parseStylePrompt(text);

    if (!prompt) {
      return createErrorResponse(
        'Failed to extract art style from image',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        'The AI could not extract a valid style prompt',
        { rawResponse: text }
      );
    }

    return NextResponse.json({
      prompt,
      rawResponse: text,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    logger.apiError('/api/ai/art-style/extract', error);
    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to extract art style',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
