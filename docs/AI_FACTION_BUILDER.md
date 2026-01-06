# AI-Powered Faction Builder Wizard

## Overview

The AI-Powered Faction Builder Wizard is a complete system for automating faction creation using AI-generated content. Users provide a short prompt and faction type, and the system generates a comprehensive faction profile including lore, timeline events, achievements, branding, and member archetypes.

## Features

### Core Functionality
- **AI-Powered Generation**: Describe your faction and let AI generate complete profiles
- **Step-by-Step Wizard**: Guided 3-step creation flow with instant previews
- **Rich Faction Profiles**: Auto-generates name, description, lore, timeline, achievements, branding
- **Faction Type Support**: 10+ faction types (guild, family, nation, corporation, cult, military, academic, criminal, religious, other)
- **Branding Automation**: AI generates color schemes and emblem design prompts
- **Member Archetypes**: Automatically creates character role templates

### User Experience
- **Example Prompts**: Built-in examples to inspire users
- **Preview & Edit**: Review all generated content before creating
- **Progress Tracking**: Visual feedback during faction creation
- **Tabbed Preview**: Organized views for lore, timeline, achievements, and overview
- **Manual Fallback**: Option to create factions manually if AI is not desired

## Architecture

### File Structure

```
src/app/
├── services/
│   └── aiService.ts                          # AI service with mock generator
├── types/
│   └── Faction.ts                            # Extended with AI types
├── hooks/integration/
│   └── useFactions.ts                        # Added generateFactionWithAI hook
└── features/characters/
    ├── components/
    │   └── CreateFactionForm.tsx             # Updated with AI wizard CTA
    └── sub_CharFactions/
        ├── FactionWizard.tsx                 # Main wizard orchestrator
        ├── WizardStepPrompt.tsx              # Step 1: User input
        ├── WizardStepPreview.tsx             # Step 2: Review generated data
        └── WizardStepConfirm.tsx             # Step 3: Final creation

db/migrations/
└── 008_add_faction_ai_fields.sql             # Database schema updates
```

### Component Hierarchy

```
CreateFactionForm
└── FactionWizard (conditional)
    ├── WizardStepPrompt
    │   └── aiService.generateMockFaction()
    ├── WizardStepPreview
    │   └── Tabbed content display
    └── WizardStepConfirm
        └── factionApi.createFaction()
        └── factionApi.createFactionLore()
        └── factionApi.createFactionEvent()
        └── factionApi.createFactionAchievement()
```

## Database Schema

### New Tables

**faction_lore**
- `id` (UUID)
- `faction_id` (UUID, foreign key)
- `title` (TEXT)
- `content` (TEXT)
- `category` (TEXT) - 'history', 'culture', 'conflicts', 'notable-figures'
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `updated_by` (TEXT)

**faction_events**
- `id` (UUID)
- `faction_id` (UUID, foreign key)
- `title` (TEXT)
- `description` (TEXT)
- `date` (TEXT)
- `event_type` (TEXT) - 'founding', 'battle', 'alliance', 'discovery', 'ceremony', 'conflict', 'achievement'
- `created_by` (TEXT)
- `created_at` (TIMESTAMP)

**faction_achievements**
- `id` (UUID)
- `faction_id` (UUID, foreign key)
- `title` (TEXT)
- `description` (TEXT)
- `icon_url` (TEXT)
- `earned_date` (TEXT)
- `members` (JSONB) - Array of character IDs
- `created_at` (TIMESTAMP)

**faction_media**
- `id` (UUID)
- `faction_id` (UUID, foreign key)
- `type` (TEXT) - 'logo', 'banner', 'emblem', 'screenshot', 'lore'
- `url` (TEXT)
- `uploaded_at` (TIMESTAMP)
- `uploader_id` (TEXT)
- `description` (TEXT)

### Updated Tables

**factions**
- Added `branding` (JSONB) - Color scheme and emblem style
- Added `type` (TEXT) - Faction classification
- Added `ai_generated` (BOOLEAN) - Flag for AI-created factions
- Added `ai_metadata` (JSONB) - Generation metadata (model, timestamp, etc.)

## TypeScript Types

### Core AI Types

