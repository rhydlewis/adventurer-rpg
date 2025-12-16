# Entity Type Refactor - Design Document

**Date:** 2025-12-16
**Status:** Validated Design
**Purpose:** Resolve build errors from Enemy System Redesign by refactoring utilities and UI to work with Entity base type

## Context

After implementing Tasks 2.1-2.4 of the Enemy System Implementation Plan, build errors emerged due to type mismatches:
- Utilities expecting `Character` are being passed `Creature`
- UI components accessing `.class` on entities that could be `Character | Creature`
- Combat store passing `Creature` to functions expecting `Character`

The root cause: utilities were written before the Entity/Character/Creature type hierarchy existed.

## Type Hierarchy Review

```
Entity (base type)
├── Character extends Entity
│   └── Adds: class, background, gold, inventory
└── Creature extends Entity
    └── Adds: creatureClass, taunts, lootTableId
```

**Common Entity properties:** name, avatarPath, level, attributes, hp, maxHp, ac, bab, saves, skills, feats, equipment, resources

## Design Decisions

### 1. Utility Function Types
**Decision:** Refactor combat/mechanics utilities to accept `Entity` instead of `Character`

**Rationale:**
- Saving throws, conditions, damage, and spells only need Entity properties (saves, attributes, hp, ac)
- Simplifies function signatures
- Avoids code duplication (no need for separate Character/Creature versions)
- Character/Creature-specific utilities (character creation, enemy generation) stay type-specific

### 2. Display Logic
**Decision:** Create helper functions with type guards for accessing type-specific properties

**Rationale:**
- Centralizes display logic in one place
- Keeps UI components clean
- Easier to maintain than inline type guards in every component
- Type-safe through TypeScript's type narrowing

### 3. Combat State Types
**Decision:** Keep `player: Character` and `enemy: Creature` in CombatState

**Rationale:**
- Preserves full type information for UI (loot tables, taunts, class display)
- TypeScript automatically allows upcasting to Entity when passing to utilities
- No explicit casting needed
- After victory, can access `enemy.lootTableId` with full type safety

---

## Task Breakdown (Insert Between Tasks 2.4 and 2.5)

### Task 2.4a: Create Entity Helper Utilities

**File:** `src/utils/entityHelpers.ts` (new)

**Functions:**

```typescript
/**
 * Get display name for entity's class/type
 */
export function getEntityDisplayClass(entity: Entity): string {
  if ('class' in entity) {
    return entity.class;
  }
  if ('creatureClass' in entity) {
    return entity.creatureClass;
  }
  return 'Unknown';
}

/**
 * Type guard: Check if entity is a Character
 */
export function isCharacter(entity: Entity): entity is Character {
  return 'class' in entity;
}

/**
 * Type guard: Check if entity is a Creature
 */
export function isCreature(entity: Entity): entity is Creature {
  return 'creatureClass' in entity;
}
```

**Unit Tests:** `src/__tests__/utils/entityHelpers.test.ts`

Test cases:
- `getEntityDisplayClass` returns correct class for Character
- `getEntityDisplayClass` returns correct creatureClass for Creature
- `getEntityDisplayClass` handles edge cases (returns 'Unknown')
- `isCharacter` correctly identifies Characters
- `isCreature` correctly identifies Creatures
- Type guards enable proper type narrowing

---

### Task 2.4b: Refactor Combat Utilities to Accept Entity

**Files to modify:**

1. **`src/utils/savingThrows.ts`**
   - Change: `makeSavingThrow(character: Character, ...)` → `makeSavingThrow(entity: Entity, ...)`
   - Update JSDoc comments
   - No logic changes (only uses entity.saves, entity.attributes)

2. **`src/utils/conditions.ts`**
   - Change: `applyCondition(..., target: Character, ...)` → `applyCondition(..., target: Entity, ...)`
   - Update all helper functions accepting Character parameters
   - Internal calls to `makeSavingThrow` already compatible

3. **`src/utils/spellcasting.ts`**
   - Change: `castSpell(caster: Character, ..., target: Character | Creature)` → `castSpell(caster: Entity, ..., target: Entity)`
   - Change: `getSpellSaveDC(caster: Character, ...)` → `getSpellSaveDC(caster: Entity, ...)`
   - Simplifies union types while maintaining functionality

**Unit Tests to update:**
- `src/__tests__/utils/savingThrows.test.ts` - Use Entity-shaped mocks
- `src/__tests__/utils/conditions.test.ts` - Update test data types
- `src/__tests__/utils/spellcasting.test.ts` - Test with both Character and Creature

**Approach:** Pure type signature changes. Since these utilities only use Entity properties, no conditional logic or type guards needed in implementation.

---

### Task 2.4c: Update Combat Store Types

**Files to modify:**

