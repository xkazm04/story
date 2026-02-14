/**
 * AI Audio Director API Route
 * Uses Claude to analyze a scene and suggest audio assets
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateTextWithClaude, isClaudeAvailable } from '@/app/lib/ai';
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS } from '@/app/utils/apiErrorHandling';

interface DirectorRequest {
  sceneName: string;
  setting: string;
  mood: string;
  characters: string[];
}

interface AudioSuggestion {
  type: 'music' | 'sfx' | 'ambience';
  description: string;
  confidence: number;
  reasoning: string;
}

interface DirectorResponse {
  success: boolean;
  suggestions?: AudioSuggestion[];
  error?: string;
}

const SYSTEM_PROMPT = `You are an expert audio director for narrative storytelling. Given a scene description, you analyze the emotional and environmental context to suggest specific audio assets that would enhance the scene.

Return a JSON array of 3-4 audio suggestions. Each suggestion must have:
- "type": one of "music", "sfx", or "ambience"
- "description": a specific, actionable description that could be used as a generation prompt (e.g. "Tense orchestral strings with low brass crescendo" not just "tense music")
- "confidence": 0.0-1.0 how confident you are this fits the scene
- "reasoning": brief explanation of why this audio enhances the scene

Guidelines:
- Always include at least one music suggestion and one ambience suggestion
- SFX should be specific environmental sounds, not generic
- Music descriptions should reference instruments, tempo, and mood
- Ambience should describe layered environmental audio
- Confidence should be lower for creative/unusual choices, higher for obvious fits

Return ONLY the JSON array, no other text.`;

/**
 * GET /api/ai/audio/director
 * Health check
 */
export async function GET(): Promise<NextResponse<{ available: boolean; service: string }>> {
  const available = isClaudeAvailable();
  return NextResponse.json({
    available,
    service: 'claude-audio-director',
  });
}

/**
 * POST /api/ai/audio/director
 * Analyze a scene and suggest audio assets
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<DirectorResponse>> {
  try {
    if (!isClaudeAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Anthropic API key not configured' },
        { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      );
    }

    const body: DirectorRequest = await request.json();
    const { sceneName, setting, mood, characters } = body;

    if (!sceneName || !setting) {
      return NextResponse.json(
        { success: false, error: 'sceneName and setting are required' },
        { status: HTTP_STATUS.BAD_REQUEST }
      );
    }

    const userPrompt = `Analyze this scene and suggest audio assets:

Scene: "${sceneName}"
Setting: ${setting}
Mood: ${mood || 'unspecified'}
Characters present: ${characters?.join(', ') || 'none specified'}

Return a JSON array of 3-4 audio suggestions.`;

    const result = await generateTextWithClaude(
      userPrompt,
      SYSTEM_PROMPT,
      {
        maxTokens: 1500,
        temperature: 0.7,
        metadata: { feature: 'audio-director' },
      }
    );

    // Parse JSON from response (handle potential markdown wrapping)
    const jsonStr = result.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const suggestions: AudioSuggestion[] = JSON.parse(jsonStr);

    // Validate and clamp
    const validated = suggestions
      .filter((s) => ['music', 'sfx', 'ambience'].includes(s.type) && s.description)
      .map((s) => ({
        type: s.type,
        description: s.description,
        confidence: Math.max(0, Math.min(1, s.confidence ?? 0.8)),
        reasoning: s.reasoning ?? '',
      }));

    return NextResponse.json({
      success: true,
      suggestions: validated,
    });
  } catch (error) {
    logger.error('/api/ai/audio/director', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to analyze scene',
      },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
}
