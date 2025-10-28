# Smart Generation System

## Overview

The Smart Generation System is a context-aware AI generation framework that gets progressively more intelligent as you add data to your project. It leverages rich contextual information from your project database to create highly consistent and interconnected story elements.

**Core Principle**: The more data saved in the project database, the easier it is to generate high-quality additions that naturally fit into your story world.

## Philosophy

Traditional AI generation prompts work in isolation, treating each generation as a standalone task. The Smart Generation System takes a holistic approach:

- **Story shapes Character Creation** - New characters naturally fit the established world
- **Character shapes Voice** - Voice generation reflects personality and background
- **Scenes flow from Story** - Each scene advances the narrative and connects to beats
- **Visuals maintain Consistency** - Images and videos reference established appearances
- **Relationships inform Interactions** - Character dynamics shape dialogue and behavior

## Architecture

### 1. Context Gathering (`src/app/lib/contextGathering.ts`)

The foundation of the system is comprehensive context gathering from the Supabase database:

```typescript
// Core Context Types
export interface ProjectContext {
  title: string;
  description?: string;
  genre?: string;
  themes?: string[];
  tone?: string;
  characterCount: number;
  sceneCount: number;
  beatCount: number;
}

export interface CharacterContext {
  name: string;
  role?: string;
  traits?: string[];
  background?: string;
  personality?: string;
  appearance?: string;
  relationships: Array<{
    targetCharacterName: string;
    relationshipType: string;
    description?: string;
  }>;
  factions?: Array<{...}>;
  scenes: Array<{...}>;
}

export interface SceneContext {
  title: string;
  location?: string;
  timeOfDay?: string;
  mood?: string;
  characters: Array<{...}>;
  beats: Array<{...}>;
  previousScene?: {...};
  nextScene?: {...};
}

export interface VisualStyleContext {
  projectStyle?: string;
  colorPalette?: string[];
  characterAppearances: Array<{
    characterId: string;
    appearance: string;
    imageUrls?: string[];
  }>;
  sceneVisuals: Array<{...}>;
}
```

### 2. Gathering Functions

Each gathering function pulls rich data with relationships:

```typescript
// Gather comprehensive project overview
const projectCtx = await gatherProjectContext(projectId);

// Get story structure (acts, beats, themes)
const storyCtx = await gatherStoryContext(projectId);

// Get character with relationships and appearances
const charCtx = await gatherCharacterContext(characterId);

// Get scene with neighboring scenes and participants
const sceneCtx = await gatherSceneContext(sceneId);

// Get visual references for consistency
const visualCtx = await gatherVisualStyleContext(projectId);
```

### 3. Smart Prompts

Smart prompts leverage gathered context to create intelligent generation instructions:

#### `smartCharacterCreationPrompt`
**Location**: `src/prompts/character/smartCharacterCreation.ts`

Creates characters that fit naturally into the existing story world:

```typescript
import {
  smartCharacterCreationPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherVisualStyleContext
} from '@/prompts';

// Gather context
const projectCtx = await gatherProjectContext(projectId);
const storyCtx = await gatherStoryContext(projectId);
const existingChars = await useCharacters(projectId);
const visualCtx = await gatherVisualStyleContext(projectId);

// Generate context-aware character
const prompt = smartCharacterCreationPrompt.user({
  characterName: "Elena Thornwood",
  characterRole: "Protagonist",
  projectContext: projectCtx,
  storyContext: storyCtx,
  existingCharacters: existingChars,
  visualStyle: visualCtx
});

// Result: Character that naturally fits themes, connects to existing cast,
// matches visual style, and serves the narrative arc
```

**What it includes**:
- Project title, genre, themes, tone
- Story structure (acts and beats)
- Existing characters with relationships
- Visual style consistency
- Requests 8 aspects: traits, background, personality, appearance, motivations, relationships, story role, character arc

#### `smartSceneGenerationPrompt`
**Location**: `src/prompts/scene/smartSceneGeneration.ts`

Generates scenes that flow naturally from story progression:

