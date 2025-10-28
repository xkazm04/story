import { NextRequest, NextResponse } from 'next/server';
import { LLMRequest, LLMResponse, OllamaGenerateRequest, OllamaGenerateResponse, DEFAULT_LLM_CONFIG } from '@/app/types/LLM';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || DEFAULT_LLM_CONFIG.baseUrl;
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || DEFAULT_LLM_CONFIG.model;

/**
 * POST /api/llm
 *
 * Proxies requests to local Ollama instance
 * Supports both streaming and non-streaming responses
 */
export async function POST(request: NextRequest) {
  try {
    const body: LLMRequest = await request.json();

    const {
      prompt,
      model = DEFAULT_MODEL,
      temperature = DEFAULT_LLM_CONFIG.temperature,
      maxTokens = DEFAULT_LLM_CONFIG.maxTokens,
      stream = false,
      systemPrompt,
    } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: 'Missing prompt', message: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Prepare Ollama request
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

    // Make request to Ollama
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ollamaRequest),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API error:', errorText);

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
    if (stream) {
      // For streaming, we need to pass through the response
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

    const response: LLMResponse = {
      content: ollamaData.response,
      model: ollamaData.model,
      done: ollamaData.done,
      totalDuration: ollamaData.total_duration,
      promptEvalCount: ollamaData.prompt_eval_count,
      evalCount: ollamaData.eval_count,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('LLM API error:', error);

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

    const data = await response.json();

    return NextResponse.json({
      status: 'ok',
      message: 'Ollama is accessible',
      ollamaUrl: OLLAMA_BASE_URL,
      defaultModel: DEFAULT_MODEL,
      availableModels: data.models?.map((m: any) => m.name) || [],
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
