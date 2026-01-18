/**
 * Outfit History API Route
 *
 * Handles outfit timeline/history tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// GET - Fetch outfit history for a character
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return createErrorResponse('characterId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('outfit_history')
      .select(`
        *,
        outfit:character_outfits(id, name, outfit_type, thumbnail_url)
      `)
      .eq('character_id', characterId)
      .order('start_time', { ascending: true });

    if (error) {
      return handleDatabaseError('fetch outfit history', error, 'GET /api/character-outfits/history');
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return handleUnexpectedError('GET /api/character-outfits/history', error);
  }
}

// ============================================================================
// POST - Record an outfit change
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      character_id,
      outfit_id,
      scene_id,
      scene_title,
      scene_description,
      narrative_reason,
      modifications = {},
    } = body;

    if (!character_id) {
      return createErrorResponse('character_id is required', 400);
    }

    if (!outfit_id) {
      return createErrorResponse('outfit_id is required', 400);
    }

    // End any currently active outfit for this character
    await supabaseServer
      .from('outfit_history')
      .update({ end_time: new Date().toISOString() })
      .eq('character_id', character_id)
      .is('end_time', null);

    // Create new history entry
    const { data, error } = await supabaseServer
      .from('outfit_history')
      .insert({
        character_id,
        outfit_id,
        scene_id,
        scene_title,
        scene_description,
        narrative_reason,
        modifications,
        start_time: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('record outfit change', error, 'POST /api/character-outfits/history');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/character-outfits/history', error);
  }
}
