/**
 * Scene Breakdown API Route
 * Extract scene description from an image using Groq Vision
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';

/**
 * System prompt for scene image breakdown
 */
const SCENE_BREAKDOWN_SYSTEM_PROMPT = `You are an expert art director analyzing images for the purpose of recreating them via AI image generation.

Your task is to break down the visual elements of a scene image into a structured description that can be used to recreate it or inspire new similar scenes.

OUTPUT FORMAT - Use these specific headers:

**Artistic Style & Medium:**
Describe the visual aesthetic, textures, materials rendered, color palette, and line work style.

**Key Subjects:**
Identify the main characters or objects, detailing their appearance, clothing/armor, mounts, and specific poses or expressions.

**Action & Composition:**
Describe what is happening in the scene, the movement, flow, and how the elements are arranged within the frame.

**Environment & Background:**
Describe the setting, lighting, and how negative space is utilized.

**Specific Details:**
Note any unique elements, symbols, or crucial textures that define the image's character.

GUIDELINES:
1. Be specific and descriptive - avoid vague terms
2. Use visual language suitable for image generation
3. Note colors, textures, materials when visible
4. Capture the mood and atmosphere
5. Keep each section concise but informative
6. Total description should be 600-1200 characters
7. Output ONLY the structured description, no preamble or explanations`;

const SCENE_BREAKDOWN_PROMPT = `Analyze this scene image and extract a detailed visual breakdown following the structured format.

Focus on:
1. The artistic style and rendering technique
2. Main subjects and their details
3. The action and composition
4. Environment and atmosphere
5. Unique defining details

Provide the breakdown using the headers: Artistic Style & Medium, Key Subjects, Action & Composition, Environment & Background, Specific Details.`;

/**
 * Call Groq Vision API for scene breakdown
 */
async function callGroqVisionApi(apiKey: string, imageUrl: string) {
  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
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
            content: SCENE_BREAKDOWN_SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: SCENE_BREAKDOWN_PROMPT,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl,
                },
              },
            ],
          },
        ],
        temperature: API_CONSTANTS.GROQ_TEMPERATURE,
        max_tokens: API_CONSTANTS.GROQ_MAX_TOKENS,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
  }

  return response.json();
}

/**
 * GET /api/ai/scene-breakdown
 * Check if scene breakdown extraction is available
 */
export async function GET() {
  const available = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    available,
    service: 'groq-vision',
    model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
  });
}

/**
 * POST /api/ai/scene-breakdown
 * Extract scene description from an image using Groq Vision
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl) {
      return createErrorResponse(
        'Image URL is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate image URL format (base64 data URL or valid URL)
    const isValidFormat =
      imageUrl.startsWith('data:image/') ||
      imageUrl.startsWith('http://') ||
      imageUrl.startsWith('https://');

    if (!isValidFormat) {
      return createErrorResponse(
        'Invalid image URL format. Must be a data URL or HTTP(S) URL.',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check API key
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      return createErrorResponse(
        'Groq API key not configured',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Use Groq Vision to extract scene breakdown
    const result = await callGroqVisionApi(GROQ_API_KEY, imageUrl);

    // Extract text from response
    const text = result.choices?.[0]?.message?.content || '';

    if (!text) {
      return createErrorResponse(
        'Failed to extract scene breakdown from image',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Clean up the response
    let extractedBreakdown = text.trim();

    // Remove any markdown code block formatting if present
    extractedBreakdown = extractedBreakdown
      .replace(/^```[\w]*\n?/g, '')
      .replace(/\n?```$/g, '')
      .replace(/^Here is the (?:breakdown|description)[^:]*:\s*/i, '')
      .trim();

    return NextResponse.json({
      success: true,
      breakdown: extractedBreakdown,
      model: result.model,
      usage: result.usage,
    });
  } catch (error) {
    logger.apiError('/api/ai/scene-breakdown', error);

    return createErrorResponse(
      error instanceof Error
        ? error.message
        : 'Failed to extract scene breakdown',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
