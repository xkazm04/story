import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Act } from '@/app/types/Act';

/**
 * GET /api/acts/[id]
 * Get a single act by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseServer
      .from('acts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching act:', error);
      return NextResponse.json(
        { error: 'Act not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as Act);
  } catch (error) {
    console.error('Unexpected error in GET /api/acts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/acts/[id]
 * Update an act
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('acts')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating act:', error);
      return NextResponse.json(
        { error: 'Failed to update act' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Act);
  } catch (error) {
    console.error('Unexpected error in PUT /api/acts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/acts/[id]
 * Delete an act
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('acts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting act:', error);
      return NextResponse.json(
        { error: 'Failed to delete act' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/acts/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

