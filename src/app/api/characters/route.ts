import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Character } from '@/app/types/Character';

/**
 * GET /api/characters?projectId=xxx
 * Get all characters for a project
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('characters')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching characters:', error);
      return NextResponse.json(
        { error: 'Failed to fetch characters' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Character[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/characters
 * Create a new character
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, project_id, type, faction_id, voice, avatar_url } = body;

    if (!name || !project_id) {
      return NextResponse.json(
        { error: 'name and project_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('characters')
      .insert({
        name,
        project_id,
        type,
        faction_id,
        voice,
        avatar_url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating character:', error);
      return NextResponse.json(
        { error: 'Failed to create character' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Character, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/characters:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


