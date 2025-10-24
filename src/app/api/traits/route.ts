import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Trait } from '@/app/types/Character';

/**
 * GET /api/traits?characterId=xxx
 * Get all traits for a character
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
      .from('traits')
      .select('*')
      .eq('character_id', characterId);

    if (error) {
      console.error('Error fetching traits:', error);
      return NextResponse.json(
        { error: 'Failed to fetch traits' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Trait[]);
  } catch (error) {
    console.error('Unexpected error in GET /api/traits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/traits
 * Create a new trait
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character_id, type, description } = body;

    if (!character_id || !type || !description) {
      return NextResponse.json(
        { error: 'character_id, type, and description are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer
      .from('traits')
      .insert({
        character_id,
        type,
        description,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating trait:', error);
      return NextResponse.json(
        { error: 'Failed to create trait' },
        { status: 500 }
      );
    }

    return NextResponse.json(data as Trait, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/traits:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

