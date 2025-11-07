/**
 * Character Creator Module
 * Modular components for character creation with AI-powered image extraction
 */

export { default as CharacterAppearanceForm } from './CharacterAppearanceForm';
export { CharacterImageExtraction } from './CharacterImageExtraction';
export { CharacterImageUpload } from './CharacterImageUpload';
export { AppearanceBasicAttributes } from './AppearanceBasicAttributes';
export { AppearanceFacialFeatures } from './AppearanceFacialFeatures';
export { AppearanceClothing } from './AppearanceClothing';
export { AppearanceCustomFeatures } from './AppearanceCustomFeatures';
export { AppearancePreview } from './AppearancePreview';

export type { ImageExtractionConfig, ExtractionResult } from './types';
