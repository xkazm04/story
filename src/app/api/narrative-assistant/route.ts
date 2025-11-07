import { NextRequest, NextResponse } from 'next/server';
import type { AIAssistantRequest, AIAssistantResponse, AISuggestion } from '@/app/types/AIAssistant';
import { narrativeAssistantPrompt } from '@/prompts';
import { gatherProjectContext, gatherStoryContext, gatherCharacterContext } from '@/prompts';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const DEFAULT_MODEL = process.env.OLLAMA_MODEL || 'llama2';

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
      max_suggestions = 5,
    } = body;

    if (!project_id) {
      return NextResponse.json(
        { error: 'Missing project_id', message: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Gather context based on type
    let contextData: any = {};

    try {
      if (context_type === 'act' || context_type === 'beat') {
        contextData = await gatherStoryContext(project_id);
      } else if (context_type === 'character') {
        if (context_id) {
          contextData = await gatherCharacterContext(context_id);
        }
      }

      // Always get project context
      const projectContext = await gatherProjectContext(project_id);
      contextData = { ...projectContext, ...contextData };
    } catch (error) {
      console.error('Error gathering context:', error);
      // Continue with minimal context
      contextData = {
        projectId: project_id,
        projectName: 'Current Project',
        genre: genre,
      };
    }

    // Build the narrative assistant prompt
    const promptContext = {
      contextType: context_type,
      projectName: contextData.projectName || contextData.name || 'Untitled Project',
      projectDescription: contextData.description || contextData.projectDescription,
      genre: genre || contextData.genre,
      actName: contextData.currentAct?.name,
      actDescription: contextData.currentAct?.description,
      beatName: contextData.currentBeat?.name,
      beatDescription: contextData.currentBeat?.description,
      characterName: contextData.characterName || contextData.name,
      characterTraits: contextData.traits?.map((t: any) => t.description) || [],
      sceneName: contextData.sceneName,
      sceneDescription: contextData.sceneDescription,
      existingBeats: contextData.beats?.slice(0, 10).map((b: any) => ({
        name: b.name,
        description: b.description,
      })) || [],
      existingScenes: contextData.scenes?.slice(0, 10).map((s: any) => ({
        name: s.name,
        description: s.description,
      })) || [],
      suggestionTypes: suggestion_types,
      depth,
      maxSuggestions: max_suggestions,
    };

    const prompt = narrativeAssistantPrompt(promptContext);

    // Call Ollama LLM
    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
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

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API error:', errorText);

      return NextResponse.json(
        {
          error: 'LLM service error',
          message: `Failed to generate suggestions: ${errorText}`,
        },
        { status: 500 }
      );
    }

    const ollamaData = await ollamaResponse.json();
    const llmResponse = ollamaData.response;

    // Parse LLM response
    let suggestions: AISuggestion[] = [];
    try {
      // Try to extract JSON from response
      const jsonMatch = llmResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsedSuggestions = JSON.parse(jsonMatch[0]);
        suggestions = parsedSuggestions.map((s: any, index: number) => ({
          id: `suggestion-${Date.now()}-${index}`,
          type: s.type || 'scene_hook',
          title: s.title || 'Untitled Suggestion',
          content: s.content || '',
          context: s.context || '',
          genre: genre,
          confidence: s.confidence || 0.7,
          reasoning: s.reasoning || '',
          created_at: new Date(),
        }));
      } else {
        // Fallback: create a single suggestion from the response
        suggestions = [{
          id: `suggestion-${Date.now()}-0`,
          type: suggestion_types[0],
          title: 'AI Suggestion',
          content: llmResponse.substring(0, 500),
          context: 'Generated from narrative context',
          genre: genre,
          confidence: 0.6,
          reasoning: 'AI-generated suggestion',
          created_at: new Date(),
        }];
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError);
      // Return raw response as fallback
      suggestions = [{
        id: `suggestion-${Date.now()}-0`,
        type: suggestion_types[0],
        title: 'AI Suggestion',
        content: llmResponse.substring(0, 500),
        context: 'Generated suggestion',
        genre: genre,
        confidence: 0.5,
        reasoning: 'Fallback parsing',
        created_at: new Date(),
      }];
    }

    const processingTime = Date.now() - startTime;

    const response: AIAssistantResponse = {
      suggestions,
      context_summary: `Generated ${suggestions.length} ${context_type} suggestions`,
      model_used: ollamaData.model || DEFAULT_MODEL,
      processing_time: processingTime,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Narrative assistant error:', error);

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
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
