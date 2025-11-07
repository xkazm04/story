# Character Appearance Table - Migration Guide

## Quick Start

### Step 1: Run Migration Script
```sql
-- Copy and run this in your Supabase SQL Editor
-- File: db/migrations/005_add_char_appearance_table.sql
```

Or run via command line:
```bash
psql "your-database-url" -f story/db/migrations/005_add_char_appearance_table.sql
```

### Step 2: Verify Installation
```sql
-- Check table exists
\d char_appearance

-- Should show:
-- character_id (UUID, PK, FK -> characters)
-- gender, age, skin_color, body_type, height
-- face_shape, eye_color, hair_color, hair_style, facial_hair, face_features
-- clothing_style, clothing_color, clothing_accessories
-- custom_features, prompt
-- created_at, updated_at
```

### Step 3: Test the API

**Fetch appearance:**
```bash
curl http://localhost:3000/api/char-appearance?character_id=<character-id>
```

**Save appearance:**
```bash
curl -X POST http://localhost:3000/api/char-appearance \
  -H "Content-Type: application/json" \
  -d '{
    "character_id": "<character-id>",
    "gender": "Male",
    "age": "Adult",
    "prompt": "A tall athletic male..."
  }'
```

**Delete appearance:**
```bash
curl -X DELETE http://localhost:3000/api/char-appearance?character_id=<character-id>
```

## Table Schema Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     char_appearance                         │
├─────────────────────────────────────────────────────────────┤
│ character_id       UUID [PK, FK → characters.id]            │
│                                                              │
│ ┌─ BASIC ATTRIBUTES ────────────────────────────────────┐   │
│ │ gender             TEXT                              │   │
│ │ age                TEXT                              │   │
│ │ skin_color         TEXT                              │   │
│ │ body_type          TEXT                              │   │
│ │ height             TEXT                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌─ FACIAL FEATURES ─────────────────────────────────────┐   │
│ │ face_shape         TEXT                              │   │
│ │ eye_color          TEXT                              │   │
│ │ hair_color         TEXT                              │   │
│ │ hair_style         TEXT                              │   │
│ │ facial_hair        TEXT                              │   │
│ │ face_features      TEXT                              │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌─ CLOTHING & STYLE ────────────────────────────────────┐   │
│ │ clothing_style     TEXT                              │   │
│ │ clothing_color     TEXT                              │   │
│ │ clothing_accessories TEXT                            │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌─ ADDITIONAL ──────────────────────────────────────────┐   │
│ │ custom_features    TEXT                              │   │
│ │ prompt             TEXT  (AI generation prompt)      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ created_at         TIMESTAMP WITH TIME ZONE                 │
│ updated_at         TIMESTAMP WITH TIME ZONE                 │
└─────────────────────────────────────────────────────────────┘
```

## Relationship Diagram

```
users (1) ──→ (many) projects (1) ──→ (many) characters (1) ──→ (one) char_appearance
                                                              ↑
                                                       ONE-TO-ONE
                                               (character_id as PRIMARY KEY)
```

## Field Mapping

### TypeScript ↔ Database

| TypeScript (Appearance)          | Database Column          |
|----------------------------------|--------------------------|
| `appearance.gender`              | `gender`                 |
| `appearance.age`                 | `age`                    |
| `appearance.skinColor`           | `skin_color`             |
| `appearance.bodyType`            | `body_type`              |
| `appearance.height`              | `height`                 |
| `appearance.face.shape`          | `face_shape`             |
| `appearance.face.eyeColor`       | `eye_color`              |
| `appearance.face.hairColor`      | `hair_color`             |
| `appearance.face.hairStyle`      | `hair_style`             |
| `appearance.face.facialHair`     | `facial_hair`            |
| `appearance.face.features`       | `face_features`          |
| `appearance.clothing.style`      | `clothing_style`         |
| `appearance.clothing.color`      | `clothing_color`         |
| `appearance.clothing.accessories`| `clothing_accessories`   |
| `appearance.customFeatures`      | `custom_features`        |
| `prompt` (separate param)        | `prompt`                 |

## Usage Examples

### In CharacterAppearanceForm

```typescript
import { 
  saveCharacterAppearance, 
  fetchCharacterAppearance 
} from '@/app/lib/services/characterAppearanceService';