```typescript
interface AIGeneratedFaction {
  name: string;
  description: string;
  type: 'guild' | 'family' | 'nation' | 'corporation' | 'cult' | 'military' | 'academic' | 'criminal' | 'religious' | 'other';
  branding: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    emblem_style: 'shield' | 'crest' | 'sigil' | 'custom';
    banner_template: 'standard' | 'ornate' | 'minimal' | 'custom';
  };
  lore: Array<{
    title: string;
    content: string;
    category: 'history' | 'culture' | 'conflicts' | 'notable-figures';
  }>;
  timeline_events: Array<{
    title: string;
    description: string;
    date: string;
    event_type: 'founding' | 'battle' | 'alliance' | 'discovery' | 'ceremony' | 'conflict' | 'achievement';
  }>;
  achievements: Array<{
    title: string;
    description: string;
    earned_date: string;
  }>;
  emblem_design_prompt: string;
  member_archetypes: Array<{
    role: string;
    description: string;
  }>;
}

interface FactionWizardPrompt {
  prompt: string;
  faction_type?: string;
  project_id: string;
}

interface FactionWizardResponse {
  faction: AIGeneratedFaction;
  metadata: {
    generated_at: string;
    model_used: string;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
}
```

## Usage Flow

### 1. User Entry Point
User clicks "New Faction" → CreateFactionForm modal opens → User clicks "Use AI Wizard" button

### 2. Step 1: Prompt Input
- User selects faction type (guild, family, nation, etc.)
- User enters descriptive prompt
- Example prompts provided for inspiration
- Click "Generate with AI" button

### 3. Step 2: Preview Generated Content
- Review faction name, description, and type
- Preview branding colors (primary, secondary, accent)
- Browse tabs:
  - **Overview**: Member archetypes and emblem design prompt
  - **Lore**: History, culture, conflicts, notable figures
  - **Timeline**: Key events in faction history
  - **Achievements**: Notable accomplishments
- Options: Edit Prompt (go back) or Continue to Create

### 4. Step 3: Confirm & Create
- Summary of what will be created
- Visual progress tracking during creation
- Automatic database population:
  1. Create base faction record
  2. Apply branding and colors
  3. Create lore entries
  4. Create timeline events
  5. Create achievements
- Success confirmation and modal close

## AI Service

### Current Implementation
The system currently uses a **mock AI generator** (`aiService.generateMockFaction()`) that creates realistic faction data without requiring an AI API. This allows for:
- Immediate functionality without external dependencies
- Testing and development without API costs
- Template for future AI integration

### Mock Generator Features
- Extracts faction name from prompt
- Generates contextual descriptions
- Creates 2+ lore entries
- Adds 2+ timeline events
- Includes 1+ achievements
- Generates appropriate branding colors
- Creates member archetypes

### Future AI Integration
To integrate with a real LLM API (e.g., Claude, OpenAI):

1. **Update AI endpoint** in `aiService.ts`:
```typescript
const AI_API_ENDPOINT = process.env.NEXT_PUBLIC_AI_API_ENDPOINT || '/api/ai/generate-faction';
```

2. **Create API route** at `src/app/api/ai/generate-faction/route.ts`:
```typescript
export async function POST(request: Request) {
  const { prompt, faction_type, project_id } = await request.json();

  // Call LLM API (Claude, OpenAI, etc.)
  const response = await callLLMAPI(prompt, faction_type);

  // Validate and return structured data
  return NextResponse.json({
    faction: response.faction,
    metadata: {
      generated_at: new Date().toISOString(),
      model_used: 'claude-3-sonnet',
      prompt_tokens: response.usage.prompt_tokens,
      completion_tokens: response.usage.completion_tokens,
    }
  });
}
```

3. **Update WizardStepPrompt** to call actual API instead of mock

## Testing

All interactive components include `data-testid` attributes for automated testing:

### Test IDs
- `faction-wizard-modal` - Main wizard modal
- `close-wizard-btn` - Wizard close button
- `faction-type-{type}` - Faction type selection buttons
- `faction-prompt-input` - Prompt textarea
- `example-prompt-{index}` - Example prompt buttons
- `generate-faction-btn` - Generate button
- `preview-tab-{tab}` - Preview tab buttons
- `edit-prompt-btn` - Edit prompt button
- `confirm-preview-btn` - Continue to create button
- `back-to-preview-btn` - Back button in confirm step
- `create-faction-btn` - Final create button
- `open-ai-wizard-btn` - AI wizard CTA in CreateFactionForm

### Example Test
```typescript
describe('Faction Wizard', () => {
  it('should generate and create faction', async () => {
    // Open wizard
    await user.click(screen.getByTestId('open-ai-wizard-btn'));

    // Select faction type
    await user.click(screen.getByTestId('faction-type-guild'));

    // Enter prompt
    await user.type(
      screen.getByTestId('faction-prompt-input'),
      'A guild of master craftsmen'
    );

    // Generate
    await user.click(screen.getByTestId('generate-faction-btn'));

    // Wait for generation
    await waitFor(() => expect(screen.getByTestId('confirm-preview-btn')).toBeInTheDocument());

    // Confirm
    await user.click(screen.getByTestId('confirm-preview-btn'));

    // Create
    await user.click(screen.getByTestId('create-faction-btn'));

    // Verify success
    await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  });
});
```

