# Appearance Propagation System

## Overview

The Appearance Propagation System is an automated background service that maintains narrative consistency when character appearances change. When a writer updates a character's physical attributes, the system automatically identifies and updates all story elements (scenes, beats, character bios) that reference the character's appearance.

## How It Works

### 1. Automatic Change Detection
- Database triggers monitor the `char_appearance` table
- Any INSERT or UPDATE operation creates an entry in `appearance_change_log`
- Changed fields, old values, and new values are tracked

### 2. Target Identification
- System scans the project's scenes, beats, and character traits
- Identifies content that references the character
- Creates propagation targets in `appearance_propagation_targets` table

### 3. LLM-Powered Synthesis
- For each target, the system uses an LLM to generate updated content
- Maintains the original narrative voice, tone, and style
- Only updates appearance-related descriptions
- Preserves plot points, actions, and dialogue

### 4. Review & Apply
- Users can review AI-generated updates before applying
- Side-by-side comparison of original vs updated content
- Batch apply multiple updates or apply individually
- Undo functionality for applied changes

### 5. Background Processing
- Cron job processes pending changes in batches
- Retry logic for failed updates (max 3 retries)
- Error tracking and logging

## Database Schema

### appearance_change_log
Tracks all appearance changes for propagation.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| character_id | UUID | Reference to characters table |
| project_id | UUID | Reference to projects table |
| changed_fields | JSONB | Array of field names that changed |
| old_values | JSONB | Previous values |
| new_values | JSONB | New values |
| propagation_status | TEXT | pending, processing, completed, failed |
| propagation_started_at | TIMESTAMP | When processing started |
| propagation_completed_at | TIMESTAMP | When processing finished |
| error_message | TEXT | Error details if failed |
| retry_count | INTEGER | Number of retry attempts |

### appearance_propagation_targets
Tracks individual story elements that need updating.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| change_log_id | UUID | Reference to appearance_change_log |
| character_id | UUID | Reference to characters table |
| target_type | TEXT | scene, beat, character_bio, dialogue |
| target_id | UUID | ID of the scene, beat, etc. |
| status | TEXT | pending, completed, failed |
| original_content | TEXT | Original text |
| updated_content | TEXT | AI-generated updated text |
| applied | BOOLEAN | Whether update has been applied |

## API Endpoints

### GET /api/appearance-propagation
Get pending appearance changes.

**Query Parameters:**
- `character_id` (optional) - Filter by character

**Response:**
```json
[
  {
    "id": "uuid",
    "character_id": "uuid",
    "changed_fields": ["hair_color", "eye_color"],
    "propagation_status": "pending",
    "created_at": "2025-11-23T10:00:00Z"
  }
]
```

### POST /api/appearance-propagation/process
Process a change log and generate updates.

**Request:**
```json
{
  "change_log_id": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "changeLogId": "uuid",
  "targetsProcessed": 5,
  "successCount": 4,
  "failureCount": 1
}
```

### POST /api/appearance-propagation/apply
Apply updates to story elements.

**Request:**
```json
{
  "target_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "success": true,
  "applied": 2,
  "failed": 0,
  "total": 2
}
```

### GET /api/cron/process-appearance-changes
Cron job endpoint for batch processing.

**Headers:**
- `Authorization: Bearer <CRON_SECRET>`

**Response:**
```json
{
  "success": true,
  "timestamp": "2025-11-23T10:00:00Z",
  "result": {
    "processedCount": 10,
    "successCount": 9,
    "failureCount": 1
  }
}
```

## React Hook Usage

### useAppearancePropagation

```typescript
import { useAppearancePropagation } from '@/app/hooks/useAppearancePropagation';

function MyComponent({ characterId }) {
  const {
    isProcessing,
    propagationStatus,
    targets,
    triggerPropagation,
    getPendingChanges,
    getPropagationTargets,
    applyUpdates,
  } = useAppearancePropagation();

  // Trigger propagation for a change log
  const handleProcess = async () => {
    const changes = await getPendingChanges(characterId);
    if (changes.length > 0) {
      await triggerPropagation(changes[0].id);
    }
  };

  // Apply selected updates
  const handleApply = async () => {
    await applyUpdates(selectedTargetIds);
  };

  return (
    // Your UI
  );
}
```

## UI Components

### AppearancePropagationPanel
Full-featured panel for managing appearance propagation.

```tsx
import { AppearancePropagationPanel } from '@/app/features/characters/components/AppearancePropagationPanel';

<AppearancePropagationPanel characterId={characterId} />
```

**Features:**
- View pending changes
- Review propagation targets
- Side-by-side comparison
- Batch apply or individual apply
- Status indicators

### AppearancePropagationIndicator
Simple indicator for showing propagation status.

```tsx
import { AppearancePropagationIndicator } from '@/app/features/characters/components/AppearancePropagationIndicator';

<AppearancePropagationIndicator
  characterId={characterId}
  onViewDetails={() => setShowPanel(true)}
/>
```

**Features:**
- Pending change count
- Quick sync button
- Last update timestamp
- Link to detailed view

