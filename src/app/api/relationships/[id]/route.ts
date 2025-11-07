import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { CharRelationship } from '@/app/types/Character';

/**
 * PUT /api/relationships/[id]
 * Update a character relationship
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('character_relationships')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating relationship:', error);
      return NextResponse.json(
        { error: 'Failed to update relationship' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as CharRelationship);
  } catch (error) {
    console.error('Unexpected error in PUT /api/relationships/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/relationships/[id]
 * Delete a character relationship
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from('character_relationships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting relationship:', error);
      return NextResponse.json(
        { error: 'Failed to delete relationship' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/relationships/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


