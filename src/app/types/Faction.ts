export interface Faction {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  logo_url?: string;
  color?: string;
}

export interface FactionRelationship {
  id: string;
  faction_a_id: string;
  faction_b_id: string;
  description: string;
  relationship_type?: string;
}
