/**
 * ElevenLabs Audio Isolation API Route
 * Separate vocals from instrumental using ElevenLabs Audio Isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/audio-isolation';

interface IsolateResponse {
  success: boolean;
  vocals?: string;      // base64 data URL
  instrumental?: string; // base64 data URL (original minus vocals)
  error?: string;
}

/**
 * GET /api/ai/audio/isolate
 * Health check
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-audio-isolation',
  });
}

/**
 * POST /api/ai/audio/isolate
 * Separate vocals from an audio file
 *
 * Accepts multipart/form-data:
 * - audio: File — the audio file to process
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<IsolateResponse>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Build FormData for ElevenLabs
    const elFormData = new FormData();
    elFormData.append('audio', audioFile);

    const elResponse = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elFormData,
    });

    if (!elResponse.ok) {
      const errorText = await elResponse.text();
      logger.error('ElevenLabs Audio Isolation error', new Error(errorText));
      return NextResponse.json(
        { success: false, error: `ElevenLabs isolation error (${elResponse.status})` },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // ElevenLabs returns the isolated vocals as audio bytes
    const vocalsBuffer = await elResponse.arrayBuffer();

    if (vocalsBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs returned empty audio' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const vocalsBase64 = Buffer.from(vocalsBuffer).toString('base64');
    const vocalsUrl = `data:audio/mpeg;base64,${vocalsBase64}`;

    return NextResponse.json({
      success: true,
      vocals: vocalsUrl,
    });
  } catch (error) {
    logger.error('/api/ai/audio/isolate', error);
    return NextResponse.json(
      { success: false, error: 'Failed to isolate audio' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
