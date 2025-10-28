import { Project } from '@/app/types/Project';
import { Character, Trait, CharRelationship } from '@/app/types/Character';
import { Faction, FactionRelationship, FactionMedia, FactionEvent, FactionAchievement, FactionLore } from '@/app/types/Faction';
import { Act } from '@/app/types/Act';
import { Scene } from '@/app/types/Scene';

// Mock User ID (must match src/app/config/mockUser.ts)
export const MOCK_USER_ID = '550e8400-e29b-41d4-a716-446655440000';

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

// Mock Faction Media
export const mockFactionMedia: FactionMedia[] = [
  {
    id: 'media-1',
    faction_id: 'faction-1',
    type: 'logo',
    url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=400&h=400&fit=crop',
    uploaded_at: '2024-01-15T10:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'The Silver Order official logo',
  },
  {
    id: 'media-2',
    faction_id: 'faction-1',
    type: 'banner',
    url: 'https://images.unsplash.com/photo-1451847251646-8a6c0dd1510c?w=800&h=400&fit=crop',
    uploaded_at: '2024-01-16T11:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Silver Order banner for ceremonial events',
  },
  {
    id: 'media-3',
    faction_id: 'faction-1',
    type: 'emblem',
    url: 'https://images.unsplash.com/photo-1589254066213-a0c9dc853511?w=400&h=400&fit=crop',
    uploaded_at: '2024-01-17T14:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Silver knight emblem worn by all members',
  },
  {
    id: 'media-4',
    faction_id: 'faction-1',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1486915585738-e7e93d334cc2?w=600&h=400&fit=crop',
    uploaded_at: '2024-01-18T09:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'The Silver Fortress at dawn',
  },
  {
    id: 'media-5',
    faction_id: 'faction-2',
    type: 'logo',
    url: 'https://images.unsplash.com/photo-1592424002053-21f369ad7fdb?w=400&h=400&fit=crop',
    uploaded_at: '2024-01-19T10:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Dragon Clan emblem',
  },
  {
    id: 'media-6',
    faction_id: 'faction-2',
    type: 'banner',
    url: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&h=400&fit=crop',
    uploaded_at: '2024-01-20T12:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Dragon Clan war banner',
  },
  {
    id: 'media-7',
    faction_id: 'faction-2',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1578836537282-3171d77f8632?w=600&h=400&fit=crop',
    uploaded_at: '2024-01-21T15:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Dragon riders training in the mountains',
  },
  {
    id: 'media-8',
    faction_id: 'faction-3',
    type: 'logo',
    url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=400&fit=crop',
    uploaded_at: '2024-01-22T08:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Shadow Guild secret mark',
  },
  {
    id: 'media-9',
    faction_id: 'faction-3',
    type: 'screenshot',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop',
    uploaded_at: '2024-01-23T19:00:00Z',
    uploader_id: MOCK_USER_ID,
    description: 'Hidden Shadow Guild meeting place',
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

// Mock Faction Events
export const mockFactionEvents: FactionEvent[] = [
  {
    id: 'event-1',
    faction_id: 'faction-1',
    title: 'Founding of the Silver Order',
    description: 'The Silver Order was established by the great knight Sir Alderon the Brave, who united scattered bands of knights under one banner to protect the realm from darkness.',
    date: '1247-03-15',
    event_type: 'founding',
    created_by: MOCK_USER_ID,
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'event-2',
    faction_id: 'faction-1',
    title: 'Battle of Crystal Pass',
    description: 'The Silver Order defended Crystal Pass against a massive dragon assault, preventing the enemy from reaching the capital. This battle cemented their reputation as the realm\'s protectors.',
    date: '1298-07-22',
    event_type: 'battle',
    created_by: MOCK_USER_ID,
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'event-3',
    faction_id: 'faction-1',
    title: 'Treaty of Dawn',
    description: 'Historic peace treaty signed with the Dragon Clan after the Great War, establishing trade routes and mutual defense pacts.',
    date: '1305-01-01',
    event_type: 'alliance',
    created_by: MOCK_USER_ID,
    created_at: '2024-01-15T12:00:00Z',
  },
  {
    id: 'event-4',
    faction_id: 'faction-2',
    title: 'First Dragon Bond',
    description: 'The legendary warrior Kael forged the first bond with a wild dragon, beginning the tradition that would define the Dragon Clan.',
    date: '987-05-10',
    event_type: 'founding',
    created_by: MOCK_USER_ID,
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: 'event-5',
    faction_id: 'faction-2',
    title: 'Discovery of Dragon\'s Nest',
    description: 'The ancestral home of dragons was discovered in the Crimson Mountains, becoming the sacred grounds for the Dragon Clan.',
    date: '1102-11-30',
    event_type: 'discovery',
    created_by: MOCK_USER_ID,
    created_at: '2024-01-16T11:00:00Z',
  },
  {
    id: 'event-6',
    faction_id: 'faction-3',
    title: 'Shadow Guild Emergence',
    description: 'The Shadow Guild emerged from the underground, revealing themselves as master information brokers and covert operatives.',
    date: '1156-08-13',
    event_type: 'founding',
    created_by: MOCK_USER_ID,
    created_at: '2024-01-17T10:00:00Z',
  },
];

// Mock Faction Achievements
export const mockFactionAchievements: FactionAchievement[] = [
  {
    id: 'achievement-1',
    faction_id: 'faction-1',
    title: 'Realm Protectors',
    description: 'Successfully defended the realm from major threats for 50 consecutive years',
    icon_url: '🛡️',
    earned_date: '1300-01-01',
    members: ['char-1', 'char-4'],
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'achievement-2',
    faction_id: 'faction-1',
    title: 'Peacemakers',
    description: 'Negotiated and maintained peaceful relations with former enemies',
    icon_url: '🕊️',
    earned_date: '1305-01-01',
    members: ['char-1', 'char-4'],
    created_at: '2024-01-15T11:00:00Z',
  },
  {
    id: 'achievement-3',
    faction_id: 'faction-1',
    title: 'Elite Training Corps',
    description: 'Established the most prestigious knight training academy in the realm',
    icon_url: '⚔️',
    earned_date: '1290-06-15',
    members: ['char-1', 'char-4'],
    created_at: '2024-01-15T12:00:00Z',
  },
  {
    id: 'achievement-4',
    faction_id: 'faction-2',
    title: 'Sky Masters',
    description: 'Achieved perfect harmony between riders and dragons',
    icon_url: '🐉',
    earned_date: '1200-03-20',
    members: ['char-3'],
    created_at: '2024-01-16T10:00:00Z',
  },
  {
    id: 'achievement-5',
    faction_id: 'faction-2',
    title: 'Ancient Lineage',
    description: 'Maintained unbroken dragon bloodlines for over 300 years',
    icon_url: '🔥',
    earned_date: '1287-12-31',
    members: ['char-3'],
    created_at: '2024-01-16T11:00:00Z',
  },
  {
    id: 'achievement-6',
    faction_id: 'faction-3',
    title: 'Information Network',
    description: 'Established the most comprehensive intelligence network across all kingdoms',
    icon_url: '🕵️',
    earned_date: '1250-09-09',
    members: ['char-2'],
    created_at: '2024-01-17T10:00:00Z',
  },
];

// Mock Faction Lore
export const mockFactionLore: FactionLore[] = [
  {
    id: 'lore-1',
    faction_id: 'faction-1',
    title: 'The Code of Silver',
    content: `The Code of Silver is the foundational document that guides all members of the Silver Order. Written by Sir Alderon himself, it outlines the principles of honor, courage, and selfless service.

## Core Tenets

1. **Honor Above All** - A knight's word is their bond
2. **Courage in Darkness** - Stand firm when others flee
3. **Protect the Innocent** - The weak shall find shelter in our strength
4. **Unity in Purpose** - Together we are unbreakable

The Code has been passed down through generations, with each knight taking a sacred oath to uphold these values until their final breath.`,
    category: 'history',
    created_at: '2024-01-15T10:00:00Z',
    updated_by: MOCK_USER_ID,
  },
  {
    id: 'lore-2',
    faction_id: 'faction-1',
    title: 'The Silver Fortress',
    content: `Built into the side of Mount Argentum, the Silver Fortress serves as both the headquarters and training grounds for the Silver Order. The fortress is constructed from rare silversteel, which gleams brilliantly in the sunlight and is said to be nearly indestructible.

The fortress contains:
- The Grand Hall of Honor where ceremonies are held
- Training grounds that span several acres
- The Archive of Valor documenting every knight's deeds
- The Eternal Flame that has burned since the Order's founding`,
    category: 'culture',
    created_at: '2024-01-15T11:00:00Z',
    updated_by: MOCK_USER_ID,
  },
  {
    id: 'lore-3',
    faction_id: 'faction-1',
    title: 'The Great War with Dragons',
    content: `For nearly a century, the Silver Order engaged in brutal conflict with the Dragon Clan. This period, known as the Dragon Wars, saw countless battles and tremendous loss on both sides.

The war began when a rogue dragon destroyed a border village, leading to escalating retaliation. It finally ended with the Treaty of Dawn, brokered by Sir Aldric Stormwind and Theron Drakehart's grandfather, who recognized that continued conflict would destroy both factions.`,
    category: 'conflicts',
    created_at: '2024-01-15T12:00:00Z',
    updated_by: MOCK_USER_ID,
  },
  {
    id: 'lore-4',
    faction_id: 'faction-1',
    title: 'Sir Alderon the Brave',
    content: `The founder of the Silver Order, Sir Alderon was a legendary warrior who united scattered knights under one banner. Born to a humble blacksmith, Alderon showed exceptional courage from a young age.

His most famous deed was single-handedly defending a village from a band of marauders for three days until reinforcements arrived. This act of heroism inspired others to join his cause, eventually forming the Silver Order.

Alderon's silversteel sword, "Dawnbringer," is preserved in the Grand Hall and remains a symbol of the Order's enduring legacy.`,
    category: 'notable-figures',
    created_at: '2024-01-15T13:00:00Z',
    updated_by: MOCK_USER_ID,
  },
  {
    id: 'lore-5',
    faction_id: 'faction-2',
    title: 'The First Bond',
    content: `The Dragon Clan's entire culture revolves around the sacred bond between rider and dragon. Legend tells of Kael the Fearless, who climbed the treacherous peaks of the Crimson Mountains and faced a wild dragon in its lair.

Rather than fighting, Kael spoke to the dragon in the ancient tongue, showing no fear. Moved by the human's courage and respect, the dragon, named Emberhorn, chose to bond with Kael. This partnership became the template for all future bonds, proving that trust and mutual respect are the foundation of the Dragon Clan's power.`,
    category: 'history',
    created_at: '2024-01-16T10:00:00Z',
    updated_by: MOCK_USER_ID,
  },
  {
    id: 'lore-6',
    faction_id: 'faction-2',
    title: 'Dragon Bonding Ceremony',
    content: `When a young member of the Dragon Clan comes of age, they undergo the Bonding Ceremony. This sacred rite takes place at Dragon's Nest during the autumn equinox.

The ceremony involves:
- A week-long fast and meditation
- A solo journey to the dragon nesting grounds
- Offerings of precious gems and crafted weapons
- The "Call," where the initiate uses ancient dragon speech
- If accepted, a lifelong bond forms between rider and dragon

Not all who attempt the ceremony succeed. Those who fail are not shamed but find other ways to serve the Clan.`,
    category: 'culture',
    created_at: '2024-01-16T11:00:00Z',
    updated_by: MOCK_USER_ID,
  },
  {
    id: 'lore-7',
    faction_id: 'faction-3',
    title: 'The Shadow Network',
    content: `The Shadow Guild's true power lies not in combat but in information. They maintain an intricate network of informants, safe houses, and secret passages throughout every major city in the realm.

Guild members communicate using a complex cipher system that changes monthly. Each member knows only their direct contacts, ensuring the network cannot be compromised even if individuals are captured.

Their motto, "Knowledge is the sharpest blade," reflects their philosophy that information can topple kingdoms more effectively than any army.`,
    category: 'culture',
    created_at: '2024-01-17T10:00:00Z',
    updated_by: MOCK_USER_ID,
  },
];

// Helper functions to simulate API behavior
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const simulateApiCall = async <T>(data: T, delayMs: number = 300): Promise<T> => {
  await delay(delayMs);
  return data;
};

