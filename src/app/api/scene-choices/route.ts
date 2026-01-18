/**
 * Scene Choices API Route
 *
 * Handles CRUD operations for scene choices (branching paths)
 * Supports filtering by scene_id, project_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// GET - Fetch scene choices
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get('scene_id');
    const projectId = searchParams.get('project_id');
    const targetSceneId = searchParams.get('target_scene_id');

    let query = supabaseServer
      .from('scene_choices')
      .select('*')
      .order('order', { ascending: true });

    // Apply filters
    if (sceneId) {
      query = query.eq('scene_id', sceneId);
    }

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    if (targetSceneId) {
      query = query.eq('target_scene_id', targetSceneId);
    }

    const { data, error } = await query;

    if (error) {
      return handleDatabaseError('fetch scene choices', error, 'GET /api/scene-choices');
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return handleUnexpectedError('GET /api/scene-choices', error);
  }
}

// ============================================================================
// POST - Create a new scene choice
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      scene_id,
      project_id,
      label,
      target_scene_id,
      order,
      condition,
      is_hidden,
      metadata,
    } = body;

    // Validate required fields
    if (!scene_id) {
      return createErrorResponse('scene_id is required', 400);
    }

    if (!project_id) {
      return createErrorResponse('project_id is required', 400);
    }

    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return createErrorResponse('label is required and must be a non-empty string', 400);
    }

    // Calculate order if not provided
    let choiceOrder = order;
    if (choiceOrder === undefined || choiceOrder === null) {
      const { data: existingChoices } = await supabaseServer
        .from('scene_choices')
        .select('order')
        .eq('scene_id', scene_id)
        .order('order', { ascending: false })
        .limit(1);

      choiceOrder = existingChoices && existingChoices.length > 0
        ? existingChoices[0].order + 1
        : 0;
    }

    const { data, error } = await supabaseServer
      .from('scene_choices')
      .insert({
        scene_id,
        project_id,
        label: label.trim(),
        target_scene_id: target_scene_id || null,
        order: choiceOrder,
        condition: condition || null,
        is_hidden: is_hidden || false,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (error) {
      return handleDatabaseError('create scene choice', error, 'POST /api/scene-choices');
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return handleUnexpectedError('POST /api/scene-choices', error);
  }
}

// ============================================================================
// PUT - Update an existing scene choice
// ============================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      id,
      label,
      target_scene_id,
      order,
      condition,
      is_hidden,
      metadata,
    } = body;

    if (!id) {
      return createErrorResponse('id is required', 400);
    }

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {};

    if (label !== undefined) {
      if (typeof label !== 'string' || label.trim().length === 0) {
        return createErrorResponse('label must be a non-empty string', 400);
      }
      updates.label = label.trim();
    }

    if (target_scene_id !== undefined) {
      updates.target_scene_id = target_scene_id || null;
    }

    if (order !== undefined) {
      updates.order = order;
    }

    if (condition !== undefined) {
      updates.condition = condition;
    }

    if (is_hidden !== undefined) {
      updates.is_hidden = is_hidden;
    }

    if (metadata !== undefined) {
      updates.metadata = metadata;
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabaseServer
      .from('scene_choices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return handleDatabaseError('update scene choice', error, 'PUT /api/scene-choices');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('PUT /api/scene-choices', error);
  }
}

// ============================================================================
// DELETE - Delete a scene choice
// ============================================================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return createErrorResponse('id is required', 400);
    }

    const { error } = await supabaseServer
      .from('scene_choices')
      .delete()
      .eq('id', id);

    if (error) {
      return handleDatabaseError('delete scene choice', error, 'DELETE /api/scene-choices');
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    return handleUnexpectedError('DELETE /api/scene-choices', error);
  }
}

// ============================================================================
// PATCH - Reorder choices within a scene
// ============================================================================

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const { scene_id, choice_ids } = body;

    if (!scene_id) {
      return createErrorResponse('scene_id is required', 400);
    }

    if (!Array.isArray(choice_ids) || choice_ids.length === 0) {
      return createErrorResponse('choice_ids must be a non-empty array', 400);
    }

    // Update order for each choice
    const updates = choice_ids.map((id: string, index: number) =>
      supabaseServer
        .from('scene_choices')
        .update({ order: index, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('scene_id', scene_id)
    );

    const results = await Promise.all(updates);

    // Check for errors
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      return handleDatabaseError(
        'reorder scene choices',
        errors[0].error!,
        'PATCH /api/scene-choices'
      );
    }

    // Fetch updated choices
    const { data, error } = await supabaseServer
      .from('scene_choices')
      .select('*')
      .eq('scene_id', scene_id)
      .order('order', { ascending: true });

    if (error) {
      return handleDatabaseError('fetch reordered choices', error, 'PATCH /api/scene-choices');
    }

    return NextResponse.json(data);
  } catch (error) {
    return handleUnexpectedError('PATCH /api/scene-choices', error);
  }
}
