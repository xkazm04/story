import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { Faction, FactionBranding } from '@/app/types/Faction';
import { validateFactionBrandingColors } from '@/app/utils/colorValidation';
import { logger } from '@/app/utils/logger';
import {
  HTTP_STATUS,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

const ENDPOINT = 'PUT /api/factions/[id]/branding';

/**
 * PUT /api/factions/[id]/branding
 * Update faction branding with strict color validation
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const branding: Partial<FactionBranding> = await request.json();

    // Validate branding colors
    const brandingValidation = validateFactionBrandingColors({
      primary_color: branding.primary_color,
      secondary_color: branding.secondary_color,
      accent_color: branding.accent_color,
    });

    if (!brandingValidation.isValid) {
      const errorMessages = Object.entries(brandingValidation.errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join('; ');
      return createErrorResponse(
        `Invalid branding colors: ${errorMessages}`,
        HTTP_STATUS.BAD_REQUEST,
        undefined,
        brandingValidation.errors
      );
    }

    // Use sanitized colors
    const sanitizedBranding: Partial<FactionBranding> = {
      ...branding,
      primary_color: brandingValidation.sanitized.primary_color,
      secondary_color: brandingValidation.sanitized.secondary_color,
      accent_color: brandingValidation.sanitized.accent_color,
    };

    // First, get the current faction to merge branding
    const { data: currentFaction, error: fetchError } = await supabaseServer
      .from('factions')
      .select('branding')
      .eq('id', id)
      .single();

    if (fetchError) {
      logger.apiError(ENDPOINT, fetchError, { factionId: id, step: 'fetch' });
      return createErrorResponse(
        'Faction not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Merge with existing branding
    const updatedBranding = {
      ...(currentFaction.branding || {}),
      ...sanitizedBranding,
    };

    // Update the faction with new branding
    const { data, error } = await supabaseServer
      .from('factions')
      .update({ branding: updatedBranding })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.apiError(ENDPOINT, error, { factionId: id, step: 'update' });
      return createErrorResponse(
        'Failed to update faction branding',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json(data as Faction);
  } catch (error) {
    logger.apiError(ENDPOINT, error, { factionId: await context.params.then(p => p.id) });
    return createErrorResponse(
      'Internal server error',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
