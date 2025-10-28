import { useState, useCallback } from 'react';
import { LLMRequest, LLMResponse, LLMError, DEFAULT_LLM_CONFIG } from '@/app/types/LLM';
import { PromptTemplate } from '@/prompts';

/**
 * useLLM Hook
 *
 * Provides an easy interface to interact with the Ollama LLM service
 * Supports both template-based and raw prompt generation
 */

interface UseLLMOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  onSuccess?: (response: LLMResponse) => void;
  onError?: (error: LLMError) => void;
}

interface UseLLMReturn {
  generate: (prompt: string, systemPrompt?: string) => Promise<LLMResponse | null>;
  generateFromTemplate: (template: PromptTemplate, context: Record<string, any>) => Promise<LLMResponse | null>;
  isLoading: boolean;
  error: LLMError | null;
  response: LLMResponse | null;
  reset: () => void;
}

export const useLLM = (options: UseLLMOptions = {}): UseLLMReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<LLMError | null>(null);
  const [response, setResponse] = useState<LLMResponse | null>(null);

  const {
    model = DEFAULT_LLM_CONFIG.model,
    temperature = DEFAULT_LLM_CONFIG.temperature,
    maxTokens = DEFAULT_LLM_CONFIG.maxTokens,
    onSuccess,
    onError,
  } = options;

  const reset = useCallback(() => {
    setError(null);
    setResponse(null);
    setIsLoading(false);
  }, []);

  const generate = useCallback(
    async (prompt: string, systemPrompt?: string): Promise<LLMResponse | null> => {
      setIsLoading(true);
      setError(null);
      setResponse(null);

      try {
        const requestBody: LLMRequest = {
          prompt,
          model,
          temperature,
          maxTokens,
          stream: false,
          systemPrompt,
        };

        const res = await fetch('/api/llm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await res.json();

        if (!res.ok) {
          const llmError: LLMError = {
            error: data.error || 'LLM request failed',
            message: data.message || 'Unknown error',
            statusCode: res.status,
          };
          setError(llmError);
          onError?.(llmError);
          return null;
        }

        const llmResponse: LLMResponse = data;
        setResponse(llmResponse);
        onSuccess?.(llmResponse);
        return llmResponse;
      } catch (err) {
        const llmError: LLMError = {
          error: 'Network error',
          message: err instanceof Error ? err.message : 'Failed to connect to LLM service',
        };
        setError(llmError);
        onError?.(llmError);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [model, temperature, maxTokens, onSuccess, onError]
  );

  const generateFromTemplate = useCallback(
    async (template: PromptTemplate, context: Record<string, any>): Promise<LLMResponse | null> => {
      const systemPrompt = template.system;
      const userPrompt = template.user(context);
      return generate(userPrompt, systemPrompt);
    },
    [generate]
  );

  return {
    generate,
    generateFromTemplate,
    isLoading,
    error,
    response,
    reset,
  };
};

/**
 * useLLMHealth Hook
 *
 * Checks if the Ollama service is accessible and returns available models
 */
interface UseLLMHealthReturn {
  checkHealth: () => Promise<void>;
  isHealthy: boolean;
  isChecking: boolean;
  availableModels: string[];
  ollamaUrl: string;
  error: string | null;
}

export const useLLMHealth = (): UseLLMHealthReturn => {
  const [isHealthy, setIsHealthy] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [ollamaUrl, setOllamaUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const checkHealth = useCallback(async () => {
    setIsChecking(true);
    setError(null);

    try {
      const res = await fetch('/api/llm', {
        method: 'GET',
      });

      const data = await res.json();

      if (res.ok && data.status === 'ok') {
        setIsHealthy(true);
        setAvailableModels(data.availableModels || []);
        setOllamaUrl(data.ollamaUrl);
        setError(null);
      } else {
        setIsHealthy(false);
        setError(data.message || 'Ollama is not accessible');
        setOllamaUrl(data.ollamaUrl);
      }
    } catch (err) {
      setIsHealthy(false);
      setError(err instanceof Error ? err.message : 'Failed to check Ollama health');
    } finally {
      setIsChecking(false);
    }
  }, []);

  return {
    checkHealth,
    isHealthy,
    isChecking,
    availableModels,
    ollamaUrl,
    error,
  };
};
