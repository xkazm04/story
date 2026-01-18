/**
 * Character Outfit by ID API Route
 *
 * Handles single outfit operations: GET, PATCH, DELETE
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
// GET - Fetch a single outfit
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { outfitId } = await params;

    const { data, error } = await supabaseServer
      .from('character_outfits')
      .select('*')
      .eq('id', outfitId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Outfit not found', 404);
      }
      return handleDatabaseError('fetch outfit', error, 'GET /api/character-outfits/[outfitId]');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('GET /api/character-outfits/[outfitId]', error);
  }
}

// ============================================================================
// PATCH - Update an outfit
// ============================================================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { outfitId } = await params;
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, character_id, created_at, updated_at, ...updateData } = body;

    const { data, error } = await supabaseServer
      .from('character_outfits')
      .update(updateData)
      .eq('id', outfitId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Outfit not found', 404);
      }
      return handleDatabaseError('update outfit', error, 'PATCH /api/character-outfits/[outfitId]');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('PATCH /api/character-outfits/[outfitId]', error);
  }
}

// ============================================================================
// DELETE - Delete an outfit
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { outfitId } = await params;

    const { error } = await supabaseServer
      .from('character_outfits')
      .delete()
      .eq('id', outfitId);

    if (error) {
      return handleDatabaseError('delete outfit', error, 'DELETE /api/character-outfits/[outfitId]');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleUnexpectedError('DELETE /api/character-outfits/[outfitId]', error);
  }
}
