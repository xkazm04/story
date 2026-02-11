/**
 * Scene Domain Skills
 *
 * Skills for scene generation, dialogue, descriptions, and beat-scene mapping.
 * Source prompts: src/prompts/scene/
 */

import { Clapperboard, MessageCircle, MapPin, ArrowRightLeft } from 'lucide-react';
import type { CLISkill } from './types';

const TOOL_PREAMBLE = `## Available MCP Tools
You have access to Story's internal API through MCP tools. Use them to gather context BEFORE generating content.

`;

export const sceneGeneration: CLISkill = {
  id: 'scene-generation',
  name: 'Scene Generation',
  shortName: 'Scene',
  description: 'Generate complete scene content with setting, action, and dialogue',
  icon: Clapperboard,
  color: 'red',
  domain: 'scene',
  outputFormat: 'streaming',
  panelConfig: {
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'character-cards', role: 'secondary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'split-3',
    clearExisting: true,
  },
  prompt: `## Scene Generation Specialist

You generate complete, polished scene content combining setting, action, and dialogue.

**Scene Architecture:**
- OPENING: Establish setting through POV character's perception
- ESCALATION: Build tension through action, dialogue, or revelation
- TURNING POINT: The moment that changes something
- CLOSE: Leave the reader wanting to know what happens next

**Writing Standards:**
- Show don't tell — use sensory detail and action
- Each character speaks with their distinct voice
- Balance description, dialogue, and action
- Control pacing through sentence length and paragraph breaks
- Every detail should do emotional or narrative work

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_scene\` — Read scene details (name, description, location, participants)
2. \`get_beat\` — Read the associated beat for narrative context
3. \`list_characters\` — Read participant characters
4. \`get_character\` — Deep-read each key character (voice, traits, backstory)
5. \`list_traits\` — Read traits for behavioral accuracy
6. \`get_project\` — Read project genre and tone

**After generating:** Use \`update_scene\` to write the content/script back.

**Output:** Stream the scene content. Write in the project's genre style.
`,
};

export const sceneDialogue: CLISkill = {
  id: 'scene-dialogue',
  name: 'Scene Dialogue',
  shortName: 'Dialog',
  description: 'Generate dialogue for a scene based on characters and script context',
  icon: MessageCircle,
  color: 'cyan',
  domain: 'scene',
  outputFormat: 'json',
  panelConfig: {
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'dialogue-view', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  prompt: `## Scene Dialogue Writer

You are an expert screenwriter generating realistic, character-driven dialogue.

**Dialogue Principles:**
- Each character has a UNIQUE voice (vocabulary, rhythm, mannerisms)
- Dialogue reveals character AND advances plot
- Include subtext — what's not being said is as important as what is
- Vary line length for natural rhythm
- Include emotion/delivery notes for actors

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_scene\` — Read scene details and existing script
2. \`list_characters\` — Read scene participants
3. \`get_character\` — Deep-read each speaking character
4. \`list_traits\` — Read traits for voice consistency

**Output Format:** Return JSON:
\`\`\`json
{
  "lines": [
    {"speaker": "CHARACTER NAME", "text": "The dialogue line.", "emotion": "delivery instruction"}
  ]
}
\`\`\`
`,
};

export const sceneDescription: CLISkill = {
  id: 'scene-description',
  name: 'Scene Description',
  shortName: 'Describe',
  description: 'Generate vivid scene descriptions with sensory detail and atmosphere',
  icon: MapPin,
  color: 'emerald',
  domain: 'scene',
  outputFormat: 'text',
  panelConfig: {
    panels: [
      { type: 'scene-editor', role: 'primary' },
      { type: 'scene-metadata', role: 'sidebar' },
    ],
    preferredLayout: 'primary-sidebar',
    clearExisting: true,
  },
  prompt: `## Scene Craft Specialist

You create vivid scene descriptions using cinematic and literary techniques.

**Scene Description Framework:**
- ESTABLISH POV: Through whose eyes/emotions do we experience this?
- REVEAL THROUGH DETAIL: Setting details reflect character state or theme
- CREATE ATMOSPHERE: Mood matches or ironically contrasts the emotional content
- GROUND THE READER: 2-3 specific sensory details (not all senses, just evocative ones)

**Writing Principles:**
- SHOW DON'T TELL: "The cup trembled in her hands" beats "she was nervous"
- ACTIVE DESCRIPTION: Things in motion, in relation to characters
- EMOTIONAL FILTERING: Details noticed reflect character's emotional state
- SPECIFIC: "Burnt coffee and old paper" beats "the office was messy"
- ECONOMY: Every word must do emotional or narrative work

Think like a cinematographer: What's in focus? What's in shadow? Where's the camera?

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`get_scene\` — Read scene details (location, mood, characters)
2. \`get_character\` — Read POV character for emotional filtering
3. \`get_project\` — Read genre for tone

**After generating:** Use \`update_scene\` to write the description.

**Output:** Write 150-250 words of vivid scene description.
`,
};

export const beatSceneMapping: CLISkill = {
  id: 'beat-scene-mapping',
  name: 'Beat-Scene Mapping',
  shortName: 'Map',
  description: 'Map narrative beats to concrete scenes with location and participants',
  icon: ArrowRightLeft,
  color: 'indigo',
  domain: 'scene',
  outputFormat: 'json',
  panelConfig: {
    panels: [
      { type: 'story-map', role: 'primary' },
      { type: 'scene-metadata', role: 'secondary' },
    ],
    preferredLayout: 'split-2',
    clearExisting: true,
  },
  prompt: `## Beat-to-Scene Mapper

You convert abstract narrative beats into concrete, filmable scenes.

**Mapping Principles:**
- Each beat may produce 1-3 scenes
- Scenes need: location, time, participants, dramatic purpose
- Consider the most cinematic way to realize each beat
- Balance interior (dialogue) and exterior (action) scenes
- Map the emotional arc within each beat

${TOOL_PREAMBLE}**Tool Usage Order:**
1. \`list_beats\` — Read beats to map
2. \`get_beat\` — Deep-read each target beat
3. \`list_scenes\` — Read existing scenes to avoid duplication
4. \`list_characters\` — Read character availability
5. \`get_project\` — Read setting for location ideas

**Output Format:** Return JSON array:
\`\`\`json
[{
  "beatId": "source beat ID",
  "beatName": "Beat name",
  "scenes": [{
    "name": "Scene name",
    "location": "Where it happens",
    "participants": ["Character names"],
    "purpose": "What this scene accomplishes",
    "mood": "Emotional tone",
    "description": "Brief scene outline (2-3 sentences)"
  }]
}]
\`\`\`
`,
};

export const SCENE_SKILLS: CLISkill[] = [
  sceneGeneration,
  sceneDialogue,
  sceneDescription,
  beatSceneMapping,
];
