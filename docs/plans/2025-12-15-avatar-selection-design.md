# Avatar Selection System Design

**Date:** 2025-12-15
**Status:** Approved
**Scope:** Add avatar selection to character creation and display in combat/character sheet

## Overview

Players will be able to choose from 4 pre-made avatar images during character creation (combined with name entry step). The selected avatar will be displayed:
1. In the combat screen next to the player's name
2. In the character sheet Overview tab as a hero section

## Design Decisions

### Placement in Creation Flow
- **Decision:** Combine avatar selection with name entry (Step 5 of 6)
- **Rationale:** Name and avatar are both "identity" choices - keep them together
- **Flow:** Class → Attributes → Skills → Feats → Name+Avatar → Complete

### Avatar Picker UI
- **Decision:** 2x2 grid of thumbnails above name input
- **Rationale:** Shows all 4 avatars at once, easy to scan, scalable
- **Interaction:** Click to select, visual highlight with ring border

### Required vs Optional
- **Decision:** Required with first avatar pre-selected by default
- **Rationale:** Clean data model (no null checks), no friction (default selected)
- **Validation:** Always have an avatar, can't proceed without one

### Avatar Organization
- **Decision:** Simple filename strings, no parsing or metadata
- **Rationale:** Keep it simple for 4 avatars, can refactor later if needed
- **Format:** Store as `avatarPath: string` (e.g., `'human_female_00009.png'`)

## Implementation Details

### 1. Data Model Changes

**File:** `src/types/character.ts`

Add `avatarPath` field to `Character` interface:

```typescript
interface Character {
  name: string;
  avatarPath: string;  // e.g., 'human_female_00009.png'
  class: CharacterClass;
  level: number;
  // ... existing fields
}
```

### 2. Avatar Constants

**File:** `src/data/avatars.ts` (new file)

```typescript
export const AVAILABLE_AVATARS = [
  'human_female_00009.png',
  'human_female_00062.png',
  'human_male_00005.png',
  'human_male_00024.png',
] as const;

export const DEFAULT_AVATAR = AVAILABLE_AVATARS[0];
```

**Why hardcoded list:**
- Works in production builds (can't scan directories)
- Easy to control ordering
- Type-safe with `as const`
- Simple to extend

### 3. Character Store Updates

**File:** `src/stores/characterStore.ts`

**Changes:**
1. Add `avatarPath: string` to `CharacterCreationData` interface
2. Initialize with `DEFAULT_AVATAR` in creation data
3. Add action: `setAvatarPath: (path: string) => void`
4. Update `finalizeCharacter()` to pass `avatarPath` to `createCharacter()`

### 4. Character Creation Utility

**File:** `src/utils/character.ts` (or wherever `createCharacter()` is defined)

**Changes:**
- Add `avatarPath` parameter to `createCharacter()` function
- Include `avatarPath` in returned `Character` object

### 5. Character Creation Screen UI

**File:** `src/screens/CharacterCreationScreen.tsx`

**Step 5: Name + Avatar Selection**

**Layout (top to bottom):**
1. Step title: "Name Your Hero"
2. **Avatar Grid** (new)
   - 2x2 grid, 80x80px images, rounded
   - Selected: `ring-4 ring-accent`
   - Unselected: `ring-2 ring-border-primary hover:ring-accent`
   - Click handler: `characterStore.setAvatarPath(avatar)`
3. Name input field (existing)
4. Navigation buttons (existing)

**Avatar Grid Component:**
```tsx
<div className="grid grid-cols-2 gap-4 max-w-xs mx-auto mb-6">
  {AVAILABLE_AVATARS.map((avatar) => (
    <button
      key={avatar}
      onClick={() => setAvatarPath(avatar)}
      className={`rounded-lg overflow-hidden transition-all ${
        creationData.avatarPath === avatar
          ? 'ring-4 ring-accent'
          : 'ring-2 ring-border-primary hover:ring-accent'
      }`}
    >
      <img
        src={`/assets/avatars/${avatar}`}
        alt="Character avatar"
        className="w-20 h-20 object-cover"
      />
    </button>
  ))}
</div>
```

### 6. Combat Screen Display

**File:** `src/screens/CombatScreen.tsx`

**Player Combatant Card:**
- Add 48x48px circular avatar to left of player name
- Use flex layout to align avatar + stats
- Avatar has `ring-2 ring-accent` for visual pop

**Layout:**
```
[Avatar] [Player Name]
         HP: [===] 20/20
         AC: 15 | BAB: +1
```

**Implementation:**
```tsx
<div className="flex gap-3 items-start">
  <img
    src={`/assets/avatars/${combat.player.avatarPath}`}
    alt={combat.player.name}
    className="w-12 h-12 rounded-full ring-2 ring-accent"
  />
  <div className="flex-1">
    <h3 className="character-name">{combat.player.name}</h3>
    {/* HP, AC, BAB stats */}
  </div>
</div>
```

**Enemy side:** No avatar for now (can add later)

### 7. Character Sheet Display

**File:** `src/screens/CharacterSheetScreen.tsx`

**Overview Tab - Add Hero Section at top:**

```tsx
{/* Hero Section - new */}
<div className="flex flex-col items-center mb-6 pb-6 border-b border-border-primary">
  <img
    src={`/assets/avatars/${character.avatarPath}`}
    alt={character.name}
    className="w-24 h-24 rounded-full ring-4 ring-accent mb-3"
  />
  <h2 className="character-name">{character.name}</h2>
  <p className="body-secondary">
    Level {character.level} {character.class}
  </p>
</div>

{/* Existing stats grid, attributes, etc. */}
```

**Why Overview tab:**
- First tab users see - establishes character identity
- Centered layout feels balanced
- Doesn't interfere with stats/attributes below

## Files to Modify

1. `src/types/character.ts` - Add `avatarPath` field
2. `src/data/avatars.ts` - Create avatar constants (new file)
3. `src/stores/characterStore.ts` - Add avatar state and action
4. `src/utils/character.ts` - Update `createCharacter()` signature
5. `src/screens/CharacterCreationScreen.tsx` - Add avatar grid to Step 5
6. `src/screens/CombatScreen.tsx` - Add avatar to player card
7. `src/screens/CharacterSheetScreen.tsx` - Add hero section to Overview tab

## Testing Considerations

1. **Character creation flow:**
   - Default avatar is pre-selected
   - Clicking avatars updates selection
   - Selected avatar is stored in character data

2. **Avatar display:**
   - Avatar displays correctly in combat screen
   - Avatar displays correctly in character sheet
   - Images load properly from `/public/assets/avatars/`

3. **Edge cases:**
   - Character created before avatar system (migration not needed - all new)
   - Missing avatar file (should not happen with hardcoded list)

## Future Enhancements (Out of Scope)

- Custom avatar upload
- More avatar options (50+ avatars with filtering)
- Avatar metadata (gender, tags, descriptions)
- Avatar unlocks/progression
- Enemy avatars in combat
