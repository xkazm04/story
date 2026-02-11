import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';
import { logger } from '@/app/utils/apiErrorHandling';

/**
 * DELETE /api/datasets/[id]/images/[imageId]
 * Remove an image from a dataset
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { imageId } = await context.params;

    const { error } = await supabaseServer
      .from('dataset_images')
      .delete()
      .eq('id', imageId);

    if (error) {
      logger.error('Error deleting dataset image', error, { imageId });
      return createErrorResponse('Failed to delete image', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Unexpected error in DELETE /api/datasets/[id]/images/[imageId]', error);
    return createErrorResponse('Internal server error', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
