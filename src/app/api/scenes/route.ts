import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Scene } from '@/app/types/Scene';

/**
 * GET /api/scenes?projectId=xxx&actId=yyy
 * Get scenes for a project or specific act
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const actId = searchParams.get('actId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'projectId is required' },
        { status: 400 }
      );
    }

    let query = supabaseServer
      .from('scenes')
      .select('*')
      .eq('project_id', projectId);

    if (actId) {
      query = query.eq('act_id', actId);
    }

    const { data, error } = await query.order('order', { ascending: true });

    if (error) {
      console.error('Error fetching scenes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scenes' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Scene[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/scenes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/scenes
 * Create a new scene
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, project_id, act_id, description, order } = body;

    if (!project_id || !act_id) {
      return NextResponse.json(
        { error: 'project_id and act_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('scenes')
      .insert({
        name: name || 'Untitled Scene',
        project_id,
        act_id,
        description,
        order: order || 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating scene:', error);
      return NextResponse.json(
        { error: 'Failed to create scene' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Scene, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/scenes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

