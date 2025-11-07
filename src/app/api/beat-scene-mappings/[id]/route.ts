import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

// GET - Fetch single beat-scene mapping by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = supabaseServer;
  const { id } = await params;

  try {
    const { data, error } = await supabase
      .from('beat_scene_mappings')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching beat-scene mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Beat-scene mapping not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/beat-scene-mappings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update beat-scene mapping
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = supabaseServer;
  const { id } = await params;

  try {
    const body = await request.json();

    // Prevent updating certain fields
    const allowedFields = [
      'status',
      'scene_id',
      'suggested_scene_name',
      'suggested_scene_description',
      'suggested_scene_script',
      'suggested_location',
      'user_feedback',
      'user_modified',
    ];

    const updates: any = {};
    Object.keys(body).forEach((key) => {
      if (allowedFields.includes(key)) {
        updates[key] = body[key];
      }
    });

    // If user is modifying the suggestion, mark it
    if (
      body.suggested_scene_name ||
      body.suggested_scene_description ||
      body.suggested_scene_script ||
      body.suggested_location
    ) {
      updates.user_modified = true;
    }

    const { data, error } = await supabase
      .from('beat_scene_mappings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating beat-scene mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in PUT /api/beat-scene-mappings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete beat-scene mapping
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = supabaseServer;
  const { id } = await params;

  try {
    const { error } = await supabase
      .from('beat_scene_mappings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting beat-scene mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/beat-scene-mappings/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