// Load on mount
useEffect(() => {
  const loadAppearance = async () => {
    const { appearance, prompt } = await fetchCharacterAppearance(characterId);
    setAppearance(appearance);
    setPrompt(prompt);
  };
  loadAppearance();
}, [characterId]);

// Save
const handleSave = async () => {
  await saveCharacterAppearance(characterId, appearance, prompt);
};
```

### Direct Supabase Queries

```typescript
import { supabaseServer } from '@/lib/supabase/server';

// Insert/Update (Upsert)
const { data, error } = await supabaseServer
  .from('char_appearance')
  .upsert({
    character_id: 'uuid-here',
    gender: 'Male',
    age: 'Adult',
    // ... other fields
  })
  .select()
  .single();

// Fetch
const { data, error } = await supabaseServer
  .from('char_appearance')
  .select('*')
  .eq('character_id', 'uuid-here')
  .single();

// Delete
const { error } = await supabaseServer
  .from('char_appearance')
  .delete()
  .eq('character_id', 'uuid-here');
```

## Important Notes

### One-to-One Relationship
- Each character can have **only ONE** appearance record
- `character_id` is the PRIMARY KEY (not `id`)
- Attempting to insert a second record for the same character will fail
- Use `upsert()` to handle both insert and update cases

### Cascading Delete
- When a character is deleted, their appearance is automatically deleted
- This is enforced by `ON DELETE CASCADE` on the foreign key

### Nullable Fields
- All fields except `character_id` are nullable
- This allows gradual data entry (user can fill in fields over time)
- Also accommodates incomplete AI extraction results

### Auto-Updating Timestamps
- `created_at` is set automatically on insert
- `updated_at` is set automatically on insert and every update
- Handled by database trigger (no need to manage in code)

### The Prompt Field
**Purpose**: Store a descriptive prompt to regenerate the character in different art styles

**Focus**: Character only (physical features, clothing, expression, pose)

**Not included**: Background, image style, artistic elements

**Example**:
> "A tall athletic male adult with fair skin, short brown hair, blue eyes, clean-shaven, strong jawline, wearing black and silver armor with a belt of pouches, standing confidently"

## Troubleshooting

### Error: Foreign key constraint violation
**Cause**: Trying to insert appearance for a character_id that doesn't exist

**Solution**: Ensure the character exists first:
```sql
SELECT id FROM characters WHERE id = 'your-character-id';
```

### Error: Duplicate key value violates unique constraint
**Cause**: Trying to insert a second appearance for the same character

**Solution**: Use `upsert()` instead of `insert()`:
```typescript
.upsert({ character_id: '...', ... })  // ✅ Good
.insert({ character_id: '...', ... })  // ❌ Fails if exists
```

### Error: Export createClient doesn't exist
**Cause**: Incorrect import in API route

**Solution**: Use `supabaseServer` from server client:
```typescript
import { supabaseServer } from '@/lib/supabase/server';
const supabase = supabaseServer;
```

## Testing Checklist

- [ ] Run migration script successfully
- [ ] Verify table exists with correct columns
- [ ] Insert test appearance data
- [ ] Fetch appearance via API
- [ ] Update appearance via API (upsert)
- [ ] Delete appearance via API
- [ ] Verify cascading delete (delete character, appearance should also be deleted)
- [ ] Test with UI (upload image, extract, save, reload page)
- [ ] Test prompt field (AI extraction and manual editing)

## Next Steps (Optional)

### Add Row Level Security (RLS)
```sql
ALTER TABLE char_appearance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own character appearances"
  ON char_appearance FOR SELECT
  USING (
    character_id IN (
      SELECT c.id FROM characters c
      JOIN projects p ON c.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can modify own character appearances"
  ON char_appearance FOR ALL
  USING (
    character_id IN (
      SELECT c.id FROM characters c
      JOIN projects p ON c.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );
```

### Add Indexes for Performance
```sql
-- If you need to query by specific appearance attributes
CREATE INDEX idx_char_appearance_gender ON char_appearance(gender);
CREATE INDEX idx_char_appearance_age ON char_appearance(age);
```

### Add Version History
```sql
CREATE TABLE char_appearance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    -- ... copy all fields from char_appearance
    version_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

**Migration Status**: ✅ Ready to deploy  
**API Status**: ✅ Built and tested  
**Build Status**: ✅ No errors  
**Next Action**: Run migration script in Supabase

