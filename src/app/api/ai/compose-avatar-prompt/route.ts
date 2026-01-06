/**
 * Compose Avatar Prompt API Route
 * Generate a face-focused avatar prompt from character appearance data using Groq LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';

/**
 * Avatar style configurations
 */
const AVATAR_STYLES: Record<string, { name: string; prompt: string; suffix: string }> = {
  pixel: {
    name: 'Pixel Art',
    prompt: '16-bit pixel art style, retro gaming aesthetic, limited color palette, crisp pixels',
    suffix: 'pixel art portrait, game sprite style',
  },
  rpg: {
    name: 'RPG Classic',
    prompt: 'classic RPG portrait style, JRPG character art, vibrant colors, clean linework',
    suffix: 'RPG game portrait, character select screen',
  },
  chibi: {
    name: 'Chibi',
    prompt: 'chibi style, super deformed proportions, cute oversized head, expressive eyes',
    suffix: 'chibi portrait, kawaii style',
  },
  portrait: {
    name: 'Portrait',
    prompt: 'realistic portrait style, detailed facial features, professional quality',
    suffix: 'portrait illustration, detailed face',
  },
  cartoon: {
    name: 'Cartoon',
    prompt: 'western cartoon style, bold outlines, expressive features, comic book aesthetic',
    suffix: 'cartoon portrait, animated style',
  },
  handdrawn: {
    name: 'Sketch',
    prompt: 'hand-drawn sketch style, pencil strokes, artistic imperfection, traditional media feel',
    suffix: 'sketch portrait, hand-drawn illustration',
  },
  story: {
    name: 'Story Style',
    prompt: 'narrative illustration style, storybook aesthetic, evocative and atmospheric',
    suffix: 'story illustration portrait',
  },
};

/**
 * System prompt for avatar generation
 */
const AVATAR_PROMPT_SYSTEM = `You are an expert at creating focused character avatar prompts for text-to-image models.

Your task is to create a portrait/avatar-focused prompt from character appearance data.

RULES:
1. The prompt MUST NOT exceed 800 characters
2. Focus on facial features, expression, and upper body only
3. If an art style is provided, incorporate it naturally
4. Emphasize the character's most distinctive visual traits
5. Include lighting and mood that suits the character
6. Output ONLY the avatar prompt text, nothing else

OUTPUT FORMAT:
A single paragraph prompt focused on creating a character avatar/portrait.`;

/**
 * Call Groq LLM API for avatar prompt composition
 */
async function callGroqLLM(
  userPrompt: string,
  systemPrompt: string
): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('Groq API key not configured');
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: API_CONSTANTS.GROQ_TEMPERATURE,
        max_tokens: 512,
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Groq API error: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return { content, model: data.model };
}

/**
 * Build fallback avatar prompt without AI
 */
function buildFallbackPrompt(
  appearance: Record<string, unknown>,
  style: string,
  artStyle?: string
): string {
  const parts: string[] = [];
  const styleConfig = AVATAR_STYLES[style] || AVATAR_STYLES.portrait;

  // Art style first
  if (artStyle) {
    parts.push(artStyle);
  }

  // Avatar style
  parts.push(styleConfig.prompt);

  // Character portrait directive
  parts.push('Character avatar,');

  // Facial features
  const face = appearance.face as Record<string, string> | undefined;
  if (face) {
    const faceDetails = [
      face.hairColor && face.hairStyle ? `${face.hairColor} ${face.hairStyle} hair` : '',
      face.eyeColor ? `${face.eyeColor} eyes` : '',
      face.shape ? `${face.shape} face` : '',
      face.features || '',
      face.facialHair ? `${face.facialHair}` : '',
    ].filter(Boolean).join(', ');
    if (faceDetails) {
      parts.push(faceDetails + ',');
    }
  }

  // Basic character info
  const gender = appearance.gender || '';
  const age = appearance.age || '';
  const skinColor = appearance.skinColor || '';

  if (gender || age || skinColor) {
    parts.push(`${age} ${gender} with ${skinColor} skin,`.replace(/\s+/g, ' '));
  }

  // Style suffix
  parts.push(styleConfig.suffix);

  // Quality tags
  parts.push('high quality, detailed');

  let prompt = parts.join(' ').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

  // Ensure max length
  if (prompt.length > 800) {
    prompt = prompt.substring(0, 797) + '...';
  }

  return prompt;
}

