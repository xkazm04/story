'use client';

import { useCallback } from 'react';

/**
 * Intent detection result — maps a free-text prompt to a skill ID.
 */
export interface DetectedIntent {
  skillId: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Keyword → skill mapping rules.
 * Ordered by specificity — first match wins within a priority group.
 */
const INTENT_RULES: { patterns: RegExp[]; skillId: string; priority: number }[] = [
  // ─── Scene (high priority for specific verbs) ───
  { patterns: [/\b(write|create|generate|draft)\b.*\bscene\b/i, /\bscene\b.*\b(write|create|generate|draft)\b/i], skillId: 'scene-generation', priority: 10 },
  { patterns: [/\bdialogue\b.*\bscene\b/i, /\bscene\b.*\bdialogue\b/i, /\bwrite\b.*\bdialogue\b/i, /\bgenerate\b.*\bdialogue\b/i], skillId: 'scene-dialogue', priority: 9 },
  { patterns: [/\bdescri(be|ption)\b.*\bscene\b/i, /\bscene\b.*\bdescri(be|ption)\b/i], skillId: 'scene-description', priority: 9 },
  { patterns: [/\bbeat\b.*\bscene\b.*\bmap/i, /\bmap\b.*\bbeat\b.*\bscene\b/i, /\bbeat-scene\b/i], skillId: 'beat-scene-mapping', priority: 9 },

  // ─── Character Appearance (high priority, specific) ───
  { patterns: [/\bappearance\b/i, /\blook\b.*\bcharacter\b/i, /\bcharacter\b.*\blook\b/i, /\bvisual\b.*\bcharacter\b/i, /\bcharacter\b.*\bvisual\b/i, /\bdesign\b.*\bappearance\b/i, /\bcharacter\b.*\bcreator\b/i, /\bhair\b.*\beyes\b/i], skillId: 'character-appearance', priority: 9 },

  // ─── Character ───
  { patterns: [/\bbackstory\b/i, /\bback\s*story\b/i, /\borigin\b.*\bcharacter\b/i, /\bcharacter\b.*\bhistory\b/i], skillId: 'character-backstory', priority: 8 },
  { patterns: [/\btrait\b/i, /\bpersonality\b.*\btrait\b/i, /\bcharacter\b.*\btrait\b/i], skillId: 'character-traits', priority: 8 },
  { patterns: [/\bcharacter\b.*\bdialogue\b/i, /\bdialogue\b.*\bstyle\b/i, /\bspeech\b.*\bpattern\b/i], skillId: 'character-dialogue', priority: 8 },
  { patterns: [/\bname\b.*\bcharacter\b/i, /\bcharacter\b.*\bname\b/i, /\bname\s+suggest/i, /\bsuggest\b.*\bname\b/i], skillId: 'character-names', priority: 8 },
  { patterns: [/\bextract\b.*\bpersonality\b/i, /\bpersonality\b.*\bextract\b/i, /\banalyze\b.*\bpersonality\b/i], skillId: 'personality-extraction', priority: 8 },
  { patterns: [/\b(create|develop|build|design)\b.*\bcharacter\b/i, /\bcharacter\b.*\b(create|develop|build|design)\b/i, /\bnew\b.*\bcharacter\b/i], skillId: 'character-backstory', priority: 7 },

  // ─── Faction ───
  { patterns: [/\b(create|build|design)\b.*\bfaction\b/i, /\bfaction\b.*\b(create|build|design)\b/i, /\bnew\b.*\bfaction\b/i], skillId: 'faction-creation', priority: 8 },
  { patterns: [/\blore\b.*\bfaction\b/i, /\bfaction\b.*\blore\b/i, /\bmythology\b.*\bfaction\b/i], skillId: 'faction-lore', priority: 8 },
  { patterns: [/\bdescri(be|ption)\b.*\bfaction\b/i, /\bfaction\b.*\bdescri(be|ption)\b/i], skillId: 'faction-description', priority: 8 },
  { patterns: [/\brelation\b.*\bfaction\b/i, /\bfaction\b.*\brelation\b/i, /\balliance\b/i, /\brivalry\b/i], skillId: 'faction-relationships', priority: 8 },

  // ─── Story ───
  { patterns: [/\bnext\b.*\bstep\b/i, /\bwhat\b.*\bhappen\b.*\bnext\b/i, /\bcontinue\b.*\bstory\b/i], skillId: 'story-next-steps', priority: 8 },
  { patterns: [/\bwrite\b.*\b(content|chapter|section)\b/i, /\bcontent\b.*\bwrite\b/i], skillId: 'story-write-content', priority: 8 },
  { patterns: [/\barchitect\b/i, /\bstory\b.*\bstructure\b/i, /\bplot\b.*\bstructure\b/i, /\bstory\b.*\barc\b/i, /\bnarrative\b.*\bstructure\b/i], skillId: 'story-architect', priority: 8 },
  { patterns: [/\bbrainstorm\b/i, /\bidea\b/i, /\bexplore\b.*\bpossibilit/i], skillId: 'story-brainstorm', priority: 7 },
  { patterns: [/\bbeat\b.*\bsuggest/i, /\bsuggest\b.*\bbeat\b/i, /\bnew\b.*\bbeat\b/i], skillId: 'beat-suggestions', priority: 8 },
  { patterns: [/\bbeat\b.*\bdescri(be|ption)\b/i, /\bdescri(be|ption)\b.*\bbeat\b/i], skillId: 'beat-description', priority: 8 },
  { patterns: [/\bproject\b.*\binspir/i, /\binspir\b.*\bproject\b/i, /\bstory\b.*\binspir/i], skillId: 'project-inspiration', priority: 7 },

  // ─── Image ───
  { patterns: [/\b(image|picture|visual)\b.*\b(compose|create|generate)\b/i, /\b(compose|create|generate)\b.*\b(image|picture|visual)\b/i, /\bgenerate\b.*\bimage\b/i], skillId: 'image-prompt-compose', priority: 8 },
  { patterns: [/\benhance\b.*\b(prompt|image)\b/i, /\bimprove\b.*\bprompt\b/i], skillId: 'image-prompt-enhance', priority: 8 },
  { patterns: [/\bvariation\b/i, /\balternative\b.*\b(prompt|image)\b/i], skillId: 'image-prompt-variations', priority: 8 },
  { patterns: [/\bcover\b.*\b(art|image|prompt)\b/i, /\b(art|image|prompt)\b.*\bcover\b/i], skillId: 'cover-prompt', priority: 8 },
  { patterns: [/\bavatar\b/i, /\bportrait\b/i, /\bprofile\b.*\b(image|picture)\b/i], skillId: 'avatar-prompt', priority: 8 },

  // ─── Simulator ───
  { patterns: [/\bvision\b.*\bbreakdown\b/i, /\bbreakdown\b.*\bvision\b/i, /\bsimulat\b.*\bbreak/i], skillId: 'simulator-vision-breakdown', priority: 8 },
  { patterns: [/\bsimulat\b.*\bprompt\b/i, /\bprompt\b.*\bsimulat\b/i], skillId: 'simulator-prompt-generation', priority: 8 },
  { patterns: [/\bdimension\b.*\brefin/i, /\brefin\b.*\bdimension\b/i], skillId: 'simulator-dimension-refinement', priority: 8 },

  // ─── Utility ───
  { patterns: [/\bdataset\b.*\btag/i, /\btag\b.*\bdataset\b/i, /\blabel\b.*\bdata/i], skillId: 'dataset-tagging', priority: 7 },
  { patterns: [/\bvoice\b.*\bdescri(be|ption)\b/i, /\bdescri(be|ption)\b.*\bvoice\b/i], skillId: 'voice-description', priority: 8 },
  { patterns: [/\bdeep\b.*\banalys/i, /\banalyz\b.*\b(deep|thorough)\b/i], skillId: 'deep-analysis', priority: 7 },
  { patterns: [/\bstorytelling\b/i, /\btell\b.*\bstory\b/i], skillId: 'storytelling', priority: 6 },

  // ─── Broad domain fallbacks (low priority) ───
  { patterns: [/\bscene\b/i], skillId: 'scene-generation', priority: 3 },
  { patterns: [/\bcharacter\b/i], skillId: 'character-backstory', priority: 3 },
  { patterns: [/\bfaction\b/i, /\bclan\b/i, /\bguild\b/i, /\borganization\b/i], skillId: 'faction-creation', priority: 3 },
  { patterns: [/\bstory\b/i, /\bplot\b/i, /\bnarrative\b/i], skillId: 'story-architect', priority: 3 },
  { patterns: [/\bimage\b/i, /\bpicture\b/i, /\bart\b/i, /\billustrat/i], skillId: 'image-prompt-compose', priority: 3 },
  { patterns: [/\bvoice\b/i, /\bspeak\b/i], skillId: 'voice-description', priority: 3 },
  { patterns: [/\bbeat\b/i], skillId: 'beat-suggestions', priority: 3 },
];

/**
 * Match a free-text prompt against intent rules.
 * Returns the best-matching skill ID or null.
 */
function detectIntentFromPrompt(prompt: string): DetectedIntent | null {
  let bestMatch: { skillId: string; priority: number } | null = null;

  for (const rule of INTENT_RULES) {
    const matched = rule.patterns.some((p) => p.test(prompt));
    if (matched && (!bestMatch || rule.priority > bestMatch.priority)) {
      bestMatch = { skillId: rule.skillId, priority: rule.priority };
    }
  }

  if (!bestMatch) return null;

  const confidence: DetectedIntent['confidence'] =
    bestMatch.priority >= 8 ? 'high' : bestMatch.priority >= 5 ? 'medium' : 'low';

  return { skillId: bestMatch.skillId, confidence };
}

/**
 * Hook providing intent detection for free-text CLI prompts.
 *
 * Returns a `detectIntent` function that maps prompt text → skill ID.
 * Used by TerminalDock to auto-compose workspace panels when user types.
 */
export function useIntentDetection() {
  const detectIntent = useCallback((prompt: string): DetectedIntent | null => {
    return detectIntentFromPrompt(prompt);
  }, []);

  return { detectIntent };
}
