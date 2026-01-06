import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/app/utils/logger';
import { createErrorResponse, validateRequiredParams, HTTP_STATUS } from '@/app/utils/apiErrorHandling';

/**
 * POST /api/ai/analyze-lore
 * Analyze lore content to generate summary and extract tags using AI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, title, category } = body;

    // Validate required parameters
    const validationError = validateRequiredParams(body, ['content', 'title']);
    if (validationError) {
      return validationError;
    }

    // In production, this would call an actual LLM API (Claude, OpenAI, etc.)
    // For now, we'll use a mock implementation
    const summary = await generateLoreSummary(content, title, category);
    const tags = await extractLoreTags(content, title, category);

    return NextResponse.json({
      summary,
      tags,
      generated_at: new Date().toISOString(),
    });
  } catch (error) {
    logger.apiError('/api/ai/analyze-lore', error);
    return createErrorResponse('Failed to analyze lore content', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
}

/**
 * Generate a concise summary of lore content
 * In production, this would use Claude API or similar
 */
async function generateLoreSummary(
  content: string,
  title: string,
  category: string
): Promise<string> {
  // Mock implementation - in production, call actual LLM API
  // Example Claude API call structure:
  /*
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      messages: [{
        role: 'user',
        content: `Summarize this ${category} lore entry titled "${title}" in 3-5 bullet points:\n\n${content}`
      }]
    })
  });
  */

  // Mock summary generation
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const keyPoints: string[] = [];

  // Extract key points (mock logic)
  if (sentences.length >= 3) {
    keyPoints.push(sentences[0].trim().substring(0, 100));
    if (sentences.length >= 2) {
      keyPoints.push(sentences[Math.floor(sentences.length / 2)].trim().substring(0, 100));
    }
    keyPoints.push(sentences[sentences.length - 1].trim().substring(0, 100));
  } else {
    sentences.forEach(s => keyPoints.push(s.trim().substring(0, 100)));
  }

  // Add category context
  keyPoints.unshift(`${category.charAt(0).toUpperCase() + category.slice(1)} entry: ${title}`);

  return keyPoints.map(point => `• ${point}`).join('\n');
}

/**
 * Extract key themes and tags from lore content
 * In production, this would use Claude API or similar
 */
async function extractLoreTags(
  content: string,
  title: string,
  category: string
): Promise<string[]> {
  // Mock implementation - in production, call actual LLM API
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'were', 'been', 'be',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'can', 'that', 'this', 'these', 'those',
    'it', 'its', 'their', 'them', 'they', 'he', 'she', 'his', 'her',
  ]);

  // Count word frequency
  const wordFrequency: Record<string, number> = {};
  words.forEach(word => {
    const cleaned = word.replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3 && !stopWords.has(cleaned)) {
      wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
    }
  });

  // Get top frequent words as tags
  const tags = Object.entries(wordFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word);

  // Always include the category as a tag
  if (!tags.includes(category)) {
    tags.push(category);
  }

  // Try to extract title keywords
  const titleWords = title.toLowerCase().split(/\s+/);
  titleWords.forEach(word => {
    const cleaned = word.replace(/[^a-z0-9]/g, '');
    if (cleaned.length > 3 && !stopWords.has(cleaned) && !tags.includes(cleaned)) {
      tags.push(cleaned);
    }
  });

  return tags.slice(0, 10); // Limit to 10 tags
}
