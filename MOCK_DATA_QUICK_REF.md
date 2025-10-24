# Mock Data Quick Reference 🚀

## ✅ Setup Complete!

Mock data is **enabled** and ready to use. Your UI will work without a backend!

---

## 🎯 Quick Test

```bash
npm run dev
```

You'll see:
- ✅ 3 projects on landing page
- ✅ Acts and scenes in left panel
- ✅ 5 characters with factions
- ✅ Relationships and traits
- ✅ All UI navigation working

---

## 📊 Mock Data Summary

| Entity | Count | Details |
|--------|-------|---------|
| **Projects** | 3 | Epic Fantasy Saga (main), Cyberpunk Chronicles, Mystery Manor |
| **Characters** | 5 | Aldric, Lyra, Theron, Elara, Marcus |
| **Factions** | 3 | Silver Order (blue), Dragon Clan (red), Shadow Guild (gray) |
| **Acts** | 3 | Act 1, 2, 3 |
| **Scenes** | 6 | 3 in Act 1, 2 in Act 2, 1 in Act 3 |
| **Traits** | 6 | Sample traits for Aldric and Lyra |
| **Relationships** | 3 | Aldric↔Lyra, Aldric↔Elara, Lyra↔Theron |

---

## 🔧 Key Files

```
story/
├── db/
│   └── mockData.ts              # All mock data here
├── src/app/
│   ├── config/
│   │   ├── api.ts               # USE_MOCK_DATA = true
│   │   └── mockUser.ts          # MOCK_USER_ID = 'user-123'
│   └── api/                     # All API files mock-enabled
```

---

## 🎮 Using Mock Data

### In any component:
```typescript
import { MOCK_USER_ID } from '@/app/config/mockUser';

// Use in ProjectsFeature (already configured)
<ProjectsFeature userId={MOCK_USER_ID} />
```

### Switch to real backend:
Edit `src/app/config/api.ts`:
```typescript
export const USE_MOCK_DATA = false;  // That's it!
```

---

## 📝 What Works

✅ All GET operations  
✅ Data filtering (by project, faction, act, etc.)  
✅ UI navigation and display  
✅ Loading states  
✅ Empty states  

❌ Create/Update/Delete (not persisted)  
❌ Real-time updates  

---

## 🎨 Test These Features

1. **Projects Page**
   - View 3 projects
   - Click to select

2. **Left Panel**
   - See acts in tabs
   - View scenes list
   - Test act/scene selection

3. **Characters**
   - View 5 characters
   - Filter by faction
   - Click for details

4. **Character Details**
   - Info tab
   - About tab (traits)
   - Relationships tab

5. **Factions**
   - View 3 factions with colors
   - See member counts
   - Click for details

---

## 💡 Adding More Data

Edit `db/mockData.ts` and add to the arrays:
```typescript
export const mockCharacters: Character[] = [
  // ... existing
  { id: 'char-6', name: 'New Character', ... },
];
```

---

## 📚 Full Documentation

See `MOCK_DATA_GUIDE.md` for:
- Complete setup details
- Architecture explanation
- Backend requirements
- Troubleshooting guide

---

**Ready to go! Start your dev server and test the UI.** 🎉

