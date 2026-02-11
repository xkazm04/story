import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';
import { logger } from '@/app/utils/apiErrorHandling';

/**
 * GET /api/datasets/[id]/images
 * Get all images for a dataset
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from('dataset_images')
      .select('*')
      .eq('dataset_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.error('Error fetching dataset images', error, { datasetId: id });
      return createErrorResponse('Failed to fetch images', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('Unexpected error in GET /api/datasets/[id]/images', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/datasets/[id]/images
 * Add an image to a dataset
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('dataset_images')
      .insert({
        dataset_id: id,
        image_url: body.image_url,
        internal_id: body.internal_id || null,
        thumbnail_url: body.thumbnail_url || null,
        tags: body.tags || [],
        description: body.description || null,
        prompt: body.prompt || null,
        width: body.width || null,
        height: body.height || null,
      })
      .select()
      .single();

    if (error) {
      logger.error('Error adding image to dataset', error, { datasetId: id });
      return createErrorResponse('Failed to add image', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('Unexpected error in POST /api/datasets/[id]/images', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
