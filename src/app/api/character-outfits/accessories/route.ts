/**
 * Character Accessories API Route
 *
 * Handles CRUD operations for character accessories
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// GET - Fetch accessories for a character
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return createErrorResponse('characterId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('character_accessories')
      .select('*')
      .eq('character_id', characterId)
      .order('is_signature', { ascending: false })
      .order('name', { ascending: true });

    if (error) {
      return handleDatabaseError('fetch accessories', error, 'GET /api/character-outfits/accessories');
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return handleUnexpectedError('GET /api/character-outfits/accessories', error);
  }
}

// ============================================================================
// POST - Create a new accessory
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      character_id,
      name,
      category,
      description,
      material,
      color,
      attributes = {},
      is_signature = false,
      story_significance,
      acquired_scene_id,
      current_state = 'stored',
      reference_image_url,
      prompt_fragment,
    } = body;

    if (!character_id) {
      return createErrorResponse('character_id is required', 400);
    }

    if (!name) {
      return createErrorResponse('name is required', 400);
    }

    if (!category) {
      return createErrorResponse('category is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('character_accessories')
      .insert({
        character_id,
        name,
        category,
        description,
        material,
        color,
        attributes,
        is_signature,
        story_significance,
        acquired_scene_id,
        current_state,
        reference_image_url,
        prompt_fragment,
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('create accessory', error, 'POST /api/character-outfits/accessories');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/character-outfits/accessories', error);
  }
}
