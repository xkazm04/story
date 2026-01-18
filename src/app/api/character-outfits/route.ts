/**
 * Character Outfits API Route
 *
 * Handles CRUD operations for character outfits/wardrobe system
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// GET - Fetch outfits for a character
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return createErrorResponse('characterId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('character_outfits')
      .select('*')
      .eq('character_id', characterId)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      return handleDatabaseError('fetch outfits', error, 'GET /api/character-outfits');
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return handleUnexpectedError('GET /api/character-outfits', error);
  }
}

// ============================================================================
// POST - Create a new outfit
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      character_id,
      name,
      outfit_type = 'custom',
      description,
      is_default = false,
      clothing = {},
      context_tags = [],
      suitable_locations = [],
      suitable_weather = [],
      suitable_time_of_day = [],
      reference_image_url,
      thumbnail_url,
      prompt_fragment,
      sort_order = 0,
    } = body;

    if (!character_id) {
      return createErrorResponse('character_id is required', 400);
    }

    if (!name) {
      return createErrorResponse('name is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('character_outfits')
      .insert({
        character_id,
        name,
        outfit_type,
        description,
        is_default,
        clothing,
        context_tags,
        suitable_locations,
        suitable_weather,
        suitable_time_of_day,
        reference_image_url,
        thumbnail_url,
        prompt_fragment,
        sort_order,
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('create outfit', error, 'POST /api/character-outfits');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/character-outfits', error);
  }
}
