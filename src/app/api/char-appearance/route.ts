import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

/**
 * Character Appearance API
 * CRUD operations for character appearance data
 */

// GET - Fetch appearance for a character
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get('character_id');

    if (!characterId) {
      return NextResponse.json(
        { error: 'character_id is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('char_appearance')
      .select('*')
      .eq('character_id', characterId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is acceptable
      throw error;
    }

    return NextResponse.json(data || null);
  } catch (error) {
    console.error('Error fetching character appearance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch character appearance' },
      { status: 500 }
    );
  }
}

// POST - Create or update appearance (upsert)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character_id, ...appearanceData } = body;

    if (!character_id) {
      return NextResponse.json(
        { error: 'character_id is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    // Use upsert to handle both insert and update
    const { data, error } = await supabase
      .from('char_appearance')
      .upsert({
        character_id,
        ...appearanceData,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error saving character appearance:', error);
    return NextResponse.json(
      { error: 'Failed to save character appearance' },
      { status: 500 }
    );
  }
}

// DELETE - Delete appearance for a character
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get('character_id');

    if (!characterId) {
      return NextResponse.json(
        { error: 'character_id is required' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;

    const { error } = await supabase
      .from('char_appearance')
      .delete()
      .eq('character_id', characterId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting character appearance:', error);
    return NextResponse.json(
      { error: 'Failed to delete character appearance' },
      { status: 500 }
    );
  }
}

