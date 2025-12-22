# Code Review Polish Tasks

**Date:** 2025-12-19
**Status:** Pending
**Context:** Post-merge polish for item usage & weapon swapping feature

## Overview

After merging the item usage and weapon swapping implementation, these minor improvements were identified during code review. All are polish/maintainability enhancements with no functional changes required.

**Original Review:** Code quality score 9.5/10 - these tasks bring it to 10/10.

---

## Tasks

### 1. Add Comment for Escape Item Handling

**File:** `src/utils/combat.ts`
**Location:** Line ~450 (escape item handling in resolveCombatRound)
**Priority:** Low
**Complexity:** Trivial (1 minute)

**Issue:**
The escape item handling uses an early return to prevent the enemy from taking their turn, but this isn't immediately obvious from the code.

**Current Code:**
```typescript
if (item.effect.type === 'escape') {
  return {
    ...state,
    turn: state.turn + 1,
    playerCharacter,
    log,
    winner: 'player', // Escaped successfully
  };
}
```

**Improvement:**
```typescript
// Handle escape items (special case: end combat immediately)
// Early return prevents enemy from taking their turn
if (item.effect.type === 'escape') {
  return {
    ...state,
    turn: state.turn + 1,
    playerCharacter,
    log,
    winner: 'player', // Escaped successfully
  };
}
```

**Benefit:** Future developers immediately understand why this returns early instead of continuing to enemy turn logic.

---

### 2. Extract Shield AC Bonus Constant

**Files:**
- `src/utils/characterCreation.ts` (lines with shield AC calculation)
- `src/utils/armor.ts` (if AC calculations moved there in future)

**Priority:** Low
**Complexity:** Simple (5 minutes)

**Issue:**
Shield AC bonus is hardcoded as `2` in multiple places. If game design changes shield values, we'd need to update multiple locations.

**Current Code:**
```typescript
// In calculateAC
if (classDef.hasShield) {
  ac += 2; // Magic number
}
```

**Improvement:**
```typescript
// At top of file (or in src/data/constants.ts for shared constants)
const SHIELD_AC_BONUS = 2;

// In calculateAC
if (classDef.hasShield) {
  ac += SHIELD_AC_BONUS;
}
```

**Locations to Update:**
1. `src/utils/characterCreation.ts::calculateAC()` - line ~50
2. `src/utils/characterCreation.ts::createCharacter()` - line ~180 (if direct calculation exists)

**Benefit:** Single source of truth for shield mechanics. Easy to adjust for game balance.

---

### 3. Add JSDoc to Item Effects Utility

**File:** `src/utils/itemEffects.ts`
**Priority:** Medium
**Complexity:** Simple (10 minutes)

**Functions to Document:**
1. `applyItemEffect()` - Main export, needs clear JSDoc

**Current:**
```typescript
export function applyItemEffect(
  character: Character,
  effect: ItemEffect,
  inCombat: boolean
): { character: Character; logMessage: string } {
  // ...
}
```

**Improvement:**
```typescript
/**
 * Apply an item's effect to a character
 *
 * Handles all item effect types: heal, escape, remove-condition, buff, damage, spell.
 * Returns updated character state and a log message describing the effect.
 *
 * @param character - The character using the item
 * @param effect - The item effect to apply
 * @param inCombat - Whether the character is currently in combat (affects escape items)
 * @returns Object with updated character and descriptive log message
 *
 * @example
 * const { character: updated, logMessage } = applyItemEffect(
 *   character,
 *   { type: 'heal', amount: '2d8+2' },
 *   true
 * );
 * console.log(logMessage); // "2d8+2: [7]+[5]+2 = 14 HP restored"
 */
export function applyItemEffect(
  character: Character,
  effect: ItemEffect,
  inCombat: boolean
): { character: Character; logMessage: string } {
  // ...
}
```

**Benefit:**
- Better IDE autocomplete
- Clear API contract for future developers
- Example usage for common case

---

### 4. Add JSDoc to Equipment Helpers

**File:** `src/utils/equipmentHelpers.ts`
**Priority:** Medium
**Complexity:** Simple (15 minutes)

**Functions to Document:**
1. `hasWeaponProficiency()` - Public API
2. `hasArmorProficiency()` - Public API
3. `canUseItem()` - Public API
4. `getItemDisabledReason()` - Public API

