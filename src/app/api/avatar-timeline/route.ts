/**
 * Avatar Timeline API Route
 *
 * Handles CRUD operations for avatar evolution/timeline tracking.
 * Tracks visual changes to characters over the story timeline.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// Types
// ============================================================================

type TransformationType =
  | 'initial'
  | 'natural_aging'
  | 'injury'
  | 'healing'
  | 'magical'
  | 'costume_change'
  | 'emotional'
  | 'custom';

type AgeStage = 'child' | 'teen' | 'young_adult' | 'adult' | 'middle_aged' | 'elderly';

interface VisualChange {
  attribute: string;
  from?: string;
  to: string;
  reason?: string;
}

// ============================================================================
// GET - Fetch avatar timeline for a character
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');
    const sceneId = searchParams.get('sceneId');
    const actId = searchParams.get('actId');
    const transformationType = searchParams.get('transformationType') as TransformationType | null;
    const milestonesOnly = searchParams.get('milestonesOnly') === 'true';

    if (!characterId) {
      return createErrorResponse('characterId is required', 400);
    }

    let query = supabaseServer
      .from('avatar_timeline')
      .select(`
        *,
        scene:scenes(id, name, order),
        act:acts(id, name, order)
      `)
      .eq('character_id', characterId)
      .order('timeline_order', { ascending: true })
      .order('created_at', { ascending: true });

    // Apply optional filters
    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    }

    if (actId) {
      query = query.eq('act_id', actId);
    }

    if (transformationType) {
      query = query.eq('transformation_type', transformationType);
    }

    if (milestonesOnly) {
      query = query.eq('is_milestone', true);
    }

    const { data, error } = await query;

    if (error) {
      return handleDatabaseError('fetch avatar timeline', error, 'GET /api/avatar-timeline');
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return handleUnexpectedError('GET /api/avatar-timeline', error);
  }
}

// ============================================================================
// POST - Create a new avatar timeline entry
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      character_id,
      avatar_url,
      thumbnail_url,
      scene_id,
      act_id,
      transformation_type = 'custom' as TransformationType,
      transformation_trigger,
      visual_changes = [] as VisualChange[],
      age_stage,
      estimated_age,
      is_milestone = false,
      notes,
      prompt_used,
      generation_params = {},
      timeline_order,
    } = body;

    if (!character_id) {
      return createErrorResponse('character_id is required', 400);
    }

    if (!avatar_url) {
      return createErrorResponse('avatar_url is required', 400);
    }

    // If timeline_order not provided, get the next order number
    let order = timeline_order;
    if (order === undefined) {
      const { data: lastEntry } = await supabaseServer
        .from('avatar_timeline')
        .select('timeline_order')
        .eq('character_id', character_id)
        .order('timeline_order', { ascending: false })
        .limit(1)
        .single();

      order = lastEntry ? (lastEntry.timeline_order || 0) + 1 : 0;
    }

    const { data, error } = await supabaseServer
      .from('avatar_timeline')
      .insert({
        character_id,
        avatar_url,
        thumbnail_url,
        scene_id,
        act_id,
        transformation_type,
        transformation_trigger,
        visual_changes,
        age_stage,
        estimated_age,
        is_milestone,
        notes,
        prompt_used,
        generation_params,
        timeline_order: order,
      })
      .select(`
        *,
        scene:scenes(id, name, order),
        act:acts(id, name, order)
      `)
      .single();

    if (error) {
      return handleDatabaseError('create avatar timeline entry', error, 'POST /api/avatar-timeline');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/avatar-timeline', error);
  }
}
