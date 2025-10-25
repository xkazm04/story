import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Beat } from '@/app/types/Beat';

/**
 * GET /api/beats?projectId=xxx&actId=yyy
 * Get beats for a project or specific act
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');
    const actId = searchParams.get('actId');

    if (!projectId && !actId) {
      return NextResponse.json(
        { error: 'projectId or actId is required' },
        { status: 400 }
      );
    }

    let query = supabaseServer.from('beats').select('*');

    if (actId) {
      query = query.eq('act_id', actId);
    } else if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query.order('order', { ascending: true });

    if (error) {
      console.error('Error fetching beats:', error);
      return NextResponse.json(
        { error: 'Failed to fetch beats' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Beat[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/beats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beats
 * Create a new beat
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, project_id, act_id, description, order } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'name and type are required' },
        { status: 400 }
      );
    }

    if (!project_id && !act_id) {
      return NextResponse.json(
        { error: 'Either project_id or act_id is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('beats')
      .insert({
        name,
        type,
        project_id,
        act_id,
        description,
        order: order || 0,
        completed: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating beat:', error);
      return NextResponse.json(
        { error: 'Failed to create beat' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Beat, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/beats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


