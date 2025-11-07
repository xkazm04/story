/**
 * Context Gathering Utilities
 *
 * These utilities collect rich contextual data from the project database
 * to provide LLM prompts with comprehensive information for better generation.
 *
 * The more data in the project, the smarter the AI becomes.
 */

import { supabase } from '@/lib/supabase/client';

/**
 * Project Context - Overall story information
 */
export interface ProjectContext {
  id: string;
  title: string;
  description?: string;
  genre?: string;
  themes?: string[];
  tone?: string;
  targetAudience?: string;
  characterCount: number;
  sceneCount: number;
  beatCount: number;
}

/**
 * Story Context - Narrative structure and progression
 */
export interface StoryContext {
  acts: Array<{
    id: string;
    name: string;
    order: number;
    description?: string;
  }>;
  beats: Array<{
    id: string;
    name: string;
    description?: string;
    type: 'act' | 'story';
    order: number;
  }>;
  themes: string[];
  currentActName?: string;
  storyArc?: string;
}

/**
 * Character Context - Character details and relationships
 */
export interface CharacterContext {
  id: string;
  name: string;
  role?: string;
  type?: string;
  age?: number;
  gender?: string;
  traits?: string[];
  background?: string;
  personality?: string;
  appearance?: string;
  voiceDescription?: string;
  relationships: Array<{
    targetCharacterId: string;
    targetCharacterName: string;
    relationshipType: string;
    description?: string;
  }>;
  factions?: Array<{
    id: string;
    name: string;
    role?: string;
  }>;
  scenes: Array<{
    id: string;
    title: string;
    actName: string;
  }>;
}

/**
 * Scene Context - Scene details and participants
 */
export interface SceneContext {
  id: string;
  title: string;
  description?: string;
  location?: string;
  timeOfDay?: string;
  mood?: string;
  actName: string;
  actOrder: number;
  characters: Array<{
    id: string;
    name: string;
    role?: string;
    traits?: string[];
  }>;
  beats: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
  previousScene?: {
    title: string;
    description?: string;
  };
  nextScene?: {
    title: string;
    description?: string;
  };
}

/**
 * Visual Style Context - Consistent visual references
 */
export interface VisualStyleContext {
  projectStyle?: string;
  characterAppearances: Array<{
    characterId: string;
    characterName: string;
    appearance: string;
    imageUrls?: string[];
  }>;
  sceneVisuals: Array<{
    sceneId: string;
    sceneTitle: string;
    imageUrls?: string[];
    videoUrls?: string[];
  }>;
  colorPalette?: string[];
  artisticStyle?: string;
}

/**
 * Gather comprehensive project context
 */
export async function gatherProjectContext(projectId: string): Promise<ProjectContext | null> {
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (!project) return null;

    // Get counts
    const [
      { count: characterCount },
      { count: sceneCount },
      { count: beatCount }
    ] = await Promise.all([
      supabase.from('characters').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('scenes').select('id', { count: 'exact', head: true }).eq('project_id', projectId),
      supabase.from('beats').select('id', { count: 'exact', head: true }).eq('project_id', projectId)
    ]);

    return {
      id: project.id,
      title: project.title,
      description: project.description,
      genre: project.genre,
      themes: project.themes || [],
      tone: project.tone,
      targetAudience: project.target_audience,
      characterCount: characterCount || 0,
      sceneCount: sceneCount || 0,
      beatCount: beatCount || 0,
    };
  } catch (error) {
    console.error('Error gathering project context:', error);
    return null;
  }
}

/**
 * Gather story structure context
 */
export async function gatherStoryContext(projectId: string): Promise<StoryContext> {
  try {
    const [
      { data: acts },
      { data: beats }
    ] = await Promise.all([
      supabase.from('acts').select('*').eq('project_id', projectId).order('order'),
      supabase.from('beats').select('*').eq('project_id', projectId).order('order')
    ]);

    const { data: project } = await supabase
      .from('projects')
      .select('themes, description')
      .eq('id', projectId)
      .single();

    return {
      acts: acts?.map((act: any) => ({
        id: act.id,
        name: act.name,
        order: act.order,
        description: act.description
      })) || [],
      beats: beats?.map((beat: any) => ({
        id: beat.id,
        name: beat.name,
        description: beat.description,
        type: beat.type,
        order: beat.order
      })) || [],
      themes: project?.themes || [],
      storyArc: project?.description,
    };
  } catch (error) {
    console.error('Error gathering story context:', error);
    return { acts: [], beats: [], themes: [] };
  }
}

