# Structure Refactoring (Batch 1/4)

## Project Type: Next.js 15 (App Router)

## Overview

This requirement addresses structural violations detected in the codebase. Following proper project structure improves:
- **Code Organization**: Easier to find and maintain files
- **Developer Experience**: Predictable locations for different types of code
- **Scalability**: Clear patterns for adding new features
- **Team Collaboration**: Consistent structure across the team

## Structure Violations Detected


### 1. db/01_schema.sql

**Issue**: Anti-pattern detected

**Current Location**: `db/01_schema.sql`

**Expected Location**: `Move to src/ or remove`

**Reason**: Item is in "db/" which is not a standard Next.js folder. Expected structure has code in src/ folder. 

**Action Required**:
- Refactor or relocate `db/01_schema.sql`
- Follow the pattern: Move to src/ or remove
- Update imports and references

---

### 2. db/02_seed_data.sql

**Issue**: Anti-pattern detected

**Current Location**: `db/02_seed_data.sql`

**Expected Location**: `Move to src/ or remove`

**Reason**: Item is in "db/" which is not a standard Next.js folder. Expected structure has code in src/ folder. 

**Action Required**:
- Refactor or relocate `db/02_seed_data.sql`
- Follow the pattern: Move to src/ or remove
- Update imports and references

---

### 3. db/mockData.ts

**Issue**: Anti-pattern detected

**Current Location**: `db/mockData.ts`

**Expected Location**: `Move to src/ or remove`

**Reason**: Item is in "db/" which is not a standard Next.js folder. Expected structure has code in src/ folder. 

**Action Required**:
- Refactor or relocate `db/mockData.ts`
- Follow the pattern: Move to src/ or remove
- Update imports and references

---

### 4. db/README.md

**Issue**: Anti-pattern detected

**Current Location**: `db/README.md`

**Expected Location**: `Move to src/ or remove`

**Reason**: Item is in "db/" which is not a standard Next.js folder. Expected structure has code in src/ folder. 

**Action Required**:
- Refactor or relocate `db/README.md`
- Follow the pattern: Move to src/ or remove
- Update imports and references

---

### 5. src/app/components

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components`

**Expected Location**: `src/app/features/components/`

**Reason**: Folder "components" is not allowed in src/app/. (Strict mode: only explicitly allowed items permitted) Allowed folders: api, features, *-page

**Action Required**:
- Refactor or relocate `src/app/components`
- Follow the pattern: src/app/features/components/
- Update imports and references

---

### 6. src/app/components/animation

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/animation`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: Folder "animation" is not allowed in src/app/components/. (Strict mode: only explicitly allowed items permitted) Allowed folders: api, features, *-page

**Action Required**:
- Refactor or relocate `src/app/components/animation`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 7. src/app/components/animation/BackgroundPattern.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/animation/BackgroundPattern.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "BackgroundPattern.tsx" is not allowed in src/app/components/animation/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/animation/BackgroundPattern.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 8. src/app/components/dev

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/dev`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: Folder "dev" is not allowed in src/app/components/. (Strict mode: only explicitly allowed items permitted) Allowed folders: api, features, *-page

**Action Required**:
- Refactor or relocate `src/app/components/dev`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 9. src/app/components/dev/DevProjectInitializer.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/dev/DevProjectInitializer.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "DevProjectInitializer.tsx" is not allowed in src/app/components/dev/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/dev/DevProjectInitializer.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 10. src/app/components/dev/RateLimiterMonitor.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/dev/RateLimiterMonitor.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "RateLimiterMonitor.tsx" is not allowed in src/app/components/dev/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/dev/RateLimiterMonitor.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 11. src/app/components/icons

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/icons`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: Folder "icons" is not allowed in src/app/components/. (Strict mode: only explicitly allowed items permitted) Allowed folders: api, features, *-page

**Action Required**:
- Refactor or relocate `src/app/components/icons`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 12. src/app/components/icons/Logo.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/icons/Logo.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "Logo.tsx" is not allowed in src/app/components/icons/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/icons/Logo.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 13. src/app/components/layout

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/layout`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: Folder "layout" is not allowed in src/app/components/. (Strict mode: only explicitly allowed items permitted) Allowed folders: api, features, *-page

**Action Required**:
- Refactor or relocate `src/app/components/layout`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 14. src/app/components/layout/AppShell.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/layout/AppShell.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "AppShell.tsx" is not allowed in src/app/components/layout/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/layout/AppShell.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 15. src/app/components/layout/CenterPanel.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/layout/CenterPanel.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "CenterPanel.tsx" is not allowed in src/app/components/layout/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/layout/CenterPanel.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 16. src/app/components/layout/LeftPanel.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/layout/LeftPanel.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "LeftPanel.tsx" is not allowed in src/app/components/layout/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/layout/LeftPanel.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 17. src/app/components/layout/RightPanel.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/layout/RightPanel.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "RightPanel.tsx" is not allowed in src/app/components/layout/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/layout/RightPanel.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 18. src/app/components/UI

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/UI`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: Folder "UI" is not allowed in src/app/components/. (Strict mode: only explicitly allowed items permitted) Allowed folders: api, features, *-page

**Action Required**:
- Refactor or relocate `src/app/components/UI`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 19. src/app/components/UI/BannerContext.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/UI/BannerContext.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "BannerContext.tsx" is not allowed in src/app/components/UI/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/UI/BannerContext.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references

---

### 20. src/app/components/UI/ColoredBorder.tsx

