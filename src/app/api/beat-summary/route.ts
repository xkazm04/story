import { NextRequest, NextResponse } from 'next/server';
import { beatSummaryPrompt } from '@/prompts/story/beatSummary';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

interface BeatSummaryRequest {
  beatName: string;
  beatDescription?: string;
  beatType?: string;
  actContext?: string;
  order?: number;
  precedingBeatSummary?: string;
}

interface BeatSummaryResponse {
  summary: string;
  beatId: string;
}

interface BeatContext {
  beatName: string;
  beatDescription?: string;
  beatType?: string;
  actContext?: string;
  order?: number;
  precedingBeatSummary?: string;
}

/**
 * Generates a single beat summary using LLM
 */
async function generateBeatSummary(context: BeatContext): Promise<string> {
  const systemPrompt = beatSummaryPrompt.system;
  const userPrompt = beatSummaryPrompt.user(context);

  const llmResponse = await fetch(`${API_BASE_URL}/api/llm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: userPrompt,
      systemPrompt,
      temperature: 0.7,
      maxTokens: 100, // Keep summaries concise
      stream: false,
    }),
  });

  if (!llmResponse.ok) {
    const errorData = await llmResponse.json();
    throw new Error(errorData.message || 'Failed to generate summary');
  }

  const llmData = await llmResponse.json();
  return llmData.content.trim();
}

/**
 * POST /api/beat-summary
 *
 * Generates concise narrative summaries for beat cards using LLM
 * Optimized for visual cards and quick scanning of plot structure
 */
export async function POST(request: NextRequest) {
  try {
    const body: BeatSummaryRequest = await request.json();

    const {
      beatName,
      beatDescription,
      beatType,
      actContext,
      order,
      precedingBeatSummary,
    } = body;

    // Validate required fields
    if (!beatName) {
      return NextResponse.json(
        { error: 'Missing beat name', message: 'Beat name is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Build context for prompt
    const context: BeatContext = {
      beatName,
      beatDescription,
      beatType,
      actContext,
      order,
      precedingBeatSummary,
    };

    const summary = await generateBeatSummary(context);

    const response: BeatSummaryResponse = {
      summary,
      beatId: body.beatName, // For tracking purposes
    };

    return NextResponse.json(response);
  } catch (error) {
    logger.apiError('POST /api/beat-summary', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}

/**
 * Generates summary for a single beat in batch processing
 */
async function generateBatchBeatSummary(
  beat: Record<string, unknown>,
  index: number,
  beats: Record<string, unknown>[]
): Promise<{
  beatId: unknown;
  beatName: unknown;
  summary: string;
  error?: boolean;
}> {
  const context: BeatContext = {
    beatName: beat.name as string,
    beatDescription: beat.description as string | undefined,
    beatType: beat.type as string | undefined,
    actContext: beat.actContext as string | undefined,
    order: index,
    precedingBeatSummary:
      index > 0 && beats[index - 1].summary
        ? (beats[index - 1].summary as string)
        : undefined,
  };

  try {
    const summary = await generateBeatSummary(context);
    return {
      beatId: beat.id,
      beatName: beat.name,
      summary,
    };
  } catch (error) {
    logger.error(`Error generating summary for beat ${beat.name as string}`, error);
    return {
      beatId: beat.id,
      beatName: beat.name,
      summary: (beat.description as string) || 'Summary generation failed',
      error: true,
    };
  }
}

/**
 * PUT /api/beat-summary
 *
 * Generates summaries for multiple beats in a single request
 * More efficient for generating summaries for entire act or project
 */
export async function PUT(request: NextRequest) {
  try {
    const { beats } = await request.json();

    if (!beats || !Array.isArray(beats)) {
      return NextResponse.json(
        { error: 'Invalid request', message: 'beats array is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Generate summaries for all beats
    const summaryPromises = beats.map((beat, index) =>
      generateBatchBeatSummary(beat, index, beats)
    );

    const summaries = await Promise.all(summaryPromises);

    return NextResponse.json({ summaries });
  } catch (error) {
    logger.apiError('PUT /api/beat-summary (batch)', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
