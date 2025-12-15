# Creature Avatar System Design

**Date:** 2025-12-15
**Status:** Approved
**Scope:** Add creature avatar display in combat screen and replace test Goblin with Skeleton

## Overview

Implement creature avatar system to display enemy images in combat, using the skeleton image currently available. Replace the test "Goblin" enemy with "Skeleton" since we have the skeleton avatar asset. Use a generic fallback avatar for creatures without custom images.

## Design Decisions

### Avatar Mapping Structure
- **Decision:** Explicit mapping with default constant (Option A)
- **Rationale:** Clean, shows which creatures have custom avatars, clear fallback behavior
- **Pattern:** Reuse the constant-based approach from character avatars

### Fallback for Missing Avatars
- **Decision:** Use generic creature avatar (`monster_generic.png`)
- **Rationale:** Existing asset with question mark icon provides consistent placeholder
- **Benefit:** Every creature shows an avatar, even without custom art

### Test Enemy Replacement
- **Decision:** Replace Goblin with Skeleton
- **Rationale:** Skeleton image is available (`monster_skeleton_00009.png`)
- **Impact:** Update test files and HomeScreen test enemy definition

## Implementation Details

### 1. Creature Avatar Constants

**File:** `src/data/creatureAvatars.ts` (new file)

```typescript
/**
 * Creature avatar mappings
 * Images are located in /public/assets/creatures/
 */

type CreatureName = 'Skeleton' | 'Goblin' | 'Wolf' | 'Cultist' | 'Spider' | 'Wraith';

export const CREATURE_AVATARS: Partial<Record<CreatureName, string>> = {
  Skeleton: 'monster_skeleton_00009.png',
  // Add more as images become available:
  // Goblin: 'monster_goblin_00001.png',
  // Wolf: 'monster_wolf_00001.png',
  // Cultist: 'monster_cultist_00001.png',
  // Spider: 'monster_spider_00001.png',
  // Wraith: 'monster_wraith_00001.png',
} as const;

export const DEFAULT_CREATURE_AVATAR = 'monster_generic.png';
```

**Type Design:**
- `CreatureName` type documents the 6 planned Phase 1 enemy types
- `Partial<Record<...>>` allows mapping only creatures with custom images
- Comments show future expansion points

**Usage Pattern:**
```typescript
const avatarPath = CREATURE_AVATARS[creature.name] ?? DEFAULT_CREATURE_AVATAR;
```

### 2. Replace Goblin with Skeleton

**File:** `src/screens/HomeScreen.tsx`

**Import Changes:**
```typescript
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from '../data/creatureAvatars';
```

**Enemy Definition (replace lines 39-93):**
```typescript
const skeleton: Creature = {
  name: 'Skeleton',
  avatarPath: CREATURE_AVATARS['Skeleton'] ?? DEFAULT_CREATURE_AVATAR,
  class: 'Fighter',
  level: 1,
  attributes: {
    STR: 13,  // Stronger than goblin (undead resilience)
    DEX: 15,  // More agile (skeletal frame)
    CON: 10,  // Undead don't tire
    INT: 6,   // Mindless undead
    WIS: 8,   // Limited awareness
    CHA: 5,   // Frightening appearance
  },
  hp: 12,    // Slightly tougher than goblin (was 10)
  maxHp: 12,
  ac: 10,
  bab: 1,
  saves: {
    fortitude: 1,
    reflex: 1,
    will: -1,
  },
  skills: {
    Athletics: 0,
    Stealth: 0,
    Perception: 0,
    Arcana: 0,
    Medicine: 0,
    Intimidate: 0,
  },
  feats: [],
  equipment: {
    weapon: {
      name: 'Rusty Shortsword',
      damage: '1d6',
      damageType: 'slashing',
      finesse: false,
      description: 'A corroded blade wielded by the undead',
    },
    armor: {
      name: 'Tattered Armor',
      baseAC: 10,
      maxDexBonus: null,
      description: 'Decayed leather armor',
    },
    shield: {
      equipped: false,
      acBonus: 0,
    },
    items: [],
  },
  resources: {
    abilities: [],
  },
};

startCombat(player, skeleton);
```

