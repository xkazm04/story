import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import { createErrorResponse, HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * POST /api/ai/audio/upload
 * Upload a base64 audio data URL to Supabase Storage.
 * Returns the public HTTP URL for persistent storage.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audioUrl, filename, projectId } = body as {
      audioUrl: string;
      filename: string;
      projectId: string;
    };

    if (!audioUrl || !filename || !projectId) {
      return createErrorResponse('audioUrl, filename, and projectId are required', HTTP_STATUS.BAD_REQUEST);
    }

    if (!audioUrl.startsWith('data:')) {
      // Already an HTTP URL — no upload needed
      return NextResponse.json({ success: true, storageUrl: audioUrl });
    }

    // Decode base64 data URL to buffer
    const base64Match = audioUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!base64Match) {
      return createErrorResponse('Invalid data URL format', HTTP_STATUS.BAD_REQUEST);
    }

    const contentType = base64Match[1]!;
    const base64Data = base64Match[2]!;
    const buffer = Buffer.from(base64Data, 'base64');

    const storagePath = `${projectId}/sound-lab/${filename}`;

    // Try primary bucket
    const { data: uploadData, error: uploadError } = await supabaseServer.storage
      .from('story-audio')
      .upload(storagePath, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (!uploadError && uploadData) {
      const { data: urlData } = supabaseServer.storage
        .from('story-audio')
        .getPublicUrl(uploadData.path);

      return NextResponse.json({
        success: true,
        storageUrl: urlData.publicUrl,
      });
    }

    // Fallback to assets bucket
    const fallbackPath = `audio/${storagePath}`;
    const { data: fallbackData, error: fallbackError } = await supabaseServer.storage
      .from('assets')
      .upload(fallbackPath, buffer, {
        contentType,
        cacheControl: '3600',
        upsert: true,
      });

    if (fallbackError || !fallbackData) {
      return createErrorResponse(
        `Storage upload failed: ${fallbackError?.message ?? 'Unknown error'}`,
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }

    const { data: fallbackUrlData } = supabaseServer.storage
      .from('assets')
      .getPublicUrl(fallbackData.path);

    return NextResponse.json({
      success: true,
      storageUrl: fallbackUrlData.publicUrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed';
    return createErrorResponse(message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}
