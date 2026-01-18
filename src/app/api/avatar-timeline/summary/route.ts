/**
 * Avatar Timeline Summary API Route
 *
 * Provides evolution summary and analytics for character avatars.
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

interface TimelineSummary {
  characterId: string;
  totalEntries: number;
  milestoneCount: number;
  transformationBreakdown: Record<string, number>;
  ageStageProgression: Array<{
    stage: string;
    entryId: string;
    timestamp: string;
  }>;
  firstEntry: {
    id: string;
    avatarUrl: string;
    createdAt: string;
  } | null;
  latestEntry: {
    id: string;
    avatarUrl: string;
    createdAt: string;
  } | null;
  actsSpanned: number;
  scenesSpanned: number;
}

// ============================================================================
// GET - Fetch evolution summary for a character
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const characterId = searchParams.get('characterId');

    if (!characterId) {
      return createErrorResponse('characterId is required', 400);
    }

    // Fetch all timeline entries for the character
    const { data: entries, error } = await supabaseServer
      .from('avatar_timeline')
      .select('*')
      .eq('character_id', characterId)
      .order('timeline_order', { ascending: true });

    if (error) {
      return handleDatabaseError('fetch avatar timeline summary', error, 'GET /api/avatar-timeline/summary');
    }

    if (!entries || entries.length === 0) {
      const emptySummary: TimelineSummary = {
        characterId,
        totalEntries: 0,
        milestoneCount: 0,
        transformationBreakdown: {},
        ageStageProgression: [],
        firstEntry: null,
        latestEntry: null,
        actsSpanned: 0,
        scenesSpanned: 0,
      };
      return NextResponse.json(emptySummary);
    }

    // Calculate transformation breakdown
    const transformationBreakdown: Record<string, number> = {};
    for (const entry of entries) {
      const type = entry.transformation_type || 'unknown';
      transformationBreakdown[type] = (transformationBreakdown[type] || 0) + 1;
    }

    // Extract age stage progression (only entries with age_stage)
    const ageStageProgression = entries
      .filter(e => e.age_stage)
      .map(e => ({
        stage: e.age_stage!,
        entryId: e.id,
        timestamp: e.created_at,
      }));

    // Get unique acts and scenes
    const uniqueActs = new Set(entries.filter(e => e.act_id).map(e => e.act_id));
    const uniqueScenes = new Set(entries.filter(e => e.scene_id).map(e => e.scene_id));

    // Build summary
    const summary: TimelineSummary = {
      characterId,
      totalEntries: entries.length,
      milestoneCount: entries.filter(e => e.is_milestone).length,
      transformationBreakdown,
      ageStageProgression,
      firstEntry: {
        id: entries[0].id,
        avatarUrl: entries[0].avatar_url,
        createdAt: entries[0].created_at,
      },
      latestEntry: {
        id: entries[entries.length - 1].id,
        avatarUrl: entries[entries.length - 1].avatar_url,
        createdAt: entries[entries.length - 1].created_at,
      },
      actsSpanned: uniqueActs.size,
      scenesSpanned: uniqueScenes.size,
    };

    return NextResponse.json(summary);
  } catch (error) {
    return handleUnexpectedError('GET /api/avatar-timeline/summary', error);
  }
}
