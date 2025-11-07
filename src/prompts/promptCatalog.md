# Prompt Catalog

A comprehensive catalog of all AI prompts available in the Story application, organized by category. Each prompt is designed to work with specific entities and context to generate high-quality, story-relevant content.

---

## Table of Contents

- [Project Prompts](#project-prompts)
- [Character Prompts](#character-prompts)
- [Faction Prompts](#faction-prompts)
- [Story Prompts](#story-prompts)
- [Scene Prompts](#scene-prompts)
- [Image Generation Prompts](#image-generation-prompts)
- [Video Generation Prompts](#video-generation-prompts)
- [Voice Prompts](#voice-prompts)
- [Dataset Prompts](#dataset-prompts)

---

## Project Prompts

### Project Inspiration
**File:** `project/projectInspiration.ts`

**Purpose:** Generates story inspiration and thematic ideas based on user's initial thoughts. Helps writers develop their concept into a more detailed and compelling description.

**Output:** 2-4 paragraphs (150-300 words) of inspiring story description with themes, conflicts, and story hooks.

---

## Character Prompts

### Character Trait Generation
**File:** `character/characterTrait.ts`

**Purpose:** Generates compelling, nuanced character traits using professional character development principles. Focuses on three dimensions (physical, psychological, social) and creates traits that reveal core wounds, show contradictions, and connect to themes.

**Entities Used:**
- Character Name
- Character Type
- Role in Story
- Background
- Existing Traits (array)
- Faction (with values)
- Relationships
- Story Themes

**Output:** JSON array of 3-5 traits with categories (personality, physical, skill, flaw).

**Enhanced Features:**
- Three-dimensional character framework (physical, psychological, social)
- Emphasis on core wounds and contradictions
- Faction integration (embody, struggle with, or subvert values)
- Thematic resonance
- Specific over generic (concrete behavioral details)

---

### Character Backstory Enhancement
**File:** `character/characterBackstory.ts`

**Purpose:** Creates psychologically rich backstories using professional screenwriting principles. Every backstory includes the ghost/wound, the lie they believe, defining moments, want vs need, and relationships that formed them.

**Entities Used:**
- Character Name
- Current Backstory
- Traits (array)
- Age
- Occupation
- Relationships (array with name and type)
- Faction (affiliation and values)
- Story Role
- Story Themes

**Output:** 2-4 paragraphs (200-350 words) covering the ghost/wound, the lie they believe, defining moments, relationships that formed them, and want vs need.

**Enhanced Features:**
- Based on "The Anatomy of Story" (John Truby)
- Ghost/wound and the lie they believe framework
- Want vs Need for character arc setup
- Faction integration (how they joined, belief alignment)
- Explains current traits through past experiences
- Plants seeds for character arc

---

### Character Dialogue Style
**File:** `character/characterDialogue.ts`

**Purpose:** Generates dialogue samples or improves existing dialogue for character consistency and authenticity.

**Entities Used:**
- Character Name
- Traits (array)
- Background
- Situation/Context
- Current Dialogue (optional)
- Tone

**Output:** 2-3 example dialogue lines or improved dialogue with character-specific voice.

---

### Personality Extraction
**File:** `character/personalityExtraction.ts`

**Purpose:** Analyzes transcribed audio/text to extract personality traits and speaking style.

**Entities Used:**
- Transcription Text
- Character Name
- Additional Context

**Output:** JSON object with personality summary, traits, speaking style, emotional range, values, communication patterns, notable quotes, and confidence score.

---

### Smart Character Creation (Context-Aware)
**File:** `character/smartCharacterCreation.ts`

**Purpose:** Creates characters using professional character architecture principles. Ensures characters fill narrative gaps, have clear want/need, embody contradictions, and connect organically to existing characters.

**Entities Used:**
- Character Name
- Character Role
- Project Context (title, description, genre, themes, tone, character count)
- Story Context (acts, beats)
- Existing Characters (with traits and relationships)
- Existing Factions (for affiliation options)
- Visual Style (style, color palette)

**Output:** Comprehensive 10-section profile: Core Identity & Function, The Ghost/Wound, Want vs Need, Core Traits, Background & Faction, Personality & Voice, Appearance, Relationships, Thematic Purpose, and Character Arc.

**Enhanced Features:**
- Hero's Journey archetypes framework
- Three dimensions: Physical, Psychological, Social
- Ghost/wound and want vs need structure
- Faction integration and value alignment
- Thematic purpose clearly defined
- Character function in narrative ecosystem

---

## Faction Prompts

### Faction Description Enhancement
**File:** `faction/factionDescription.ts`

**Purpose:** Creates or enhances faction descriptions using professional world-building principles. Focuses on core identity, values, culture, structure, and dramatic potential.

**Entities Used:**
- Faction Name
- Current Description (optional)
- Project Context (title, genre, description, themes)
- Existing Factions (for differentiation)
- Characters (faction members)
- Story Themes

**Output:** 2-4 paragraphs (200-400 words) covering core identity, values & culture, structure & power, and goals & conflicts. Creates factions that feel like living societies with internal logic and dramatic richness.

**Enhanced Features:**
- Draws on world-building theory (Tolkien, Martin, Herbert)
- Emphasizes internal contradictions and complexity
- Connects faction identity to story themes
- Considers faction relationships and power dynamics

---

### Faction Lore Generation
**File:** `faction/factionLore.ts`

**Purpose:** Creates rich lore entries covering history, culture, notable figures, and conflicts. Lore should reveal character, create depth, and plant seeds for plot.

**Entities Used:**
- Faction Name
- Lore Category (history, culture, notable-figures, conflicts)
- Current Lore (optional)
- Faction Description
- Project Context
- Existing Lore (for consistency)
- Related Factions
- Timeline Position

**Output:** 3-5 paragraphs (250-400 words) of rich, specific lore with concrete details, emotional resonance, and story potential. Category-specific guidance for history, culture, notable figures, or conflicts.

**Enhanced Features:**
- Specific guidance for each lore category
- Emphasis on concrete details and memorable elements
- Seeds for character backstories and plot conflicts
- Maintains consistency with established faction identity

---

### Faction Relationship Description
**File:** `faction/factionRelationship.ts`

**Purpose:** Develops complex, multifaceted relationships between factions. Relationships should be historically grounded, dramatically rich, and evolving.

**Entities Used:**
- Faction A (with description, values, goals)
- Faction B (with description, values, goals)
- Current Relationship (optional)
- Relationship Type
- Historical Events (shared history)
- Shared Characters
- Project Context

**Output:** 2-3 paragraphs (150-300 words) covering surface dynamics, historical roots, underlying complexity, and story potential. Creates nuanced relationships beyond simple ally/enemy labels.

**Enhanced Features:**
- Inspired by real-world geopolitics
- Emphasizes complexity and nuance
- Historical grounding for current relations
- Story opportunities through relationship tensions

---

### Smart Faction Creation (Context-Aware)
**File:** `faction/smartFactionCreation.ts`

**Purpose:** Creates factions that fit seamlessly into existing story world. Considers themes, existing factions, characters, and narrative needs to create factions that feel necessary and integrated.

**Entities Used:**
- Faction Name
- Faction Role (intended purpose)
- Project Context (title, description, genre, tone)
- Story Context (acts, main conflict)
- Existing Factions (for differentiation)
- Characters (potential members and connections)
- Themes

**Output:** Comprehensive faction profile with 9 sections: Core Identity, Values & Philosophy, Structure & Leadership, Culture & Traditions, Goals & Motivations, Relationships with Other Factions, Historical Context, Narrative Role, and Suggested Members.

**Enhanced Features:**
- Ensures faction fills unique narrative niche
- Connects to existing characters and factions
- Embodies or challenges story themes
- Provides complete world-building framework

---

## Story Prompts

### Story Description Enhancement
**File:** `story/storyDescription.ts`

**Purpose:** Improves or generates story descriptions/summaries that capture the essence of the narrative.

**Entities Used:**
- Current Description
- Genre
- Themes (array)
- Characters (array with name and role)
- Acts (array with summary)
- Target Length (short/medium/long)

**Output:** Description ranging from 50-500 words depending on target length, focusing on conflict, stakes, and uniqueness.

---

### Beat Description
**File:** `story/beatDescription.ts`

**Purpose:** Develops story beats using professional narrative frameworks (Save the Cat, Dan Harmon's Story Circle, Scene/Sequel pattern). Each beat creates change through action, reaction, decision, and consequence.

**Entities Used:**
- Beat Name
- Current Description
- Beat Type
- Preceding Beats (array)
- Characters Involved (array)
- Act Context
- Story Themes

**Output:** 2-4 sentences covering what happens, the change (before → after), character impact, causality, and thematic purpose.

**Enhanced Features:**
- Based on professional beat theory (Blake Snyder, Dan Harmon, Dwight Swain)
- Emphasis on causality and change
- Every beat must raise stakes and reveal character
- Thematic resonance required
- Specific over vague (concrete events, not summaries)

---

### Act Summary
**File:** `story/actSummary.ts`

**Purpose:** Generates or improves act summaries based on beats and scenes, capturing key turning points.

**Entities Used:**
- Act Number
- Act Name
- Current Summary
- Beats (array with name and description)
- Scenes (array)
- Main Characters (array)

**Output:** 3-4 sentence summary covering main events, character development, and story progression.

---

## Scene Prompts

### Scene Description
**File:** `scene/sceneDescription.ts`

**Purpose:** Crafts scene descriptions using cinematic and literary techniques. Descriptions establish POV, create atmosphere, hint at subtext, and ground the reader through emotional filtering.

**Entities Used:**
- Scene Name
- Current Description
- Location
- Time of Day
- Characters Present (array)
- Mood/Tone
- Scene Purpose
- POV Character (for filtering)
- Emotional State
- Story Themes

**Output:** 2-4 sentences (150-250 words) establishing setting through POV, creating atmosphere, reflecting emotional state, hinting at stakes/subtext, and serving theme.

**Enhanced Features:**
- POV-filtered description (characters notice different things based on emotional state)
- Show don't tell principles
- Active description (things in motion, in relation to characters)
- Emotional filtering (setting reflects internal landscape)
- Specific beats general (concrete sensory details)
- Thematic symbolism when organic
- Cinematic thinking (camera, focus, movement)

---

### Dialogue Improvement
**File:** `scene/dialogueImprovement.ts`

**Purpose:** Improves dialogue using professional screenwriting and theatrical craft. Focuses on subtext, objectives, obstacles, tactics, and voice distinction.

**Entities Used:**
- Dialogue Text
- Characters (array with names, traits, faction, background)
- Scene Context
- Emotional State
- Target Tone
- Objectives (what characters want)
- Conflict Type

**Output:** Improved dialogue with subtext, distinct voices, natural speech patterns, character objectives, and enhanced conflict.

**Enhanced Features:**
- Multi-level dialogue: surface, subtext, objective, obstacle, tactics
- Subtext techniques (deflection, coded language, power dynamics, emotional displacement)
- Voice differentiation (vocabulary, rhythm, directness, verbal tics, formality)
- Compression (cut 30%, interruptions, fragments)
- Faction influences speech patterns
- Objectives drive dialogue choices
- Avoid exposition dumps and on-the-nose dialogue
- Stage directions for clarity

---

### Smart Scene Generation (Context-Aware)
**File:** `scene/smartSceneGeneration.ts`

**Purpose:** Generates complete scenes that flow naturally from story progression, character relationships, and narrative continuity.

**Entities Used:**
- Scene Title
- Scene Location
- Project Context (title, themes, tone)
- Story Context (current act, beats)
- Scene Context (previous scene, next scene)
- Characters (with traits, personality, background, relationships)

**Output:** Comprehensive scene including description (150-250 words), action summary, character dynamics, dialogue direction, visual moments, scene purpose, and emotional arc.

---

## Image Generation Prompts

### Image Prompt Enhancement
**File:** `image/promptEnhancement.ts`

**Purpose:** Enhances user prompts for better AI image generation results (Stable Diffusion, DALL-E, Midjourney, Leonardo AI).

**Entities Used:**
- Current Prompt
- Prompt Type
- Style
- Additional Context

**Output:** Enhanced prompt (40-80 words) with visual details, technical quality tags, artistic style, and mood.

---

### Negative Prompt Suggestion
**File:** `image/negativePromptSuggestion.ts`

**Purpose:** Suggests negative prompts to avoid unwanted elements in image generation.

**Entities Used:**
- Main Prompt
- Image Purpose
- Style Preferences

**Output:** List of negative prompt keywords to exclude unwanted features.

---

### Prompt from Description
**File:** `image/promptFromDescription.ts`

**Purpose:** Converts natural language scene/character descriptions into optimized image generation prompts.

**Entities Used:**
- Natural Description
- Subject Type (character/scene/object)
- Style Preference
- Technical Requirements

**Output:** Optimized image generation prompt with proper formatting and technical tags.

---

### Smart Image Generation (Context-Aware)
**File:** `image/smartImageGeneration.ts`

**Purpose:** Generates image prompts that maintain visual consistency with existing project style and character designs.

**Entities Used:**
- Subject (character/scene)
- Project Context (title, genre, themes)
- Visual Style Context (existing images, color palette, art style)
- Character Context (if applicable)
- Scene Context (if applicable)

**Output:** Detailed image prompt that maintains project visual consistency.

---

## Video Generation Prompts

### Video Prompt Enhancement
**File:** `video/videoPromptEnhancement.ts`

**Purpose:** Enhances basic video prompts with motion, camera movement, and temporal details.

**Entities Used:**
- Current Prompt
- Duration (seconds)
- Motion Strength (0-1)
- Style

**Output:** Enhanced video prompt (50-100 words) with camera movement, subject motion, lighting changes, and temporal progression.

---

### Storyboard Generation
**File:** `video/storyboardGeneration.ts`

**Purpose:** Creates detailed storyboard descriptions for video sequences.

**Entities Used:**
- Scene Description
- Characters
- Action Sequence
- Duration
- Shot Types

**Output:** Frame-by-frame storyboard with camera angles, actions, and transitions.

---

### Motion Description
**File:** `video/motionDescription.ts`

**Purpose:** Generates detailed motion descriptions for video animation.

**Entities Used:**
- Subject
- Action Type
- Motion Speed
- Direction

**Output:** Technical motion description for video generation.

---

### Shot Composition
**File:** `video/shotComposition.ts`

**Purpose:** Suggests camera angles, framing, and composition for video shots.

**Entities Used:**
- Scene Type
- Emotional Tone
- Subject Focus
- Cinematic Style

**Output:** Detailed shot composition with camera placement, framing, and lighting suggestions.

---

### Smart Video Generation (Context-Aware)
**File:** `video/smartVideoGeneration.ts`

**Purpose:** Generates video prompts that align with story beats, character arcs, and established visual style.

**Entities Used:**
- Scene Context
- Characters (with relationships and emotional states)
- Story Beat
- Visual Style Context
- Previous/Next Shots

**Output:** Comprehensive video prompt with motion, composition, and narrative alignment.

---

## Voice Prompts

### Voice Description
**File:** `voice/voiceDescription.ts`

**Purpose:** Creates descriptions for voice profiles based on audio characteristics and character traits.

**Entities Used:**
- Voice Name
- Character Name
- Audio Features (pitch, tempo, tone)
- Current Description
- Age
- Gender
- Personality (array)

**Output:** 2-3 sentence description covering pitch range, speaking pace, distinctive characteristics, and emotional texture.

---

### Voice Characterization
**File:** `voice/voiceCharacterization.ts`

**Purpose:** Generates voice direction for voice actors or TTS systems based on character.

**Entities Used:**
- Character Name
- Personality Traits
- Age
- Background
- Emotional State
- Scene Context

**Output:** Voice direction guide with pitch, pace, tone, accent, and emotional delivery notes.

---

## Dataset Prompts

### Dataset Tagging
**File:** `dataset/datasetTagging.ts`

**Purpose:** Generates relevant, consistent tags for dataset items (images, audio, etc.) for organization and search.

**Entities Used:**
- Item Type
- Item Name
- Description
- Existing Tags (array)
- Project Context

**Output:** JSON array of 5-10 tags across categories: content descriptors, style/mood, use cases, and technical tags.

---

### Image Analysis
**File:** `dataset/imageAnalysis.ts`

**Purpose:** Analyzes images to extract content, style, and metadata for dataset organization.

**Entities Used:**
- Image URL or Base64
- Analysis Depth (quick/detailed)
- Focus Areas (composition/color/subject)

**Output:** Structured analysis with content description, detected objects, colors, style, mood, and suggested tags.

---

### Audio Transcription
**File:** `dataset/audioTranscription.ts`

**Purpose:** Provides context and structure for audio transcription and analysis.

**Entities Used:**
- Audio File Reference
- Expected Speaker(s)
- Language
- Context

**Output:** Transcription with speaker identification, timestamps, and content structure.

---

## Usage Guidelines

### Context Gathering
All "Smart" prompts (smartCharacterCreation, smartSceneGeneration, smartImageGeneration, smartVideoGeneration) use the context gathering system from `app/lib/contextGathering.ts`. This system automatically collects relevant project data to provide rich context for AI generation.

### Prompt Template Structure
All prompts follow the `PromptTemplate` interface:
```typescript
{
  system: string;           // System instructions for the AI
  user: (context) => string; // User prompt generator function
}
```

### Integration
Prompts are used with the `useLLM` hook:
```typescript
const { generateFromTemplate } = useLLM();
const response = await generateFromTemplate(promptName, context);
```

---

## Adding New Prompts

When creating a new prompt:

1. Create a new `.ts` file in the appropriate category folder
2. Follow the `PromptTemplate` interface
3. Document entities used in the context parameter
4. Export the prompt with a descriptive name
5. Add the export to `prompts/index.ts`
6. Update this catalog with the new prompt details

---

---

## Prompt Enhancement Summary

### Recent Improvements (2025-11-03)

**New Faction System:**
- Added 4 comprehensive faction prompts using professional world-building principles
- Faction prompts integrate with character system
- Based on successful world-building examples (Tolkien, Martin, Herbert)

**Character Prompts Enhanced:**
- Integrated faction context throughout character prompts
- Added professional frameworks: Ghost/Wound, Want vs Need, Three Dimensions
- Based on "The Anatomy of Story" (John Truby) and character arc theory
- Emphasis on psychological depth and thematic resonance

**Story & Scene Prompts Enhanced:**
- Beat descriptions now use Save the Cat, Dan Harmon's Story Circle, Scene/Sequel pattern
- Scene descriptions employ cinematic techniques and emotional filtering
- Dialogue improvement uses professional screenwriting principles (subtext, objectives, tactics)
- All prompts emphasize causality, change, and thematic purpose

**Core Improvements Across All Prompts:**
- Specific beats general (concrete details over vague labels)
- Professional frameworks integrated (not just instructions)
- Thematic resonance emphasized
- Causality and change required
- Show don't tell principles
- Complexity and contradiction valued over simplicity

---

*Last Updated: 2025-11-03*
*Total Prompts: 32 (28 original + 4 faction)*
