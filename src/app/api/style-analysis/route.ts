/**
 * Style Analysis API Route
 *
 * Provides endpoints for analyzing character avatar styles
 * and generating consistency reports.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase/server';
import {
  handleDatabaseError,
  handleUnexpectedError,
  createErrorResponse,
} from '@/app/utils/apiErrorHandling';

// ============================================================================
// Types
// ============================================================================

interface StyleAnalysisRequest {
  imageUrl: string;
  characterId?: string;
}

interface ExtractedStyleFeatures {
  dominantColors: string[];
  colorHarmony: string;
  brightness: number;
  contrast: number;
  saturation: number;
  detectedArtStyle: string[];
  styleVector?: number[];
}

interface StyleAnalysisResponse {
  success: boolean;
  features?: ExtractedStyleFeatures;
  error?: string;
}

interface ConsistencyCheckRequest {
  projectId: string;
  styleDefinition: Record<string, unknown>;
  characterIds: string[];
}

// ============================================================================
// Mock Feature Extraction
// ============================================================================

function mockExtractStyleFeatures(imageUrl: string): ExtractedStyleFeatures {
  // Generate deterministic but varied mock data based on URL hash
  const hash = imageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const artStyles = ['anime', 'realistic', 'painterly', 'comic', 'semi-realistic'];
  const harmonies = ['monochromatic', 'complementary', 'analogous', 'triadic'];

  // Generate pseudo-random colors based on hash
  const generateColor = (seed: number): string => {
    const r = (seed * 17) % 256;
    const g = (seed * 31) % 256;
    const b = (seed * 47) % 256;
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  return {
    dominantColors: [
      generateColor(hash),
      generateColor(hash + 100),
      generateColor(hash + 200),
      generateColor(hash + 300),
      generateColor(hash + 400),
    ],
    colorHarmony: harmonies[hash % harmonies.length],
    brightness: 30 + (hash % 50),
    contrast: 40 + (hash % 40),
    saturation: 35 + (hash % 45),
    detectedArtStyle: [artStyles[hash % artStyles.length]],
    styleVector: Array.from({ length: 8 }, (_, i) => ((hash + i * 13) % 100) / 100),
  };
}

// ============================================================================
// GET - Analyze a single image
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('imageUrl');
    const characterId = searchParams.get('characterId');

    if (!imageUrl) {
      return createErrorResponse('imageUrl is required', 400);
    }

    // In production, this would call an ML service for actual feature extraction
    // For now, we use mock data that's consistent for the same URL
    const features = mockExtractStyleFeatures(imageUrl);

    // If characterId provided, we could update the character's style profile
    if (characterId) {
      // Store analysis results (optional, for caching)
      // In production, you might want to cache this in a database
    }

    const response: StyleAnalysisResponse = {
      success: true,
      features,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleUnexpectedError('GET /api/style-analysis', error);
  }
}

// ============================================================================
// POST - Batch analyze multiple images or check consistency
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'analyze-batch': {
        const { images } = body as { images: StyleAnalysisRequest[]; action: string };

        if (!images || !Array.isArray(images)) {
          return createErrorResponse('images array is required', 400);
        }

        const results = images.map(img => ({
          imageUrl: img.imageUrl,
          characterId: img.characterId,
          features: mockExtractStyleFeatures(img.imageUrl),
        }));

        return NextResponse.json({
          success: true,
          results,
        });
      }

      case 'check-consistency': {
        const { projectId, styleDefinition, characterIds } = body as ConsistencyCheckRequest;

        if (!projectId) {
          return createErrorResponse('projectId is required', 400);
        }

        // Fetch character avatars from database
        const { data: characters, error } = await supabaseServer
          .from('characters')
          .select('id, name, avatar_url')
          .in('id', characterIds.length > 0 ? characterIds : [''])
          .eq('project_id', projectId);

        if (error) {
          return handleDatabaseError('fetch characters', error, 'POST /api/style-analysis');
        }

        // Analyze each character's avatar
        const characterProfiles = (characters || []).map(char => ({
          characterId: char.id,
          characterName: char.name,
          avatarUrl: char.avatar_url,
          extractedFeatures: char.avatar_url ? mockExtractStyleFeatures(char.avatar_url) : null,
        }));

        // Calculate consistency scores
        const artDirection = typeof styleDefinition?.artDirection === 'string'
          ? styleDefinition.artDirection
          : 'semi-realistic';
        let totalScore = 0;
        const scores = characterProfiles.map(profile => {
          const features = profile.extractedFeatures;
          if (!features) {
            return {
              characterId: profile.characterId,
              characterName: profile.characterName,
              score: 0,
              matchesArtStyle: false,
            };
          }

          const matchesArtStyle = features.detectedArtStyle.includes(artDirection);
          const score = matchesArtStyle ? 70 + Math.floor(Math.random() * 30) : 30 + Math.floor(Math.random() * 30);
          totalScore += score;

          return {
            characterId: profile.characterId,
            characterName: profile.characterName,
            score,
            matchesArtStyle,
            features,
          };
        });

        const averageScore = scores.length > 0 ? Math.round(totalScore / scores.length) : 0;

        return NextResponse.json({
          success: true,
          projectId,
          overallConsistencyScore: averageScore,
          characterScores: scores,
          analyzedAt: new Date().toISOString(),
        });
      }

      case 'compare-styles': {
        const { imageUrl1, imageUrl2 } = body;

        if (!imageUrl1 || !imageUrl2) {
          return createErrorResponse('Both imageUrl1 and imageUrl2 are required', 400);
        }

        const features1 = mockExtractStyleFeatures(imageUrl1);
        const features2 = mockExtractStyleFeatures(imageUrl2);

        // Calculate similarity based on various factors
        const colorSimilarity = calculateColorArraySimilarity(
          features1.dominantColors,
          features2.dominantColors
        );
        const brightnessSimilarity = 100 - Math.abs(features1.brightness - features2.brightness);
        const saturationSimilarity = 100 - Math.abs(features1.saturation - features2.saturation);
        const artStyleMatch = features1.detectedArtStyle.some(s =>
          features2.detectedArtStyle.includes(s)
        );

        const overallSimilarity = Math.round(
          colorSimilarity * 0.4 +
          brightnessSimilarity * 0.2 +
          saturationSimilarity * 0.2 +
          (artStyleMatch ? 100 : 0) * 0.2
        );

        return NextResponse.json({
          success: true,
          similarity: {
            overall: overallSimilarity,
            color: Math.round(colorSimilarity),
            brightness: Math.round(brightnessSimilarity),
            saturation: Math.round(saturationSimilarity),
            artStyleMatch,
          },
          features1,
          features2,
        });
      }

      default:
        return createErrorResponse(`Unknown action: ${action}`, 400);
    }
  } catch (error) {
    return handleUnexpectedError('POST /api/style-analysis', error);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function calculateColorSimilarity(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const rDiff = rgb1.r - rgb2.r;
  const gDiff = rgb1.g - rgb2.g;
  const bDiff = rgb1.b - rgb2.b;

  const distance = Math.sqrt(
    2 * rDiff * rDiff + 4 * gDiff * gDiff + 3 * bDiff * bDiff
  );

  const maxDistance = Math.sqrt(2 * 255 * 255 + 4 * 255 * 255 + 3 * 255 * 255);
  const similarity = 100 - (distance / maxDistance) * 100;

  return similarity;
}

function calculateColorArraySimilarity(colors1: string[], colors2: string[]): number {
  if (colors1.length === 0 || colors2.length === 0) return 0;

  let totalSimilarity = 0;

  for (const c1 of colors1) {
    let maxSim = 0;
    for (const c2 of colors2) {
      const sim = calculateColorSimilarity(c1, c2);
      maxSim = Math.max(maxSim, sim);
    }
    totalSimilarity += maxSim;
  }

  return totalSimilarity / colors1.length;
}
