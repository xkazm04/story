// app/api/asset-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import os from 'os';
import {
  analyzeImageMultiModel,
  AnalysisConfig,
  AnalyzedAsset,
} from '@/app/lib/services/imageAnalysis';
import { cleanupTempImage } from '@/app/lib/services/imageProcessing';

/**
 * POST /api/asset-analysis
 * Analyze uploaded image with multiple AI models (OpenAI, Gemini, Groq)
 * Replaces char-service POST /analyze/ endpoint
 */
export async function POST(request: NextRequest) {
  let tempFilePath: string | null = null;

  try {
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const configJson = formData.get('config') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    if (!configJson) {
      return NextResponse.json(
        { error: 'Analysis config is required' },
        { status: 400 }
      );
    }

    // Parse analysis configuration
    let config: AnalysisConfig;
    try {
      config = JSON.parse(configJson);
    } catch {
      return NextResponse.json(
        { error: 'Invalid config JSON' },
        { status: 400 }
      );
    }

    // Validate that at least one model is enabled
    const hasEnabledModel =
      config.openai?.enabled || config.gemini?.enabled || config.groq?.enabled;

    if (!hasEnabledModel) {
      return NextResponse.json(
        { error: 'At least one AI model must be enabled' },
        { status: 400 }
      );
    }

    // Save uploaded file to temporary location
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create temp file path
    const tempDir = os.tmpdir();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    const ext = path.extname(file.name) || '.jpg';
    tempFilePath = path.join(tempDir, `upload_${timestamp}_${random}${ext}`);

    await writeFile(tempFilePath, buffer);

    // Run parallel analysis with enabled models
    // Set timeout to 120 seconds (same as FastAPI version)
    const analysisPromise = analyzeImageMultiModel(tempFilePath, config);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Analysis timeout')), 120000)
    );

    const results = await Promise.race([analysisPromise, timeoutPromise]);

    // Clean up temp file
    if (tempFilePath) {
      await cleanupTempImage(tempFilePath);
      tempFilePath = null;
    }

    // Return results in same format as FastAPI
    return NextResponse.json(results);
  } catch (error) {
    // Clean up temp file on error
    if (tempFilePath) {
      await cleanupTempImage(tempFilePath);
    }

    console.error('Image analysis failed:', error);

    // Check for timeout
    if (error instanceof Error && error.message === 'Analysis timeout') {
      return NextResponse.json(
        { error: 'Analysis timeout - operation took longer than 120 seconds' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: 'Image analysis failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/asset-analysis
 * Returns API information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/asset-analysis',
    method: 'POST',
    description: 'Multi-model AI image analysis for game asset extraction',
    supported_models: ['openai', 'gemini', 'groq'],
    request_format: {
      file: 'Image file (multipart/form-data)',
      config: 'JSON string with model configuration',
    },
    config_example: {
      openai: { enabled: true },
      gemini: { enabled: true },
      groq: { enabled: false },
    },
    response_format: {
      openai: 'Array of analyzed assets',
      gemini: 'Array of analyzed assets',
      groq: 'Array of analyzed assets',
    },
    timeout: '120 seconds',
  });
}

