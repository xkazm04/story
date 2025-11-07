import { NextRequest, NextResponse } from 'next/server';
import { beatSummaryPrompt } from '@/prompts/story/beatSummary';

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
        { status: 400 }
      );
    }

    // Build context for prompt
    const context = {
      beatName,
      beatDescription,
      beatType,
      actContext,
      order,
      precedingBeatSummary,
    };

    // Generate prompt using template
    const systemPrompt = beatSummaryPrompt.system;
    const userPrompt = beatSummaryPrompt.user(context);

    // Call LLM API
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
      console.error('LLM API error:', errorData);

      return NextResponse.json(
        {
          error: 'LLM generation failed',
          message: errorData.message || 'Failed to generate summary',
        },
        { status: llmResponse.status }
      );
    }

    const llmData = await llmResponse.json();
    const summary = llmData.content.trim();

    const response: BeatSummaryResponse = {
      summary,
      beatId: body.beatName, // For tracking purposes
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Beat summary API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/beat-summary/batch
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
        { status: 400 }
      );
    }

    // Generate summaries for all beats
    const summaryPromises = beats.map(async (beat: any, index: number) => {
      const context = {
        beatName: beat.name,
        beatDescription: beat.description,
        beatType: beat.type,
        actContext: beat.actContext,
        order: index,
        precedingBeatSummary: index > 0 && beats[index - 1].summary
          ? beats[index - 1].summary
          : undefined,
      };

      const systemPrompt = beatSummaryPrompt.system;
      const userPrompt = beatSummaryPrompt.user(context);

      try {
        const llmResponse = await fetch(`${API_BASE_URL}/api/llm`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: userPrompt,
            systemPrompt,
            temperature: 0.7,
            maxTokens: 100,
            stream: false,
          }),
        });

        if (!llmResponse.ok) {
          throw new Error(`Failed to generate summary for beat: ${beat.name}`);
        }

        const llmData = await llmResponse.json();
        return {
          beatId: beat.id,
          beatName: beat.name,
          summary: llmData.content.trim(),
        };
      } catch (error) {
        console.error(`Error generating summary for beat ${beat.name}:`, error);
        return {
          beatId: beat.id,
          beatName: beat.name,
          summary: beat.description || 'Summary generation failed',
          error: true,
        };
      }
    });

    const summaries = await Promise.all(summaryPromises);

    return NextResponse.json({ summaries });
  } catch (error) {
    console.error('Batch beat summary API error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
