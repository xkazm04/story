/**
 * Avatar Timeline Entry API Route
 *
 * Handles operations for individual avatar timeline entries.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// GET - Fetch a single avatar timeline entry
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;

    if (!entryId) {
      return createErrorResponse('entryId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('avatar_timeline')
      .select(`
        *,
        scene:scenes(id, title, scene_number),
        act:acts(id, title, act_number)
      `)
      .eq('id', entryId)
      .single();

    if (error) {
      return handleDatabaseError('fetch avatar timeline entry', error, 'GET /api/avatar-timeline/[entryId]');
    }

    if (!data) {
      return createErrorResponse('Avatar timeline entry not found', 404);
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('GET /api/avatar-timeline/[entryId]', error);
  }
}

// ============================================================================
// PATCH - Update an avatar timeline entry
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const body = await request.json();

    if (!entryId) {
      return createErrorResponse('entryId is required', 400);
    }

    // Only allow updating certain fields
    const allowedFields = [
      'avatar_url',
      'thumbnail_url',
      'scene_id',
      'act_id',
      'transformation_type',
      'transformation_trigger',
      'visual_changes',
      'age_stage',
      'estimated_age',
      'is_milestone',
      'notes',
      'prompt_used',
      'generation_params',
      'timeline_order',
    ];

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return createErrorResponse('No valid fields to update', 400);
    }

    const { data, error } = await supabaseServer
      .from('avatar_timeline')
      .update(updateData)
      .eq('id', entryId)
      .select(`
        *,
        scene:scenes(id, title, scene_number),
        act:acts(id, title, act_number)
      `)
      .single();

    if (error) {
      return handleDatabaseError('update avatar timeline entry', error, 'PATCH /api/avatar-timeline/[entryId]');
    }

    if (!data) {
      return createErrorResponse('Avatar timeline entry not found', 404);
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('PATCH /api/avatar-timeline/[entryId]', error);
  }
}

// ============================================================================
// DELETE - Delete an avatar timeline entry
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;

    if (!entryId) {
      return createErrorResponse('entryId is required', 400);
    }

    const { error } = await supabaseServer
      .from('avatar_timeline')
      .delete()
      .eq('id', entryId);

    if (error) {
      return handleDatabaseError('delete avatar timeline entry', error, 'DELETE /api/avatar-timeline/[entryId]');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleUnexpectedError('DELETE /api/avatar-timeline/[entryId]', error);
  }
}