**Template (apply to each function):**
```typescript
/**
 * Check if character has proficiency with a weapon
 *
 * Checks class proficiencies against weapon requirements. Handles edge cases:
 * - Martial proficiency includes martial-finesse weapons
 * - Simple weapons have no proficiency requirement
 *
 * @param character - The character attempting to equip the weapon
 * @param weapon - The weapon to check proficiency for
 * @returns true if character is proficient, false otherwise
 *
 * @example
 * const canEquip = hasWeaponProficiency(wizard, longsword); // false
 * const canEquip = hasWeaponProficiency(fighter, longsword); // true
 */
export function hasWeaponProficiency(character: Character, weapon: Weapon): boolean {
  // ...
}
```

**Apply similar pattern to:**
- `hasArmorProficiency()` - Check armor proficiency
- `canUseItem()` - Context-based item usage validation
- `getItemDisabledReason()` - Return human-readable reason for disabled items

**Benefit:**
- Self-documenting API
- Reduces need to read implementation to understand usage
- Examples show common patterns

---

### 5. Evaluate UUID Library for Weapon IDs (Optional)

**Files:**
- `package.json` (if we add uuid dependency)
- `src/utils/characterCreation.ts` (weapon ID generation)

**Priority:** Very Low (optional enhancement)
**Complexity:** Simple (10 minutes)

**Current Approach:**
```typescript
id: `${classDef.startingWeapon.toLowerCase()}-${Date.now()}`
```

**Pros:** Simple, no dependencies, human-readable
**Cons:** Theoretical collision if two weapons created in same millisecond (extremely unlikely in single-player)

**Alternative (UUID):**
```typescript
import { v4 as uuidv4 } from 'uuid';

id: `${classDef.startingWeapon.toLowerCase()}-${uuidv4()}`
```

**Pros:** Guaranteed unique, standard approach, future-proof for multiplayer
**Cons:** Adds dependency, longer IDs, less human-readable

**Decision Matrix:**

| Factor | Timestamp | UUID | Winner |
|--------|-----------|------|--------|
| Simplicity | ✅ No dependency | ❌ Adds dependency | Timestamp |
| Uniqueness | ⚠️ Collisions possible (unlikely) | ✅ Guaranteed unique | UUID |
| Readability | ✅ `longsword-1702998400123` | ❌ `longsword-a7f3-4c2e-9d8b-1f3e4d5a6b7c` | Timestamp |
| Future-proof | ❌ Not safe for multiplayer | ✅ Industry standard | UUID |
| Performance | ✅ Very fast | ✅ Fast enough | Tie |

**Recommendation:**
- **Keep timestamp approach for now** - single-player game, no collision risk in practice
- **Revisit if multiplayer planned** - UUID would be essential for multiplayer
- **Alternative: nanoid** - If we want middle ground (shorter than UUID, still unique)

**Implementation (if chosen):**
```bash
npm install uuid
npm install --save-dev @types/uuid
```

Then update weapon ID generation in:
1. `src/utils/characterCreation.ts::createCharacter()`
2. Any other location that creates weapon instances dynamically

**Testing:** Verify existing saves still load correctly (weapon IDs change format).

---

## Implementation Order

Recommended sequence (easiest to hardest):

1. ✅ **Task 1:** Add escape item comment (1 min)
2. ✅ **Task 2:** Extract shield AC constant (5 min)
3. ✅ **Task 3:** Add JSDoc to itemEffects (10 min)
4. ✅ **Task 4:** Add JSDoc to equipmentHelpers (15 min)
5. ⚠️ **Task 5:** Evaluate UUID (optional, 10 min decision + implementation)

**Total Time:** ~30 minutes (excluding optional UUID task)

---

## Testing Requirements

After completing tasks 1-4:

```bash
# Run tests (should all pass, no logic changes)
npm test

# Run lint (should pass, comments don't affect lint)
npm run lint

# Build (should succeed)
npm run build
```

**Manual Testing:** Not required - these are documentation/constant extraction changes with no functional impact.

---

## Success Criteria

- [ ] All comments added are clear and explain "why" not "what"
- [ ] Shield AC bonus constant extracted and used consistently
- [ ] All public API functions have JSDoc with @param, @returns, and @example
- [ ] IDE autocomplete shows helpful documentation
- [ ] All tests still pass (469/469)
- [ ] Build and lint clean
- [ ] Code quality score: 10/10

---

## Post-Completion

After completing these tasks:
1. Commit changes: `chore: add code review polish (comments, constants, JSDoc)`
2. No need for new tests (no logic changes)
3. Update CLAUDE.md if any new patterns emerge (e.g., constants file location)

---

## Notes

**Why These Are Low Priority:**
- No bugs to fix
- No functionality to add
- Code already works correctly
- These improve maintainability, not behavior

**Why They're Still Worth Doing:**
- Future developers benefit from clear documentation
- Constants prevent magic number bugs
- JSDoc improves IDE experience
- Shows professional code quality standards
