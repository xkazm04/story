import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { FactionLore } from '@/app/types/Faction';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * Fetches a lore entry by ID from the database
 */
async function fetchLore(id: string) {
  const { data, error } = await supabaseServer
    .from('faction_lore')
    .select('*')
    .eq('id', id)
    .single();

  return { data, error };
}

/**
 * Updates a lore entry in the database
 */
async function updateLore(id: string, body: Partial<FactionLore>) {
  const { data, error } = await supabaseServer
    .from('faction_lore')
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  return { data, error };
}

/**
 * Deletes a lore entry from the database
 */
async function deleteLore(id: string) {
  const { error } = await supabaseServer
    .from('faction_lore')
    .delete()
    .eq('id', id);

  return { error };
}

/**
 * GET /api/faction-lore/[id]
 * Get a single lore entry by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await fetchLore(id);

    if (error) {
      logger.error('Error fetching lore', error, { id });
      return createErrorResponse('Lore entry not found', HTTP_STATUS.NOT_FOUND);
    }

    return NextResponse.json(data as FactionLore);
  } catch (error) {
    logger.error('Unexpected error in GET /api/faction-lore/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/faction-lore/[id]
 * Update a lore entry (including AI summary and tags)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await updateLore(id, body);

    if (error) {
      logger.error('Error updating lore', error, { id });
      return createErrorResponse('Failed to update lore entry', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data as FactionLore);
  } catch (error) {
    logger.error('Unexpected error in PUT /api/faction-lore/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/faction-lore/[id]
 * Delete a lore entry
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await deleteLore(id);

    if (error) {
      logger.error('Error deleting lore', error, { id });
      return createErrorResponse('Failed to delete lore entry', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json({ success: true }, { status: HTTP_STATUS.OK });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/faction-lore/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
