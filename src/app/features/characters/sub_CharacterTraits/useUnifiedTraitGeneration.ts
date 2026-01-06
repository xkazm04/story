/**
 * Unified Trait Generation Hook
 *
 * Generates comprehensive character traits in a single LLM call,
 * then parses the response into structured trait sections.
 */

import { useState } from 'react';
import { useLLM } from '@/app/hooks/useLLM';
import { traitApi } from '@/app/api/traits';
import {
  smartCharacterCreationPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherVisualStyleContext,
  gatherCharacterContext,
} from '@/prompts';
import { Character } from '@/app/types/Character';
import { logger } from '@/app/utils/logger';

interface ParsedTraits {
  background: string;
  personality: string;
  motivations: string;
  strengths: string;
  weaknesses: string;
  relationships: string;
}

interface UseUnifiedTraitGenerationReturn {
  generateAllTraits: () => Promise<ParsedTraits | null>;
  isGenerating: boolean;
  error: string | null;
  saveTraits: (characterId: string, traits: ParsedTraits) => Promise<void>;
}

// Section patterns for parsing AI responses
const SECTION_PATTERNS = {
  background: /\*\*BACKGROUND\*\*\s*\n([\s\S]*?)(?=\*\*[A-Z]+\*\*|$)/i,
  personality: /\*\*PERSONALITY\*\*\s*\n([\s\S]*?)(?=\*\*[A-Z]+\*\*|$)/i,
  motivations: /\*\*MOTIVATIONS?\*\*\s*\n([\s\S]*?)(?=\*\*[A-Z]+\*\*|$)/i,
  strengths: /\*\*STRENGTHS?\*\*\s*\n([\s\S]*?)(?=\*\*[A-Z]+\*\*|$)/i,
  weaknesses: /\*\*WEAKNESSES?\*\*\s*\n([\s\S]*?)(?=\*\*[A-Z]+\*\*|$)/i,
  relationships: /\*\*RELATIONSHIPS?\*\*\s*\n([\s\S]*?)(?=\*\*[A-Z]+\*\*|$)/i,
};

// Keywords for fallback section detection
const SECTION_KEYWORDS: Record<string, keyof ParsedTraits> = {
  background: 'background',
  history: 'background',
  origin: 'background',
  personality: 'personality',
  trait: 'personality',
  behavior: 'personality',
  motivation: 'motivations',
  goal: 'motivations',
  desire: 'motivations',
  strength: 'strengths',
  ability: 'strengths',
  skill: 'strengths',
  weakness: 'weaknesses',
  flaw: 'weaknesses',
  limitation: 'weaknesses',
  relationship: 'relationships',
  connection: 'relationships',
  social: 'relationships',
};

/**
 * Creates an empty ParsedTraits object
 */
function createEmptyTraits(): ParsedTraits {
  return {
    background: '',
    personality: '',
    motivations: '',
    strengths: '',
    weaknesses: '',
    relationships: '',
  };
}

/**
 * Builds the comprehensive prompt for trait generation
 */
function buildComprehensivePrompt(characterName: string, characterType: string): string {
  return `Generate a complete, detailed character profile for ${characterName}.

The profile should be comprehensive and cover ALL of the following sections. Each section should be detailed and well-developed (minimum 2-3 paragraphs each).

Return your response in the following EXACT format with clear section markers:

**BACKGROUND**
[Detailed background: history, origins, upbringing, formative experiences, key life events]

**PERSONALITY**
[Detailed personality: core traits, behaviors, mannerisms, speech patterns, how they interact with others, quirks]

**MOTIVATIONS**
[Detailed motivations: goals, desires, ambitions, fears, what drives them, internal conflicts]

**STRENGTHS**
[Detailed strengths: abilities, skills, talents, positive attributes, what they excel at]

**WEAKNESSES**
[Detailed weaknesses: flaws, limitations, vulnerabilities, struggles, what holds them back]

**RELATIONSHIPS**
[Detailed relationships: important connections, how they relate to others, social dynamics, key relationships with other characters]

IMPORTANT:
- Each section MUST be present and clearly marked with **SECTION_NAME**
- Write in a narrative style, not bullet points
- Be specific and detailed for each section
- Consider the character's role as ${characterType} in the story
- Make sure all sections flow together to create a cohesive character`;
}

/**
 * Gathers all context needed for trait generation
 */
async function gatherAllContext(projectId: string, characterId: string) {
  return await Promise.all([
    gatherProjectContext(projectId),
    gatherStoryContext(projectId),
    gatherVisualStyleContext(projectId),
    gatherCharacterContext(characterId),
  ]);
}

