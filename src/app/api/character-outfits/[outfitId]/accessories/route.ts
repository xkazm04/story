/**
 * Outfit Accessories Link API Route
 *
 * Handles linking/unlinking accessories to specific outfits
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

interface RouteParams {
  params: Promise<{ outfitId: string }>;
}

// ============================================================================
// GET - Get all accessories linked to an outfit
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { outfitId } = await params;

    const { data, error } = await supabaseServer
      .from('outfit_accessories')
      .select(`
        *,
        accessory:character_accessories(*)
      `)
      .eq('outfit_id', outfitId);

    if (error) {
      return handleDatabaseError('fetch outfit accessories', error, 'GET /api/character-outfits/[outfitId]/accessories');
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return handleUnexpectedError('GET /api/character-outfits/[outfitId]/accessories', error);
  }
}

// ============================================================================
// POST - Link an accessory to an outfit
// ============================================================================

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { outfitId } = await params;
    const body = await request.json();

    const {
      accessoryId,
      usage_type = 'worn',
      position,
      is_visible = true,
    } = body;

    if (!accessoryId) {
      return createErrorResponse('accessoryId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('outfit_accessories')
      .insert({
        outfit_id: outfitId,
        accessory_id: accessoryId,
        usage_type,
        position,
        is_visible,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return createErrorResponse('Accessory is already linked to this outfit', 409);
      }
      return handleDatabaseError('link accessory to outfit', error, 'POST /api/character-outfits/[outfitId]/accessories');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/character-outfits/[outfitId]/accessories', error);
  }
}
