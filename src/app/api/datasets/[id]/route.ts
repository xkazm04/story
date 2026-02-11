import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';
import { logger } from '@/app/utils/apiErrorHandling';

/**
 * GET /api/datasets/[id]
 * Get a single dataset by ID
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from('datasets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      logger.error('Error fetching dataset', error, { id });
      return createErrorResponse('Dataset not found', HTTP_STATUS.NOT_FOUND);
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Unexpected error in GET /api/datasets/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * PUT /api/datasets/[id]
 * Update a dataset
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('datasets')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating dataset', error, { id });
      return createErrorResponse('Failed to update dataset', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Unexpected error in PUT /api/datasets/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * DELETE /api/datasets/[id]
 * Delete a dataset
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from('datasets')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting dataset', error, { id });
      return createErrorResponse('Failed to delete dataset', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/datasets/[id]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
