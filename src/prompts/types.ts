/**
 * Shared type definitions for prompt contexts
 */

export interface CharacterInfo {
  id: string;
  name: string;
  role?: string;
  appearance?: string;
  traits?: string[];
  personality?: string;
  background?: string;
  relationships?: CharacterRelationship[];
}

export interface CharacterRelationship {
  targetCharacterId: string;
  targetCharacterName: string;
  relationshipType: string;
  description?: string;
}

export interface SceneInfo {
  title: string;
  description?: string;
  location?: string;
  timeOfDay?: string;
  mood?: string;
}

export interface PreviousShot {
  prompt?: string;
  description?: string;
}

export interface StoryBeat {
  name: string;
  description?: string;
}

export interface ProjectContextInfo {
  title?: string;
  genre?: string;
  tone?: string;
  themes?: string[];
}

export interface StoryContextInfo {
  currentActName?: string;
  beats?: StoryBeat[];
}

export interface SceneContextInfo {
  previousScene?: SceneInfo;
  nextScene?: SceneInfo;
}

export interface VisualStyleContextInfo {
  projectStyle?: string;
  colorPalette?: string[];
}

// ============================================================================
// Act Description Recommendation Types
// ============================================================================

export interface ActInfo {
  id: string;
  name: string;
  description?: string;
  order?: number;
}

export interface BeatInfo {
  id?: string;
  name: string;
  description?: string;
  type?: 'act' | 'story';
  order?: number;
}

export interface ActDescriptionRecommendationContext {
  newBeat: BeatInfo;
  targetAct: ActInfo;
  allActs: ActInfo[];
  projectTitle?: string;
  projectDescription?: string;
  storyBeats?: BeatInfo[];
  allScenes?: Array<{ id?: string; name?: string; description?: string; act_id?: string }>;
  existingActBeats?: Record<string, BeatInfo[]>;
}

// ============================================================================
// Smart Faction Creation Types
// ============================================================================

export interface FactionInfo {
  name: string;
  description?: string;
  values?: string;
  memberCount?: number;
}

export interface SmartFactionCreationContext {
  factionName: string;
  factionRole?: string;
  projectContext?: {
    title?: string;
    description?: string;
    genre?: string;
    tone?: string;
  };
  storyContext?: {
    acts?: ActInfo[];
    mainConflict?: string;
  };
  existingFactions?: FactionInfo[];
  characters?: Array<{
    name: string;
    role?: string;
    faction?: string;
    traits?: string[];
  }>;
  themes?: string[];
}

// ============================================================================
// Smart Character Creation Types
// ============================================================================

export interface SmartCharacterCreationContext {
  characterName: string;
  characterRole?: string;
  projectContext?: {
    title?: string;
    description?: string;
    genre?: string;
    themes?: string[];
    tone?: string;
    characterCount?: number;
  };
  storyContext?: {
    acts: ActInfo[];
    beats: BeatInfo[];
  };
  existingCharacters?: Array<{
    name: string;
    role?: string;
    faction?: string;
    traits?: string[];
    relationships?: Array<{ targetCharacterName: string }>;
  }>;
  existingFactions?: Array<{
    name: string;
    description?: string;
    values?: string;
    memberCount?: number;
  }>;
  visualStyle?: {
    projectStyle?: string;
    colorPalette?: string[];
  };
}

// ============================================================================
// Character Name Suggestions Types
// ============================================================================

export interface CharacterNameSuggestionsContext {
  partialName?: string;
  projectTitle?: string;
  projectDescription?: string;
  genre?: string;
  existingCharacters?: Array<{ name: string; role?: string }>;
  characterRole?: string;
  characterType?: string;
  characterTraits?: string[];
  characterGender?: string;
  characterAge?: string;
  faction?: string;
  relationships?: Array<{ type: string; characterName: string }>;
}
