import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { CharRelationship } from '@/app/types/Character';

/**
 * GET /api/relationships?characterId=xxx
 * Get all relationships for a character
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return NextResponse.json(
        { error: 'characterId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('character_relationships')
      .select('*')
      .or(`character_a_id.eq.${characterId},character_b_id.eq.${characterId}`);

    if (error) {
      console.error('Error fetching relationships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as CharRelationship[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/relationships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/relationships
 * Create a new character relationship
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character_a_id, character_b_id, description, relationship_type, act_id, event_date } = body;

    if (!character_a_id || !character_b_id || !description) {
      return NextResponse.json(
        { error: 'character_a_id, character_b_id, and description are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('character_relationships')
      .insert({
        character_a_id,
        character_b_id,
        description,
        relationship_type,
        act_id,
        event_date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating relationship:', error);
      return NextResponse.json(
        { error: 'Failed to create relationship' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as CharRelationship, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/relationships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


