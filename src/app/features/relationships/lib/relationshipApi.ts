import { apiFetch, API_BASE_URL } from '@/app/utils/api';
import { Character, CharRelationship } from '@/app/types/Character';
import { Faction, FactionRelationship } from '@/app/types/Faction';
import {
  RelationshipMapData,
  RelationshipNode,
  RelationshipEdge,
  RelationshipType,
  CharacterNodeData,
  FactionNodeData
} from '../types';

// Fetch all relationships for a project and convert to graph data
export async function fetchRelationships(projectId: string): Promise<RelationshipMapData> {
  try {
    // Fetch all data in parallel
    const [characters, factions, charRelationships, factionRelationships] = await Promise.all([
      apiFetch<Character[]>({
        url: `${API_BASE_URL}/characters?project_id=${projectId}`
      }).catch(() => [] as Character[]),
      apiFetch<Faction[]>({
        url: `${API_BASE_URL}/factions?project_id=${projectId}`
      }).catch(() => [] as Faction[]),
      apiFetch<CharRelationship[]>({
        url: `${API_BASE_URL}/relationships?project_id=${projectId}`
      }).catch(() => [] as CharRelationship[]),
      apiFetch<FactionRelationship[]>({
        url: `${API_BASE_URL}/faction_relationships?project_id=${projectId}`
      }).catch(() => [] as FactionRelationship[])
    ]);

    // Convert characters to nodes
    const characterNodes: RelationshipNode[] = characters.map((char, index) => ({
      id: `char-${char.id}`,
      type: 'character',
      position: { x: 100 + (index % 5) * 250, y: 100 + Math.floor(index / 5) * 200 },
      data: {
        character: char,
        label: char.name,
        type: 'character'
      } as CharacterNodeData
    }));

    // Convert factions to nodes
    const factionNodes: RelationshipNode[] = factions.map((faction, index) => ({
      id: `faction-${faction.id}`,
      type: 'faction',
      position: { x: 100 + (index % 5) * 250, y: 500 + Math.floor(index / 5) * 200 },
      data: {
        faction: faction,
        label: faction.name,
        type: 'faction'
      } as FactionNodeData
    }));

    // Convert character relationships to edges
    const characterEdges: RelationshipEdge[] = charRelationships.map((rel) => {
      const sourceChar = characters.find(c => c.id === rel.character_a_id);
      const targetChar = characters.find(c => c.id === rel.character_b_id);

      return {
        id: `char-rel-${rel.id}`,
        source: `char-${rel.character_a_id}`,
        target: `char-${rel.character_b_id}`,
        type: 'relationship',
        data: {
          relationshipId: rel.id,
          relationshipType: parseRelationshipType(rel.relationship_type),
          description: rel.description,
          sourceEntity: sourceChar!,
          targetEntity: targetChar!
        }
      };
    });

    // Convert faction relationships to edges
    const factionEdges: RelationshipEdge[] = factionRelationships.map((rel) => {
      const sourceFaction = factions.find(f => f.id === rel.faction_a_id);
      const targetFaction = factions.find(f => f.id === rel.faction_b_id);

      return {
        id: `faction-rel-${rel.id}`,
        source: `faction-${rel.faction_a_id}`,
        target: `faction-${rel.faction_b_id}`,
        type: 'relationship',
        data: {
          relationshipId: rel.id,
          relationshipType: parseRelationshipType(rel.relationship_type),
          description: rel.description,
          sourceEntity: sourceFaction!,
          targetEntity: targetFaction!
        }
      };
    });

    return {
      nodes: [...characterNodes, ...factionNodes],
      edges: [...characterEdges, ...factionEdges]
    };
  } catch (error) {
    console.error('Error fetching relationships:', error);
    throw error;
  }
}

// Update node position
export async function updateNodePosition(
  projectId: string,
  nodeId: string,
  position: { x: number; y: number }
): Promise<void> {
  // Store positions in localStorage for now (can be extended to API)
  const storageKey = `relationship-map-positions-${projectId}`;
  const positions = JSON.parse(localStorage.getItem(storageKey) || '{}');
  positions[nodeId] = position;
  localStorage.setItem(storageKey, JSON.stringify(positions));
}

// Get stored node positions
export function getStoredNodePositions(projectId: string): Record<string, { x: number; y: number }> {
  const storageKey = `relationship-map-positions-${projectId}`;
  return JSON.parse(localStorage.getItem(storageKey) || '{}');
}

// Update edge relationship type
export async function updateEdge(
  projectId: string,
  edgeId: string,
  relationshipType: RelationshipType,
  description?: string
): Promise<void> {
  try {
    const isCharacterRelationship = edgeId.startsWith('char-rel-');
    const relationshipId = edgeId.replace('char-rel-', '').replace('faction-rel-', '');

    if (isCharacterRelationship) {
      await apiFetch({
        url: `${API_BASE_URL}/relationships/${relationshipId}`,
        method: 'PUT',
        body: {
          relationship_type: relationshipType,
          description: description
        }
      });
    } else {
      await apiFetch({
        url: `${API_BASE_URL}/faction_relationships/${relationshipId}`,
        method: 'PUT',
        body: {
          relationship_type: relationshipType,
          description: description
        }
      });
    }
  } catch (error) {
    console.error('Error updating edge:', error);
    throw error;
  }
}

// Delete edge
export async function deleteEdge(projectId: string, edgeId: string): Promise<void> {
  try {
    const isCharacterRelationship = edgeId.startsWith('char-rel-');
    const relationshipId = edgeId.replace('char-rel-', '').replace('faction-rel-', '');

    if (isCharacterRelationship) {
      await apiFetch({
        url: `${API_BASE_URL}/relationships/${relationshipId}`,
        method: 'DELETE'
      });
    } else {
      await apiFetch({
        url: `${API_BASE_URL}/faction_relationships/${relationshipId}`,
        method: 'DELETE'
      });
    }
  } catch (error) {
    console.error('Error deleting edge:', error);
    throw error;
  }
}

// Helper: Parse relationship type string to enum
function parseRelationshipType(type?: string): RelationshipType {
  if (!type) return RelationshipType.UNKNOWN;

  const upperType = type.toUpperCase();
  if (upperType in RelationshipType) {
    return RelationshipType[upperType as keyof typeof RelationshipType];
  }

  return RelationshipType.UNKNOWN;
}
