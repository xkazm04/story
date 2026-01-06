/**
 * Mock Characters Data
 */

import { Character, Trait, CharRelationship } from '@/app/types/Character';

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
    description: "Cunning, mysterious, and fiercely independent. Trust doesn't come easily.",
  },
  {
    id: 'trait-6',
    character_id: 'char-2',
    type: 'motivations',
    description: "Seeks to uncover the truth about her parents' mysterious disappearance.",
  },
];

export const mockCharRelationships: CharRelationship[] = [
  {
    id: 'rel-1',
    character_a_id: 'char-1',
    character_b_id: 'char-2',
    description: "Reluctant allies. Aldric doesn't trust Lyra's methods, but respects her skills.",
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