```typescript
import {
  smartSceneGenerationPrompt,
  gatherSceneContext,
  gatherSceneCharacters
} from '@/prompts';

// Gather context
const sceneCtx = await gatherSceneContext(previousSceneId);
const characters = await gatherSceneCharacters(currentSceneId);
const storyCtx = await gatherStoryContext(projectId);

const prompt = smartSceneGenerationPrompt.user({
  sceneTitle: "The Confrontation",
  sceneLocation: "Abandoned Warehouse",
  projectContext: projectCtx,
  storyContext: storyCtx,
  sceneContext: sceneCtx,
  characters: characters
});

// Result: Scene that flows from previous, uses character relationships,
// advances story beats, and sets up future developments
```

**What it includes**:
- Previous scene for continuity
- Next scene to lead into
- Character relationships and dynamics
- Story beats to advance
- Project themes and tone
- Requests: description, action, dynamics, dialogue direction, visual moments, scene purpose, emotional arc

#### `smartImageGenerationPrompt`
**Location**: `src/prompts/image/smartImageGeneration.ts`

Maintains visual consistency across all generated images:

```typescript
import {
  smartImageGenerationPrompt,
  gatherVisualStyleContext,
  gatherCharacterContext
} from '@/prompts';

// For character image
const visualCtx = await gatherVisualStyleContext(projectId);
const charCtx = await gatherCharacterContext(characterId);

const prompt = smartImageGenerationPrompt.user({
  basicPrompt: "Portrait of Elena in formal attire",
  imageType: 'character',
  projectContext: projectCtx,
  visualStyleContext: visualCtx,
  characters: [charCtx]
});

// Result: Image prompt that maintains character appearance consistency,
// uses established color palette, matches project style
```

**What it includes**:
- Established visual style and color palette
- Character appearance references
- Previous image URLs for consistency
- Scene context (location, mood, time)
- Story tone and genre

#### `smartVideoGenerationPrompt`
**Location**: `src/prompts/video/smartVideoGeneration.ts`

Creates videos with cinematic and narrative continuity:

```typescript
import {
  smartVideoGenerationPrompt,
  gatherSceneContext,
  gatherVisualStyleContext
} from '@/prompts';

const sceneCtx = await gatherSceneContext(sceneId);
const characters = await gatherSceneCharacters(sceneId);
const visualCtx = await gatherVisualStyleContext(projectId);

const prompt = smartVideoGenerationPrompt.user({
  basicPrompt: "Elena confronts Marcus about the betrayal",
  projectContext: projectCtx,
  sceneContext: sceneCtx,
  characters: characters,
  visualStyleContext: visualCtx,
  duration: 5,
  previousShots: [...]
});

// Result: Video prompt with camera work, character dynamics, lighting,
// and narrative flow that maintains continuity
```

**What it includes**:
- Character appearances and relationship dynamics
- Previous shots for visual continuity
- Scene mood, location, time of day
- Visual style and color palette
- Requests: camera work (movement, angle, shot type), motion & action, lighting & atmosphere, narrative flow

## Usage Patterns

### Pattern 1: Progressive Enhancement

As you add data, generation quality improves automatically:

```typescript
// Early project (minimal data)
const charCtx = await gatherCharacterContext(characterId);
// Returns: Basic character info

// Mid project (more relationships)
const charCtx = await gatherCharacterContext(characterId);
// Returns: Character + 5 relationships + 2 factions

// Mature project (rich connections)
const charCtx = await gatherCharacterContext(characterId);
// Returns: Character + 15 relationships + 4 factions + 20 scenes
// Smart prompts now generate with deep story integration
```

### Pattern 2: Context Summary for Quick Overview

```typescript
import { buildContextSummary } from '@/prompts';

const summary = buildContextSummary({
  project: projectCtx,
  story: storyCtx,
  characters: [char1Ctx, char2Ctx],
  scene: sceneCtx,
  visual: visualCtx
});

// Returns formatted text summary of all context
// Useful for debugging or showing users what data is being used
```

### Pattern 3: Incremental Context Building

Only gather what you need for performance:

