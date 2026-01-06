import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';

interface Context {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  files?: any[];
  test_scenario?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * GET /api/contexts
 * Fetch contexts, optionally filtered by project_id or context id
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const contextId = searchParams.get('id');

    const supabase = supabaseServer;
    let query = supabase.from('contexts').select('*');

    if (contextId) {
      query = query.eq('id', contextId);
    } else if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching contexts:', error);
      return NextResponse.json(
        { error: 'Failed to fetch contexts', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Unexpected error in GET /api/contexts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/contexts
 * Create a new context
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, project_id, name, description, files, test_scenario } = body;

    if (!id || !project_id || !name) {
      return NextResponse.json(
        { error: 'Missing required fields: id, project_id, name' },
        { status: 400 }
      );
    }

    const contextData: Context = {
      id,
      project_id,
      name,
      description,
      files: files || [],
      test_scenario: test_scenario || null,
    };

    const supabase = supabaseServer;
    const { data, error } = await supabase
      .from('contexts')
      .insert([contextData])
      .select()
      .single();

    if (error) {
      console.error('Error creating context:', error);
      return NextResponse.json(
        { error: 'Failed to create context', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Unexpected error in POST /api/contexts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/contexts
 * Update an existing context
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { contextId, updates } = body;

    if (!contextId) {
      return NextResponse.json(
        { error: 'Missing required field: contextId' },
        { status: 400 }
      );
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json(
        { error: 'Missing or invalid updates object' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;
    const { data, error } = await supabase
      .from('contexts')
      .update(updates)
      .eq('id', contextId)
      .select()
      .single();

    if (error) {
      console.error('Error updating context:', error);
      return NextResponse.json(
        { error: 'Failed to update context', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Context not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in PUT /api/contexts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/contexts
 * Delete a context by id
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contextId = searchParams.get('id');

    if (!contextId) {
      return NextResponse.json(
        { error: 'Missing required parameter: id' },
        { status: 400 }
      );
    }

    const supabase = supabaseServer;
    const { error } = await supabase
      .from('contexts')
      .delete()
      .eq('id', contextId);

    if (error) {
      console.error('Error deleting context:', error);
      return NextResponse.json(
        { error: 'Failed to delete context', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/contexts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
