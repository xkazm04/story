/**
 * CLI Skills Registry
 *
 * Central registry for all CLI skills organized by domain.
 * Skills are specialized instruction sets that guide Claude Code CLI
 * for specific storytelling tasks.
 *
 * 29 skills across 7 domains:
 * - Character (6): backstory, traits, dialogue, names, personality, appearance
 * - Faction (4): creation, lore, description, relationships
 * - Story (7): next-steps, write-content, architect, brainstorm, beat-suggestions, beat-description, project-inspiration
 * - Scene (4): generation, dialogue, description, beat-scene-mapping
 * - Image (5): compose, enhance, variations, cover, avatar
 * - Simulator (3): vision-breakdown, prompt-generation, dimension-refinement
 * - Utility (4): dataset-tagging, voice-description, deep-analysis, storytelling
 */

// Types
export type { CLISkill, SkillDomain, SkillOutputFormat, SkillId } from './types';

// Domain skill arrays
import { CHARACTER_SKILLS } from './character';
import { FACTION_SKILLS } from './faction';
import { STORY_SKILLS } from './story';
import { SCENE_SKILLS } from './scene';
import { IMAGE_SKILLS } from './image';
import { SIMULATOR_SKILLS } from './simulator';
import { UTILITY_SKILLS } from './utility';

import type { CLISkill, SkillDomain, SkillId } from './types';

// Re-export domain arrays for targeted access
export { CHARACTER_SKILLS } from './character';
export { FACTION_SKILLS } from './faction';
export { STORY_SKILLS } from './story';
export { SCENE_SKILLS } from './scene';
export { IMAGE_SKILLS } from './image';
export { SIMULATOR_SKILLS } from './simulator';
export { UTILITY_SKILLS } from './utility';

/**
 * All skills as flat array
 */
const ALL_SKILLS: CLISkill[] = [
  ...CHARACTER_SKILLS,
  ...FACTION_SKILLS,
  ...STORY_SKILLS,
  ...SCENE_SKILLS,
  ...IMAGE_SKILLS,
  ...SIMULATOR_SKILLS,
  ...UTILITY_SKILLS,
];

/**
 * Skills indexed by ID for O(1) lookup
 */
export const CLI_SKILLS: Record<string, CLISkill> = Object.fromEntries(
  ALL_SKILLS.map((skill) => [skill.id, skill])
);

/**
 * Skills grouped by domain
 */
export const SKILLS_BY_DOMAIN: Record<SkillDomain, CLISkill[]> = {
  character: CHARACTER_SKILLS,
  faction: FACTION_SKILLS,
  story: STORY_SKILLS,
  scene: SCENE_SKILLS,
  image: IMAGE_SKILLS,
  simulator: SIMULATOR_SKILLS,
  utility: UTILITY_SKILLS,
};

/**
 * Get skill by ID
 */
export function getSkill(id: SkillId): CLISkill | undefined {
  return CLI_SKILLS[id];
}

/**
 * Get all skills as array
 */
export function getAllSkills(): CLISkill[] {
  return ALL_SKILLS;
}

/**
 * Get skills for a specific domain
 */
export function getSkillsByDomain(domain: SkillDomain): CLISkill[] {
  return SKILLS_BY_DOMAIN[domain] ?? [];
}

/**
 * Build combined prompt from enabled skills.
 * Prepends skill instructions to the CLI prompt.
 */
export function buildSkillsPrompt(enabledSkills: SkillId[]): string {
  if (enabledSkills.length === 0) return '';

  const prompts = enabledSkills
    .map((id) => CLI_SKILLS[id]?.prompt)
    .filter(Boolean);

  if (prompts.length === 0) return '';

  return `# Active Skills

${prompts.join('\n\n---\n\n')}

---

Now proceed with the task:

`;
}

/**
 * Get skill IDs for a domain — useful for UI skill pickers
 */
export function getSkillIdsForDomain(domain: SkillDomain): SkillId[] {
  return (SKILLS_BY_DOMAIN[domain] ?? []).map((s) => s.id);
}

// Log skill count on module load (development aid)
if (typeof window !== 'undefined') {
  console.debug(`[cli-skills] Registered ${ALL_SKILLS.length} skills across ${Object.keys(SKILLS_BY_DOMAIN).length} domains`);
}
