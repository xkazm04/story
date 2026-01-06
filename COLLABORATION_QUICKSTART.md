# Real-Time Collaboration - Quick Start Guide

## What Was Implemented

A complete real-time collaboration system for story projects with:

✅ **WebSocket Infrastructure** - Real-time bidirectional communication
✅ **Team Chat** - Send, edit, and delete messages instantly
✅ **Presence Indicators** - See who's online with avatars and status
✅ **Operational Transforms** - Conflict-free collaborative editing
✅ **Role-Based Permissions** - Owner/Admin/Editor/Viewer roles
✅ **Version History** - Automatic document snapshots
✅ **Database Schema** - Supabase tables with RLS policies
✅ **API Endpoints** - Full CRUD for collaboration features

## Quick Integration

### 1. Add Collaboration Panel to Your Feature

```tsx
import { CollaborationPanel } from '@/app/features/collaboration';

function YourFeature() {
  const [showCollab, setShowCollab] = useState(false);

  return (
    <>
      <button onClick={() => setShowCollab(true)}>
        Collaborate
      </button>

      <CollaborationPanel
        projectId="project-123"
        userId="user-456"
        userName="John Doe"
        userRole="editor"
        isOpen={showCollab}
        onClose={() => setShowCollab(false)}
      />
    </>
  );
}
```

### 2. Show Presence Indicators

```tsx
import { PresenceIndicator } from '@/app/features/collaboration';
import { useCollaboration } from '@/app/hooks/useCollaboration';

function Header() {
  const { sessions } = useCollaboration({
    projectId: 'project-123',
    userId: 'user-456',
    userName: 'John Doe',
  });

  return (
    <header>
      <PresenceIndicator sessions={sessions} />
    </header>
  );
}
```

## Deployment Steps

### 1. Set Environment Variable

```env
# .env.local
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

### 2. Run Database Migration

Execute in Supabase dashboard:
```
db/migrations/017_add_collaboration_tables_supabase.sql
```

### 3. Deploy WebSocket Server (Required)

**Option A: Node.js Server**
```bash
npm install ws
node websocket-server.js
```

**Option B: Third-Party Service**
- Use Pusher, Ably, or Supabase Realtime
- Update `useCollaboration` hook accordingly

**Option C: Server-Sent Events**
- Use SSE for one-way communication
- Combine with HTTP polling

## Key Files

### Components
- `src/app/features/collaboration/components/CollaborationPanel.tsx`
- `src/app/features/collaboration/components/CollaborationChat.tsx`
- `src/app/features/collaboration/components/PresenceIndicator.tsx`

### Hooks
- `src/app/hooks/useCollaboration.ts`

### Types
- `src/app/types/Collaboration.ts`

### API Routes
- `src/app/api/collaboration/collaborators/route.ts`
- `src/app/api/collaboration/sessions/route.ts`
- `src/app/api/collaboration/messages/route.ts`
- `src/app/api/collaboration/versions/route.ts`

### Documentation
- `src/app/features/collaboration/README.md` (Detailed docs)
- `IMPLEMENTATION_LOG_COLLABORATION.md` (Implementation details)

## Role Permissions

| Role   | Edit | Delete | Invite | Manage Roles | Export | View History |
|--------|------|--------|--------|--------------|--------|--------------|
| Owner  | ✅   | ✅     | ✅     | ✅           | ✅     | ✅           |
| Admin  | ✅   | ✅     | ✅     | ❌           | ✅     | ✅           |
| Editor | ✅   | ❌     | ❌     | ❌           | ✅     | ✅           |
| Viewer | ❌   | ❌     | ❌     | ❌           | ✅     | ❌           |

## Testing

### Manual Testing Checklist

1. Open project in two browser windows (different users)
2. Verify both users show in presence indicators
3. Send chat message from user A → appears for user B
4. Edit message → changes reflect in real-time
5. Close one browser → user goes offline in other window
6. Test with different roles → verify permission restrictions

### Data Test IDs

All interactive elements have `data-testid` attributes:
- `collaboration-panel`
- `collaboration-chat`
- `chat-input`
- `chat-send-btn`
- `chat-message-{id}`
- `presence-indicator`
- `presence-avatar-{userId}`
- `collaborator-{userId}`

## Subscription Tiers (Monetization)

**Free**: 3 collaborators, basic chat, 7-day history
**Pro** ($9.99/mo): 10 collaborators, unlimited chat, 30-day history
**Enterprise** ($49.99/mo): Unlimited collaborators, full history, API access

## Known Limitations

1. ⚠️ **Requires separate WebSocket server** (not included)
2. ⚠️ **No cursor tracking** (infrastructure ready)
3. ⚠️ **No offline support** (queuing not implemented)
4. ⚠️ **Basic version history UI** (restoration ready, needs UI)

## Next Steps

1. **Deploy WebSocket server** - Choose Option A, B, or C above
2. **Run Supabase migration** - Create collaboration tables
3. **Test with multiple users** - Verify real-time sync
4. **Add to project workspace** - Integrate CollaborationPanel
5. **Configure permissions** - Set up initial project collaborators

## Support & Documentation

- **Full Docs**: `src/app/features/collaboration/README.md`
- **Implementation Log**: `IMPLEMENTATION_LOG_COLLABORATION.md`
- **API Reference**: See individual route files in `src/app/api/collaboration/`

## Quick Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run WebSocket server (if using Node.js option)
node websocket-server.js
```

---

**Status**: ✅ Implementation Complete | ⏳ WebSocket Server Needed | 📝 Testing Required

For detailed information, see `src/app/features/collaboration/README.md`
