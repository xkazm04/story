import { NextRequest, NextResponse } from 'next/server';
import {
  TEMPLATE_CORPUS,
  getTemplatesByType,
  getTrendingTemplates,
  ProjectTemplate
} from '@/app/constants/templateCorpus';
import { validateRequiredParams, handleUnexpectedError } from '@/app/utils/apiErrorHandling';

/**
 * Request body structure for template generation
 */
interface GenerateTemplateRequest {
  projectType: 'story' | 'short' | 'edu';
  genre?: string;
  description?: string;
  themes?: string[];
  useAI?: boolean;
}

/**
 * Response structure for generated template
 */
interface GenerateTemplateResponse {
  template: ProjectTemplate;
  source: 'corpus' | 'ai-enhanced' | 'ai-generated';
  matchScore?: number;
}

/**
 * Calculate match score between user input and template
 */
function calculateMatchScore(
  template: ProjectTemplate,
  genre?: string,
  description?: string,
  themes?: string[]
): number {
  let score = 0;
  const maxScore = 100;

  // Genre match (40 points)
  if (genre && template.genre.toLowerCase().includes(genre.toLowerCase())) {
    score += 40;
  } else if (genre) {
    // Partial genre match
    const genreWords = genre.toLowerCase().split(' ');
    const templateGenre = template.genre.toLowerCase();
    const matches = genreWords.filter(word => templateGenre.includes(word));
    score += (matches.length / genreWords.length) * 20;
  }

  // Description keyword match (30 points)
  if (description && description.length > 10) {
    const descWords = description.toLowerCase().split(/\s+/);
    const templateKeywords = template.keywords.map(k => k.toLowerCase());
    const matchingKeywords = descWords.filter(word =>
      templateKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
    );
    score += (matchingKeywords.length / Math.max(descWords.length, 1)) * 30;
  }

  // Theme match (20 points)
  if (themes && themes.length > 0) {
    const themeMatches = themes.filter(theme =>
      template.keywords.some(keyword =>
        keyword.toLowerCase().includes(theme.toLowerCase()) ||
        theme.toLowerCase().includes(keyword.toLowerCase())
      )
    );
    score += (themeMatches.length / themes.length) * 20;
  }

  // Trending bonus (10 points)
  if (template.trending) {
    score += 10;
  }

  return Math.min(score, maxScore);
}

/**
 * Find best matching template from corpus
 */
function findBestTemplate(
  projectType: 'story' | 'short' | 'edu',
  genre?: string,
  description?: string,
  themes?: string[]
): { template: ProjectTemplate; matchScore: number } {
  const typeTemplates = getTemplatesByType(projectType);

  if (typeTemplates.length === 0) {
    // Fallback to any type if no matching templates
    const trending = getTrendingTemplates();
    return {
      template: trending[0] || TEMPLATE_CORPUS[0],
      matchScore: 0
    };
  }

  // Score all templates
  const scoredTemplates = typeTemplates.map(template => ({
    template,
    matchScore: calculateMatchScore(template, genre, description, themes)
  }));

  // Sort by score and popularity
  scoredTemplates.sort((a, b) => {
    if (Math.abs(a.matchScore - b.matchScore) < 5) {
      // If scores are close, prefer popularity
      return (b.template.popularity || 0) - (a.template.popularity || 0);
    }
    return b.matchScore - a.matchScore;
  });

  return scoredTemplates[0];
}

/**
 * Enhance template with AI-generated customizations
 * This uses the LLM to personalize the template based on user input
 */
async function enhanceTemplateWithAI(
  template: ProjectTemplate,
  description?: string,
  genre?: string
): Promise<ProjectTemplate> {
  if (!description || description.length < 10) {
    return template;
  }

  try {
    const prompt = `Given this project template and user description, suggest minor customizations to character names and objectives to better fit the user's vision. Keep the structure intact.

Template: ${template.name}
Template Description: ${template.description}
User Description: ${description}
${genre ? `User Genre: ${genre}` : ''}

Original Characters: ${template.characters.map(c => c.name).join(', ')}
Original Objectives: ${template.objectives.map(o => o.name).join(', ')}

Respond with ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "characterNames": ["Name1", "Name2", ...],
  "objectiveNames": ["Objective1", "Objective2", ...]
}

The arrays must match the original counts. Names should be creative but fitting.`;

    const llmResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/llm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        temperature: 0.7,
        maxTokens: 500,
      }),
    });

    if (!llmResponse.ok) {
      console.warn('LLM enhancement failed, using original template');
      return template;
    }

    const llmData = await llmResponse.json();
    const content = llmData.content?.trim() || '';

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return template;
    }

    const suggestions = JSON.parse(jsonMatch[0]);

    // Apply suggestions
    const enhancedTemplate = { ...template };

    if (suggestions.characterNames && Array.isArray(suggestions.characterNames)) {
      enhancedTemplate.characters = template.characters.map((char, idx) => ({
        ...char,
        name: suggestions.characterNames[idx] || char.name
      }));
    }

    if (suggestions.objectiveNames && Array.isArray(suggestions.objectiveNames)) {
      enhancedTemplate.objectives = template.objectives.map((obj, idx) => ({
        ...obj,
        name: suggestions.objectiveNames[idx] || obj.name
      }));
    }

    return enhancedTemplate;
  } catch (error) {
    console.warn('Error enhancing template with AI:', error);
    return template;
  }
}

/**
 * POST /api/ai/generate-template
 *
 * Generate a customized project template based on user input
 * Uses corpus matching + optional AI enhancement
 */
export async function POST(request: NextRequest) {
  try {
    const body: GenerateTemplateRequest = await request.json();
    const { projectType, genre, description, themes, useAI = true } = body;

    // Validate required parameters
    const validationError = validateRequiredParams(
      { projectType },
      ['projectType']
    );
    if (validationError) return validationError;

    // Validate project type
    if (!['story', 'short', 'edu'].includes(projectType)) {
      return NextResponse.json(
        { error: 'Invalid project type', message: 'Project type must be story, short, or edu' },
        { status: 400 }
      );
    }

    // Find best matching template
    const { template, matchScore } = findBestTemplate(
      projectType,
      genre,
      description,
      themes
    );

    let finalTemplate = template;
    let source: 'corpus' | 'ai-enhanced' | 'ai-generated' = 'corpus';

    // Enhance with AI if requested and description provided
    if (useAI && description && description.length > 10) {
      finalTemplate = await enhanceTemplateWithAI(template, description, genre);
      source = 'ai-enhanced';
    }

    const response: GenerateTemplateResponse = {
      template: finalTemplate,
      source,
      matchScore
    };

    return NextResponse.json(response);
  } catch (error) {
    return handleUnexpectedError('POST /api/ai/generate-template', error);
  }
}

/**
 * GET /api/ai/generate-template
 *
 * Get all available templates or filter by type
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type') as 'story' | 'short' | 'edu' | null;
    const trending = searchParams.get('trending') === 'true';

    let templates: ProjectTemplate[] = [];

    if (trending) {
      templates = getTrendingTemplates();
    } else if (type) {
      templates = getTemplatesByType(type);
    } else {
      templates = TEMPLATE_CORPUS;
    }

    return NextResponse.json({ templates, count: templates.length });
  } catch (error) {
    return handleUnexpectedError('GET /api/ai/generate-template', error);
  }
}
