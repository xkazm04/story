/**
 * Generate Images API Route
 * Generate images using Leonardo AI API
 */

import { NextRequest, NextResponse } from 'next/server';
import { LeonardoService } from '@/lib/services/leonardo';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
} from '@/app/utils/apiErrorHandling';

/**
 * POST /api/ai/generate-images
 * Generate images using Leonardo AI API directly
 */
export async function POST(request: NextRequest) {
  try {
    // Check if Leonardo API is available
    if (!LeonardoService.isAvailable()) {
      return createErrorResponse(
        'Leonardo API is not configured. Please set LEONARDO_API_KEY environment variable.',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      prompt,
      numImages = 2,
      width = 1184,
      height = 672,
      model,
      presetStyle,
      negativePrompt,
      referenceImages,
      referenceStrength = 0.75,
    } = body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return createErrorResponse('Prompt is required', HTTP_STATUS.BAD_REQUEST);
    }

    // Initialize Leonardo service
    const leonardo = new LeonardoService();

    // Generate images
    const result = await leonardo.generateImages({
      prompt: prompt.trim(),
      width,
      height,
      numImages: Math.min(Math.max(numImages, 1), 8), // Clamp between 1-8
      model,
      presetStyle,
      negativePrompt,
      referenceImages: referenceImages?.slice(0, 4), // Max 4 references
      referenceStrength,
    });

    if (!result.success || result.images.length === 0) {
      return createErrorResponse(
        result.error || 'No images generated',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json({
      success: true,
      images: result.images,
      generationId: result.generationId,
      provider: result.provider,
      prompt: result.prompt,
    });
  } catch (error) {
    logger.apiError('/api/ai/generate-images', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return createErrorResponse(
          'Leonardo API is not properly configured',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
      if (error.message.includes('timed out')) {
        return createErrorResponse(
          'Image generation timed out. Please try again.',
          504
        );
      }
      if (error.message.includes('failed')) {
        return createErrorResponse(
          'Image generation failed. Please try a different prompt.',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
    }

    return createErrorResponse(
      'Failed to generate images',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
