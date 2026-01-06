import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Character } from '@/app/types/Character';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
  validateRequiredParams,
} from '@/app/utils/apiErrorHandling';

/**
 * GET /api/characters?projectId=xxx
 * Get all characters for a project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('projectId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) {
      return handleDatabaseError('fetch characters', error, 'GET /api/characters');
    }

    return NextResponse.json(data as Character[]);
  } catch (error) {
    return handleUnexpectedError('GET /api/characters', error);
  }
}

/**
 * POST /api/characters
 * Create a new character
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, project_id, type, faction_id, faction_role, faction_rank, voice, avatar_url } = body;

    // Validate required parameters
    const paramValidation = validateRequiredParams(
      { name, project_id },
      ['name', 'project_id']
    );
    if (paramValidation) return paramValidation;

    const { data, error } = await supabaseServer
      .from('characters')
      .insert({
        name,
        project_id,
        type,
        faction_id,
        faction_role,
        faction_rank: faction_rank ?? 0,
        voice,
        avatar_url,
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('create character', error, 'POST /api/characters');
    }

    return NextResponse.json(data as Character, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/characters', error);
  }
}
