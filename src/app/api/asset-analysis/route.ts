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
import { logger } from '@/app/utils/logger';
import { HTTP_STATUS, API_CONSTANTS, createErrorResponse } from '@/app/utils/apiErrorHandling';

/**
 * Validates file upload from form data
 */
function validateFileUpload(file: File | null, configJson: string | null): NextResponse | null {
  if (!file) {
    return createErrorResponse('No file uploaded', HTTP_STATUS.BAD_REQUEST);
  }

  if (!configJson) {
    return createErrorResponse('Analysis config is required', HTTP_STATUS.BAD_REQUEST);
  }

  return null;
}

/**
 * Parses and validates analysis configuration
 */
function parseAnalysisConfig(configJson: string): { config: AnalysisConfig | null; error: NextResponse | null } {
  let config: AnalysisConfig;

  try {
    config = JSON.parse(configJson);
  } catch {
    return {
      config: null,
      error: createErrorResponse('Invalid config JSON', HTTP_STATUS.BAD_REQUEST)
    };
  }

  // Validate that at least one model is enabled
  const hasEnabledModel =
    config.openai?.enabled || config.gemini?.enabled || config.groq?.enabled;

  if (!hasEnabledModel) {
    return {
      config: null,
      error: createErrorResponse('At least one AI model must be enabled', HTTP_STATUS.BAD_REQUEST)
    };
  }

  return { config, error: null };
}

/**
 * Saves uploaded file to temporary location
 */
async function saveTempFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  // Create temp file path
  const tempDir = os.tmpdir();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  const ext = path.extname(file.name) || '.jpg';
  const tempFilePath = path.join(tempDir, `upload_${timestamp}_${random}${ext}`);

  await writeFile(tempFilePath, buffer);
  return tempFilePath;
}

/**
 * Runs analysis with timeout
 */
async function runAnalysisWithTimeout(tempFilePath: string, config: AnalysisConfig) {
  const analysisPromise = analyzeImageMultiModel(tempFilePath, config);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Analysis timeout')), API_CONSTANTS.ANALYSIS_TIMEOUT_MS)
  );

  return await Promise.race([analysisPromise, timeoutPromise]);
}

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

    // Validate file upload
    const fileValidationError = validateFileUpload(file, configJson);
    if (fileValidationError) return fileValidationError;

    // Parse and validate config
    const { config, error: configError } = parseAnalysisConfig(configJson);
    if (configError) return configError;

    // Save uploaded file to temporary location
    tempFilePath = await saveTempFile(file);

    // Run parallel analysis with enabled models with timeout
    const results = await runAnalysisWithTimeout(tempFilePath, config!);

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

    logger.apiError('POST /api/asset-analysis', error);

    // Check for timeout
    if (error instanceof Error && error.message === 'Analysis timeout') {
      return createErrorResponse(
        `Analysis timeout - operation took longer than ${API_CONSTANTS.ANALYSIS_TIMEOUT_MS / 1000} seconds`,
        API_CONSTANTS.GATEWAY_TIMEOUT
      );
    }

    return createErrorResponse(
      'Image analysis failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      error instanceof Error ? error.message : 'Unknown error'
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

