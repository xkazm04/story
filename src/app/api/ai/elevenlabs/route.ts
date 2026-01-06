/**
 * ElevenLabs TTS API Route
 * Generate audio narration from text using ElevenLabs Text-to-Speech
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
} from '@/app/utils/apiErrorHandling';

// ElevenLabs configuration
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';
const VOICE_ID = 'Og9r1xtrwAAzZwUkNjhz'; // Default narrative voice
const MODEL_ID = 'eleven_v3';

interface GenerateAudioRequest {
  text: string;
  projectId: string;
  sceneId: string;
}

interface GenerateAudioResponse {
  success: boolean;
  audioUrl?: string;
  error?: string;
}

/**
 * GET /api/ai/elevenlabs
 * Check if ElevenLabs API key is configured
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-tts',
  });
}

/**
 * POST /api/ai/elevenlabs
 * Generate audio narration from text using ElevenLabs TTS
 *
 * Body:
 * - text: string - The text to convert to speech
 * - projectId: string - Project ID for storage path
 * - sceneId: string - Scene ID for storage path
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<GenerateAudioResponse>> {
  try {
    // Check for API key
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Parse request body
    const body: GenerateAudioRequest = await request.json();
    const { text, projectId, sceneId } = body;

    if (!text || !text.trim()) {
      return NextResponse.json(
        { success: false, error: 'Text is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!projectId || !sceneId) {
      return NextResponse.json(
        { success: false, error: 'projectId and sceneId are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Generate audio with ElevenLabs
    const elevenLabsResponse = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${VOICE_ID}`,
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
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            use_speaker_boost: true,
          },
          language_code: 'en',
        }),
      }
    );

    if (!elevenLabsResponse.ok) {
      const errorText = await elevenLabsResponse.text();
      logger.error('ElevenLabs API error', new Error(errorText));
      return NextResponse.json(
        {
          success: false,
          error: `ElevenLabs API error: ${elevenLabsResponse.status}`,
        },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Get audio buffer
    const audioBuffer = await elevenLabsResponse.arrayBuffer();

    // Upload to Supabase Storage
    const fileName = `${sceneId}-${Date.now()}.mp3`;
    const storagePath = `${projectId}/audio/${fileName}`;

    // Try primary bucket first
    const { error: uploadError } = await supabaseServer.storage
      .from('story-audio')
      .upload(storagePath, audioBuffer, {
        contentType: 'audio/mpeg',
        upsert: true,
      });

    if (uploadError) {
      // Try fallback to assets bucket
      logger.warn('Primary storage failed, trying fallback', {
        error: uploadError.message,
      });

      const { error: fallbackError } = await supabaseServer.storage
        .from('assets')
        .upload(`audio/${storagePath}`, audioBuffer, {
          contentType: 'audio/mpeg',
          upsert: true,
        });

      if (fallbackError) {
        logger.error('Storage upload failed', fallbackError);
        return NextResponse.json(
          { success: false, error: 'Failed to upload audio file' },
          { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
        );
      }

      // Get public URL from fallback bucket
      const { data: publicUrlData } = supabaseServer.storage
        .from('assets')
        .getPublicUrl(`audio/${storagePath}`);

      return NextResponse.json({
        success: true,
        audioUrl: publicUrlData.publicUrl,
      });
    }

    // Get public URL from primary bucket
    const { data: publicUrlData } = supabaseServer.storage
      .from('story-audio')
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      audioUrl: publicUrlData.publicUrl,
    });
  } catch (error) {
    logger.apiError('/api/ai/elevenlabs', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate audio',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/ai/elevenlabs
 * Delete audio file from storage
 *
 * Body:
 * - audioUrl: string - URL of the audio file to delete
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    // Parse request body
    const body = await request.json();
    const { audioUrl } = body;

    if (!audioUrl) {
      return NextResponse.json(
        { success: false, error: 'audioUrl is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Extract storage path from URL
    // URLs look like: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = audioUrl.split('/storage/v1/object/public/');
    if (urlParts.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Invalid audio URL format' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const pathWithBucket = urlParts[1];
    const bucketEndIndex = pathWithBucket.indexOf('/');
    const bucket = pathWithBucket.substring(0, bucketEndIndex);
    const path = pathWithBucket.substring(bucketEndIndex + 1);

    // Delete from storage
    const { error: deleteError } = await supabaseServer.storage
      .from(bucket)
      .remove([path]);

    if (deleteError) {
      logger.error('Storage delete error', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete audio file' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.apiError('/api/ai/elevenlabs DELETE', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete audio',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
