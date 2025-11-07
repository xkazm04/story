import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import {
  Dataset,
  DatasetInsert,
  DatasetUpdate,
  DatasetImage,
  DatasetImageInsert,
  AudioTranscription,
  AudioTranscriptionInsert
} from '@/app/types/Dataset';

/**
 * Fetch all datasets for a project
 */
export const useDatasetsByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['datasets', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching datasets:', error);
        throw new Error(error.message);
      }

      return data as Dataset[];
    },
    enabled: !!projectId,
  });
};

/**
 * Fetch a single dataset by ID
 */
export const useDataset = (datasetId: string) => {
  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: async () => {
      if (!datasetId) return null;

      const { data, error } = await supabase
        .from('datasets')
        .select('*')
        .eq('id', datasetId)
        .single();

      if (error) {
        console.error('Error fetching dataset:', error);
        throw new Error(error.message);
      }

      return data as Dataset;
    },
    enabled: !!datasetId,
  });
};

/**
 * Create a new dataset
 */
export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dataset: DatasetInsert) => {
      const { data, error } = await supabase
        .from('datasets')
        .insert(dataset)
        .select()
        .single();

      if (error) {
        console.error('Error creating dataset:', error);
        throw new Error(error.message);
      }

      return data as Dataset;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', data.project_id] });
    },
  });
};

/**
 * Update a dataset
 */
export const useUpdateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: DatasetUpdate }) => {
      const { data, error } = await supabase
        .from('datasets')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating dataset:', error);
        throw new Error(error.message);
      }

      return data as Dataset;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.id] });
    },
  });
};

/**
 * Delete a dataset
 */
export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('datasets')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting dataset:', error);
        throw new Error(error.message);
      }

      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['datasets', data.projectId] });
    },
  });
};

// =====================================================
// IMAGE DATASETS
// =====================================================

/**
 * Fetch images for a dataset
 */
export const useDatasetImages = (datasetId: string) => {
  return useQuery({
    queryKey: ['dataset-images', datasetId],
    queryFn: async () => {
      if (!datasetId) return [];

      const { data, error } = await supabase
        .from('dataset_images')
        .select('*')
        .eq('dataset_id', datasetId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching dataset images:', error);
        throw new Error(error.message);
      }

      return data as DatasetImage[];
    },
    enabled: !!datasetId,
  });
};

/**
 * Add image to dataset
 */
export const useAddImageToDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: DatasetImageInsert) => {
      const { data, error } = await supabase
        .from('dataset_images')
        .insert(image)
        .select()
        .single();

      if (error) {
        console.error('Error adding image to dataset:', error);
        throw new Error(error.message);
      }

      return data as DatasetImage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dataset-images', data.dataset_id] });
    },
  });
};

/**
 * Remove image from dataset
 */
export const useRemoveImageFromDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ imageId, datasetId }: { imageId: string; datasetId: string }) => {
      const { error } = await supabase
        .from('dataset_images')
        .delete()
        .eq('id', imageId);

      if (error) {
        console.error('Error removing image from dataset:', error);
        throw new Error(error.message);
      }

      return { imageId, datasetId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['dataset-images', data.datasetId] });
    },
  });
};

// =====================================================
// AUDIO TRANSCRIPTIONS
// =====================================================

/**
 * Fetch transcriptions
 */
export const useTranscriptions = (filters?: { filename?: string }) => {
  return useQuery({
    queryKey: ['transcriptions', filters],
    queryFn: async () => {
      let query = supabase
        .from('audio_transcriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.filename) {
        query = query.eq('filename', filters.filename);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching transcriptions:', error);
        throw new Error(error.message);
      }

      return data as AudioTranscription[];
    },
  });
};

/**
 * Create transcription
 */
export const useCreateTranscription = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transcription: AudioTranscriptionInsert) => {
      const { data, error } = await supabase
        .from('audio_transcriptions')
        .insert(transcription)
        .select()
        .single();

      if (error) {
        console.error('Error creating transcription:', error);
        throw new Error(error.message);
      }

      return data as AudioTranscription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcriptions'] });
    },
  });
};
