import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { BeatSceneMapping } from '@/app/types/Beat';

// GET - Fetch beat-scene mappings
export async function GET(request: NextRequest) {
  const supabase = supabaseServer;
  const { searchParams } = new URL(request.url);

  const beatId = searchParams.get('beatId');
  const projectId = searchParams.get('projectId');
  const status = searchParams.get('status');

  try {
    let query = supabase
      .from('beat_scene_mappings')
      .select('*')
      .order('created_at', { ascending: false });

    if (beatId) {
      query = query.eq('beat_id', beatId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching beat-scene mappings:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error in GET /api/beat-scene-mappings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create new beat-scene mapping
export async function POST(request: NextRequest) {
  const supabase = supabaseServer;

  try {
    const body = await request.json();
    const {
      beat_id,
      scene_id,
      project_id,
      status = 'suggested',
      suggested_scene_name,
      suggested_scene_description,
      suggested_scene_script,
      suggested_location,
      semantic_similarity_score,
      reasoning,
      ai_model = 'gpt-4o-mini',
      confidence_score,
    } = body;

    if (!beat_id || !project_id) {
      return NextResponse.json(
        { error: 'beat_id and project_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('beat_scene_mappings')
      .insert({
        beat_id,
        scene_id: scene_id || null,
        project_id,
        status,
        suggested_scene_name,
        suggested_scene_description,
        suggested_scene_script,
        suggested_location,
        semantic_similarity_score,
        reasoning,
        ai_model,
        confidence_score,
        user_modified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating beat-scene mapping:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/beat-scene-mappings:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
