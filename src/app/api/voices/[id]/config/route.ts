import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { VoiceConfig } from '@/app/types/Voice';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * GET /api/voices/[id]/config
 * Get voice config by looking up the voice's voice_id
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // First get the voice to find its voice_id
    const { data: voice, error: voiceError } = await supabaseServer
      .from('voices')
      .select('voice_id')
      .eq('id', id)
      .single();

    if (voiceError || !voice) {
      logger.error('Error fetching voice for config', voiceError, { id });
      return createErrorResponse('Voice not found', HTTP_STATUS.NOT_FOUND);
    }

    const { data, error } = await supabaseServer
      .from('voice_configs')
      .select('*')
      .eq('voice_id', voice.voice_id)
      .single();

    if (error) {
      // Return defaults if no config exists
      return NextResponse.json({
        voice_id: voice.voice_id,
        stability: 0.50,
        similarity_boost: 0.75,
        style: 0.50,
        speed: 1.00,
        use_speaker_boost: false,
      } as VoiceConfig);
    }

    return NextResponse.json(data as VoiceConfig);
  } catch (error) {
    logger.error('Unexpected error in GET /api/voices/[id]/config', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/voices/[id]/config
 * Upsert voice config
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    // Get the voice's voice_id
    const { data: voice, error: voiceError } = await supabaseServer
      .from('voices')
      .select('voice_id')
      .eq('id', id)
      .single();

    if (voiceError || !voice) {
      logger.error('Error fetching voice for config update', voiceError, { id });
      return createErrorResponse('Voice not found', HTTP_STATUS.NOT_FOUND);
    }

    const configData = {
      voice_id: voice.voice_id,
      stability: body.stability ?? 0.50,
      similarity_boost: body.similarity_boost ?? 0.75,
      style: body.style ?? 0.50,
      speed: body.speed ?? 1.00,
      use_speaker_boost: body.use_speaker_boost ?? false,
    };

    const { data, error } = await supabaseServer
      .from('voice_configs')
      .upsert(configData, { onConflict: 'voice_id' })
      .select()
      .single();

    if (error) {
      logger.error('Error upserting voice config', error, { id, voice_id: voice.voice_id });
      return createErrorResponse('Failed to update voice config', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data as VoiceConfig);
  } catch (error) {
    logger.error('Unexpected error in PUT /api/voices/[id]/config', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
