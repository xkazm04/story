/**
 * Character Consistency API
 * Endpoint for analyzing character consistency across beats, scenes, and traits
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { analyzeCharacterConsistency } from '@/app/lib/services/characterConsistency';
import { Beat } from '@/app/types/Beat';
import { Scene } from '@/app/types/Scene';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { character_id, project_id, include_beats = true, include_scenes = true, include_traits = true } = body;

    if (!character_id || !project_id) {
      return NextResponse.json(
        { error: 'character_id and project_id are required' },
        { status: 400 }
      );
    }

    // Fetch character data
    const { data: character, error: characterError } = await supabase
      .from('characters')
      .select('*')
      .eq('id', character_id)
      .single();

    if (characterError || !character) {
      return NextResponse.json(
        { error: 'Character not found' },
        { status: 404 }
      );
    }

    // Fetch beats if requested
    let beats: Beat[] = [];
    if (include_beats) {
      const { data: beatsData, error: beatsError } = await supabase
        .from('beats')
        .select('*')
        .eq('project_id', project_id)
        .order('order', { ascending: true });

      if (!beatsError && beatsData) {
        beats = beatsData as Beat[];
      }
    }

    // Fetch scenes if requested
    let scenes: Scene[] = [];
    if (include_scenes) {
      const { data: scenesData, error: scenesError } = await supabase
        .from('scenes')
        .select('*')
        .eq('project_id', project_id)
        .order('order', { ascending: true });

      if (!scenesError && scenesData) {
        scenes = scenesData as Scene[];
      }
    }

    // Fetch traits if requested
    let traits: any[] = [];
    if (include_traits) {
      const { data: traitsData, error: traitsError } = await supabase
        .from('traits')
        .select('*')
        .eq('character_id', character_id);

      if (!traitsError && traitsData) {
        traits = traitsData;
      }
    }

    // Analyze consistency
    const report = await analyzeCharacterConsistency(
      character_id,
      character.name,
      beats,
      scenes,
      traits
    );

    return NextResponse.json(report);
  } catch (error) {
    console.error('Error analyzing character consistency:', error);
    return NextResponse.json(
      { error: 'Failed to analyze character consistency' },
      { status: 500 }
    );
  }
}
