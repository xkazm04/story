import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { GeneratedImage, GeneratedImageInsert, GeneratedImageUpdate } from '@/app/types/Image';

const supabase = createClient();

/**
 * Fetch all generated images for a project
 */
export const useImagesByProject = (projectId: string) => {
  return useQuery({
    queryKey: ['images', projectId],
    queryFn: async () => {
      if (!projectId) return [];

      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching images:', error);
        throw new Error(error.message);
      }

      return data as GeneratedImage[];
    },
    enabled: !!projectId,
  });
};

/**
 * Fetch a single image
 */
export const useImage = (imageId: string) => {
  return useQuery({
    queryKey: ['image', imageId],
    queryFn: async () => {
      if (!imageId) return null;

      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('id', imageId)
        .single();

      if (error) {
        console.error('Error fetching image:', error);
        throw new Error(error.message);
      }

      return data as GeneratedImage;
    },
    enabled: !!imageId,
  });
};

/**
 * Create a new generated image record
 */
export const useCreateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (image: GeneratedImageInsert) => {
      const { data, error } = await supabase
        .from('generated_images')
        .insert(image)
        .select()
        .single();

      if (error) {
        console.error('Error creating image:', error);
        throw new Error(error.message);
      }

      return data as GeneratedImage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['images', data.project_id] });
    },
  });
};

/**
 * Update an image record
 */
export const useUpdateImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: GeneratedImageUpdate }) => {
      const { data, error } = await supabase
        .from('generated_images')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating image:', error);
        throw new Error(error.message);
      }

      return data as GeneratedImage;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['images', data.project_id] });
      queryClient.invalidateQueries({ queryKey: ['image', data.id] });
    },
  });
};

/**
 * Delete an image
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, projectId }: { id: string; projectId: string }) => {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting image:', error);
        throw new Error(error.message);
      }

      return { id, projectId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['images', data.projectId] });
    },
  });
};

/**
 * Fetch image variants (child images)
 */
export const useImageVariants = (parentImageId: string) => {
  return useQuery({
    queryKey: ['image-variants', parentImageId],
    queryFn: async () => {
      if (!parentImageId) return [];

      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .eq('parent_image_id', parentImageId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching image variants:', error);
        throw new Error(error.message);
      }

      return data as GeneratedImage[];
    },
    enabled: !!parentImageId,
  });
};