/**
 * Gather comprehensive character context
 */
export async function gatherCharacterContext(characterId: string): Promise<CharacterContext | null> {
  try {
    const { data: character } = await supabase
      .from('characters')
      .select(`
        *,
        character_traits(trait),
        voices(description)
      `)
      .eq('id', characterId)
      .single();

    if (!character) return null;

    // Get relationships
    const { data: relationships } = await supabase
      .from('character_relationships')
      .select(`
        target_character_id,
        relationship_type,
        description,
        target_character:characters!target_character_id(id, name)
      `)
      .eq('character_id', characterId);

    // Get factions
    const { data: factionMembers } = await supabase
      .from('faction_members')
      .select(`
        role,
        faction:factions(id, name)
      `)
      .eq('character_id', characterId);

    // Get scenes
    const { data: sceneCharacters } = await supabase
      .from('scene_characters')
      .select(`
        scene:scenes(id, title, act:acts(name))
      `)
      .eq('character_id', characterId);

    return {
      id: character.id,
      name: character.name,
      role: character.role,
      type: character.type,
      age: character.age,
      gender: character.gender,
      traits: character.character_traits?.map((t: any) => t.trait) || [],
      background: character.background,
      personality: character.personality,
      appearance: character.appearance,
      voiceDescription: character.voices?.[0]?.description,
      relationships: relationships?.map((r: any) => ({
        targetCharacterId: r.target_character_id,
        targetCharacterName: r.target_character?.name || 'Unknown',
        relationshipType: r.relationship_type,
        description: r.description
      })) || [],
      factions: factionMembers?.map((fm: any) => ({
        id: fm.faction?.id,
        name: fm.faction?.name,
        role: fm.role
      })) || [],
      scenes: sceneCharacters?.map((sc: any) => ({
        id: sc.scene?.id,
        title: sc.scene?.title,
        actName: sc.scene?.act?.name
      })) || []
    };
  } catch (error) {
    console.error('Error gathering character context:', error);
    return null;
  }
}

/**
 * Gather comprehensive scene context
 */
export async function gatherSceneContext(sceneId: string): Promise<SceneContext | null> {
  try {
    const { data: scene } = await supabase
      .from('scenes')
      .select(`
        *,
        act:acts(name, order)
      `)
      .eq('id', sceneId)
      .single();

    if (!scene) return null;

    // Get characters in scene
    const { data: sceneCharacters } = await supabase
      .from('scene_characters')
      .select(`
        character:characters(
          id,
          name,
          role,
          character_traits(trait)
        )
      `)
      .eq('scene_id', sceneId);

    // Get related beats
    const { data: beats } = await supabase
      .from('beats')
      .select('id, name, description')
      .eq('scene_id', sceneId);

    // Get previous and next scenes in the act
    const { data: actScenes } = await supabase
      .from('scenes')
      .select('id, title, description, order')
      .eq('act_id', scene.act_id)
      .order('order');

    const currentIndex = actScenes?.findIndex((s: any) => s.id === sceneId) || 0;
    const previousScene = currentIndex > 0 ? actScenes?.[currentIndex - 1] : undefined;
    const nextScene = currentIndex < (actScenes?.length || 0) - 1 ? actScenes?.[currentIndex + 1] : undefined;

    return {
      id: scene.id,
      title: scene.title,
      description: scene.description,
      location: scene.location,
      timeOfDay: scene.time_of_day,
      mood: scene.mood,
      actName: scene.act?.name || 'Unknown Act',
      actOrder: scene.act?.order || 0,
      characters: sceneCharacters?.map((sc: any) => ({
        id: sc.character?.id,
        name: sc.character?.name,
        role: sc.character?.role,
        traits: sc.character?.character_traits?.map((t: any) => t.trait) || []
      })) || [],
      beats: beats || [],
      previousScene: previousScene ? {
        title: previousScene.title,
        description: previousScene.description
      } : undefined,
      nextScene: nextScene ? {
        title: nextScene.title,
        description: nextScene.description
      } : undefined
    };
  } catch (error) {
    console.error('Error gathering scene context:', error);
    return null;
  }
}

/**
 * Gather visual style context for consistency
 */
