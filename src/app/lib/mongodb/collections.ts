/**
 * MongoDB Collections Configuration
 *
 * Collection names and index configurations for the asset management system.
 * Uses the same collection structure as pikselplay (char-ui) app.
 */

export const COLLECTIONS = {
  ASSETS: 'assets',
  ASSET_EMBEDDINGS: 'asset_embeddings', // For semantic search vectors
} as const;

/**
 * Asset categories configuration
 */
export const ASSET_CATEGORIES = {
  character: {
    label: 'Character Assets',
    types: ['body', 'equipment', 'clothing', 'background'] as const,
  },
  story: {
    label: 'Story Assets',
    types: ['scenes', 'props', 'locations'] as const,
  },
} as const;

export type CharacterAssetType = typeof ASSET_CATEGORIES.character.types[number];
export type StoryAssetType = typeof ASSET_CATEGORIES.story.types[number];
export type AssetType = CharacterAssetType | StoryAssetType;

/**
 * MongoDB index definitions for optimal query performance
 */
export const INDEXES = {
  assets: [
    { key: { type: 1 }, name: 'idx_type' },
    { key: { subcategory: 1 }, name: 'idx_subcategory' },
    { key: { name: 'text', description: 'text' }, name: 'idx_text_search' },
    { key: { created_at: -1 }, name: 'idx_created_at' },
    { key: { type: 1, subcategory: 1 }, name: 'idx_type_subcategory' },
  ],
} as const;

/**
 * Projection for list queries (excludes large fields)
 */
export const ASSET_LIST_PROJECTION = {
  _id: 1,
  name: 1,
  type: 1,
  subcategory: 1,
  gen: 1,
  description: 1,
  image_url: 1,
  created_at: 1,
  updated_at: 1,
  metadata: 1,
} as const;

/**
 * Projection for detail queries (includes base64 image)
 */
export const ASSET_DETAIL_PROJECTION = {
  ...ASSET_LIST_PROJECTION,
  image_data_base64: 1,
  image_content_type: 1,
} as const;