```typescript
// Light context (fast)
const projectCtx = await gatherProjectContext(projectId);

// Medium context (moderate)
const projectCtx = await gatherProjectContext(projectId);
const storyCtx = await gatherStoryContext(projectId);

// Full context (comprehensive)
const projectCtx = await gatherProjectContext(projectId);
const storyCtx = await gatherStoryContext(projectId);
const charCtx = await gatherCharacterContext(characterId);
const sceneCtx = await gatherSceneContext(sceneId);
const visualCtx = await gatherVisualStyleContext(projectId);
```

## Integration Examples

### Example 1: Smart Character Creation in Component

```typescript
import { useState } from 'react';
import {
  smartCharacterCreationPrompt,
  gatherProjectContext,
  gatherStoryContext,
  gatherVisualStyleContext
} from '@/prompts';
import { useCharacters } from '@/hooks/useCharacters';
import { useProjectStore } from '@/store/projectStore';

export const SmartCharacterCreator: React.FC = () => {
  const { activeProjectId } = useProjectStore();
  const { data: existingCharacters } = useCharacters(activeProjectId);
  const [characterName, setCharacterName] = useState('');
  const [characterRole, setCharacterRole] = useState('');

  const handleGenerate = async () => {
    // Gather all relevant context
    const projectCtx = await gatherProjectContext(activeProjectId);
    const storyCtx = await gatherStoryContext(activeProjectId);
    const visualCtx = await gatherVisualStyleContext(activeProjectId);

    // Build smart prompt
    const systemPrompt = smartCharacterCreationPrompt.system;
    const userPrompt = smartCharacterCreationPrompt.user({
      characterName,
      characterRole,
      projectContext: projectCtx,
      storyContext: storyCtx,
      existingCharacters: existingCharacters,
      visualStyle: visualCtx
    });

    // Send to your LLM API
    const result = await callLLMAPI({
      system: systemPrompt,
      user: userPrompt
    });

    // Parse result and create character
    // Result will naturally fit the story world!
  };

  return (/* UI for character creation */);
};
```

### Example 2: Smart Scene Generation

```typescript
import {
  smartSceneGenerationPrompt,
  gatherSceneContext,
  gatherSceneCharacters,
  gatherStoryContext
} from '@/prompts';

export const SmartSceneGenerator: React.FC<{
  previousSceneId: string;
  selectedCharacterIds: string[];
}> = ({ previousSceneId, selectedCharacterIds }) => {

  const handleGenerate = async (title: string, location: string) => {
    // Gather context about previous scene
    const prevSceneCtx = await gatherSceneContext(previousSceneId);

    // Gather full character contexts with relationships
    const characters = await Promise.all(
      selectedCharacterIds.map(id => gatherCharacterContext(id))
    );

    // Get story context for beats and acts
    const storyCtx = await gatherStoryContext(activeProjectId);
    const projectCtx = await gatherProjectContext(activeProjectId);

    // Generate smart scene
    const prompt = smartSceneGenerationPrompt.user({
      sceneTitle: title,
      sceneLocation: location,
      projectContext: projectCtx,
      storyContext: storyCtx,
      sceneContext: {
        previousScene: prevSceneCtx,
        // Can also include nextScene if known
      },
      characters: characters.filter(Boolean)
    });

    // Scene will flow naturally from previous and use character dynamics
  };

  return (/* UI */);
};
```

### Example 3: Maintaining Visual Consistency

```typescript
import {
  smartImageGenerationPrompt,
  gatherVisualStyleContext,
  gatherCharacterContext
} from '@/prompts';

export const ConsistentImageGenerator: React.FC = () => {

  const generateCharacterImage = async (
    characterId: string,
    basicPrompt: string
  ) => {
    // Gather character appearance and existing images
    const charCtx = await gatherCharacterContext(characterId);

    // Gather project visual style
    const visualCtx = await gatherVisualStyleContext(activeProjectId);

    // Generate prompt that maintains consistency
    const prompt = smartImageGenerationPrompt.user({
      basicPrompt,
      imageType: 'character',
      visualStyleContext: visualCtx,
      characters: [charCtx],
      projectContext: await gatherProjectContext(activeProjectId)
    });

    // Send to image generation API
    // Result will match established character appearance and project style
  };

  return (/* UI */);
};
```

