import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { FactionLore } from '@/app/types/Faction';
import { logger } from '@/app/utils/logger';
import {
  HTTP_STATUS,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

const ENDPOINT_GET = 'GET /api/factions/[id]/lore';
const ENDPOINT_POST = 'POST /api/factions/[id]/lore';

/**
 * GET /api/factions/[id]/lore
 * Get all lore entries for a faction
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from('faction_lore')
      .select('*')
      .eq('faction_id', id)
      .order('created_at', { ascending: false });

    if (error) {
      logger.apiError(ENDPOINT_GET, error, { factionId: id });
      return createErrorResponse(
        'Failed to fetch lore entries',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json(data as FactionLore[]);
  } catch (error) {
    logger.apiError(ENDPOINT_GET, error, { factionId: await context.params.then(p => p.id) });
    return createErrorResponse(
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * POST /api/factions/[id]/lore
 * Create a new lore entry for a faction
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    if (!body.title || !body.content || !body.category) {
      return createErrorResponse(
        'Title, content, and category are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const { data, error } = await supabaseServer
      .from('faction_lore')
      .insert({
        faction_id: id,
        title: body.title,
        content: body.content,
        category: body.category,
        updated_by: body.updated_by || 'system',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      logger.apiError(ENDPOINT_POST, error, { factionId: id });
      return createErrorResponse(
        'Failed to create lore entry',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json(data as FactionLore, { status: HTTP_STATUS.CREATED });
  } catch (error) {
    logger.apiError(ENDPOINT_POST, error, { factionId: await context.params.then(p => p.id) });
    return createErrorResponse(
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
