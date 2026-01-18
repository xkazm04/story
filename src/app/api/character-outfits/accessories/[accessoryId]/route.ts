/**
 * Single Accessory API Route
 *
 * Handles single accessory operations: GET, PATCH, DELETE
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

interface RouteParams {
  params: Promise<{ accessoryId: string }>;
}

// ============================================================================
// GET - Fetch a single accessory
// ============================================================================

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { accessoryId } = await params;

    const { data, error } = await supabaseServer
      .from('character_accessories')
      .select('*')
      .eq('id', accessoryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Accessory not found', 404);
      }
      return handleDatabaseError('fetch accessory', error, 'GET /api/character-outfits/accessories/[accessoryId]');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('GET /api/character-outfits/accessories/[accessoryId]', error);
  }
}

// ============================================================================
// PATCH - Update an accessory
// ============================================================================

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { accessoryId } = await params;
    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, character_id, created_at, updated_at, ...updateData } = body;

    const { data, error } = await supabaseServer
      .from('character_accessories')
      .update(updateData)
      .eq('id', accessoryId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return createErrorResponse('Accessory not found', 404);
      }
      return handleDatabaseError('update accessory', error, 'PATCH /api/character-outfits/accessories/[accessoryId]');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('PATCH /api/character-outfits/accessories/[accessoryId]', error);
  }
}

// ============================================================================
// DELETE - Delete an accessory
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { accessoryId } = await params;

    const { error } = await supabaseServer
      .from('character_accessories')
      .delete()
      .eq('id', accessoryId);

    if (error) {
      return handleDatabaseError('delete accessory', error, 'DELETE /api/character-outfits/accessories/[accessoryId]');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleUnexpectedError('DELETE /api/character-outfits/accessories/[accessoryId]', error);
  }
}