export async function gatherVisualStyleContext(projectId: string): Promise<VisualStyleContext> {
  try {
    const { data: project } = await supabase
      .from('projects')
      .select('visual_style, color_palette')
      .eq('id', projectId)
      .single();

    // Get character appearances with images
    const { data: characters } = await supabase
      .from('characters')
      .select(`
        id,
        name,
        appearance,
        generated_images(url)
      `)
      .eq('project_id', projectId)
      .not('appearance', 'is', null);

    // Get scene visuals
    const { data: scenes } = await supabase
      .from('scenes')
      .select(`
        id,
        title,
        generated_images(url),
        generated_videos(url)
      `)
      .eq('project_id', projectId);

    return {
      projectStyle: project?.visual_style,
      colorPalette: project?.color_palette,
      characterAppearances: characters?.map((c: any) => ({
        characterId: c.id,
        characterName: c.name,
        appearance: c.appearance,
        imageUrls: c.generated_images?.map((img: any) => img.url)
      })) || [],
      sceneVisuals: scenes?.map((s: any) => ({
        sceneId: s.id,
        sceneTitle: s.title,
        imageUrls: s.generated_images?.map((img: any) => img.url),
        videoUrls: s.generated_videos?.map((vid: any) => vid.url)
      })) || []
    };
  } catch (error) {
    console.error('Error gathering visual style context:', error);
    return { characterAppearances: [], sceneVisuals: [] };
  }
}

/**
 * Gather all related characters for a scene
 */
export async function gatherSceneCharacters(sceneId: string): Promise<CharacterContext[]> {
  try {
    const { data: sceneCharacters } = await supabase
      .from('scene_characters')
      .select('character_id')
      .eq('scene_id', sceneId);

    if (!sceneCharacters || sceneCharacters.length === 0) return [];

    const characterContexts = await Promise.all(
      sceneCharacters.map((sc: any) => gatherCharacterContext(sc.character_id))
    );

    return characterContexts.filter((ctx: CharacterContext | null): ctx is CharacterContext => ctx !== null);
  } catch (error) {
    console.error('Error gathering scene characters:', error);
    return [];
  }
}

/**
 * Build a rich context summary for prompts
 */
export function buildContextSummary(contexts: {
  project?: ProjectContext | null;
  story?: StoryContext;
  characters?: CharacterContext[];
  scene?: SceneContext | null;
  visual?: VisualStyleContext;
}): string {
  const parts: string[] = [];

  if (contexts.project) {
    parts.push(`Project: "${contexts.project.title}"`);
    if (contexts.project.description) parts.push(`Story: ${contexts.project.description}`);
    if (contexts.project.genre) parts.push(`Genre: ${contexts.project.genre}`);
    if (contexts.project.themes?.length) parts.push(`Themes: ${contexts.project.themes.join(', ')}`);
    if (contexts.project.tone) parts.push(`Tone: ${contexts.project.tone}`);
  }

  if (contexts.story && contexts.story.acts.length > 0) {
    parts.push(`\nStory Structure: ${contexts.story.acts.length} acts`);
    if (contexts.story.beats.length > 0) {
      parts.push(`Key Beats: ${contexts.story.beats.slice(0, 3).map(b => b.name).join(', ')}`);
    }
  }

  if (contexts.characters && contexts.characters.length > 0) {
    parts.push(`\nCharacters in Context:`);
    contexts.characters.slice(0, 5).forEach(char => {
      parts.push(`- ${char.name}${char.role ? ` (${char.role})` : ''}`);
      if (char.traits && char.traits.length > 0) parts.push(`  Traits: ${char.traits.join(', ')}`);
      if (char.relationships && char.relationships.length > 0) {
        parts.push(`  Relationships: ${char.relationships.map(r => `${r.relationshipType} with ${r.targetCharacterName}`).join('; ')}`);
      }
    });
  }

  if (contexts.scene) {
    parts.push(`\nCurrent Scene: "${contexts.scene.title}" (${contexts.scene.actName})`);
    if (contexts.scene.description) parts.push(`Description: ${contexts.scene.description}`);
    if (contexts.scene.location) parts.push(`Location: ${contexts.scene.location}`);
    if (contexts.scene.mood) parts.push(`Mood: ${contexts.scene.mood}`);
    if (contexts.scene.previousScene) parts.push(`Previous: "${contexts.scene.previousScene.title}"`);
    if (contexts.scene.nextScene) parts.push(`Next: "${contexts.scene.nextScene.title}"`);
  }

  if (contexts.visual) {
    if (contexts.visual.projectStyle) parts.push(`\nVisual Style: ${contexts.visual.projectStyle}`);
    if (contexts.visual.colorPalette) parts.push(`Color Palette: ${contexts.visual.colorPalette.join(', ')}`);
  }

  return parts.join('\n');
}
