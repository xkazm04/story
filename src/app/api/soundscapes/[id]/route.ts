import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/soundscapes/[id]
 * Get a single soundscape with full timeline data.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { data, error } = await supabaseServer
      .from('soundscapes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Soundscape not found' },
        { status: HTTP_STATUS.NOT_FOUND }
      );
    }

    return NextResponse.json({ success: true, soundscape: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

/**
 * PUT /api/soundscapes/[id]
 * Update a soundscape.
 */
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { name, timeline_data, transport_data } = body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (timeline_data !== undefined) updateData.timeline_data = timeline_data;
    if (transport_data !== undefined) updateData.transport_data = transport_data;

    const { data, error } = await supabaseServer
      .from('soundscapes')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: `Failed to update: ${error.message}` },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ success: true, soundscape: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}

/**
 * DELETE /api/soundscapes/[id]
 * Delete a soundscape.
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const { error } = await supabaseServer
      .from('soundscapes')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: `Failed to delete: ${error.message}` },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: HTTP_STATUS.INTERNAL_SERVER_ERROR });
  }
}
