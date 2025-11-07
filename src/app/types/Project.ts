export interface Project {
  id: string;
  name: string;
  description?: string;
  type?: string;
  word_count?: number;
  created_at?: string;
  updated_at?: string;
  user_id?: string;
}
