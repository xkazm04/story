import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  Faction,
  FactionRelationship,
  FactionMedia,
  FactionLore,
  FactionAchievement,
  FactionEvent,
  FactionSummary
} from '@/app/types/Faction';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * GET /api/factions/[id]/summary
 * Get comprehensive faction details with all related data in a single request
 * Combines members, relationships, media, lore, achievements, and events
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Execute all queries in parallel to minimize latency
    const [
      factionResult,
      membersResult,
      relationshipsResult,
      mediaResult,
      loreResult,
      achievementsResult,
      eventsResult,
    ] = await Promise.all([
      // Get faction details
      supabaseServer
        .from('factions')
        .select('*')
        .eq('id', id)
        .single(),

      // Get faction members (characters)
      supabaseServer
        .from('characters')
        .select('id, name, avatar_url, faction_id')
        .eq('faction_id', id)
        .order('name', { ascending: true }),

      // Get faction relationships
      supabaseServer
        .from('faction_relationships')
        .select('*')
        .or(`faction_a_id.eq.${id},faction_b_id.eq.${id}`),

      // Get faction media
      supabaseServer
        .from('faction_media')
        .select('*')
        .eq('faction_id', id)
        .order('uploaded_at', { ascending: false }),

      // Get faction lore
      supabaseServer
        .from('faction_lore')
        .select('*')
        .eq('faction_id', id)
        .order('created_at', { ascending: false }),

      // Get faction achievements
      supabaseServer
        .from('faction_achievements')
        .select('*')
        .eq('faction_id', id)
        .order('earned_date', { ascending: false }),

      // Get faction events (timeline)
      supabaseServer
        .from('faction_events')
        .select('*')
        .eq('faction_id', id)
        .order('date', { ascending: true }),
    ]);

    // Check for critical error (faction not found)
    if (factionResult.error) {
      logger.apiError('GET /api/factions/[id]/summary', factionResult.error, { factionId: id, section: 'faction' });
      return NextResponse.json(
        { error: 'Faction not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    // Log non-critical errors but continue with available data
    if (membersResult.error) {
      logger.warn('Error fetching faction members', { factionId: id, error: membersResult.error });
    }
    if (relationshipsResult.error) {
      logger.warn('Error fetching faction relationships', { factionId: id, error: relationshipsResult.error });
    }
    if (mediaResult.error) {
      logger.warn('Error fetching faction media', { factionId: id, error: mediaResult.error });
    }
    if (loreResult.error) {
      logger.warn('Error fetching faction lore', { factionId: id, error: loreResult.error });
    }
    if (achievementsResult.error) {
      logger.warn('Error fetching faction achievements', { factionId: id, error: achievementsResult.error });
    }
    if (eventsResult.error) {
      logger.warn('Error fetching faction events', { factionId: id, error: eventsResult.error });
    }

    // Construct summary response
    const summary: FactionSummary = {
      faction: factionResult.data as Faction,
      members: membersResult.data || [],
      relationships: (relationshipsResult.data || []) as FactionRelationship[],
      media: (mediaResult.data || []) as FactionMedia[],
      lore: (loreResult.data || []) as FactionLore[],
      achievements: (achievementsResult.data || []) as FactionAchievement[],
      events: (eventsResult.data || []) as FactionEvent[],
    };

    return NextResponse.json(summary);
  } catch (error) {
    logger.apiError('GET /api/factions/[id]/summary', error, { factionId: await context.params.then(p => p.id) });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
