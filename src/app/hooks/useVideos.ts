import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { GeneratedVideo, GeneratedVideoInsert, GeneratedVideoUpdate, VideoStoryboard, StoryboardFrame } from '@/app/types/Video';

/**
 * Fetch all generated videos for a project
 */
export const useVideosByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['videos', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching videos:', error);
        throw new Error(error.message);
      }

      return data as GeneratedVideo[];
    },
    enabled: !!projectId,
  });
};

/**
 * Fetch a single video
 */
export const useVideo = (videoId: string) => {
  return useQuery({
    queryKey: ['video', videoId],
    queryFn: async () => {
      if (!videoId) return null;

      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('id', videoId)
        .single();

      if (error) {
        console.error('Error fetching video:', error);
        throw new Error(error.message);
      }

      return data as GeneratedVideo;
    },
    enabled: !!videoId,
  });
};

/**
 * Create a new generated video record
 */
export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (video: GeneratedVideoInsert) => {
      const { data, error } = await supabase
        .from('generated_videos')
        .insert(video)
        .select()
        .single();

      if (error) {
        console.error('Error creating video:', error);
        throw new Error(error.message);
      }

      return data as GeneratedVideo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['videos', data.project_id] });
    },
  });
};

/**
 * Update a video record
 */
export const useUpdateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GeneratedVideoUpdate }) => {
      const { data, error } = await supabase
        .from('generated_videos')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating video:', error);
        throw new Error(error.message);
      }

      return data as GeneratedVideo;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['videos', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['video', data.id] });
    },
  });
};

/**
 * Delete a video
 */
export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('generated_videos')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting video:', error);
        throw new Error(error.message);
      }

      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['videos', data.projectId] });
    },
  });
};

/**
 * Fetch video variants (child videos)
 */
export const useVideoVariants = (parentVideoId: string) => {
  return useQuery({
    queryKey: ['video-variants', parentVideoId],
    queryFn: async () => {
      if (!parentVideoId) return [];

      const { data, error } = await supabase
        .from('generated_videos')
        .select('*')
        .eq('parent_video_id', parentVideoId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching video variants:', error);
        throw new Error(error.message);
      }

      return data as GeneratedVideo[];
    },
    enabled: !!parentVideoId,
  });
};

/**
 * Fetch storyboards for a project
 */
export const useStoryboardsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['storyboards', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('video_storyboards')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching storyboards:', error);
        throw new Error(error.message);
      }

      return data as VideoStoryboard[];
    },
    enabled: !!projectId,
  });
};

/**
 * Create a new storyboard
 */
export const useCreateStoryboard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyboard: Omit<VideoStoryboard, 'id' | 'created_at' | 'updated_at' | 'frames'>) => {
      const { data, error } = await supabase
        .from('video_storyboards')
        .insert(storyboard)
        .select()
        .single();

      if (error) {
        console.error('Error creating storyboard:', error);
        throw new Error(error.message);
      }

      return data as Omit<VideoStoryboard, 'frames'>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storyboards', data.project_id] });
    },
  });
};

/**
 * Fetch storyboard frames
 */
export const useStoryboardFrames = (storyboardId: string) => {
  return useQuery({
    queryKey: ['storyboard-frames', storyboardId],
    queryFn: async () => {
      if (!storyboardId) return [];

      const { data, error } = await supabase
        .from('storyboard_frames')
        .select('*')
        .eq('storyboard_id', storyboardId)
        .order('order_index', { ascending: true });

      if (error) {
        console.error('Error fetching storyboard frames:', error);
        throw new Error(error.message);
      }

      return data as StoryboardFrame[];
    },
    enabled: !!storyboardId,
  });
};

/**
 * Create storyboard frame
 */
export const useCreateStoryboardFrame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (frame: Omit<StoryboardFrame, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('storyboard_frames')
        .insert(frame)
        .select()
        .single();

      if (error) {
        console.error('Error creating storyboard frame:', error);
        throw new Error(error.message);
      }

      return data as StoryboardFrame;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storyboard-frames', data.storyboard_id] });
    },
  });
};

/**
 * Update storyboard frame
 */
export const useUpdateStoryboardFrame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<StoryboardFrame> }) => {
      const { data, error } = await supabase
        .from('storyboard_frames')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating storyboard frame:', error);
        throw new Error(error.message);
      }

      return data as StoryboardFrame;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storyboard-frames', data.storyboard_id] });
    },
  });
};

/**
 * Delete storyboard frame
 */
export const useDeleteStoryboardFrame = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, storyboardId }: { id: string; storyboardId: string }) => {
      const { error } = await supabase
        .from('storyboard_frames')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting storyboard frame:', error);
        throw new Error(error.message);
      }

      return { id, storyboardId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['storyboard-frames', data.storyboardId] });
    },
  });
};
