/**
 * Single Outfit-Accessory Link API Route
 *
 * Handles unlinking a specific accessory from an outfit
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
} from '@/app/utils/apiErrorHandling';

interface RouteParams {
  params: Promise<{ outfitId: string; accessoryId: string }>;
}

// ============================================================================
// DELETE - Unlink an accessory from an outfit
// ============================================================================

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { outfitId, accessoryId } = await params;

    const { error } = await supabaseServer
      .from('outfit_accessories')
      .delete()
      .eq('outfit_id', outfitId)
      .eq('accessory_id', accessoryId);

    if (error) {
      return handleDatabaseError('unlink accessory from outfit', error, 'DELETE /api/character-outfits/[outfitId]/accessories/[accessoryId]');
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleUnexpectedError('DELETE /api/character-outfits/[outfitId]/accessories/[accessoryId]', error);
  }
}
