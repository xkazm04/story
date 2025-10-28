import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { Voice, VoiceInsert, VoiceUpdate, VoiceConfig } from '@/app/types/Voice';

const supabase = createClient();

/**
 * Fetch all voices for a project
 */
export const useVoicesByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['voices', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('voices')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching voices:', error);
        throw new Error(error.message);
      }

      return data as Voice[];
    },
    enabled: !!projectId,
  });
};

/**
 * Fetch a single voice by ID
 */
export const useVoice = (voiceId: string) => {
  return useQuery({
    queryKey: ['voice', voiceId],
    queryFn: async () => {
      if (!voiceId) return null;

      const { data, error } = await supabase
        .from('voices')
        .select('*')
        .eq('id', voiceId)
        .single();

      if (error) {
        console.error('Error fetching voice:', error);
        throw new Error(error.message);
      }

      return data as Voice;
    },
    enabled: !!voiceId,
  });
};

/**
 * Create a new voice
 */
export const useCreateVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (voice: VoiceInsert) => {
      const { data, error } = await supabase
        .from('voices')
        .insert(voice)
        .select()
        .single();

      if (error) {
        console.error('Error creating voice:', error);
        throw new Error(error.message);
      }

      return data as Voice;
    },
    onSuccess: (data) => {
      // Invalidate and refetch voices for the project
      queryClient.invalidateQueries({ queryKey: ['voices', data.project_id] });
    },
  });
};

/**
 * Update a voice
 */
export const useUpdateVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: VoiceUpdate }) => {
      const { data, error } = await supabase
        .from('voices')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating voice:', error);
        throw new Error(error.message);
      }

      return data as Voice;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voices', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['voice', data.id] });
    },
  });
};

/**
 * Delete a voice
 */
export const useDeleteVoice = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('voices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting voice:', error);
        throw new Error(error.message);
      }

      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voices', data.projectId] });
    },
  });
};

/**
 * Fetch voice configuration settings
 */
export const useVoiceConfig = (voiceId: string) => {
  return useQuery({
    queryKey: ['voice-config', voiceId],
    queryFn: async () => {
      if (!voiceId) return null;

      const { data, error } = await supabase
        .from('voice_configs')
        .select('*')
        .eq('voice_id', voiceId)
        .single();

      if (error) {
        // Return default config if not found
        if (error.code === 'PGRST116') {
          return {
            voice_id: voiceId,
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.5,
            speed: 1.0,
          } as VoiceConfig;
        }
        console.error('Error fetching voice config:', error);
        throw new Error(error.message);
      }

      return data as VoiceConfig;
    },
    enabled: !!voiceId,
  });
};

/**
 * Update voice configuration
 */
export const useUpdateVoiceConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (config: VoiceConfig) => {
      const { data, error } = await supabase
        .from('voice_configs')
        .upsert(config)
        .select()
        .single();

      if (error) {
        console.error('Error updating voice config:', error);
        throw new Error(error.message);
      }

      return data as VoiceConfig;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['voice-config', data.voice_id] });
    },
  });
};
