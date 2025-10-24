import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Beat } from '@/app/types/Beat';

/**
 * PUT /api/beats/[id]
 * Update a beat
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('beats')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating beat:', error);
      return NextResponse.json(
        { error: 'Failed to update beat' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Beat);
  } catch (error) {
    console.error('Unexpected error in PUT /api/beats/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/beats/[id]
 * Delete a beat
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('beats')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beat:', error);
      return NextResponse.json(
        { error: 'Failed to delete beat' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/beats/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

