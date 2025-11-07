# Character Creator Module

## Overview
Modular character appearance creation system with AI-powered image extraction.

## Features
- **Image Upload**: Upload character portraits with automatic compression
- **AI Extraction**: Extract appearance details using Gemini/Groq vision models
- **Manual Input**: Traditional form-based input for all appearance fields
- **Live Preview**: Real-time generated description from appearance data
- **Modular Design**: Each section is a separate, reusable component

## Components

### CharacterAppearanceForm
Main container component that orchestrates all sub-components.

### CharacterImageExtraction
Handles image upload and AI extraction workflow.

### CharacterImageUpload
Reusable image upload component with drag & drop support.

### Appearance Sections
- **AppearanceBasicAttributes**: Gender, age, skin, body type, height
- **AppearanceFacialFeatures**: Face shape, eyes, hair, facial hair
- **AppearanceClothing**: Clothing style, colors, accessories
- **AppearanceCustomFeatures**: Additional distinctive features
- **AppearancePreview**: Generated description preview

## Universal Image Extraction Library

Located at: `story/src/app/lib/services/imageExtraction.ts`

### Features
- Multi-model support (Gemini, Groq)
- Schema-based extraction
- Automatic result merging
- Confidence-based selection
- Reusable across different use cases

### Usage Example

```typescript
import { extractFromImage } from '@/app/lib/services/imageExtraction';
import { characterAppearanceSchema } from '@/app/lib/schemas/extractionSchemas';

const results = await extractFromImage(
  imageFile,
  characterAppearanceSchema,
  { gemini: { enabled: true }, groq: { enabled: true } }
);

const mergedData = mergeExtractionResults(results, 'gemini');
```

## Extraction Schemas

Located at: `story/src/app/lib/schemas/extractionSchemas.ts`

### Available Schemas
1. **assetExtractionSchema**: For game asset analysis
2. **characterAppearanceSchema**: For character appearance extraction

### Creating Custom Schemas

```typescript
const customSchema: ExtractionSchema = {
  name: 'Custom Extraction',
  description: 'Extract custom data from images',
  fields: [
    {
      name: 'fieldName',
      type: 'string',
      description: 'Field description',
      required: true,
      options: ['option1', 'option2'], // Optional
    },
  ],
};
```

## Integration with Asset Analysis

The universal library can be used for both:
1. **Character Appearance** (this module)
2. **Asset Analysis** (existing feature)

### Refactoring Asset Analysis

To use the universal library in asset analysis:

```typescript
// In AssetAnalysisUpload.tsx
import { extractFromImage } from '@/app/lib/services/imageExtraction';
import { assetExtractionSchema } from '@/app/lib/schemas/extractionSchemas';

const results = await extractFromImage(
  selectedFile,
  assetExtractionSchema,
  config
);
```

## API Endpoints Required

### /api/image-extraction/gemini
```typescript
POST /api/image-extraction/gemini
Body: {
  image: string (base64),
  prompt: string,
  schema: ExtractionSchema
}
Response: {
  data: any,
  confidence: number
}
```

### /api/image-extraction/groq
```typescript
POST /api/image-extraction/groq
Body: {
  image: string (base64),
  prompt: string,
  schema: ExtractionSchema
}
Response: {
  data: any,
  confidence: number
}
```

## File Structure

```
sub_CharacterCreator/
├── CharacterAppearanceForm.tsx      # Main container
├── CharacterImageExtraction.tsx     # Image extraction workflow
├── CharacterImageUpload.tsx         # Image upload component
├── AppearanceBasicAttributes.tsx    # Basic attributes section
├── AppearanceFacialFeatures.tsx     # Facial features section
├── AppearanceClothing.tsx           # Clothing section
├── AppearanceCustomFeatures.tsx     # Custom features section
├── AppearancePreview.tsx            # Description preview
├── types.ts                         # TypeScript types
├── index.ts                         # Exports
└── README.md                        # This file
```

## Usage

### Replace Old Component

In `CharacterAppearance.tsx`:

```typescript
// Old
import CharacterAppearance from './components/CharacterAppearance';

// New
import { CharacterAppearanceForm } from './sub_CharacterCreator';

// Use
<CharacterAppearanceForm characterId={characterId} />
```

### Standalone Usage

```typescript
import { CharacterImageExtraction } from './sub_CharacterCreator';

<CharacterImageExtraction
  onExtracted={(appearance) => {
    console.log('Extracted:', appearance);
  }}
  config={{
    gemini: { enabled: true },
    groq: { enabled: true }
  }}
/>
```

## Benefits

1. **Modular**: Each component is independent and reusable
2. **Universal Library**: Same extraction logic for all use cases
3. **Type-Safe**: Full TypeScript support
4. **Extensible**: Easy to add new extraction schemas
5. **Multi-Model**: Support for multiple AI models with automatic merging
6. **Maintainable**: Clear separation of concerns

## Next Steps

1. Implement API endpoints for Gemini and Groq
2. Test extraction with real images
3. Refactor AssetAnalysisUpload to use universal library
4. Add more extraction schemas as needed
5. Add confidence visualization
6. Add manual correction workflow
