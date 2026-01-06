/**
 * Mock Story Data (Acts and Scenes)
 */

import { Act } from '@/app/types/Act';
import { Scene } from '@/app/types/Scene';

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

export const mockScenes: Scene[] = [
  // Act 1 Scenes
  {
    id: 'scene-1',
    name: "The Knight's Oath",
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
    name: "Dragon's Warning",
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
    description: "Discovery of the enemy's stronghold",
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
