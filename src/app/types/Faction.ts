export interface FactionBranding {
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  emblem_style: 'shield' | 'crest' | 'sigil' | 'custom';
  banner_template: 'standard' | 'ornate' | 'minimal' | 'custom';
  custom_logo_url?: string;
  theme_tier: 'free' | 'premium';
}

export interface Faction {
  id: string;
  name: string;
  description?: string;
  project_id: string;
  logo_url?: string;
  color?: string;
  media?: FactionMedia[];
  branding?: FactionBranding;
}

export interface FactionMedia {
  id: string;
  faction_id: string;
  type: 'logo' | 'banner' | 'emblem' | 'screenshot' | 'lore';
  url: string;
  uploaded_at: string;
  uploader_id: string;
  description?: string;
}

export interface FactionRelationship {
  id: string;
  faction_a_id: string;
  faction_b_id: string;
  description: string;
  relationship_type?: string;
}

export interface FactionEvent {
  id: string;
  faction_id: string;
  title: string;
  description: string;
  date: string;
  event_type: 'founding' | 'battle' | 'alliance' | 'discovery' | 'ceremony' | 'conflict' | 'achievement';
  created_by: string;
  created_at?: string;
}

export interface FactionAchievement {
  id: string;
  faction_id: string;
  title: string;
  description: string;
  icon_url?: string;
  earned_date: string;
  members: string[]; // Array of character IDs who earned this achievement
  created_at?: string;
}

export interface FactionLore {
  id: string;
  faction_id: string;
  title: string;
  content: string;
  category: 'history' | 'culture' | 'conflicts' | 'notable-figures';
  created_at: string;
  updated_at?: string;
  updated_by: string;
}
