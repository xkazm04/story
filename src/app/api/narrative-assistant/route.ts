import { NextRequest, NextResponse } from 'next/server';
import type { AIAssistantRequest, AIAssistantResponse, SuggestionType, SuggestionDepth } from '@/app/types/AIAssistant';
import { narrativeAssistantPrompt } from '@/prompts';
import { gatherProjectContext, gatherStoryContext, gatherCharacterContext } from '@/prompts';
import {
  logger,
  handleUnexpectedError,
  createErrorResponse,
  ProjectContextData,
  OllamaGenerateResponse,
  API_CONSTANTS,
} from '@/app/utils/apiErrorHandling';
import type { AISuggestion } from '@/app/types/AIAssistant';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama2';

/**
 * Gathers context data based on context type
 */
async function gatherContextData(
  context_type: string,
  project_id: string,
  context_id?: string,
  genre?: string
): Promise<ProjectContextData> {
  try {
    let contextData: ProjectContextData = {
      projectId: project_id,
      projectName: 'Current Project',
      genre: genre,
    };

    if (context_type === 'act' || context_type === 'beat') {
      const storyContext = await gatherStoryContext(project_id);
      contextData = { ...contextData, ...storyContext } as ProjectContextData;
    } else if (context_type === 'character' && context_id) {
      const characterContext = await gatherCharacterContext(context_id);
      contextData = { ...contextData, ...characterContext } as ProjectContextData;
    }

    // Always get project context and merge
    const projectContext = await gatherProjectContext(project_id);
    return { ...projectContext, ...contextData };
  } catch (error) {
    logger.warn('Context gathering', 'Failed to gather full context, using minimal', { error });
    return {
      projectId: project_id,
      projectName: 'Current Project',
      genre: genre,
    };
  }
}

/**
 * Builds prompt context from gathered data
 */
function buildPromptContext(
  contextData: ProjectContextData,
  context_type: string,
  suggestion_types: string[],
  depth: string,
  max_suggestions: number,
  genre?: string
) {
  return {
    contextType: context_type as 'act' | 'beat' | 'character' | 'scene' | 'general',
    projectName: contextData.projectName || contextData.name || 'Untitled Project',
    projectDescription: contextData.description || contextData.projectDescription,
    genre: genre || contextData.genre,
    actName: contextData.currentAct?.name,
    actDescription: contextData.currentAct?.description,
    beatName: contextData.currentBeat?.name,
    beatDescription: contextData.currentBeat?.description,
    characterName: contextData.characterName || contextData.name,
    characterTraits: contextData.traits?.map((t) => t.description || t.trait || '') || [],
    sceneName: contextData.sceneName,
    sceneDescription: contextData.sceneDescription,
    existingBeats: contextData.beats?.slice(0, 10).map((b) => ({
      name: b.name || '',
      description: b.description || '',
    })) || [],
    existingScenes: contextData.scenes?.slice(0, 10).map((s) => ({
      name: s.name || '',
      description: s.description || '',
    })) || [],
    suggestionTypes: suggestion_types as SuggestionType[],
    depth: depth as SuggestionDepth,
    maxSuggestions: max_suggestions,
  };
}

/**
 * Calls Ollama LLM service
 */
async function callOllamaLLM(prompt: string): Promise<OllamaGenerateResponse> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      prompt,
      temperature: 0.8,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM service error: ${errorText}`);
  }

  return await response.json();
}

interface RawSuggestion {
  type?: string;
  title?: string;
  content?: string;
  context?: string;
  confidence?: number;
  reasoning?: string;
}

/**
 * Parses LLM response into structured suggestions
 */
function parseLLMResponse(
  llmResponse: string,
  suggestion_types: SuggestionType[],
  genre?: string
): AISuggestion[] {
  try {
    // Try to extract JSON from response
    const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsedSuggestions: RawSuggestion[] = JSON.parse(jsonMatch[0]);
      return parsedSuggestions.map((s, index) => ({
        id: `suggestion-${Date.now()}-${index}`,
        type: (s.type || 'scene_hook') as SuggestionType,
        title: s.title || 'Untitled Suggestion',
        content: s.content || '',
        context: s.context || '',
        genre: genre,
        confidence: s.confidence || 0.7,
        reasoning: s.reasoning || '',
        created_at: new Date(),
      }));
    }
  } catch (parseError) {
    logger.warn('LLM Response Parsing', 'Failed to parse JSON from LLM response', { parseError });
  }

  // Fallback: create a single suggestion from the response
  return [{
    id: `suggestion-${Date.now()}-0`,
    type: suggestion_types[0],
    title: 'AI Suggestion',
    content: llmResponse.substring(0, API_CONSTANTS.MAX_CONTENT_LENGTH),
    context: 'Generated from narrative context',
    genre: genre,
    confidence: API_CONSTANTS.FALLBACK_CONFIDENCE,
    reasoning: 'Fallback parsing',
    created_at: new Date(),
  }];
}

/**
 * POST /api/narrative-assistant
 *
 * Generates AI-powered narrative suggestions based on current context
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: AIAssistantRequest = await request.json();

    const {
      project_id,
      context_type,
      context_id,
      suggestion_types = ['scene_hook', 'beat_outline', 'dialogue_snippet'],
      genre,
      depth = 'moderate',
      max_suggestions = API_CONSTANTS.MAX_SUGGESTIONS_LIMIT,
    } = body;

    if (!project_id) {
      return createErrorResponse(
        'Missing project_id',
        400,
        'Project ID is required'
      );
    }

    // Gather context based on type
    const contextData = await gatherContextData(
      context_type,
      project_id,
      context_id,
      genre
    );

    // Build the narrative assistant prompt
    const promptContext = buildPromptContext(
      contextData,
      context_type,
      suggestion_types,
      depth,
      max_suggestions,
      genre
    );

    const prompt = narrativeAssistantPrompt(promptContext);

    // Call Ollama LLM
    const ollamaData = await callOllamaLLM(prompt);
    const suggestions = parseLLMResponse(ollamaData.response, suggestion_types, genre);

    const processingTime = Date.now() - startTime;

    const response: AIAssistantResponse = {
      suggestions,
      context_summary: `Generated ${suggestions.length} ${context_type} suggestions`,
      model_used: ollamaData.model || DEFAULT_MODEL,
      processing_time: processingTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleUnexpectedError('POST /api/narrative-assistant', error);
  }
}

/**
 * GET /api/narrative-assistant
 *
 * Health check and settings endpoint
 */
export async function GET() {
  try {
    return NextResponse.json({
      status: 'ok',
      message: 'Narrative assistant is ready',
      available_suggestion_types: [
        'scene_hook',
        'beat_outline',
        'dialogue_snippet',
        'character_action',
        'plot_twist',
        'world_building',
      ],
      available_depths: ['brief', 'moderate', 'detailed'],
    });
  } catch (error) {
    return handleUnexpectedError('GET /api/narrative-assistant', error);
  }
}
