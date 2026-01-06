import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Character } from '@/app/types/Character';
import { logger } from '@/app/utils/logger';
import {
  HTTP_STATUS,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

const ENDPOINT = 'PUT /api/characters/[id]/faction-role';

/**
 * PUT /api/characters/[id]/faction-role
 * Update a character's faction role and rank
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { faction_role, faction_rank } = body;

    // Validate faction_rank is a number if provided
    if (faction_rank !== undefined && faction_rank !== null) {
      const rankNum = Number(faction_rank);
      if (isNaN(rankNum)) {
        return createErrorResponse(
          'faction_rank must be a number',
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const { data, error } = await supabaseServer
      .from('characters')
      .update({
        faction_role: faction_role || null,
        faction_rank: faction_rank !== undefined ? faction_rank : 0,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.apiError(ENDPOINT, error, { characterId: id });
      return createErrorResponse(
        'Failed to update character faction role',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json(data as Character);
  } catch (error) {
    logger.apiError(ENDPOINT, error, { characterId: await context.params.then(p => p.id) });
    return createErrorResponse(
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