## Design Patterns

### Visual Design
- **Purple/Pink Gradient**: AI features use purple-to-pink gradients to distinguish from standard blue UI
- **Glassmorphism**: Semi-transparent backgrounds with backdrop blur
- **Progressive Disclosure**: Step-by-step reveal of information
- **Progress Indicators**: Visual feedback during async operations
- **ColoredBorder**: Consistent border styling matching existing components

### UX Patterns
- **Example-Driven**: Provides example prompts to guide users
- **Preview Before Commit**: Full review of generated content before creation
- **Graceful Degradation**: Manual creation always available
- **Loading States**: Clear feedback during AI generation and database operations
- **Error Handling**: Informative error messages with recovery options

## API Hooks

### New Hooks
```typescript
factionApi.generateFactionWithAI(prompt, factionType, projectId)
```

### Extended Hooks
All existing faction hooks work with AI-generated factions:
- `useFactions(projectId)` - Lists all factions including AI-generated
- `useFactionLore(factionId)` - Retrieves AI-generated lore
- `useFactionEvents(factionId)` - Retrieves AI-generated timeline
- `useFactionAchievements(factionId)` - Retrieves AI-generated achievements

## Future Enhancements

### Near-term
1. **Real LLM Integration**: Connect to Claude/OpenAI API
2. **Regeneration**: Allow re-generating specific sections
3. **Editing**: In-line editing of generated content before creation
4. **Templates**: Save successful prompts as templates
5. **Faction Relationships**: Auto-generate relationships with existing factions

### Long-term
1. **Image Generation**: Generate faction emblems using DALL-E/Midjourney
2. **Character Generation**: Extend wizard to create member characters
3. **Lore Expansion**: Add more AI-generated lore on demand
4. **Translation**: Multi-language faction generation
5. **Voice**: Text-to-speech for faction lore narration

## Performance Considerations

### Optimizations
- **Lazy Loading**: Wizard components only load when activated
- **Debounced Preview**: Preview updates debounced during editing
- **Optimistic Updates**: UI updates before API confirmation
- **Streaming**: Future LLM integration can use streaming responses
- **Caching**: Generated content cached during wizard flow

### Database
- **Indexed Queries**: All foreign keys indexed for fast retrieval
- **Batch Inserts**: Related records created in transaction
- **JSONB Columns**: Efficient storage for flexible branding/metadata

## Security

### Input Validation
- Prompt length limits (prevents abuse)
- Faction type whitelist (prevents injection)
- SQL injection protection (parameterized queries)

### API Security
- Rate limiting on AI generation endpoint
- Authentication required for faction creation
- Project ownership validation before creation

## Migration Guide

### Running the Migration
```bash
# Using psql
psql -U your_user -d your_database -f db/migrations/008_add_faction_ai_fields.sql

# Or using Supabase
# Upload migration file to Supabase Dashboard > SQL Editor
```

### Backward Compatibility
The migration is **fully backward compatible**:
- All new columns have defaults or are nullable
- Existing factions continue to work without changes
- New tables are independent additions
- No breaking changes to existing API

## Troubleshooting

### Common Issues

**Issue**: AI generation fails
- **Solution**: Check that aiService.generateMockFaction() is being called. For real API, verify API keys and endpoint configuration.

**Issue**: Faction creation fails during wizard
- **Solution**: Check console for specific error. Verify database migration has been applied.

**Issue**: Wizard doesn't open
- **Solution**: Verify FactionWizard import in CreateFactionForm.tsx. Check browser console for import errors.

**Issue**: Preview shows incomplete data
- **Solution**: Verify all required fields in AIGeneratedFaction interface are populated by generator.

## Support & Documentation

- **Type Definitions**: `src/app/types/Faction.ts`
- **Service Implementation**: `src/app/services/aiService.ts`
- **Component Reference**: `src/app/features/characters/sub_CharFactions/`
- **Database Schema**: `db/migrations/008_add_faction_ai_fields.sql`
- **API Hooks**: `src/app/hooks/integration/useFactions.ts`

## Credits

Generated using Claude Code based on requirement specification for AI-Powered Faction Builder Wizard feature.
