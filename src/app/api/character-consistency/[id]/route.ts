/**
 * Character Consistency Issue API
 * Endpoint for resolving individual consistency issues
 */

import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { resolution_type, custom_resolution, user_feedback } = body;

    if (!resolution_type) {
      return NextResponse.json(
        { error: 'resolution_type is required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Store the issue in a database
    // 2. Update the issue with the resolution
    // 3. Apply the resolution to the relevant sources

    // For now, return a success response
    return NextResponse.json({
      issue_id: id,
      resolved: true,
      resolution_type,
      custom_resolution,
      user_feedback,
      resolved_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error resolving consistency issue:', error);
    return NextResponse.json(
      { error: 'Failed to resolve consistency issue' },
      { status: 500 }
    );
  }
}
