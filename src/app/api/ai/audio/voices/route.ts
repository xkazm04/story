/**
 * ElevenLabs Voice Catalog API Route
 * Fetch available voices from ElevenLabs for browsing/importing
 */

import { NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/voices';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  preview_url: string;
  description: string;
  settings: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  } | null;
}

interface VoiceCatalogResponse {
  success: boolean;
  voices?: ElevenLabsVoice[];
  error?: string;
}

/**
 * GET /api/ai/audio/voices
 * Fetch available voices from ElevenLabs catalog
 */
export async function GET(): Promise<NextResponse<VoiceCatalogResponse>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const response = await fetch(ELEVENLABS_API_URL, {
      method: 'GET',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('ElevenLabs voices API error', new Error(errorText));
      return NextResponse.json(
        { success: false, error: `ElevenLabs API error: ${response.status}` },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const data = await response.json();
    const voices: ElevenLabsVoice[] = (data.voices ?? []).map((v: Record<string, unknown>) => ({
      voice_id: v.voice_id,
      name: v.name,
      category: v.category ?? 'premade',
      labels: v.labels ?? {},
      preview_url: v.preview_url ?? '',
      description: v.description ?? '',
      settings: v.settings ?? null,
    }));

    return NextResponse.json({ success: true, voices });
  } catch (error) {
    logger.error('/api/ai/audio/voices', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch voices' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
