/**
 * Compose Character Prompt API Route
 * Generate an image generation prompt from character appearance data using Groq LLM
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import {
  createErrorResponse,
  HTTP_STATUS,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';

/**
 * System prompt for character image generation
 */
const CHARACTER_PROMPT_SYSTEM = `You are an expert at creating detailed character image generation prompts for high-end text-to-image models.

Your task is to take character appearance data and convert it into a cohesive, highly descriptive prompt for generating a full-body character illustration.

RULES:
1. The prompt MUST NOT exceed 1500 characters
2. If an art style is provided, establish it immediately at the beginning
3. Always describe a full-body character illustration, not a portrait or close-up
4. Include the pose and expression naturally in the description
5. Use rich descriptive adjectives for clothing textures, colors, and details
6. Describe the character's presence and atmosphere
7. Do not use the word "portrait" - use "illustration" or "full-body illustration"
8. Output ONLY the image generation prompt text, nothing else

OUTPUT FORMAT:
A single paragraph prompt starting with the art style, then the character description, pose, expression, and atmosphere.`;

/**
 * Pose options for character generation
 */
const POSE_DESCRIPTIONS: Record<string, string> = {
  heroic: 'standing in a heroic pose with confident stance, feet shoulder-width apart',
  battle: 'in a battle-ready stance, weapon drawn and alert',
  casual: 'standing relaxed with a casual, approachable posture',
  sitting: 'seated comfortably with a relaxed demeanor',
  walking: 'mid-stride in a dynamic walking pose',
  action: 'in dynamic action pose with dramatic movement',
  mysterious: 'partially shrouded in shadow with an enigmatic presence',
  regal: 'standing with noble, commanding presence',
};

/**
 * Expression options for character generation
 */
const EXPRESSION_DESCRIPTIONS: Record<string, string> = {
  determined: 'with a determined, focused expression',
  serene: 'with a calm, serene expression',
  fierce: 'with a fierce, intense gaze',
  cunning: 'with a cunning, knowing smirk',
  noble: 'with a noble, dignified expression',
  haunted: 'with haunted, distant eyes',
  joyful: 'with a warm, joyful smile',
  mysterious: 'with an inscrutable, mysterious expression',
};

/**
 * Archetype descriptions for character generation
 */
const ARCHETYPE_DESCRIPTIONS: Record<string, string> = {
  knight: 'armored warrior, honorable protector',
  wizard: 'mystical spellcaster with arcane power',
  assassin: 'stealthy shadow operative',
  ranger: 'wilderness expert and skilled tracker',
  cleric: 'divine healer with holy power',
  barbarian: 'fierce tribal warrior',
  bard: 'charismatic performer and storyteller',
  rogue: 'cunning trickster and thief',
};

/**
 * Call Groq LLM API for character prompt composition
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
        max_tokens: 1024,
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
 * Build fallback prompt without AI
 */
function buildFallbackPrompt(
  appearance: Record<string, unknown>,
  selections: { archetype?: string; pose?: string; expression?: string },
  artStyle?: string
): string {
  const parts: string[] = [];

  // Art style first
  if (artStyle) {
    parts.push(artStyle);
  }

  // Full-body illustration directive
  parts.push('Full-body character illustration,');

  // Archetype
  if (selections.archetype && ARCHETYPE_DESCRIPTIONS[selections.archetype]) {
    parts.push(ARCHETYPE_DESCRIPTIONS[selections.archetype] + ',');
  }

  // Character details from appearance
  const gender = appearance.gender || 'character';
  const age = appearance.age || '';
  const skinColor = appearance.skinColor || '';
  const bodyType = appearance.bodyType || '';
  const height = appearance.height || '';

  if (age || skinColor || bodyType || height) {
    parts.push(`${age} ${gender} with ${skinColor} skin, ${bodyType} ${height} build,`.replace(/\s+/g, ' '));
  }

  // Facial features
  const face = appearance.face as Record<string, string> | undefined;
  if (face) {
    const faceDetails = [
      face.hairColor && face.hairStyle ? `${face.hairColor} ${face.hairStyle} hair` : '',
      face.eyeColor ? `${face.eyeColor} eyes` : '',
      face.features || '',
    ].filter(Boolean).join(', ');
    if (faceDetails) {
      parts.push(faceDetails + ',');
    }
  }

  // Clothing
  const clothing = appearance.clothing as Record<string, string> | undefined;
  if (clothing) {
    const clothingDetails = [
      clothing.style || '',
      clothing.color ? `in ${clothing.color}` : '',
      clothing.accessories || '',
    ].filter(Boolean).join(' ');
    if (clothingDetails) {
      parts.push(`wearing ${clothingDetails},`);
    }
  }

  // Pose
  if (selections.pose && POSE_DESCRIPTIONS[selections.pose]) {
    parts.push(POSE_DESCRIPTIONS[selections.pose] + ',');
  }

  // Expression
  if (selections.expression && EXPRESSION_DESCRIPTIONS[selections.expression]) {
    parts.push(EXPRESSION_DESCRIPTIONS[selections.expression] + ',');
  }

  // Custom features
  if (appearance.customFeatures) {
    parts.push(String(appearance.customFeatures) + ',');
  }

  // Closing atmosphere
  parts.push('highly detailed, professional illustration quality');

  let prompt = parts.join(' ').replace(/,\s*,/g, ',').replace(/\s+/g, ' ').trim();

  // Ensure max length
  if (prompt.length > 1500) {
    prompt = prompt.substring(0, 1497) + '...';
  }

  return prompt;
}