1. **`src/types/combat.ts`**
   ```typescript
   interface CombatState {
     player: Character;      // Unchanged
     enemy: Creature;        // Changed from Character
     turn: number;
     log: CombatLogEntry[];
     winner: 'player' | 'enemy' | null;
     // ... rest unchanged
   }
   ```

2. **`src/stores/combatStore.ts`**
   - Update `startCombat` signature: `(player: Character, enemy: Creature) => void`
   - Pass to utilities as Entity (automatic upcasting, no explicit cast needed)
   - Access type-specific properties when needed:
     ```typescript
     // After victory:
     const loot = rollLoot(state.enemy.lootTableId); // ✓ TypeScript knows enemy is Creature
     ```

**Unit Tests:** `src/__tests__/stores/combatStore.test.ts`
- Update test setup to use `generateEnemy()` for enemy creation
- Verify `combat.player` is Character, `combat.enemy` is Creature
- Test that combat utilities work with both types

---

### Task 2.4d: Update UI Components

**Files to modify:**

1. **`src/screens/CombatScreen.tsx`**
   - Import `getEntityDisplayClass` from `utils/entityHelpers`
   - Change line 400: `{character.class}` → `{getEntityDisplayClass(character)}`
   - Update internal render functions to accept `character: Character | Creature`
   - Other Entity properties (hp, ac, level) work unchanged

   **Example:**
   ```tsx
   // Before:
   <p className="text-[10px] text-slate-500 label-secondary">
     Lv{character.level} {character.class}
   </p>

   // After:
   <p className="text-[10px] text-slate-500 label-secondary">
     Lv{character.level} {getEntityDisplayClass(character)}
   </p>
   ```

2. **`src/screens/HomeScreen.tsx`**
   - Check for any `.class` property access on entities
   - Apply same helper pattern if found
   - Likely minimal changes (HomeScreen primarily uses player Character)

**No unit tests needed:** UI components not unit tested per project conventions (CLAUDE.md: "Test game mechanics, not UI")

---

### Task 2.4e: Fix Failing Tests

**Approach:** Run `npm test` after each task and fix failures incrementally.

**Expected failures:**

1. **`src/__tests__/utils/combat.test.ts`**
   - Issue: Mock enemies created as Character instead of Creature
   - Fix: Create proper Creature mocks with `creatureClass` and `lootTableId`
   - Or: Use Entity-shaped objects if tests only need base properties

2. **`src/__tests__/stores/combatStore.test.ts`**
   - Issue: Enemies created as Character type
   - Fix: Use `generateEnemy('bandit')` or create Creature mocks
   - Verify: `combat.enemy` has Creature-specific properties accessible

3. **`src/__tests__/utils/spellcasting.test.ts`**
   - Issue: Assumes caster/target always Character
   - Fix: Add test cases with Creature casters (e.g., Wraith)
   - Verify: Entity type works for both Character and Creature

**Success Criteria:**
- ✅ `npm test` passes completely
- ✅ `npm run build` succeeds with no TypeScript errors
- ✅ `npm run lint` clean

---

## Implementation Order

Execute tasks sequentially:

1. **Task 2.4a** - Entity helpers (foundation for everything else)
2. **Task 2.4b** - Refactor utilities (enables combat store changes)
3. **Task 2.4c** - Update combat store types (enables UI changes)
4. **Task 2.4d** - Update UI components (fixes remaining errors)
5. **Task 2.4e** - Fix failing tests (continuous throughout, final verification)

**Verification after each task:**
- Run `npm run build` to check for TypeScript errors
- Run `npm test` to catch test failures early
- Fix issues before proceeding to next task

---

## Benefits of This Approach

1. **Type Safety:** Full TypeScript type checking with no `any` casts
2. **Simplicity:** Utilities use Entity, avoiding union types and conditional logic
3. **Maintainability:** Display logic centralized in helper functions
4. **Flexibility:** Easy to add new Entity subtypes in future (e.g., Summon, NPC)
5. **Non-Breaking:** Changes are additive - existing Character code continues working

---

## Rollback Plan

If issues arise, tasks can be reverted independently:
- Task 2.4a: Delete `entityHelpers.ts` (no dependencies yet)
- Task 2.4b: Revert utility signatures to `Character`
- Task 2.4c: Revert combat store to use `Character` for enemy
- Task 2.4d: Revert UI to direct property access with type assertions

Each task should be committed separately for easy rollback.

---

## Future Considerations

This refactor enables:
- **Polymorphic combat:** NPCs, summons, companions could all be Entity subtypes
- **Unified condition system:** Any Entity can have conditions applied
- **Flexible spell targeting:** Spells work on any Entity, not just Characters
- **Combat variety:** Creature-vs-Creature battles, multi-combatant encounters

The Entity abstraction is future-proof for Phase 2+ features.
