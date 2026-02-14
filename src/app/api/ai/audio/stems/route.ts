/**
 * BS-RoFormer Stem Separation API Route
 * Separate audio into stems (vocals, drums, bass, guitar, piano, other)
 * using BS-RoFormer via HuggingFace Inference API.
 */

import { NextRequest, NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

// Allow up to 2 minutes for stem separation
export const maxDuration = 120;

const DEFAULT_MODEL = 'HiDolen/Mini-BS-RoFormer';

interface StemsResponse {
  success: boolean;
  stems?: Array<{ type: string; audioUrl: string }>;
  model?: string;
  stemMode?: string;
  error?: string;
}

/**
 * GET /api/ai/audio/stems
 * Health check — report availability and configuration
 */
export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const endpointUrl = process.env.HUGGINGFACE_STEM_ENDPOINT_URL;
  const model = process.env.HUGGINGFACE_STEM_MODEL || DEFAULT_MODEL;

  return NextResponse.json({
    available: !!apiKey,
    service: 'bs-roformer-stems',
    model,
    hasCustomEndpoint: !!endpointUrl,
  });
}

/**
 * POST /api/ai/audio/stems
 * Separate an audio file into stems
 *
 * Accepts multipart/form-data:
 * - audio: File — the audio file to process
 * - stemMode: string — '2stem' | '4stem' | '6stem' (optional, default '4stem')
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<StemsResponse>> {
  try {
    const apiKey = process.env.HUGGINGFACE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'HUGGINGFACE_API_KEY not configured. Add it to .env to enable BS-RoFormer stem separation.' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const formData = await request.formData();
    const audioFile = formData.get('audio');
    const stemMode = (formData.get('stemMode') as string) || '4stem';

    if (!audioFile || !(audioFile instanceof File)) {
      return NextResponse.json(
        { success: false, error: 'Audio file is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const endpointUrl = process.env.HUGGINGFACE_STEM_ENDPOINT_URL;
    const model = process.env.HUGGINGFACE_STEM_MODEL || DEFAULT_MODEL;

    let stems: Array<{ type: string; audioUrl: string }>;

    if (endpointUrl) {
      stems = await callDedicatedEndpoint(endpointUrl, apiKey, audioFile);
    } else {
      stems = await callServerlessInference(apiKey, model, audioFile);
    }

    return NextResponse.json({
      success: true,
      stems,
      model,
      stemMode,
    });
  } catch (error) {
    logger.error('/api/ai/audio/stems', error);
    const message = error instanceof Error ? error.message : 'Failed to separate stems';
    return NextResponse.json(
      { success: false, error: message },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

// ─── Dedicated Inference Endpoint ───────────────────────────────

async function callDedicatedEndpoint(
  endpointUrl: string,
  apiKey: string,
  audioFile: File
): Promise<Array<{ type: string; audioUrl: string }>> {
  const audioBytes = await audioFile.arrayBuffer();

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': audioFile.type || 'audio/mpeg',
    },
    body: audioBytes,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HF Endpoint error (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const results = await response.json();
  return normalizeHFOutput(results);
}

// ─── Serverless Inference API ───────────────────────────────────

async function callServerlessInference(
  apiKey: string,
  model: string,
  audioFile: File
): Promise<Array<{ type: string; audioUrl: string }>> {
  const client = new InferenceClient(apiKey);

  const audioBlob = new Blob([await audioFile.arrayBuffer()], {
    type: audioFile.type || 'audio/mpeg',
  });

  const results = await client.audioToAudio({
    model,
    inputs: audioBlob,
  });

  return normalizeHFOutput(results);
}

// ─── Output Normalization ───────────────────────────────────────

function normalizeHFOutput(
  results: Array<{ label: string; blob: string; 'content-type': string }>
): Array<{ type: string; audioUrl: string }> {
  if (!Array.isArray(results) || results.length === 0) {
    throw new Error('BS-RoFormer returned no stems. The model may not be available on this inference endpoint.');
  }

  return results.map((result) => {
    const normalizedType = normalizeStemLabel(result.label);
    const contentType = result['content-type'] || 'audio/wav';
    const audioUrl = `data:${contentType};base64,${result.blob}`;

    return { type: normalizedType, audioUrl };
  });
}

function normalizeStemLabel(label: string): string {
  const lower = label.toLowerCase().trim();

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
    'no vocals': 'other',
    'instrumental': 'other',
    'accompaniment': 'other',
    'background': 'other',
  };

  return labelMap[lower] || 'other';
}
