import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
  validateRequiredParams,
} from '@/app/utils/apiErrorHandling';

/**
 * GET /api/datasets?projectId=xxx
 * Get all datasets for a project
 */
export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');

    if (!projectId) {
      return createErrorResponse('projectId is required', 400);
    }

    const { data, error } = await supabaseServer
      .from('datasets')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      return handleDatabaseError('fetch datasets', error, 'GET /api/datasets');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('GET /api/datasets', error);
  }
}

/**
 * POST /api/datasets
 * Create a new dataset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, project_id, type, description } = body;

    const paramValidation = validateRequiredParams(
      { name, project_id },
      ['name', 'project_id']
    );
    if (paramValidation) return paramValidation;

    const { data, error } = await supabaseServer
      .from('datasets')
      .insert({
        name,
        project_id,
        type: type || 'image',
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('create dataset', error, 'POST /api/datasets');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/datasets', error);
  }
}
