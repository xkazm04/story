/**
 * ElevenLabs Stem Separation API Route
 * Separate audio into stems using ElevenLabs Music Stem Separation.
 *
 * Supports 2-stem (vocals + instrumental) and 6-stem modes.
 * Returns ZIP archive which is parsed server-side into individual stem audio URLs.
 */

import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

// Allow up to 2 minutes for stem separation
export const maxDuration = 120;

const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/music/stem-separation';

const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true';

const STEM_VARIATION_MAP: Record<string, string> = {
  '2stem': 'two_stems_v1',
  '6stem': 'six_stems_v1',
};

interface StemSeparationResponse {
  success: boolean;
  stems?: Array<{ type: string; audioUrl: string; label: string }>;
  stemMode?: string;
  provider?: string;
  error?: string;
}

/**
 * GET /api/ai/audio/stem-separation
 * Health check
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  return NextResponse.json({
    available: !!apiKey,
    service: 'elevenlabs-stem-separation',
  });
}

/**
 * POST /api/ai/audio/stem-separation
 * Separate an audio file into stems
 *
 * Accepts multipart/form-data:
 * - audio: File — the audio file to process
 * - stemMode: '2stem' | '6stem' (default '2stem')
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<StemSeparationResponse>> {
  try {
    // Mock mode
    if (USE_MOCK_DATA) {
      return handleMock(request);
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const stemMode = (formData.get('stemMode') as string) || '2stem';

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const stemVariationId = STEM_VARIATION_MAP[stemMode];
    if (!stemVariationId) {
      return NextResponse.json(
        { success: false, error: `Invalid stem mode: ${stemMode}. Use "2stem" or "6stem".` },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Build FormData for ElevenLabs
    const elFormData = new FormData();
    elFormData.append('audio', audioFile);
    elFormData.append('stem_variation_id', stemVariationId);

    const elResponse = await fetch(ELEVENLABS_API_URL, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
      },
      body: elFormData,
    });

    if (!elResponse.ok) {
      const errorText = await elResponse.text();
      logger.error('ElevenLabs Stem Separation error', new Error(errorText));
      return NextResponse.json(
        { success: false, error: `ElevenLabs stem separation error (${elResponse.status})` },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // ElevenLabs returns a ZIP archive containing stem audio files
    const zipBuffer = Buffer.from(await elResponse.arrayBuffer());

    if (zipBuffer.byteLength === 0) {
      return NextResponse.json(
        { success: false, error: 'ElevenLabs returned empty response' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    // Parse ZIP and extract stems
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();

    const stems: Array<{ type: string; audioUrl: string; label: string }> = [];

    for (const entry of entries) {
      if (entry.isDirectory) continue;

      const fileName = entry.name.toLowerCase();
      // Skip non-audio files
      if (!fileName.endsWith('.wav') && !fileName.endsWith('.mp3') && !fileName.endsWith('.flac')) continue;

      const stemType = normalizeStemFilename(fileName);
      const audioData = entry.getData();
      const contentType = fileName.endsWith('.mp3') ? 'audio/mpeg' : 'audio/wav';
      const base64 = audioData.toString('base64');
      const audioUrl = `data:${contentType};base64,${base64}`;

      stems.push({
        type: stemType,
        audioUrl,
        label: stemType.charAt(0).toUpperCase() + stemType.slice(1),
      });
    }

    if (stems.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No audio stems found in ElevenLabs response' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    return NextResponse.json({
      success: true,
      stems,
      stemMode,
      provider: 'elevenlabs',
    });
  } catch (error) {
    logger.error('/api/ai/audio/stem-separation', error);
    return NextResponse.json(
      { success: false, error: 'Failed to separate stems' },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// ─── Mock Handler ───────────────────────────────────────────────

async function handleMock(request: NextRequest): Promise<NextResponse<StemSeparationResponse>> {
  const formData = await request.formData();
  const stemMode = (formData.get('stemMode') as string) || '2stem';

  // Simulate processing delay
  await new Promise((r) => setTimeout(r, 2000));

  const mockStems: Array<{ type: string; audioUrl: string; label: string }> = stemMode === '2stem'
    ? [
        { type: 'vocals', audioUrl: 'data:audio/wav;base64,MOCK_VOCALS', label: 'Vocals' },
        { type: 'other', audioUrl: 'data:audio/wav;base64,MOCK_INSTRUMENTAL', label: 'Other' },
      ]
    : [
        { type: 'vocals', audioUrl: 'data:audio/wav;base64,MOCK_VOCALS', label: 'Vocals' },
        { type: 'drums', audioUrl: 'data:audio/wav;base64,MOCK_DRUMS', label: 'Drums' },
        { type: 'bass', audioUrl: 'data:audio/wav;base64,MOCK_BASS', label: 'Bass' },
        { type: 'guitar', audioUrl: 'data:audio/wav;base64,MOCK_GUITAR', label: 'Guitar' },
        { type: 'piano', audioUrl: 'data:audio/wav;base64,MOCK_PIANO', label: 'Piano' },
        { type: 'other', audioUrl: 'data:audio/wav;base64,MOCK_OTHER', label: 'Other' },
      ];

  return NextResponse.json({
    success: true,
    stems: mockStems,
    stemMode,
    provider: 'elevenlabs',
  });
}

// ─── Filename Normalization ───────────────────────────────────────

function normalizeStemFilename(fileName: string): string {
  const lower = fileName.replace(/\.[^.]+$/, '').toLowerCase();

  const labelMap: Record<string, string> = {
    'vocals': 'vocals',
    'vocal': 'vocals',
    'voice': 'vocals',
    'drums': 'drums',
    'drum': 'drums',
    'percussion': 'drums',
    'bass': 'bass',
    'guitar': 'guitar',
    'piano': 'piano',
    'keys': 'piano',
    'keyboard': 'piano',
    'other': 'other',
    'instrumental': 'other',
    'accompaniment': 'other',
  };

  // Check if any known label appears in the filename
  for (const [keyword, stemType] of Object.entries(labelMap)) {
    if (lower.includes(keyword)) return stemType;
  }

  return 'other';
}