## Benefits

### 1. **Progressive Intelligence**
- Empty project: Basic generation
- Growing project: Contextual generation
- Mature project: Deeply interconnected generation

### 2. **Visual Consistency**
- Characters look the same across images
- Scenes maintain established atmosphere
- Color palettes remain consistent
- Style matches project vision

### 3. **Narrative Cohesion**
- New characters fit the story world
- Scenes flow naturally
- Character interactions reflect relationships
- Story beats advance organically

### 4. **Time Savings**
- Less manual prompt engineering
- Fewer regenerations for consistency
- Automatic relationship integration
- Smart suggestions based on existing data

### 5. **Quality Improvement**
- Richer character backgrounds
- More believable interactions
- Coherent visual style
- Professional storytelling flow

## Best Practices

### 1. Build Your Foundation First
Add core data before heavy generation:
- Define project genre, themes, tone
- Create main characters with relationships
- Establish story structure (acts, beats)
- Set visual style and color palette

### 2. Use Existing Data
Always check for existing context before creating new:
```typescript
// Good: Check existing characters first
const existingChars = await useCharacters(projectId);
if (existingChars.length > 0) {
  // Use smart generation with character context
} else {
  // Use basic generation
}
```

### 3. Update Context Regularly
When you modify entities, regenerate related content:
- Change character appearance → Regenerate character images
- Add new relationships → Regenerate scenes with those characters
- Update story themes → Regenerate character motivations

### 4. Start Broad, Then Specific
Gather context hierarchically:
```typescript
// 1. Project context (broad)
const projectCtx = await gatherProjectContext(projectId);

// 2. Story context (structure)
const storyCtx = await gatherStoryContext(projectId);

// 3. Specific context (detailed)
const charCtx = await gatherCharacterContext(characterId);
const sceneCtx = await gatherSceneContext(sceneId);
```

### 5. Cache Context When Possible
Context gathering involves database queries:
```typescript
// Cache in component state for multiple uses
const [projectCtx, setProjectCtx] = useState(null);

useEffect(() => {
  gatherProjectContext(projectId).then(setProjectCtx);
}, [projectId]);

// Reuse cached context for multiple generations
```

## Performance Considerations

### Query Optimization
Context gathering uses Supabase joins to minimize round trips:
```typescript
// Single query with joins (fast)
const { data } = await supabase
  .from('characters')
  .select(`
    *,
    character_traits(trait),
    character_relationships(target_character:characters!target_character_id(name))
  `);

// Multiple queries (slow - avoid)
const character = await supabase.from('characters').select('*').single();
const traits = await supabase.from('character_traits').select('*');
const relationships = await supabase.from('character_relationships').select('*');
```

### Selective Gathering
Don't gather more than you need:
```typescript
// For character creation: Don't need scene context
const projectCtx = await gatherProjectContext(projectId);
const storyCtx = await gatherStoryContext(projectId);
// Skip: gatherSceneContext, gatherVisualStyleContext

// For image generation: Don't need full character relationships
const visualCtx = await gatherVisualStyleContext(projectId);
const charCtx = await gatherCharacterContext(characterId);
// Skip: gatherStoryContext (unless needed for thematic elements)
```

## Future Enhancements

Potential areas for expansion:

1. **Caching Layer** - Cache frequently accessed context with invalidation
2. **Context Diffing** - Only fetch changed data since last generation
3. **Smart Suggestions** - Proactively suggest generations based on gaps
4. **Relationship Strength** - Weight relationship importance in prompts
5. **Temporal Context** - Track when data was created/modified
6. **Context Visualization** - Show users what data influences generation
7. **A/B Testing** - Compare smart vs basic generation results

## Conclusion

The Smart Generation System transforms your project database into an intelligent storytelling assistant. As you build your story world with characters, scenes, relationships, and visual elements, the system automatically leverages this rich context to generate content that feels cohesive, consistent, and professionally crafted.

**Remember**: Every piece of data you add makes the system smarter. Start building your foundation, and watch the AI grow with your story.
