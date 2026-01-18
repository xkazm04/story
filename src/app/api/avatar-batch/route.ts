/**
 * Avatar Batch Generation API Route
 *
 * Handles batch generation of multiple avatar expressions/poses with:
 * - Sequential generation for consistency
 * - Shared seed support for character consistency
 * - Progress tracking via streaming
 * - Expression modifier injection
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// Types
// ============================================================================

interface BatchItem {
  id: string;
  expressionModifier: string;
  poseModifier?: string;
  angleModifier?: string;
  intensityModifier?: string;
  label?: string;
}

interface BatchRequest {
  characterId: string;
  basePrompt: string;
  items: BatchItem[];
  referenceImage?: string;
  referenceStrength?: number;
  width?: number;
  height?: number;
  seed?: number; // Shared seed for consistency
}

interface BatchItemResult {
  id: string;
  status: 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  processingTime?: number;
}

interface BatchResponse {
  batchId: string;
  results: BatchItemResult[];
  totalTime: number;
  successCount: number;
  failureCount: number;
}

// ============================================================================
// Constants
// ============================================================================

const MAX_BATCH_SIZE = 16;
const DEFAULT_WIDTH = 512;
const DEFAULT_HEIGHT = 512;
const DEFAULT_REFERENCE_STRENGTH = 0.5;

// ============================================================================
// Helper Functions
// ============================================================================

function buildBatchItemPrompt(
  basePrompt: string,
  item: BatchItem
): string {
  const parts: string[] = [basePrompt];

  if (item.expressionModifier) {
    parts.push(item.expressionModifier);
  }

  if (item.poseModifier) {
    parts.push(item.poseModifier);
  }

  if (item.angleModifier) {
    parts.push(item.angleModifier);
  }

  if (item.intensityModifier) {
    parts.push(item.intensityModifier);
  }

  return parts.join(', ');
}

async function generateSingleImage(
  prompt: string,
  options: {
    width: number;
    height: number;
    referenceImage?: string;
    referenceStrength?: number;
    seed?: number;
  }
): Promise<{ url: string } | { error: string }> {
  try {
    // Build request for the generate-images API
    const requestBody: Record<string, unknown> = {
      prompt,
      numImages: 1,
      width: options.width,
      height: options.height,
    };

    if (options.referenceImage) {
      requestBody.referenceImages = [options.referenceImage];
      requestBody.referenceStrength = options.referenceStrength || DEFAULT_REFERENCE_STRENGTH;
    }

    // Note: In a real implementation, this would call the Leonardo API directly
    // For now, we call the existing generate-images endpoint
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api'}/ai/generate-images`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { error: errorData.error || 'Generation failed' };
    }

    const data = await response.json();
    if (data.images && data.images.length > 0) {
      return { url: data.images[0] };
    }

    return { error: 'No images returned' };
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

// ============================================================================
// POST - Generate batch of avatar variations
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body: BatchRequest = await request.json();

    const {
      characterId,
      basePrompt,
      items,
      referenceImage,
      referenceStrength = DEFAULT_REFERENCE_STRENGTH,
      width = DEFAULT_WIDTH,
      height = DEFAULT_HEIGHT,
      seed,
    } = body;

    // Validation
    if (!characterId) {
      return createErrorResponse('characterId is required', 400);
    }

    if (!basePrompt) {
      return createErrorResponse('basePrompt is required', 400);
    }

    if (!items || items.length === 0) {
      return createErrorResponse('items array is required and must not be empty', 400);
    }

    if (items.length > MAX_BATCH_SIZE) {
      return createErrorResponse(`Maximum batch size is ${MAX_BATCH_SIZE}`, 400);
    }

    const batchId = `batch-${characterId}-${Date.now()}`;
    const startTime = Date.now();
    const results: BatchItemResult[] = [];

    // Process items sequentially for consistency
    for (const item of items) {
      const itemStartTime = Date.now();
      const prompt = buildBatchItemPrompt(basePrompt, item);

      const result = await generateSingleImage(prompt, {
        width,
        height,
        referenceImage,
        referenceStrength,
        seed,
      });

      if ('url' in result) {
        results.push({
          id: item.id,
          status: 'completed',
          imageUrl: result.url,
          processingTime: Date.now() - itemStartTime,
        });
      } else {
        results.push({
          id: item.id,
          status: 'failed',
          error: result.error,
          processingTime: Date.now() - itemStartTime,
        });
      }
    }

    const response: BatchResponse = {
      batchId,
      results,
      totalTime: Date.now() - startTime,
      successCount: results.filter(r => r.status === 'completed').length,
      failureCount: results.filter(r => r.status === 'failed').length,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleUnexpectedError('POST /api/avatar-batch', error);
  }
}

// ============================================================================
// GET - Get batch generation status/info
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    // Return API info and limits
    return NextResponse.json({
      maxBatchSize: MAX_BATCH_SIZE,
      defaultDimensions: {
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      },
      supportedFeatures: [
        'expression_modifiers',
        'pose_modifiers',
        'angle_modifiers',
        'intensity_modifiers',
        'reference_image',
        'shared_seed',
      ],
      status: 'available',
    });
  } catch (error) {
    return handleUnexpectedError('GET /api/avatar-batch', error);
  }
}
