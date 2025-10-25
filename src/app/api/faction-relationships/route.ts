import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { FactionRelationship } from '@/app/types/Faction';

/**
 * GET /api/faction-relationships?factionId=xxx
 * Get all relationships for a faction
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const factionId = searchParams.get('factionId');

    if (!factionId) {
      return NextResponse.json(
        { error: 'factionId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('faction_relationships')
      .select('*')
      .or(`faction_a_id.eq.${factionId},faction_b_id.eq.${factionId}`);

    if (error) {
      console.error('Error fetching faction relationships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch faction relationships' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as FactionRelationship[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/faction-relationships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faction-relationships
 * Create a new faction relationship
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { faction_a_id, faction_b_id, description, relationship_type } = body;

    if (!faction_a_id || !faction_b_id || !description) {
      return NextResponse.json(
        { error: 'faction_a_id, faction_b_id, and description are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('faction_relationships')
      .insert({
        faction_a_id,
        faction_b_id,
        description,
        relationship_type,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating faction relationship:', error);
      return NextResponse.json(
        { error: 'Failed to create faction relationship' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as FactionRelationship, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/faction-relationships:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


