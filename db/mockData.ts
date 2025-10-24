import { Project } from '@/app/types/Project';
import { Character, Trait, CharRelationship } from '@/app/types/Character';
import { Faction, FactionRelationship } from '@/app/types/Faction';
import { Act } from '@/app/types/Act';
import { Scene } from '@/app/types/Scene';

// Mock User ID
export const MOCK_USER_ID = 'user-123';

// Mock Projects
export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'Epic Fantasy Saga',
    description: 'A tale of dragons, magic, and ancient prophecies',
    user_id: MOCK_USER_ID,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-20T15:30:00Z',
  },
  {
    id: 'proj-2',
    name: 'Cyberpunk Chronicles',
    description: 'Dark future, neon lights, and corporate espionage',
    user_id: MOCK_USER_ID,
    created_at: '2024-02-01T08:00:00Z',
    updated_at: '2024-02-10T12:00:00Z',
  },
  {
    id: 'proj-3',
    name: 'Mystery at Moonlight Manor',
    description: 'A detective story set in a haunted Victorian mansion',
    user_id: MOCK_USER_ID,
    created_at: '2024-03-05T14:00:00Z',
    updated_at: '2024-03-05T14:00:00Z',
  },
];

// Mock Factions
export const mockFactions: Faction[] = [
  {
    id: 'faction-1',
    name: 'The Silver Order',
    description: 'Ancient order of knights sworn to protect the realm',
    project_id: 'proj-1',
    color: '#3b82f6',
    logo_url: '',
  },
  {
    id: 'faction-2',
    name: 'Dragon Clan',
    description: 'Nomadic warriors who ride dragons',
    project_id: 'proj-1',
    color: '#ef4444',
    logo_url: '',
  },
  {
    id: 'faction-3',
    name: 'Shadow Guild',
    description: 'Secretive organization of spies and assassins',
    project_id: 'proj-1',
    color: '#6b7280',
    logo_url: '',
  },
];

// Mock Characters
export const mockCharacters: Character[] = [
  {
    id: 'char-1',
    name: 'Aldric Stormwind',
    type: 'Key',
    project_id: 'proj-1',
    faction_id: 'faction-1',
    avatar_url: '',
    voice: 'deep-male',
  },
  {
    id: 'char-2',
    name: 'Lyra Shadowmoon',
    type: 'Key',
    project_id: 'proj-1',
    faction_id: 'faction-3',
    avatar_url: '',
    voice: 'female-mysterious',
  },
  {
    id: 'char-3',
    name: 'Theron Drakehart',
    type: 'Major',
    project_id: 'proj-1',
    faction_id: 'faction-2',
    avatar_url: '',
  },
  {
    id: 'char-4',
    name: 'Elara Brightshield',
    type: 'Major',
    project_id: 'proj-1',
    faction_id: 'faction-1',
    avatar_url: '',
  },
  {
    id: 'char-5',
    name: 'Marcus the Wanderer',
    type: 'Minor',
    project_id: 'proj-1',
    faction_id: undefined,
    avatar_url: '',
  },
];

// Mock Traits
export const mockTraits: Trait[] = [
  {
    id: 'trait-1',
    character_id: 'char-1',
    type: 'background',
    description: 'Born into nobility, trained as a knight from childhood. Lost his family in the Dragon Wars.',
  },
  {
    id: 'trait-2',
    character_id: 'char-1',
    type: 'personality',
    description: 'Honorable, brave, and sometimes too rigid in his adherence to the code of knights.',
  },
  {
    id: 'trait-3',
    character_id: 'char-1',
    type: 'strengths',
    description: 'Master swordsman, natural leader, unwavering courage in battle.',
  },
  {
    id: 'trait-4',
    character_id: 'char-2',
    type: 'background',
    description: 'Grew up in the shadows of the city, trained by the Shadow Guild since she was a child.',
  },
  {
    id: 'trait-5',
    character_id: 'char-2',
    type: 'personality',
    description: 'Cunning, mysterious, and fiercely independent. Trust doesn\'t come easily.',
  },
  {
    id: 'trait-6',
    character_id: 'char-2',
    type: 'motivations',
    description: 'Seeks to uncover the truth about her parents\' mysterious disappearance.',
  },
];

