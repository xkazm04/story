/**
 * ElevenLabs TTS Preview API Route
 * Generate speech preview with custom voice settings — returns base64 data URL
 * Separate from /api/ai/elevenlabs which uploads to Supabase storage
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const MODEL_ID = 'eleven_v3';

interface TtsRequest {
  text: string;
  voice_id: string;
  voice_settings?: {
    stability?: number;
    similarity_boost?: number;
    style?: number;
    speed?: number;
  };
}

interface TtsResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

/**
 * GET /api/ai/audio/tts
 * Check if ElevenLabs API key is configured
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-tts-preview',
  });
}

/**
 * POST /api/ai/audio/tts
 * Generate speech preview with custom voice settings
 *
 * Body:
 * - text: string — text to speak
 * - voice_id: string — ElevenLabs voice ID
 * - voice_settings?: object — stability, similarity_boost, style, speed
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<TtsResponse>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const body: TtsRequest = await request.json();
    const { text, voice_id, voice_settings } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!voice_id) {
      return NextResponse.json(
        { success: false, error: 'voice_id is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const elevenLabsResponse = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voice_id}`,
      {
        method: 'POST',
        headers: {
          Accept: 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: text.trim(),
          model_id: MODEL_ID,
          voice_settings: {
            stability: voice_settings?.stability ?? 0.5,
            similarity_boost: voice_settings?.similarity_boost ?? 0.75,
            style: voice_settings?.style ?? 0.5,
            use_speaker_boost: false,
          },
          ...(voice_settings?.speed != null && voice_settings.speed !== 1.0
            ? { pronunciation_dictionary_locators: [], seed: null, speed: voice_settings.speed }
            : {}),
          language_code: 'en',
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      logger.error('ElevenLabs TTS API error', new Error(errorText));
      return NextResponse.json(
        { success: false, error: `ElevenLabs TTS error: ${elevenLabsResponse.status}` },
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

    // Return base64 data URL for instant playback
    const base64 = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/mpeg;base64,${base64}`;

    return NextResponse.json({ success: true, audioUrl });
  } catch (error) {
    logger.error('/api/ai/audio/tts', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate speech' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
