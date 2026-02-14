/**
 * ElevenLabs Sound Effects API Route
 * Generate sound effects from text prompts using ElevenLabs Sound Generation v2
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/sound-generation';

interface SfxRequest {
  text: string;
  duration_seconds?: number;
  prompt_influence?: number;
}

interface SfxResponse {
  success: boolean;
  audioUrl?: string;
  duration?: number;
  error?: string;
}

/**
 * GET /api/ai/audio/sfx
 * Check if ElevenLabs API key is configured
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-sfx',
  });
}

/**
 * POST /api/ai/audio/sfx
 * Generate a sound effect from a text prompt
 *
 * Body:
 * - text: string — Description of the sound effect
 * - duration_seconds?: number — Duration (0.5–30s), auto if omitted
 * - prompt_influence?: number — 0–1, default 0.3
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<SfxResponse>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured. Set ELEVENLABS_API_KEY in .env.local' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const body: SfxRequest = await request.json();
    const { text, duration_seconds, prompt_influence } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text prompt is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const requestBody: Record<string, unknown> = {
      text: text.trim(),
      model_id: 'eleven_text_to_sound_v2',
    };

    if (duration_seconds !== undefined) {
      requestBody.duration_seconds = Math.max(0.5, Math.min(30, duration_seconds));
    }
    if (prompt_influence !== undefined) {
      requestBody.prompt_influence = Math.max(0, Math.min(1, prompt_influence));
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
      logger.error('ElevenLabs SFX API error', new Error(errorText));
      return NextResponse.json(
        {
          success: false,
          error: `ElevenLabs SFX error (${elevenLabsResponse.status}): ${errorText}`,
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
      duration: duration_seconds,
    });
  } catch (error) {
    logger.error('/api/ai/audio/sfx', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate sound effect',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
