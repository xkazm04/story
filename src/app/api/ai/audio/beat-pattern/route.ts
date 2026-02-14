/**
 * Beat Pattern Generation API Route
 *
 * Uses Claude to generate structured BeatPattern JSON from natural language prompts.
 * This is the direct/instant path (no CLI terminal streaming).
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTextWithClaude } from '@/app/lib/ai/providers/claude';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

interface BeatPatternRequest {
  prompt: string;
  genre?: string;
  bpm?: number;
  bars?: number;
}

const SYSTEM_PROMPT = `You are a professional music producer and beat programmer. Generate structured beat patterns as JSON.

**Available Instruments:** kick, snare, hihat, clap, tom, cymbal, bass, pad, arp, perc

**Output Format:** Return ONLY valid JSON, no markdown fences or explanation text:
{
  "name": "Pattern name",
  "bpm": 120,
  "swing": 0.0,
  "stepsPerBeat": 4,
  "beats": 4,
  "bars": 2,
  "genre": "genre name",
  "mood": "mood description",
  "reasoning": "Brief music theory explanation",
  "tracks": [
    {
      "instrument": "kick",
      "steps": [{"active": true, "velocity": 1.0}, {"active": false, "velocity": 0}, ...],
      "volume": 0.8,
      "muted": false
    }
  ]
}

**Rules:**
- Steps array length MUST equal stepsPerBeat * beats * bars
- Velocity range: 0.0-1.0 (ghost notes ~0.3, normal ~0.7, accents ~1.0)
- Include at least kick + snare/clap + hihat
- Use velocity variation for groove — never all 1.0
- Keep BPM realistic for genre
- Return ONLY the JSON object, nothing else`;

/**
 * POST /api/ai/audio/beat-pattern
 * Generate a beat pattern from a text prompt using Claude
 */
export async function POST(request: NextRequest) {
  try {
    const body: BeatPatternRequest = await request.json();
    const { prompt, genre, bpm, bars } = body;

    if (!prompt?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    // Build user prompt with optional constraints
    const constraints: string[] = [];
    if (genre) constraints.push(`Genre: ${genre}`);
    if (bpm) constraints.push(`BPM: ${bpm}`);
    if (bars) constraints.push(`Bars: ${bars}`);

    const userPrompt = constraints.length > 0
      ? `${prompt.trim()}\n\nConstraints:\n${constraints.join('\n')}`
      : prompt.trim();

    const responseText = await generateTextWithClaude(userPrompt, SYSTEM_PROMPT, {
      maxTokens: 4000,
      temperature: 0.7,
      metadata: { feature: 'beat-pattern' },
    });

    // Parse and validate JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      logger.error('Beat pattern: Claude returned non-JSON response', new Error(responseText.slice(0, 200)));
      return NextResponse.json(
        { success: false, error: 'Failed to parse beat pattern from AI response' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const pattern = JSON.parse(jsonMatch[0]);

    // Basic validation
    if (!pattern.tracks || !Array.isArray(pattern.tracks) || pattern.tracks.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid pattern: no tracks' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    if (!pattern.bpm || pattern.bpm < 30 || pattern.bpm > 300) {
      pattern.bpm = bpm || 120;
    }

    // Ensure defaults
    pattern.swing = pattern.swing ?? 0;
    pattern.stepsPerBeat = pattern.stepsPerBeat ?? 4;
    pattern.beats = pattern.beats ?? 4;
    pattern.bars = pattern.bars ?? (bars || 2);

    return NextResponse.json({
      success: true,
      pattern,
    });
  } catch (error) {
    logger.error('/api/ai/audio/beat-pattern', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate beat pattern',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
