import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Faction } from '@/app/types/Faction';

/**
 * GET /api/factions?projectId=xxx
 * Get all factions for a project
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
      .from('factions')
      .select('*')
      .eq('project_id', projectId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching factions:', error);
      return NextResponse.json(
        { error: 'Failed to fetch factions' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Faction[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/factions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/factions
 * Create a new faction
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, project_id, description, color, logo_url } = body;

    if (!name || !project_id) {
      return NextResponse.json(
        { error: 'name and project_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('factions')
      .insert({
        name,
        project_id,
        description,
        color,
        logo_url,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating faction:', error);
      return NextResponse.json(
        { error: 'Failed to create faction' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Faction, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/factions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