## LLM Synthesis

### Prompt Strategy

The system uses a specialized prompt to ensure high-quality updates:

1. **System Prompt**: Instructs the LLM to act as a narrative consistency assistant
2. **Character Context**: Provides character name and updated appearance
3. **Change Summary**: Lists specific fields that changed
4. **Original Content**: The text to be updated
5. **Target Type**: Scene, beat, character bio, or dialogue

### Validation

All LLM-generated updates are validated before being presented:
- Length ratio check (50%-150% of original)
- Non-empty content check
- Structural integrity check

### Confidence Scoring

Each update includes a confidence score:
- Character bios: 90%
- Scenes: 85%
- Beats: 85%
- Dialogue: 80%

## Background Job Processor

### Configuration

Set environment variable:
```bash
CRON_SECRET=your-secret-key
```

### Batch Processing

- Processes up to 10 pending changes per run
- Batch size: 5 concurrent changes
- 1-second delay between batches
- Max retries: 3 per change

### Error Handling

- Failed changes are marked with error messages
- Retry count is incremented
- After 3 retries, changes are skipped
- Errors are logged for debugging

### Recommended Schedule

- **Development**: Every 5 minutes
- **Production**: Every 15 minutes
- **High-traffic**: Every 5 minutes with larger batch size

## Integration Guide

### 1. Run Database Migration

```bash
psql -U postgres -d your_database -f db/migrations/018_add_appearance_propagation_system.sql
```

### 2. Set Up Cron Job

**Vercel Cron:**
```json
{
  "crons": [{
    "path": "/api/cron/process-appearance-changes",
    "schedule": "*/15 * * * *"
  }]
}
```

**GitHub Actions:**
```yaml
- name: Process Appearance Changes
  run: |
    curl -X GET \
      -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
      https://your-app.vercel.app/api/cron/process-appearance-changes
  schedule:
    - cron: '*/15 * * * *'
```

### 3. Add UI Components

Add to character appearance editor:

```tsx
import { AppearancePropagationIndicator } from '@/app/features/characters/components/AppearancePropagationIndicator';

function CharacterAppearanceEditor({ characterId }) {
  return (
    <div>
      {/* Your appearance form */}

      <AppearancePropagationIndicator characterId={characterId} />
    </div>
  );
}
```

## Monitoring & Debugging

### Check Pending Changes

```sql
SELECT * FROM appearance_change_log
WHERE propagation_status = 'pending'
ORDER BY created_at DESC;
```

### Check Failed Changes

```sql
SELECT * FROM appearance_change_log
WHERE propagation_status = 'failed'
ORDER BY created_at DESC;
```

### View Propagation Targets

```sql
SELECT t.*, c.name as character_name
FROM appearance_propagation_targets t
JOIN characters c ON t.character_id = c.id
WHERE t.status = 'pending'
ORDER BY t.created_at DESC;
```

### Check Retry Counts

```sql
SELECT character_id, retry_count, error_message
FROM appearance_change_log
WHERE retry_count > 0
ORDER BY retry_count DESC;
```

## Performance Considerations

### Database Indexes

All necessary indexes are created by the migration:
- `idx_appearance_change_log_character_id`
- `idx_appearance_change_log_project_id`
- `idx_appearance_change_log_status`
- `idx_appearance_propagation_targets_change_log_id`
- `idx_appearance_propagation_targets_status`

### LLM Rate Limiting

Consider implementing rate limiting for LLM calls:
- Max concurrent requests: 5
- Delay between requests: 200ms
- Exponential backoff for failures

### Batch Size Optimization

Adjust batch size based on your infrastructure:
- Small projects: 5-10 concurrent
- Medium projects: 10-20 concurrent
- Large projects: 20-50 concurrent

## Troubleshooting

### Issue: Changes not being detected
- Check if database triggers are installed
- Verify char_appearance table exists
- Check trigger function `log_appearance_change()`

### Issue: LLM synthesis fails
- Verify LLM API endpoint is configured
- Check API key and permissions
- Review error logs for specific failures

### Issue: Updates not applying
- Check target IDs are valid
- Verify user has write permissions
- Check for database constraints

### Issue: Cron job not running
- Verify CRON_SECRET is set
- Check authorization header
- Review cron schedule configuration

## Best Practices

1. **Review Before Applying**: Always review AI-generated updates before applying
2. **Batch Operations**: Use batch apply for efficiency
3. **Monitor Errors**: Regularly check failed changes
4. **Clean Old Logs**: Periodically clean up old completed logs
5. **Test LLM Prompts**: Adjust prompts for better quality
6. **Set Confidence Thresholds**: Only auto-apply high-confidence updates

## Future Enhancements

- [ ] Diff view for comparing changes
- [ ] Undo/rollback functionality
- [ ] Notification system for completed propagations
- [ ] Analytics dashboard
- [ ] Custom LLM prompt templates
- [ ] Confidence threshold settings
- [ ] Manual override for specific targets
- [ ] Bulk approval workflows
