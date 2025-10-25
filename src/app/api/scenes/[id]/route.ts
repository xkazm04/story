import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Scene } from '@/app/types/Scene';

/**
 * GET /api/scenes/[id]
 * Get a single scene by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseServer
      .from('scenes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching scene:', error);
      return NextResponse.json(
        { error: 'Scene not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as Scene);
  } catch (error) {
    console.error('Unexpected error in GET /api/scenes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/scenes/[id]
 * Update a scene
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('scenes')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating scene:', error);
      return NextResponse.json(
        { error: 'Failed to update scene' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Scene);
  } catch (error) {
    console.error('Unexpected error in PUT /api/scenes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/scenes/[id]
 * Delete a scene
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('scenes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting scene:', error);
      return NextResponse.json(
        { error: 'Failed to delete scene' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/scenes/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


