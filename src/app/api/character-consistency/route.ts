/**
 * Character Consistency API
 * Endpoint for analyzing character consistency across beats, scenes, and traits
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { analyzeCharacterConsistency } from '@/app/lib/services/characterConsistency';
import { Beat } from '@/app/types/Beat';
import { Scene } from '@/app/types/Scene';
import {
  handleUnexpectedError,
  createErrorResponse,
  validateRequiredParams,
  HTTP_STATUS,
} from '@/app/utils/apiErrorHandling';

interface Character {
  id: string;
  name: string;
  [key: string]: unknown;
}

interface Trait {
  id: string;
  character_id: string;
  [key: string]: unknown;
}

/**
 * Fetches character data from database
 */
async function fetchCharacter(supabase: typeof supabaseServer, character_id: string): Promise<Character | null> {
  const { data, error } = await supabase
    .from('characters')
    .select('*')
    .eq('id', character_id)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Character;
}

/**
 * Fetches beats for a project if requested
 */
async function fetchBeats(supabase: typeof supabaseServer, project_id: string, include: boolean): Promise<Beat[]> {
  if (!include) return [];

  const { data, error } = await supabase
    .from('beats')
    .select('*')
    .eq('project_id', project_id)
    .order('order', { ascending: true });

  if (error || !data) return [];
  return data as Beat[];
}

/**
 * Fetches scenes for a project if requested
 */
async function fetchScenes(supabase: typeof supabaseServer, project_id: string, include: boolean): Promise<Scene[]> {
  if (!include) return [];

  const { data, error } = await supabase
    .from('scenes')
    .select('*')
    .eq('project_id', project_id)
    .order('order', { ascending: true });

  if (error || !data) return [];
  return data as Scene[];
}

/**
 * Fetches traits for a character if requested
 */
async function fetchTraits(supabase: typeof supabaseServer, character_id: string, include: boolean): Promise<Trait[]> {
  if (!include) return [];

  const { data, error } = await supabase
    .from('traits')
    .select('*')
    .eq('character_id', character_id);

  if (error || !data) return [];
  return data as Trait[];
}

/**
 * POST /api/character-consistency
 * Analyze character consistency across narrative elements
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      character_id,
      project_id,
      include_beats = true,
      include_scenes = true,
      include_traits = true
    } = body;

    // Validate required parameters
    const paramValidation = validateRequiredParams(
      { character_id, project_id },
      ['character_id', 'project_id']
    );
    if (paramValidation) return paramValidation;

    // Fetch character data
    const character = await fetchCharacter(supabaseServer, character_id);

    if (!character) {
      return createErrorResponse('Character not found', HTTP_STATUS.NOT_FOUND);
    }

    // Fetch related data in parallel
    const [beats, scenes, traits] = await Promise.all([
      fetchBeats(supabaseServer, project_id, include_beats),
      fetchScenes(supabaseServer, project_id, include_scenes),
      fetchTraits(supabaseServer, character_id, include_traits),
    ]);

    // Analyze consistency
    const report = await analyzeCharacterConsistency(
      character_id,
      character.name,
      beats,
      scenes,
      traits
    );

    return NextResponse.json(report);
  } catch (error) {
    return handleUnexpectedError('POST /api/character-consistency', error);
  }
}
