import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Faction } from '@/app/types/Faction';

/**
 * GET /api/factions/[id]
 * Get a single faction by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseServer
      .from('factions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching faction:', error);
      return NextResponse.json(
        { error: 'Faction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as Faction);
  } catch (error) {
    console.error('Unexpected error in GET /api/factions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/factions/[id]
 * Update a faction
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('factions')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating faction:', error);
      return NextResponse.json(
        { error: 'Failed to update faction' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Faction);
  } catch (error) {
    console.error('Unexpected error in PUT /api/factions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/factions/[id]
 * Delete a faction
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('factions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting faction:', error);
      return NextResponse.json(
        { error: 'Failed to delete faction' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/factions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