/**
 * POST /api/ai/compose-avatar-prompt
 * Generate an avatar prompt from character appearance data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      characterName,
      appearance,
      style = 'portrait',
      artStyle,
    } = body;

    if (!appearance || typeof appearance !== 'object') {
      return createErrorResponse(
        'Character appearance data is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    if (!AVATAR_STYLES[style]) {
      return createErrorResponse(
        `Invalid style. Must be one of: ${Object.keys(AVATAR_STYLES).join(', ')}`,
        HTTP_STATUS.BAD_REQUEST
      );
    }

    const styleConfig = AVATAR_STYLES[style];

    // Build user prompt for Groq
    let userPrompt = `Create a ${styleConfig.name} style character avatar prompt for:\n\n`;

    if (characterName) {
      userPrompt += `Character Name: ${characterName}\n`;
    }

    userPrompt += `Avatar Style: ${styleConfig.name} - ${styleConfig.prompt}\n\n`;

    if (artStyle) {
      userPrompt += `Project Art Style: ${artStyle}\n\n`;
    }

    // Add appearance details focused on face
    userPrompt += 'Character Appearance:\n';
    userPrompt += `- Gender: ${appearance.gender || 'unspecified'}\n`;
    userPrompt += `- Age: ${appearance.age || 'unspecified'}\n`;
    userPrompt += `- Skin: ${appearance.skinColor || 'unspecified'}\n`;

    const face = appearance.face as Record<string, string> | undefined;
    if (face) {
      userPrompt += `- Hair: ${face.hairColor || ''} ${face.hairStyle || ''}\n`;
      userPrompt += `- Eyes: ${face.eyeColor || ''}\n`;
      userPrompt += `- Face Shape: ${face.shape || ''}\n`;
      if (face.features) userPrompt += `- Distinctive Features: ${face.features}\n`;
      if (face.facialHair) userPrompt += `- Facial Hair: ${face.facialHair}\n`;
    }

    if (appearance.customFeatures) {
      userPrompt += `- Additional Features: ${appearance.customFeatures}\n`;
    }

    userPrompt += '\nGenerate a focused avatar/portrait prompt (max 800 characters). Output ONLY the prompt text.';

    // Try AI composition, fall back to template if unavailable
    let generatedPrompt: string;
    let usedFallback = false;
    let model: string | undefined;

    try {
      const result = await callGroqLLM(userPrompt, AVATAR_PROMPT_SYSTEM);
      generatedPrompt = result.content.trim();
      model = result.model;

      // Clean up the response
      generatedPrompt = generatedPrompt
        .replace(/^```[\w]*\n?/g, '')
        .replace(/\n?```$/g, '')
        .replace(/^["']|["']$/g, '')
        .replace(/^Here is the (?:prompt|avatar prompt)[^:]*:\s*/i, '')
        .trim();
    } catch (error) {
      logger.warn('Groq API unavailable, using fallback avatar prompt composition', { error });
      generatedPrompt = buildFallbackPrompt(appearance, style, artStyle);
      usedFallback = true;
    }

    // Ensure max length
    if (generatedPrompt.length > 800) {
      generatedPrompt = generatedPrompt.substring(0, 797) + '...';
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      usedFallback,
      provider: usedFallback ? 'fallback' : 'groq',
      model,
      style: styleConfig.name,
    });
  } catch (error) {
    logger.apiError('/api/ai/compose-avatar-prompt', error);

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to compose avatar prompt',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/ai/compose-avatar-prompt
 * Get available avatar styles
 */
export async function GET() {
  const available = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    available,
    service: 'groq',
    model: 'llama-3.3-70b-versatile',
    styles: Object.entries(AVATAR_STYLES).map(([id, config]) => ({
      id,
      name: config.name,
      description: config.prompt.split(',')[0],
    })),
  });
}
