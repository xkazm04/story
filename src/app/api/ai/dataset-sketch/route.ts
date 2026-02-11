import { NextRequest, NextResponse } from 'next/server';
import { generateTextWithClaude, isClaudeAvailable, AIError } from '@/app/lib/ai';

interface SketchRequest {
  basePrompt: string;
  type: 'artstyle' | 'character';
  count: number;
  enhance: boolean;
}

/**
 * POST /api/ai/dataset-sketch
 * Generate prompt variations for dataset image generation
 */
export async function POST(request: NextRequest) {
  try {
    const body: SketchRequest = await request.json();
    const { basePrompt, type, count, enhance } = body;

    if (!basePrompt || !type || !count) {
      return NextResponse.json(
        { success: false, error: 'basePrompt, type, and count are required' },
        { status: 400 }
      );
    }

    const clampedCount = Math.min(Math.max(count, 1), 20);

    // Without enhancement, return copies with variation numbering
    if (!enhance) {
      const prompts = Array.from({ length: clampedCount }, (_, i) => ({
        id: `var-${Date.now()}-${i}`,
        text: basePrompt,
      }));

      return NextResponse.json({ success: true, prompts });
    }

    // With enhancement, use Claude to generate distinct variations
    if (!isClaudeAvailable()) {
      return NextResponse.json(
        { success: false, error: 'Claude API key not configured' },
        { status: 503 }
      );
    }

    const systemPrompt = `You are an expert AI art director specializing in ${type === 'artstyle' ? 'art style exploration' : 'character design'}.

Given a base prompt, generate exactly ${clampedCount} distinct prompt variations. Each variation should:
- Explore a different angle, mood, or interpretation while keeping the core concept
- Be a complete, self-contained image generation prompt
- Be under 1500 characters
- ${type === 'artstyle' ? 'Vary the artistic style, lighting, color palette, or composition' : 'Vary the pose, expression, outfit, setting, or angle'}

Return ONLY a JSON array of strings, no other text. Example:
["variation 1 text", "variation 2 text"]`;

    const userPrompt = `Base prompt: "${basePrompt}"

Generate ${clampedCount} distinct variations.`;

    const result = await generateTextWithClaude(userPrompt, systemPrompt, {
      maxTokens: 4000,
      temperature: 0.9,
      skipCache: true,
      metadata: { feature: 'dataset-sketch' },
    });

    // Parse the JSON response
    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json(
        { success: false, error: 'Failed to parse AI response' },
        { status: 500 }
      );
    }

    const variations: string[] = JSON.parse(jsonMatch[0]);
    const prompts = variations.slice(0, clampedCount).map((text, i) => ({
      id: `var-${Date.now()}-${i}`,
      text,
    }));

    return NextResponse.json({ success: true, prompts });
  } catch (error) {
    console.error('Dataset sketch error:', error);

    if (error instanceof AIError) {
      return NextResponse.json(
        { success: false, error: `AI error: ${error.message}` },
        { status: error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate prompt variations' },
      { status: 500 }
    );
  }
}
