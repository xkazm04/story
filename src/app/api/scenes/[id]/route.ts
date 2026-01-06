import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Scene } from '@/app/types/Scene';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS, createErrorResponse } from '@/app/utils/apiErrorHandling';

/**
 * Fetches a scene by ID from the database
 */
async function fetchScene(id: string) {
  const { data, error } = await supabaseServer
    .from('scenes')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Updates a scene in the database
 */
async function updateScene(id: string, body: Partial<Scene>) {
  const { data, error } = await supabaseServer
    .from('scenes')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Deletes a scene from the database
 */
async function deleteScene(id: string) {
  const { error } = await supabaseServer
    .from('scenes')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * GET /api/scenes/[id]
 * Get a single scene by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await fetchScene(id);

    if (error) {
      logger.apiError('GET /api/scenes/[id]', error, { sceneId: id });
      return createErrorResponse('Scene not found', HTTP_STATUS.NOT_FOUND);
    }

    return NextResponse.json(data as Scene);
  } catch (error) {
    logger.apiError('GET /api/scenes/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/scenes/[id]
 * Update a scene
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await updateScene(id, body);

    if (error) {
      logger.apiError('PUT /api/scenes/[id]', error, { sceneId: id });
      return createErrorResponse('Failed to update scene', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data as Scene);
  } catch (error) {
    logger.apiError('PUT /api/scenes/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/scenes/[id]
 * Delete a scene
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await deleteScene(id);

    if (error) {
      logger.apiError('DELETE /api/scenes/[id]', error, { sceneId: id });
      return createErrorResponse('Failed to delete scene', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    logger.apiError('DELETE /api/scenes/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
