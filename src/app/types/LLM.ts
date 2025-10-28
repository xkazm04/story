/**
 * LLM Service Types
 *
 * Type definitions for the Ollama LLM integration
 */

export interface LLMRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface LLMResponse {
  content: string;
  model: string;
  done: boolean;
  totalDuration?: number;
  promptEvalCount?: number;
  evalCount?: number;
}

export interface LLMError {
  error: string;
  message: string;
  statusCode?: number;
}

export interface LLMStreamChunk {
  content: string;
  done: boolean;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  system?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface OllamaGenerateResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

export const DEFAULT_LLM_CONFIG = {
  baseUrl: 'http://localhost:11434',
  model: 'gpt-oss:20b',
  temperature: 0.7,
  maxTokens: 2000,
} as const;
