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
import {
  validateCharacterArray,
  validateFactionArray,
  validateCharRelationshipArray,
  validateFactionRelationshipArray,
  validateRelationshipMapData,
  validateNodePositionUpdate,
  validateEdgeUpdate,
  validateRelationshipType,
  assertValidation,
  safeValidate,
  ValidationError
} from '../types/validators';
import {
  validateRelationshipNode,
  validateRelationshipEdge,
  isRelationshipType
} from '../types/guards';

// Fetch all relationships for a project and convert to graph data
export async function fetchRelationships(projectId: string): Promise<RelationshipMapData> {
  try {
    // Fetch all data in parallel
    const [charactersRaw, factionsRaw, charRelationshipsRaw, factionRelationshipsRaw] = await Promise.all([
      apiFetch<unknown>({
        url: `${API_BASE_URL}/characters?project_id=${projectId}`
      }).catch(() => []),
      apiFetch<unknown>({
        url: `${API_BASE_URL}/factions?project_id=${projectId}`
      }).catch(() => []),
      apiFetch<unknown>({
        url: `${API_BASE_URL}/relationships?project_id=${projectId}`
      }).catch(() => []),
      apiFetch<unknown>({
        url: `${API_BASE_URL}/faction_relationships?project_id=${projectId}`
      }).catch(() => [])
    ]);

    // Validate API responses
    const charactersResult = validateCharacterArray(charactersRaw);
    const factionsResult = validateFactionArray(factionsRaw);
    const charRelationshipsResult = validateCharRelationshipArray(charRelationshipsRaw);
    const factionRelationshipsResult = validateFactionRelationshipArray(factionRelationshipsRaw);

    // Assert validation or use empty arrays as fallback
    const characters = charactersResult.success ? charactersResult.data! : [];
    const factions = factionsResult.success ? factionsResult.data! : [];
    const charRelationships = charRelationshipsResult.success ? charRelationshipsResult.data! : [];
    const factionRelationships = factionRelationshipsResult.success ? factionRelationshipsResult.data! : [];

    // Log validation errors if any
    if (!charactersResult.success) {
      console.warn('Character validation errors:', charactersResult.errors);
    }
    if (!factionsResult.success) {
      console.warn('Faction validation errors:', factionsResult.errors);
    }
    if (!charRelationshipsResult.success) {
      console.warn('Character relationship validation errors:', charRelationshipsResult.errors);
    }
    if (!factionRelationshipsResult.success) {
      console.warn('Faction relationship validation errors:', factionRelationshipsResult.errors);
    }

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

    // Convert character relationships to edges (with validation)
    const characterEdges: RelationshipEdge[] = charRelationships
      .map((rel) => {
        const sourceChar = characters.find(c => c.id === rel.character_a_id);
        const targetChar = characters.find(c => c.id === rel.character_b_id);

        // Skip if entities not found
        if (!sourceChar || !targetChar) {
          console.warn(`Skipping character relationship ${rel.id}: missing entities`);
          return null;
        }

        const edge = {
          id: `char-rel-${rel.id}`,
          source: `char-${rel.character_a_id}`,
          target: `char-${rel.character_b_id}`,
          type: 'relationship' as const,
          data: {
            relationshipId: rel.id,
            relationshipType: parseRelationshipType(rel.relationship_type),
            description: rel.description,
            sourceEntity: sourceChar,
            targetEntity: targetChar
          }
        };

        // Validate edge structure
        const validation = validateRelationshipEdge(edge);
        if (!validation.isValid) {
          console.warn(`Invalid character edge ${rel.id}:`, validation.errors);
          return null;
        }

        return validation.data!;
      })
      .filter((edge): edge is RelationshipEdge => edge !== null);

    // Convert faction relationships to edges (with validation)
    const factionEdges: RelationshipEdge[] = factionRelationships
      .map((rel) => {
        const sourceFaction = factions.find(f => f.id === rel.faction_a_id);
        const targetFaction = factions.find(f => f.id === rel.faction_b_id);

        // Skip if entities not found
        if (!sourceFaction || !targetFaction) {
          console.warn(`Skipping faction relationship ${rel.id}: missing entities`);
          return null;
        }

        const edge = {
          id: `faction-rel-${rel.id}`,
          source: `faction-${rel.faction_a_id}`,
          target: `faction-${rel.faction_b_id}`,
          type: 'relationship' as const,
          data: {
            relationshipId: rel.id,
            relationshipType: parseRelationshipType(rel.relationship_type),
            description: rel.description,
            sourceEntity: sourceFaction,
            targetEntity: targetFaction
          }
        };

        // Validate edge structure
        const validation = validateRelationshipEdge(edge);
        if (!validation.isValid) {
          console.warn(`Invalid faction edge ${rel.id}:`, validation.errors);
          return null;
        }

        return validation.data!;
      })
      .filter((edge): edge is RelationshipEdge => edge !== null);

    // Construct and validate final map data
    const mapData = {
      nodes: [...characterNodes, ...factionNodes],
      edges: [...characterEdges, ...factionEdges]
    };

    const mapValidation = validateRelationshipMapData(mapData);
    if (!mapValidation.success) {
      console.error('Relationship map validation failed:', mapValidation.errors);
      // Return valid structure even if validation fails
      return mapData;
    }

    return mapValidation.data!;
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
  // Validate input
  const validation = validateNodePositionUpdate({ nodeId, position });
  if (!validation.success) {
    throw new ValidationError('NodePositionUpdate', validation.errors || []);
  }

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
    // Validate input
    const validation = validateEdgeUpdate({ edgeId, relationshipType, description });
    if (!validation.success) {
      throw new ValidationError('EdgeUpdate', validation.errors || []);
    }

    // Validate relationship type
    if (!isRelationshipType(relationshipType)) {
      throw new ValidationError('RelationshipType', [`Invalid relationship type: ${relationshipType}`]);
    }

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
