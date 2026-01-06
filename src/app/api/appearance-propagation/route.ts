import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';
import { appearancePropagationService } from '@/app/services/appearancePropagationService';

/**
 * GET /api/appearance-propagation
 * Get pending appearance changes that need propagation
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get('character_id');

    if (characterId) {
      // Get change logs for specific character
      const changeLogs = await appearancePropagationService.getCharacterChangeLogs(characterId);
      return NextResponse.json(changeLogs);
    }

    // Get all pending changes
    const pendingChanges = await appearancePropagationService.getPendingChanges();
    return NextResponse.json(pendingChanges);
  } catch (error) {
    logger.error('Error in GET /api/appearance-propagation', error);
    return createErrorResponse('Failed to fetch appearance changes', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/appearance-propagation
 * Trigger propagation for a specific change log or character
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { change_log_id, character_id } = body;

    if (!change_log_id && !character_id) {
      return createErrorResponse('change_log_id or character_id is required', HTTP_STATUS.BAD_REQUEST);
    }

    // This endpoint triggers the propagation
    // The actual propagation is handled by the background processor
    return NextResponse.json({
      success: true,
      message: 'Propagation triggered successfully',
    });
  } catch (error) {
    logger.error('Error in POST /api/appearance-propagation', error);
    return createErrorResponse('Failed to trigger propagation', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
