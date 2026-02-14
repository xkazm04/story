/**
 * ElevenLabs Music Generation API Route
 * Generate music from text prompts using ElevenLabs Eleven Music v1
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/music';

// ============ Simple prompt mode (existing) ============

interface SimpleMusicRequest {
  prompt: string;
  music_length_ms?: number;
  force_instrumental?: boolean;
}

// ============ Composition plan mode (new) ============

interface CompositionSection {
  text: string;
  duration_ms: number;
}

interface CompositionPlanRequest {
  mode: 'composition';
  positive_global_styles: string;
  negative_global_styles?: string;
  sections: CompositionSection[];
  force_instrumental?: boolean;
}

type MusicRequest = SimpleMusicRequest | CompositionPlanRequest;

interface MusicResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

function isCompositionRequest(body: MusicRequest): body is CompositionPlanRequest {
  return 'mode' in body && body.mode === 'composition';
}

/**
 * GET /api/ai/audio/music
 * Check if ElevenLabs API key is configured
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-music',
  });
}

/**
 * POST /api/ai/audio/music
 * Generate music from a text prompt
 *
 * Body:
 * - prompt: string — Description of the music
 * - music_length_ms?: number — Duration in ms (3000–600000), default 30000
 * - force_instrumental?: boolean — No vocals, default true
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<MusicResponse>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in .env.local' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const body: MusicRequest = await request.json();

    let requestBody: Record<string, unknown>;
    let lengthMs: number;

    if (isCompositionRequest(body)) {
      // Composition plan mode
      if (!body.sections || body.sections.length === 0) {
        return NextResponse.json(
          { success: false, error: 'At least one section is required for composition mode' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }
      if (!body.positive_global_styles?.trim()) {
        return NextResponse.json(
          { success: false, error: 'positive_global_styles is required for composition mode' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      lengthMs = body.sections.reduce((sum, s) => sum + s.duration_ms, 0);

      requestBody = {
        positive_global_styles: body.positive_global_styles.trim(),
        negative_global_styles: body.negative_global_styles?.trim() || '',
        sections: body.sections.map((s) => ({
          text: s.text,
          duration_ms: Math.max(1000, s.duration_ms),
        })),
        force_instrumental: body.force_instrumental ?? true,
      };
    } else {
      // Simple prompt mode (existing behavior)
      const { prompt, music_length_ms, force_instrumental } = body;

      if (!prompt || !prompt.trim()) {
        return NextResponse.json(
          { success: false, error: 'Music prompt is required' },
          { status: HTTP_STATUS.BAD_REQUEST }
        );
      }

      lengthMs = music_length_ms
        ? Math.max(3000, Math.min(600000, music_length_ms))
        : 30000;

      requestBody = {
        prompt: prompt.trim(),
        music_length_ms: lengthMs,
        force_instrumental: force_instrumental ?? true,
      };
    }

    const elevenLabsResponse = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      logger.error('ElevenLabs Music API error', new Error(errorText));
      return NextResponse.json(
        {
          success: false,
          error: `ElevenLabs Music error (${elevenLabsResponse.status}): ${errorText}`,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const audioBuffer = await elevenLabsResponse.arrayBuffer();

    if (audioBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs returned empty audio' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Convert to base64 data URL for immediate playback
    const base64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({
      success: true,
      audioUrl,
      duration: lengthMs / 1000,
    });
  } catch (error) {
    logger.error('/api/ai/audio/music', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate music',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