/**
 * Clean and format section text
 */
function cleanSectionText(text: string): string {
  return text
    .replace(/\*\*/g, '') // Remove markdown bold
    .replace(/^#+\s/gm, '') // Remove markdown headers
    .replace(/^[-*]\s/gm, '') // Remove markdown list markers
    .replace(/^\d+\.\s/gm, '') // Remove numbered list markers
    .trim();
}

/**
 * Parse AI response into structured trait sections using patterns
 */
function parseWithPatterns(content: string): ParsedTraits | null {
  const sections = createEmptyTraits();
  let hasAnySection = false;

  // Extract each section
  for (const [key, pattern] of Object.entries(SECTION_PATTERNS)) {
    const match = content.match(pattern);
    if (match && match[1]) {
      sections[key as keyof ParsedTraits] = cleanSectionText(match[1]);
      hasAnySection = true;
    }
  }

  return hasAnySection ? sections : null;
}

/**
 * Fallback parser for when the response doesn't have clear section markers
 */
function parseFallback(content: string): ParsedTraits | null {
  const lines = content.split('\n');
  const sections = createEmptyTraits();

  let currentSection: keyof ParsedTraits | null = null;
  let currentContent: string[] = [];

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    // Check if this line is a section header
    let foundSection: keyof ParsedTraits | null = null;
    for (const [keyword, section] of Object.entries(SECTION_KEYWORDS)) {
      if (lowerLine.includes(keyword)) {
        foundSection = section;
        break;
      }
    }

    if (foundSection) {
      // Save previous section
      if (currentSection && currentContent.length > 0) {
        sections[currentSection] = cleanSectionText(currentContent.join('\n'));
      }

      // Start new section
      currentSection = foundSection;
      currentContent = [];
    } else if (currentSection && line.trim()) {
      currentContent.push(line);
    }
  }

  // Save last section
  if (currentSection && currentContent.length > 0) {
    sections[currentSection] = cleanSectionText(currentContent.join('\n'));
  }

  // Check if we got any content
  const hasContent = Object.values(sections).some((v) => v.trim() !== '');

  return hasContent ? sections : null;
}

/**
 * Parse AI response into structured trait sections
 */
function parseTraitsFromResponse(content: string): ParsedTraits | null {
  // Try pattern-based parsing first
  const patternResult = parseWithPatterns(content);
  if (patternResult) return patternResult;

  // Fall back to keyword-based parsing
  return parseFallback(content);
}

export function useUnifiedTraitGeneration(
  characterId: string,
  projectId: string,
  allCharacters: Character[]
): UseUnifiedTraitGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { generateFromTemplate } = useLLM();

  const generateAllTraits = async (): Promise<ParsedTraits | null> => {
    setIsGenerating(true);
    setError(null);

    try {
      // Gather rich context
      const [projectCtx, storyCtx, visualCtx, characterCtx] = await gatherAllContext(projectId, characterId);

      // Get current character's info
      const currentCharacter = allCharacters.find((c) => c.id === characterId);
      if (!currentCharacter) {
        throw new Error('Character not found');
      }

      // Get other characters for context
      const otherCharacters = allCharacters.filter((c) => c.id !== characterId);

      // Create comprehensive prompt for all traits
      const comprehensivePrompt = buildComprehensivePrompt(
        currentCharacter.name,
        currentCharacter.type || 'character'
      );

      // Generate comprehensive profile
      const response = await generateFromTemplate(smartCharacterCreationPrompt, {
        characterName: currentCharacter.name,
        characterRole: currentCharacter.type || 'character',
        projectContext: projectCtx,
        storyContext: storyCtx,
        existingCharacters: otherCharacters,
        visualStyle: visualCtx,
        focusArea: 'comprehensive_profile',
        specificRequest: comprehensivePrompt,
      });

      if (!response?.content) {
        throw new Error('No response from AI');
      }

      // Parse the response into sections
      const parsed = parseTraitsFromResponse(response.content);

      if (!parsed) {
        throw new Error('Failed to parse response into sections');
      }

      return parsed;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate traits';
      setError(message);
      logger.error('Error generating traits', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveTraits = async (characterId: string, traits: ParsedTraits): Promise<void> => {
    const traitPromises = Object.entries(traits).map(([type, description]) => {
      if (!description || description.trim() === '') return Promise.resolve();

      return traitApi.createTrait({
        character_id: characterId,
        type,
        description,
      });
    });

    await Promise.all(traitPromises);
  };

  return {
    generateAllTraits,
    isGenerating,
    error,
    saveTraits,
  };
}
