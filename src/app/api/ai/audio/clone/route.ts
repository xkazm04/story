/**
 * ElevenLabs Voice Clone API Route
 * Clone a voice from audio samples and manage cloned voices
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/voices';

interface CloneResponse {
  success: boolean;
  voice_id?: string;
  name?: string;
  error?: string;
}

/**
 * GET /api/ai/audio/clone
 * Check if ElevenLabs API key is configured for cloning
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-voice-clone',
  });
}

/**
 * POST /api/ai/audio/clone
 * Clone a voice from audio sample(s)
 *
 * Accepts multipart/form-data:
 * - name: string — voice name
 * - files: File[] — audio samples (MP3/WAV/FLAC, 10-30s each)
 * - description: string (optional)
 * - project_id: string — project to associate the voice with
 * - remove_background_noise: boolean (optional, default false)
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<CloneResponse>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const projectId = formData.get('project_id') as string;
    const description = formData.get('description') as string | null;
    const removeNoise = formData.get('remove_background_noise') === 'true';

    if (!name || !name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Voice name is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'project_id is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Build FormData for ElevenLabs
    const elFormData = new FormData();
    elFormData.append('name', name.trim());
    if (description) elFormData.append('description', description);
    elFormData.append('remove_background_noise', String(removeNoise));

    // Collect all file entries
    const files = formData.getAll('files');
    if (files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one audio file is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    for (const file of files) {
      if (file instanceof File) {
        elFormData.append('files', file);
      }
    }

    // Call ElevenLabs voice add endpoint
    const elResponse = await fetch(`${ELEVENLABS_API_URL}/add`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elFormData,
    });

    if (!elResponse.ok) {
      const errorText = await elResponse.text();
      logger.error('ElevenLabs clone API error', new Error(errorText));
      return NextResponse.json(
        { success: false, error: `ElevenLabs clone error: ${elResponse.status}` },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const result = await elResponse.json();
    const voiceId = result.voice_id as string;

    // Save to Supabase voices table
    await supabaseServer.from('voices').insert({
      voice_id: voiceId,
      name: name.trim(),
      project_id: projectId,
      description: description ?? null,
      provider: 'elevenlabs',
      language: 'en',
    });

    // Create default voice config
    await supabaseServer.from('voice_configs').insert({
      voice_id: voiceId,
      stability: 0.50,
      similarity_boost: 0.75,
      style: 0.50,
      speed: 1.00,
      use_speaker_boost: false,
    });

    return NextResponse.json({
      success: true,
      voice_id: voiceId,
      name: name.trim(),
    });
  } catch (error) {
    logger.error('/api/ai/audio/clone', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clone voice' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * DELETE /api/ai/audio/clone?voice_id=xxx
 * Delete a cloned voice from ElevenLabs and Supabase
 */
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<{ success: boolean; error?: string }>> {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const voiceId = request.nextUrl.searchParams.get('voice_id');
    if (!voiceId) {
      return NextResponse.json(
        { success: false, error: 'voice_id is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Delete from ElevenLabs
    const elResponse = await fetch(`${ELEVENLABS_API_URL}/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!elResponse.ok) {
      const errorText = await elResponse.text();
      logger.error('ElevenLabs delete voice error', new Error(errorText));
      // Continue to delete from Supabase even if ElevenLabs deletion fails
    }

    // Delete from Supabase (cascade will handle voice_configs and audio_samples)
    await supabaseServer
      .from('voices')
      .delete()
      .eq('voice_id', voiceId);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('/api/ai/audio/clone DELETE', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete voice' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
