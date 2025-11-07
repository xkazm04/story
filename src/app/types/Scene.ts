export interface Scene {
  id: string;
  name: string;
  project_id: string;
  act_id: string;
  order: number;
  description?: string;
  script?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SceneCreateInput {
  name?: string;
  project_id: string;
  act_id: string;
  order?: number;
  description?: string;
}

export interface SceneUpdateInput {
  name?: string;
  order?: number;
  description?: string;
}

