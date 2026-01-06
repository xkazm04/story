import { NextRequest, NextResponse } from 'next/server';
import { LLMRequest, LLMResponse, OllamaGenerateRequest, DEFAULT_LLM_CONFIG } from '@/app/types/LLM';
import { logger, createErrorResponse, handleUnexpectedError } from '@/app/utils/apiErrorHandling';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || DEFAULT_LLM_CONFIG.baseUrl;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || DEFAULT_LLM_CONFIG.model;

/**
 * Ollama API response structure
 */
interface OllamaGenerateResponse {
  response: string;
  model: string;
  done: boolean;
  total_duration?: number;
  prompt_eval_count?: number;
  eval_count?: number;
}

/**
 * Ollama tags response structure
 */
interface OllamaTagsResponse {
  models?: Array<{ name: string }>;
}

/**
 * Prepares Ollama request from LLM request
 */
function prepareOllamaRequest(body: LLMRequest): OllamaGenerateRequest {
  const {
    prompt,
    model = DEFAULT_MODEL,
    temperature = DEFAULT_LLM_CONFIG.temperature,
    maxTokens = DEFAULT_LLM_CONFIG.maxTokens,
    stream = false,
    systemPrompt,
  } = body;

  const ollamaRequest: OllamaGenerateRequest = {
    model,
    prompt,
    temperature,
    max_tokens: maxTokens,
    stream,
  };

  if (systemPrompt) {
    ollamaRequest.system = systemPrompt;
  }

  return ollamaRequest;
}

/**
 * Calls Ollama generate API
 */
async function callOllamaGenerate(request: OllamaGenerateRequest): Promise<Response> {
  return await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });
}

/**
 * Transforms Ollama response to LLM response format
 */
function transformOllamaResponse(ollamaData: OllamaGenerateResponse): LLMResponse {
  return {
    content: ollamaData.response,
    model: ollamaData.model,
    done: ollamaData.done,
    totalDuration: ollamaData.total_duration,
    promptEvalCount: ollamaData.prompt_eval_count,
    evalCount: ollamaData.eval_count,
  };
}

/**
 * POST /api/llm
 *
 * Proxies requests to local Ollama instance
 * Supports both streaming and non-streaming responses
 */
export async function POST(request: NextRequest) {
  try {
    const body: LLMRequest = await request.json();

    if (!body.prompt) {
      return createErrorResponse(
        'Missing prompt',
        400,
        'Prompt is required'
      );
    }

    // Prepare Ollama request
    const ollamaRequest = prepareOllamaRequest(body);

    // Make request to Ollama
    const ollamaResponse = await callOllamaGenerate(ollamaRequest);

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      logger.error('LLM API error', new Error(`Ollama returned ${ollamaResponse.status}`), {
        endpoint: '/api/llm',
        status: ollamaResponse.status,
        errorText,
      });

      return NextResponse.json(
        {
          error: 'LLM service error',
          message: `Ollama returned ${ollamaResponse.status}: ${errorText}`,
          statusCode: ollamaResponse.status,
        },
        { status: ollamaResponse.status }
      );
    }

    // Handle streaming response
    if (body.stream) {
      return new NextResponse(ollamaResponse.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Handle non-streaming response
    const ollamaData: OllamaGenerateResponse = await ollamaResponse.json();
    const response = transformOllamaResponse(ollamaData);

    return NextResponse.json(response);
  } catch (error) {
    return handleUnexpectedError('POST /api/llm', error);
  }
}

/**
 * GET /api/llm
 *
 * Health check endpoint - verifies Ollama is accessible
 */
export async function GET() {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Cannot connect to Ollama',
          ollamaUrl: OLLAMA_BASE_URL,
        },
        { status: 503 }
      );
    }

    const data: OllamaTagsResponse = await response.json();

    return NextResponse.json({
      status: 'ok',
      message: 'Ollama is accessible',
      ollamaUrl: OLLAMA_BASE_URL,
      defaultModel: DEFAULT_MODEL,
      availableModels: data.models?.map((m) => m.name) || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Cannot connect to Ollama. Make sure Ollama is running.',
        ollamaUrl: OLLAMA_BASE_URL,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