// Mock Character Relationships
export const mockCharRelationships: CharRelationship[] = [
  {
    id: 'rel-1',
    character_a_id: 'char-1',
    character_b_id: 'char-2',
    description: 'Reluctant allies. Aldric doesn\'t trust Lyra\'s methods, but respects her skills.',
    event_date: 'Before the story',
    relationship_type: 'complicated',
  },
  {
    id: 'rel-2',
    character_a_id: 'char-1',
    character_b_id: 'char-4',
    description: 'Mentor and protégé. Aldric trained Elara in the ways of the Silver Order.',
    event_date: 'Five years ago',
    relationship_type: 'positive',
  },
  {
    id: 'rel-3',
    character_a_id: 'char-2',
    character_b_id: 'char-3',
    description: 'Ancient rivalry between their clans makes cooperation difficult.',
    event_date: 'Childhood',
    relationship_type: 'negative',
  },
];

// Mock Faction Relationships
export const mockFactionRelationships: FactionRelationship[] = [
  {
    id: 'frel-1',
    faction_a_id: 'faction-1',
    faction_b_id: 'faction-2',
    description: 'Uneasy truce after centuries of war. Trade agreement in place.',
    relationship_type: 'neutral',
  },
  {
    id: 'frel-2',
    faction_a_id: 'faction-1',
    faction_b_id: 'faction-3',
    description: 'The Silver Order hunts Shadow Guild members. Deep mistrust.',
    relationship_type: 'negative',
  },
];

// Mock Acts
export const mockActs: Act[] = [
  {
    id: 'act-1',
    name: 'Act 1: The Gathering Storm',
    project_id: 'proj-1',
    description: 'Introduction of main characters and the looming threat',
    order: 1,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'act-2',
    name: 'Act 2: Shadows Rising',
    project_id: 'proj-1',
    description: 'The conflict escalates and alliances are tested',
    order: 2,
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: 'act-3',
    name: 'Act 3: Final Confrontation',
    project_id: 'proj-1',
    description: 'The climactic battle and resolution',
    order: 3,
    created_at: '2024-01-17T10:00:00Z',
  },
];

// Mock Scenes
export const mockScenes: Scene[] = [
  // Act 1 Scenes
  {
    id: 'scene-1',
    name: 'The Knight\'s Oath',
    project_id: 'proj-1',
    act_id: 'act-1',
    order: 1,
    description: 'Aldric takes his oath at the Silver Order',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'scene-2',
    name: 'Shadows in the Alley',
    project_id: 'proj-1',
    act_id: 'act-1',
    order: 2,
    description: 'Lyra completes a dangerous mission',
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'scene-3',
    name: 'Dragon\'s Warning',
    project_id: 'proj-1',
    act_id: 'act-1',
    order: 3,
    description: 'Theron brings news of impending danger',
    created_at: '2024-01-15T12:00:00Z',
  },
  // Act 2 Scenes
  {
    id: 'scene-4',
    name: 'Unlikely Alliance',
    project_id: 'proj-1',
    act_id: 'act-2',
    order: 1,
    description: 'The heroes are forced to work together',
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: 'scene-5',
    name: 'The Hidden Fortress',
    project_id: 'proj-1',
    act_id: 'act-2',
    order: 2,
    description: 'Discovery of the enemy\'s stronghold',
    created_at: '2024-01-16T11:00:00Z',
  },
  // Act 3 Scenes
  {
    id: 'scene-6',
    name: 'Battle for the Realm',
    project_id: 'proj-1',
    act_id: 'act-3',
    order: 1,
    description: 'The final epic battle begins',
    created_at: '2024-01-17T10:00:00Z',
  },
];

// Helper functions to simulate API behavior
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const simulateApiCall = async <T>(data: T, delayMs: number = 300): Promise<T> => {
  await delay(delayMs);
  return data;
};

