import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Character } from '@/app/types/Character';

/**
 * GET /api/characters/[id]
 * Get a single character by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { data, error } = await supabaseServer
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching character:', error);
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data as Character);
  } catch (error) {
    console.error('Unexpected error in GET /api/characters/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/characters/[id]
 * Update a character
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const { data, error } = await supabaseServer
      .from('characters')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating character:', error);
      return NextResponse.json(
        { error: 'Failed to update character' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Character);
  } catch (error) {
    console.error('Unexpected error in PUT /api/characters/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/characters/[id]
 * Delete a character
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const { error } = await supabaseServer
      .from('characters')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting character:', error);
      return NextResponse.json(
        { error: 'Failed to delete character' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/characters/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

