/**
 * Implementation Log Repository
 *
 * Manages CRUD operations for implementation logs that track
 * completed requirements and features.
 */

import { supabaseServer } from '@/lib/supabase/server';

export interface ImplementationLog {
  id: string;
  project_id: string;
  requirement_name: string;
  title: string;
  overview: string;
  overview_bullets: string;
  tested: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateImplementationLogInput {
  id: string;
  project_id: string;
  requirement_name: string;
  title: string;
  overview: string;
  overview_bullets: string;
  tested: boolean;
}

export interface UpdateImplementationLogInput {
  tested?: boolean;
  overview?: string;
  overview_bullets?: string;
}

class ImplementationLogRepository {
  /**
   * Create a new implementation log entry
   */
  async createLog(input: CreateImplementationLogInput): Promise<ImplementationLog> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .insert([input])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create implementation log: ${error.message}`);
    }

    return data;
  }

  /**
   * Get implementation log by ID
   */
  async getLogById(id: string): Promise<ImplementationLog | null> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch implementation log: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all implementation logs for a project
   */
  async getLogsByProject(projectId: string): Promise<ImplementationLog[]> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch implementation logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get implementation log by requirement name
   */
  async getLogByRequirement(
    projectId: string,
    requirementName: string
  ): Promise<ImplementationLog | null> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .select('*')
      .eq('project_id', projectId)
      .eq('requirement_name', requirementName)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to fetch implementation log: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an implementation log
   */
  async updateLog(
    id: string,
    updates: UpdateImplementationLogInput
  ): Promise<ImplementationLog> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update implementation log: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete an implementation log
   */
  async deleteLog(id: string): Promise<void> {
    const supabase = supabaseServer;

    const { error } = await supabase
      .from('implementation_logs')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete implementation log: ${error.message}`);
    }
  }

  /**
   * Get all untested implementation logs for a project
   */
  async getUntestedLogs(projectId: string): Promise<ImplementationLog[]> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .select('*')
      .eq('project_id', projectId)
      .eq('tested', false)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch untested logs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Mark implementation log as tested
   */
  async markAsTested(id: string): Promise<ImplementationLog> {
    return this.updateLog(id, { tested: true });
  }

  /**
   * Get statistics for a project
   */
  async getProjectStats(projectId: string): Promise<{
    total: number;
    tested: number;
    untested: number;
  }> {
    const supabase = supabaseServer;

    const { data, error } = await supabase
      .from('implementation_logs')
      .select('tested')
      .eq('project_id', projectId);

    if (error) {
      throw new Error(`Failed to fetch project stats: ${error.message}`);
    }

    const logs = data || [];
    const tested = logs.filter((log) => log.tested).length;

    return {
      total: logs.length,
      tested,
      untested: logs.length - tested,
    };
  }
}

// Export singleton instance
export const implementationLogRepository = new ImplementationLogRepository();