**Variable Renaming:**
- Change all references from `goblin` to `skeleton` in the function

### 3. Combat Screen Avatar Display

**File:** `src/screens/CombatScreen.tsx`

**Update `CompactCombatant` component (around line 326):**

**Current:**
```typescript
{/* Avatar - only for player */}
{variant === 'player' && character.avatarPath && (
  <img
    src={`/assets/avatars/${character.avatarPath}`}
    alt={character.name}
    className="w-12 h-12 rounded-full ring-2 ring-emerald-500/50 flex-shrink-0"
  />
)}
```

**New:**
```typescript
{/* Avatar - player uses /avatars, enemy uses /creatures */}
{character.avatarPath && (
  <img
    src={`/assets/${variant === 'player' ? 'avatars' : 'creatures'}/${character.avatarPath}`}
    alt={character.name}
    className={`w-12 h-12 rounded-full ring-2 flex-shrink-0 ${
      variant === 'player'
        ? 'ring-emerald-500/50'
        : 'ring-red-500/50'
    }`}
  />
)}
```

**Key Changes:**
- Remove `variant === 'player'` check - show avatars for both sides
- Dynamic path: `/assets/avatars/` for player, `/assets/creatures/` for enemy
- Dynamic ring color: emerald for player, red for enemy
- Both avatars maintain 48x48px circular style

### 4. Test File Updates

Replace "Goblin" references with "Skeleton" in test files:

**Files to update:**
1. `src/__tests__/stores/combatStore.test.ts`
2. `src/__tests__/utils/combat.test.ts`
3. `src/__tests__/utils/spellcasting.test.ts`
4. `src/__tests__/utils/narrativeLogic.test.ts`

**Pattern:**
- Search for `name: 'Goblin'` → change to `name: 'Skeleton'`
- Update any goblin-specific stat references if needed
- Ensure avatarPath uses creature avatars pattern

## Files to Modify

1. `src/data/creatureAvatars.ts` - Create new file with creature avatar mapping
2. `src/screens/HomeScreen.tsx` - Replace goblin with skeleton, use creature avatars
3. `src/screens/CombatScreen.tsx` - Display creature avatars in enemy combatant card
4. `src/__tests__/stores/combatStore.test.ts` - Update test enemy to Skeleton
5. `src/__tests__/utils/combat.test.ts` - Update test enemy to Skeleton
6. `src/__tests__/utils/spellcasting.test.ts` - Update test enemy to Skeleton
7. `src/__tests__/utils/narrativeLogic.test.ts` - Update test enemy to Skeleton

## Testing Considerations

1. **Combat Screen Display:**
   - Skeleton avatar displays on enemy side (48x48px, circular)
   - Player avatar still displays correctly
   - Both avatars have appropriate ring colors (emerald vs red)
   - Generic avatar would display for unmapped creatures

2. **Test Validation:**
   - All tests pass with Skeleton instead of Goblin
   - No broken references to Goblin in test assertions
   - Avatar paths resolve correctly in tests

3. **Edge Cases:**
   - Creature not in CREATURE_AVATARS map → uses DEFAULT_CREATURE_AVATAR
   - Missing avatar file → browser shows broken image (acceptable for dev)

## Future Enhancements (Out of Scope)

- Add more creature images as they become available:
  ```typescript
  Goblin: 'monster_goblin_00001.png',
  Wolf: 'monster_wolf_00001.png',
  Cultist: 'monster_cultist_00001.png',
  Spider: 'monster_spider_00001.png',
  Wraith: 'monster_wraith_00001.png',
  ```
- Create full creature definitions file (`src/data/creatures.ts`)
- Move hardcoded enemy stats out of HomeScreen
- Add creature-specific traits and abilities
- Support multiple images per creature type
