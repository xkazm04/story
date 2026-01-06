import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';
import { appearancePropagationService } from '@/app/services/appearancePropagationService';

/**
 * POST /api/appearance-propagation/apply
 * Apply propagation updates to actual story elements
 * This allows user to review and approve changes before applying
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { target_id, target_ids } = body;

    if (!target_id && (!target_ids || !Array.isArray(target_ids))) {
      return createErrorResponse('target_id or target_ids array is required', HTTP_STATUS.BAD_REQUEST);
    }

    const idsToApply = target_id ? [target_id] : target_ids;

    let successCount = 0;
    let failureCount = 0;

    for (const id of idsToApply) {
      try {
        await appearancePropagationService.applyPropagationTarget(id);
        successCount++;
      } catch (error) {
        logger.error('Error applying propagation target', error, { targetId: id });
        failureCount++;
      }
    }

    return NextResponse.json({
      success: true,
      applied: successCount,
      failed: failureCount,
      total: idsToApply.length,
    });
  } catch (error) {
    logger.error('Error in POST /api/appearance-propagation/apply', error);
    return createErrorResponse('Failed to apply propagation updates', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
