-- Add prompt field to dataset_images for storing the generation prompt
ALTER TABLE dataset_images ADD COLUMN IF NOT EXISTS prompt TEXT;
COMMENT ON COLUMN dataset_images.prompt IS 'Generation prompt used to create this image';