**Issue**: Anti-pattern detected

**Current Location**: `src/app/components/UI/ColoredBorder.tsx`

**Expected Location**: `Relocate or remove - see structure guidelines`

**Reason**: File "ColoredBorder.tsx" is not allowed in src/app/components/UI/. (Strict mode: only explicitly allowed items permitted) Allowed files: globals.css, favicon.ico, layout.tsx, page.tsx

**Action Required**:
- Refactor or relocate `src/app/components/UI/ColoredBorder.tsx`
- Follow the pattern: Relocate or remove - see structure guidelines
- Update imports and references


## General Structure Guidelines for Next.js

### Next.js 15 Enforced Structure (with src/)

Strict Next.js structure with explicit folder and file rules (assumes src/ folder exists)

**Directory Structure:**

- **`src/`**: Source code directory - only specified folders allowed
  - Allowed folders:
    - `app` - Next.js App Router - pages, layouts, and routes
    - `components` - Shared/reusable components only
    - `hooks` - Custom React hooks
    - `lib` - Business logic, utilities, and services
    - `stores` - Zustand state management stores
    - `types` - TypeScript type definitions
  - ⚠️ **Strict mode**: Only explicitly listed items are allowed
  - **`src/app/`**: App Router directory - pages and API routes
    - Allowed folders:
      - `api` - API route handlers
      - `features` - Shared feature components and logic
      - `*-page` - Page folders (must end with -page)
    - Allowed files:
      - `globals.css` - Global CSS styles
      - `favicon.ico` - Favicon icon
      - `layout.tsx` - Root layout component
      - `page.tsx` - Root page component
    - ⚠️ **Strict mode**: Only explicitly listed items are allowed
    - **`src/app/features/`**: Shared feature components - supports subfeatures one level deep
      - Allowed folders:
        - `components` - Feature-specific components
        - `lib` - Feature-specific utilities and logic
        - `sub_*` - Subfeatures (one level only)
      - Allowed files:
        - `*` - Any file types allowed in features root
      - ⚠️ **Strict mode**: Only explicitly listed items are allowed
      - **`src/app/features/sub_*/`**: Subfeature folders - cannot have nested subfeatures
        - Allowed folders:
          - `components` - Subfeature components
          - `lib` - Subfeature utilities
        - Allowed files:
          - `*` - Any file types allowed in subfeatures
        - ⚠️ **Strict mode**: Only explicitly listed items are allowed


    - **`src/app/api/`**: API routes with recursive subdirectories
      - Allowed folders:
        - `*` - API route folders (recursive)
      - Allowed files:
        - `route.ts` - API route handler
        - `*.ts` - TypeScript files for API logic


  - **`src/components/`**: Shared components - recursive structure allowed
    - Allowed folders:
      - `*` - Component folders (recursive)
    - Allowed files:
      - `*.tsx` - React components
      - `*.ts` - TypeScript utilities
      - `*.css` - Component styles

  - **`src/lib/`**: Business logic and utilities - recursive structure allowed
    - Allowed folders:
      - `*` - Utility folders (recursive)
    - Allowed files:
      - `*.ts` - TypeScript files
      - `*.tsx` - React utilities

  - **`src/hooks/`**: Custom React hooks
    - Allowed files:
      - `*.ts` - Hook files
      - `*.tsx` - Hook files with JSX

  - **`src/stores/`**: Zustand stores
    - Allowed files:
      - `*.ts` - Store files

  - **`src/types/`**: TypeScript types
    - Allowed files:
      - `*.ts` - Type definition files


**Anti-Patterns (AVOID):**

- ❌ `src/pages/**` - Pages Router directory (legacy)
  - Use instead: `src/app/`
- ❌ `src/utils/**` - Utils directory
  - Use instead: `src/lib/`
- ❌ `src/helpers/**` - Helpers directory
  - Use instead: `src/lib/`
- ❌ `src/app/features/sub_*/sub_*/**` - Nested subfeatures (not allowed)
  - Use instead: `Flatten to src/app/features/sub_*/`

**Key Principles:**

1. **Strict src/ structure**: Only `app`, `components`, `hooks`, `lib`, `stores`, and `types` folders are allowed in `src/`
2. **App Router structure**: Only `api`, `features`, and `*-page` folders allowed in `src/app/`, plus specific root files
3. **Feature organization**: Use `src/app/features/` for shared feature logic with optional `sub_*` subfeatures (one level only)
4. **No nested subfeatures**: Subfeatures (`sub_*`) cannot contain other subfeatures
5. **Consistent naming**: Use `src/lib/` for all utilities (not `utils/` or `helpers/`)


## Instructions

1. **Review Each Violation**: Understand why the current structure is problematic
2. **Plan the Refactoring**: Identify all files that need to be moved/modified
3. **Move Files Systematically**: Use your file operations to move files
4. **Update Imports**: Search for and update all import statements that reference moved files
5. **Test After Each Move**: Verify the application still works correctly
6. **Commit Changes**: Group related moves into logical commits

## Important Notes

- **DO NOT** break existing functionality while refactoring
- **DO** update all import statements after moving files
- **DO** test the application after major structural changes
- **DO** preserve file content - only change locations and imports
- **AVOID** moving too many files at once - refactor incrementally

## Success Criteria

✅ All 20 violations in this batch are resolved
✅ All imports are updated and working
✅ Application builds without errors
✅ No broken functionality

## Project Path

`C:/Users/kazda/kiro/story`

Begin refactoring now. Work through each violation systematically.
