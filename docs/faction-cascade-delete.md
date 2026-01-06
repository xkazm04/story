# Faction Cascading Delete

## Overview

This document describes the cascading delete functionality for factions, which ensures that when a faction is deleted, all related data is automatically cleaned up to prevent orphaned records and maintain data integrity.

## Implementation

### Database Constraints

The cascading delete is implemented using PostgreSQL's `ON DELETE CASCADE` foreign key constraints. When a faction is deleted, the database automatically deletes all related records in the following tables:

- `faction_lore` - All lore entries for the faction
- `faction_events` - All timeline events for the faction
- `faction_achievements` - All achievements earned by the faction
- `faction_media` - All media files (logos, banners, emblems, etc.)
- `faction_relationships` - All relationships where the faction is either faction_a or faction_b

### Special Case: Characters

Characters linked to a deleted faction are **NOT** deleted. Instead, their `faction_id` is set to `NULL` using the `ON DELETE SET NULL` constraint. This preserves character data while removing the faction association.

## Migration

The cascading delete constraints are defined in:
- **Migration 008**: Initial creation of faction-related tables with CASCADE constraints
- **Migration 011**: Ensures all CASCADE constraints are properly set (idempotent)

To apply the migration:

```sql
-- Run migration 011 to ensure all constraints are properly set
-- This migration is idempotent and safe to re-run
-- File: db/migrations/011_ensure_faction_cascade_delete.sql
```

For Supabase projects, apply the migration through the Supabase dashboard or CLI.

## API Endpoint

### DELETE /api/factions/:id

Deletes a faction and all related data in a single atomic operation.

**Request:**
```http
DELETE /api/factions/550e8400-e29b-41d4-a716-446655440000
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Faction and all related data deleted successfully",
  "deletedFaction": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "The Silverhand Guild"
  }
}
```

**Response (Not Found):**
```json
{
  "error": "Faction not found"
}
```

**Response (Error):**
```json
{
  "error": "Failed to delete faction",
  "details": "Error message details"
}
```

### Logging

The endpoint logs the following information:
- Counts of related records before deletion (for audit purposes)
- Faction name and ID being deleted
- Success/failure status

Example log output:
```
Deleting faction "The Silverhand Guild" (550e8400-e29b-41d4-a716-446655440000): {
  lore: 5,
  events: 12,
  achievements: 3,
  media: 8,
  relationships: 2,
  affectedCharacters: 15
}
Successfully deleted faction "The Silverhand Guild" (550e8400-e29b-41d4-a716-446655440000) and all related data
```

## Testing

A test script is provided to verify the cascading delete functionality:

```bash
npx tsx scripts/test-faction-cascade-delete.ts
```

The test script:
1. Creates a test faction
2. Creates related data (lore, events, achievements, media, relationships, characters)
3. Deletes the faction
4. Verifies all related data was deleted (except characters, which should have faction_id set to NULL)
5. Reports pass/fail for each test case

**Expected Output:**
```
🧪 Testing Faction Cascading Delete Functionality

✅ Using project: dd11e61e-f267-4e52-95c5-421b1ed9567b

📝 Creating test faction...
✅ Created test faction: a1b2c3d4-e5f6-7890-abcd-ef1234567890

📝 Creating related data...
✅ Created related data:
   - Lore entry: ...
   - Event: ...
   - Achievement: ...
   - Media: ...
   - Relationship: ...
   - Character: ...

🗑️  Deleting test faction...
✅ Faction deleted

🔍 Verifying cascading deletes...

📊 Test Results:

✅ Faction Lore Cascade Delete
   Lore entry deleted
✅ Faction Events Cascade Delete
   Event deleted
✅ Faction Achievements Cascade Delete
   Achievement deleted
✅ Faction Media Cascade Delete
   Media deleted
✅ Faction Relationships Cascade Delete
   Relationship deleted
✅ Character Faction ID Set to NULL
   Character exists with faction_id = NULL

==================================================
✅ All tests passed!
   Cascading delete is working correctly.
==================================================
```

## Benefits

1. **Data Integrity**: No orphaned records remain after faction deletion
2. **Atomicity**: The entire delete operation is atomic (all-or-nothing)
3. **Simplicity**: Single API call deletes faction and all related data
4. **Performance**: Database-level cascading is faster than application-level deletion
5. **Reliability**: Foreign key constraints prevent inconsistent state

## Troubleshooting

### Error: Foreign Key Constraint Violation

If you encounter foreign key constraint errors, it may indicate:
- Migration 011 hasn't been applied
- Existing constraints don't have CASCADE behavior
- Manual database modifications broke constraints

**Solution:**
1. Apply migration 011: `db/migrations/011_ensure_faction_cascade_delete.sql`
2. Verify constraints are properly set:

```sql
-- Check faction_lore constraint
SELECT conname, confdeltype
FROM pg_constraint
WHERE conrelid = 'faction_lore'::regclass
AND conname LIKE '%faction_id%';

-- confdeltype should be 'c' (CASCADE)
```

### Orphaned Records

If orphaned records exist from before the migration:

```sql
-- Find orphaned faction_lore records
SELECT fl.id, fl.faction_id
FROM faction_lore fl
LEFT JOIN factions f ON fl.faction_id = f.id
WHERE f.id IS NULL;

-- Delete orphaned records (repeat for each table)
DELETE FROM faction_lore
WHERE faction_id NOT IN (SELECT id FROM factions);
```

## Related Files

- `db/migrations/008_add_faction_ai_fields.sql` - Initial faction tables
- `db/migrations/011_ensure_faction_cascade_delete.sql` - CASCADE constraint migration
- `src/app/api/factions/[id]/route.ts` - DELETE endpoint implementation
- `scripts/test-faction-cascade-delete.ts` - Test script

## References

- [PostgreSQL Foreign Key Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [Supabase Foreign Key Relationships](https://supabase.com/docs/guides/database/tables#foreign-key-relationships)