/**
 * POST /api/ai/compose-character-prompt
 * Generate an image prompt from character appearance data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      characterName,
      appearance,
      selections = {},
      artStyle,
    } = body;

    if (!appearance || typeof appearance !== 'object') {
      return createErrorResponse(
        'Character appearance data is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Build user prompt for Groq
    let userPrompt = 'Create a full-body character illustration prompt for the following character:\n\n';

    if (characterName) {
      userPrompt += `Character Name: ${characterName}\n`;
    }

    if (artStyle) {
      userPrompt += `Art Style: ${artStyle}\n\n`;
    }

    // Add appearance details
    userPrompt += 'Character Appearance:\n';
    userPrompt += `- Gender: ${appearance.gender || 'unspecified'}\n`;
    userPrompt += `- Age: ${appearance.age || 'unspecified'}\n`;
    userPrompt += `- Skin: ${appearance.skinColor || 'unspecified'}\n`;
    userPrompt += `- Body Type: ${appearance.bodyType || 'unspecified'}\n`;
    userPrompt += `- Height: ${appearance.height || 'unspecified'}\n`;

    const face = appearance.face as Record<string, string> | undefined;
    if (face) {
      userPrompt += `- Hair: ${face.hairColor || ''} ${face.hairStyle || ''}\n`;
      userPrompt += `- Eyes: ${face.eyeColor || ''}\n`;
      userPrompt += `- Face Shape: ${face.shape || ''}\n`;
      if (face.features) userPrompt += `- Distinctive Features: ${face.features}\n`;
      if (face.facialHair) userPrompt += `- Facial Hair: ${face.facialHair}\n`;
    }

    const clothing = appearance.clothing as Record<string, string> | undefined;
    if (clothing) {
      userPrompt += `- Clothing Style: ${clothing.style || ''}\n`;
      userPrompt += `- Clothing Colors: ${clothing.color || ''}\n`;
      if (clothing.accessories) userPrompt += `- Accessories: ${clothing.accessories}\n`;
    }

    if (appearance.customFeatures) {
      userPrompt += `- Additional Features: ${appearance.customFeatures}\n`;
    }

    // Add selections
    if (selections.archetype) {
      userPrompt += `\nArchetype: ${selections.archetype}`;
      if (ARCHETYPE_DESCRIPTIONS[selections.archetype]) {
        userPrompt += ` (${ARCHETYPE_DESCRIPTIONS[selections.archetype]})`;
      }
      userPrompt += '\n';
    }

    if (selections.pose) {
      userPrompt += `Pose: ${selections.pose}`;
      if (POSE_DESCRIPTIONS[selections.pose]) {
        userPrompt += ` - ${POSE_DESCRIPTIONS[selections.pose]}`;
      }
      userPrompt += '\n';
    }

    if (selections.expression) {
      userPrompt += `Expression: ${selections.expression}`;
      if (EXPRESSION_DESCRIPTIONS[selections.expression]) {
        userPrompt += ` - ${EXPRESSION_DESCRIPTIONS[selections.expression]}`;
      }
      userPrompt += '\n';
    }

    userPrompt += '\nGenerate a cohesive full-body character illustration prompt (max 1500 characters). Output ONLY the prompt text.';

    // Try AI composition, fall back to template if unavailable
    let generatedPrompt: string;
    let usedFallback = false;
    let model: string | undefined;

    try {
      const result = await callGroqLLM(userPrompt, CHARACTER_PROMPT_SYSTEM);
      generatedPrompt = result.content.trim();
      model = result.model;

      // Clean up the response
      generatedPrompt = generatedPrompt
        .replace(/^```[\w]*\n?/g, '')
        .replace(/\n?```$/g, '')
        .replace(/^["']|["']$/g, '')
        .replace(/^Here is the (?:prompt|image prompt)[^:]*:\s*/i, '')
        .trim();
    } catch (error) {
      logger.warn('Groq API unavailable, using fallback prompt composition', { error });
      generatedPrompt = buildFallbackPrompt(appearance, selections, artStyle);
      usedFallback = true;
    }

    // Ensure max length
    if (generatedPrompt.length > 1500) {
      generatedPrompt = generatedPrompt.substring(0, 1497) + '...';
    }

    return NextResponse.json({
      success: true,
      prompt: generatedPrompt,
      usedFallback,
      provider: usedFallback ? 'fallback' : 'groq',
      model,
    });
  } catch (error) {
    logger.apiError('/api/ai/compose-character-prompt', error);

    return createErrorResponse(
      error instanceof Error ? error.message : 'Failed to compose character prompt',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

/**
 * GET /api/ai/compose-character-prompt
 * Check if character prompt composition is available
 */
export async function GET() {
  const available = !!process.env.GROQ_API_KEY;

  return NextResponse.json({
    available,
    service: 'groq',
    model: 'llama-3.3-70b-versatile',
    poses: Object.keys(POSE_DESCRIPTIONS),
    expressions: Object.keys(EXPRESSION_DESCRIPTIONS),
    archetypes: Object.keys(ARCHETYPE_DESCRIPTIONS),
  });
}
