import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Act } from '@/app/types/Act';

/**
 * GET /api/acts?projectId=xxx
 * Get all acts for a project
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
      .from('acts')
      .select('*')
      .eq('project_id', projectId)
      .order('order', { ascending: true });

    if (error) {
      console.error('Error fetching acts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch acts' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Act[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/acts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/acts
 * Create a new act
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, project_id, description, order } = body;

    if (!name || !project_id) {
      return NextResponse.json(
        { error: 'name and project_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('acts')
      .insert({
        name,
        project_id,
        description,
        order,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating act:', error);
      return NextResponse.json(
        { error: 'Failed to create act' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Act, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/acts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

