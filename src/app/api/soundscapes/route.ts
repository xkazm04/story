import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * GET /api/soundscapes?projectId=xxx
 * List soundscapes for a project (summary only — no bulky timeline_data).
 */
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('projectId is required', HTTP_STATUS.BAD_REQUEST);
    }

    const { data, error } = await supabaseServer
      .from('soundscapes')
      .select('id, name, created_at, updated_at')
      .eq('project_id', projectId)
      .order('updated_at', { ascending: false });

    if (error) {
      return createErrorResponse(
        `Failed to fetch soundscapes: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json({ success: true, soundscapes: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return createErrorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * POST /api/soundscapes
 * Create a new soundscape.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { project_id, name, timeline_data, transport_data } = body;

    if (!project_id || !name || !timeline_data) {
      return createErrorResponse(
        'project_id, name, and timeline_data are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const { data, error } = await supabaseServer
      .from('soundscapes')
      .insert({ project_id, name, timeline_data, transport_data })
      .select()
      .single();

    if (error) {
      return createErrorResponse(
        `Failed to create soundscape: ${error.message}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    return NextResponse.json({ success: true, soundscape: data }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return createErrorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
