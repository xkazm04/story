import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { FactionRelationship } from '@/app/types/Faction';

/**
 * PUT /api/faction-relationships/[id]
 * Update a faction relationship
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('faction_relationships')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating faction relationship:', error);
      return NextResponse.json(
        { error: 'Failed to update faction relationship' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as FactionRelationship);
  } catch (error) {
    console.error('Unexpected error in PUT /api/faction-relationships/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/faction-relationships/[id]
 * Delete a faction relationship
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('faction_relationships')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting faction relationship:', error);
      return NextResponse.json(
        { error: 'Failed to delete faction relationship' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/faction-relationships/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


