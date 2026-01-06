import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * Character Appearance API
 * CRUD operations for character appearance data
 */

/**
 * Validates character_id parameter
 */
function validateCharacterId(characterId: string | null): NextResponse | null {
  if (!characterId) {
    return NextResponse.json(
      { error: 'character_id is required' },
      { status: HTTP_STATUS.BAD_REQUEST }
    );
  }
  return null;
}

/**
 * Creates error response
 */
function createLocalErrorResponse(message: string, error: unknown): NextResponse {
  logger.apiError('/api/char-appearance', error);
  return NextResponse.json(
    { error: message },
    { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
  );
}

// GET - Fetch appearance for a character
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get('character_id');

    const validationError = validateCharacterId(characterId);
    if (validationError) return validationError;

    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('char_appearance')
      .select('*')
      .eq('character_id', characterId!)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found" error, which is acceptable
      throw error;
    }

    return NextResponse.json(data || null);
  } catch (error) {
    return createLocalErrorResponse('Failed to fetch character appearance', error);
  }
}

// POST - Create or update appearance (upsert)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { character_id, ...appearanceData } = body;

    const validationError = validateCharacterId(character_id);
    if (validationError) return validationError;

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
    return createLocalErrorResponse('Failed to save character appearance', error);
  }
}

// DELETE - Delete appearance for a character
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const characterId = searchParams.get('character_id');

    const validationError = validateCharacterId(characterId);
    if (validationError) return validationError;

    const supabase = supabaseServer;

    const { error } = await supabase
      .from('char_appearance')
      .delete()
      .eq('character_id', characterId!);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return createLocalErrorResponse('Failed to delete character appearance', error);
  }
}
