import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Trait } from '@/app/types/Character';

/**
 * PUT /api/traits/[id]
 * Update a trait
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('traits')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating trait:', error);
      return NextResponse.json(
        { error: 'Failed to update trait' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Trait);
  } catch (error) {
    console.error('Unexpected error in PUT /api/traits/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/traits/[id]
 * Delete a trait
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from('traits')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting trait:', error);
      return NextResponse.json(
        { error: 'Failed to delete trait' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/traits/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


