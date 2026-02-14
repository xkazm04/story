/**
 * Audio Save API Route
 * Saves base64 audio data to local filesystem under public/audio/{type}/
 * Avoids Supabase storage — files become part of the project structure.
 */

import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

interface SaveRequest {
  audioUrl: string;
  name: string;
  type: 'music' | 'sfx' | 'ambience';
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveRequest;
    const { audioUrl, name, type } = body;

    if (!audioUrl || !name || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: audioUrl, name, type' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    if (!['music', 'sfx', 'ambience'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid type — must be music, sfx, or ambience' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // If already an HTTP URL, return as-is (no need to save)
    if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
      return NextResponse.json({
        success: true,
        savedPath: audioUrl,
        filename: name,
        alreadyRemote: true,
      });
    }

    // Decode base64 data URL
    const match = audioUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Invalid audio data — expected base64 data URL' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const base64Data = match[2]!;
    const buffer = Buffer.from(base64Data, 'base64');

    // Sanitize name → slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60);
    const timestamp = Date.now();
    const filename = `${slug}-${timestamp}.mp3`;

    // Ensure directory exists
    const dir = path.join(process.cwd(), 'public', 'audio', type);
    fs.mkdirSync(dir, { recursive: true });

    // Write file
    const filePath = path.join(dir, filename);
    fs.writeFileSync(filePath, buffer);

    const savedPath = `/audio/${type}/${filename}`;

    return NextResponse.json({
      success: true,
      savedPath,
      filename,
      size: buffer.length,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save audio';
    return NextResponse.json(
      { success: false, error: message },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
