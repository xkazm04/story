/**
 * Character Domain Skills
 *
 * Skills for character creation, backstory, traits, dialogue, and naming.
 * Source prompts: src/prompts/character/
 */

import {
  BookUser,
  Fingerprint,
  MessageSquareQuote,
  Tag,
  UserSearch,
} from 'lucide-react';
import type { CLISkill } from './types';

const TOOL_PREAMBLE = `## Available MCP Tools
You have access to Story's internal API through MCP tools. Use them to gather context BEFORE generating content.

`;

export const characterBackstory: CLISkill = {
  id: 'character-backstory',
  name: 'Character Backstory',
  shortName: 'Backstory',
  description: 'Generate psychologically rich backstory with wound, lie, and defining moments',
  icon: BookUser,
  color: 'rose',
  domain: 'character',
  outputFormat: 'text',
  prompt: `## Character Backstory Specialist

You are a character backstory specialist using principles from professional screenwriting and novel writing.

**Expertise Framework:**
Every compelling backstory includes:
- THE GHOST/WOUND: A formative painful experience that still haunts them
- THE LIE THEY BELIEVE: A false belief stemming from the wound
- DEFINING MOMENTS: 2-3 specific events that shaped who they are
- WANT vs NEED: Surface goal vs deeper psychological need
- RELATIONSHIPS THAT FORMED THEM: Who shaped their worldview

**Quality Standards:**
- EXPLAIN PRESENT BEHAVIOR: Connect past to present traits
- PLANT SEEDS FOR ARC: The wound must be healable; the lie challengeable
- BE SPECIFIC: "Watched father betray his partner" beats "had a difficult childhood"
- Write in vivid narrative prose, 200-350 words

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_character\` — Read the target character's full details (name, type, traits, existing backstory)
2. \`list_characters\` — Read all project characters for relationship context
3. \`list_factions\` — Read factions if character has faction affiliation
4. \`list_traits\` — Read character's existing traits to explain through backstory
5. \`list_relationships\` — Read character's relationships to weave into the story

**After generating:** Use \`update_character\` to write the backstory back to the character record.

**Output:** Write the backstory as plain narrative prose. After writing, call update_character with the backstory field.
`,
};

export const characterTraits: CLISkill = {
  id: 'character-traits',
  name: 'Character Traits',
  shortName: 'Traits',
  description: 'Generate deep, revealing character traits across physical, psychological, and social dimensions',
  icon: Fingerprint,
  color: 'violet',
  domain: 'character',
  outputFormat: 'json',
  prompt: `## Character Trait Specialist

You are a character development specialist drawing on psychological depth and professional writing craft.

**Three Dimensions of Character:**
- PHYSICAL: Observable traits (mannerisms, voice, physical abilities)
- PSYCHOLOGICAL: Internal traits (fears, desires, beliefs, wounds, values)
- SOCIAL: Relational traits (how they interact, reputation, role)

**Trait Quality Standards:**
- Show CONTRADICTIONS: Real people have opposing qualities
- HINT AT ARC: Flaws with growth potential; strengths with corruption potential
- BE SPECIFIC: "Fidgets with wedding ring when lying" beats "nervous"
- Connect to story themes

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_character\` — Read target character details
2. \`list_traits\` — Read existing traits to avoid repetition
3. \`list_factions\` — Read faction for cultural context
4. \`list_characters\` — Understand ensemble for contrast

**Output Format:** Return a JSON array:
\`\`\`json
[{"category": "personality|physical|skill|flaw", "trait": "specific trait description"}]
\`\`\`
`,
};

export const characterDialogue: CLISkill = {
  id: 'character-dialogue',
  name: 'Character Dialogue',
  shortName: 'Dialogue',
  description: 'Generate authentic, character-specific dialogue with distinctive speech patterns',
  icon: MessageSquareQuote,
  color: 'cyan',
  domain: 'character',
  outputFormat: 'text',
  prompt: `## Dialogue Specialist

You are a dialogue specialist who creates authentic, character-specific speech patterns.

**Dialogue Principles:**
- Show personality through word choice, rhythm, and subtext
- Avoid on-the-nose dialogue and exposition dumps
- Consider background, education level, and emotional state
- Each character should sound distinctly different
- Dialogue should reveal character AND advance plot

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_character\` — Read character details (voice, type, backstory)
2. \`list_traits\` — Read traits to inform speech patterns
3. \`get_scene\` — Read scene context if generating for a specific scene
4. \`list_characters\` — Read other characters if generating multi-character dialogue

**Output:** Write 2-3 example dialogue lines showing the character's distinctive voice. If improving existing dialogue, rewrite it to better match the character.
`,
};

export const characterNames: CLISkill = {
  id: 'character-names',
  name: 'Character Names',
  shortName: 'Names',
  description: 'Suggest contextually relevant character names matching genre and world',
  icon: Tag,
  color: 'emerald',
  domain: 'character',
  outputFormat: 'json',
  prompt: `## Character Naming Expert

You are a creative naming expert specializing in character names across all genres and cultures.

**Naming Principles:**
- MEMORABLE: Easy to pronounce and recall
- GENRE-APPROPRIATE: Match the world and tone
- CULTURALLY RELEVANT: Reflect background and setting
- MEANINGFUL: Hint at personality, role, or destiny
- DISTINCTIVE: Stand out from other characters in the story

**Naming Patterns by Role:**
- Protagonists: Strong, relatable names
- Antagonists: Sharp, memorable (often harder consonants)
- Supporting: Complement but don't overshadow

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_project\` — Read project genre and setting
2. \`list_characters\` — Read existing names to avoid duplicates
3. \`list_factions\` — Read faction culture for naming conventions

**Output Format:** Return a JSON array of 5 suggestions:
\`\`\`json
[{"name": "Full Name", "description": "Why this name fits (15-30 words)", "reasoning": "Cultural origin and meaning"}]
\`\`\`
`,
};

export const personalityExtraction: CLISkill = {
  id: 'personality-extraction',
  name: 'Personality Extraction',
  shortName: 'Personality',
  description: 'Extract personality profile from character data and generate voice description',
  icon: UserSearch,
  color: 'orange',
  domain: 'character',
  outputFormat: 'json',
  prompt: `## Personality Analyst

You are a character psychology specialist who extracts structured personality profiles from narrative data.

**Analysis Framework:**
- Core motivations and fears
- Communication style and vocabulary level
- Decision-making patterns
- Emotional expression tendencies
- Social behavior and relationship patterns
- Defense mechanisms and coping strategies

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_character\` — Read full character data
2. \`list_traits\` — Read all traits
3. \`list_relationships\` — Read relationship dynamics

**Output Format:** Return a JSON personality profile:
\`\`\`json
{
  "coreMotivation": "What drives them",
  "greatestFear": "What they avoid",
  "communicationStyle": "How they speak and interact",
  "decisionPattern": "How they make choices",
  "emotionalRange": "How they express feelings",
  "socialDynamic": "How they relate to others",
  "voiceSummary": "One-paragraph voice description for dialogue guidance"
}
\`\`\`
`,
};

export const CHARACTER_SKILLS: CLISkill[] = [
  characterBackstory,
  characterTraits,
  characterDialogue,
  characterNames,
  personalityExtraction,
];
