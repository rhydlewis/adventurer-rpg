# Item Usage & Weapon Swapping Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add item usage (healing potions, consumables) and weapon swapping to combat with character sheet integration.

**Architecture:** Hybrid approach with combat UI shortcuts (Items button, Swap button) and character sheet management (Use/Equip buttons). Free actions with proficiency-based restrictions.

**Tech Stack:** React + TypeScript + Zustand + Vitest

---

## Task 1: Update Equipment Type with Weapons Array

**Files:**
- Modify: `src/types/equipment.ts:48-53`

**Step 1: Add weapons array and proficiency fields to types**

Update the Equipment interface and add proficiency types:

```typescript
export interface Equipment {
  weapon: Weapon | null;       // Currently equipped weapon
  weapons: Weapon[];           // All owned weapons (includes equipped)
  armor: Armor | null;         // Currently equipped armor (no swapping Phase 1)
  shield: Shield | null;       // Shield status
  items: Item[];               // Consumables only (potions, scrolls, etc.)
}
```

Add proficiency to Weapon interface (after line 11):

```typescript
export interface Weapon {
  name: WeaponType;
  damage: string; // Dice notation (e.g., '1d8', '1d6')
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  finesse: boolean; // If true, can use DEX for attack/damage instead of STR
  description: string;
  proficiencyRequired?: 'simple' | 'martial' | 'martial-finesse'; // NEW
}
```

Add proficiency to Armor interface (after line 18):

```typescript
export interface Armor {
  name: ArmorType;
  baseAC: number; // Base AC provided (10 = no armor)
  maxDexBonus: number | null; // null = unlimited DEX bonus
  description: string;
  proficiencyRequired?: 'light' | 'medium' | 'heavy'; // NEW
}
```

**Step 2: Run TypeScript check**

Run: `npm run build`
Expected: May show errors where Equipment is used (we'll fix these next)

**Step 3: Commit**

```bash
git add src/types/equipment.ts
git commit -m "feat: add weapons array and proficiency fields to Equipment types"
```

---

## Task 2: Add Proficiencies to Class Definitions

**Files:**
- Modify: `src/data/classes.ts:6-28`

**Step 1: Add proficiencies to ClassDefinition interface**

Add after line 27 (before closing brace of interface):

```typescript
export interface ClassDefinition {
  name: CharacterClass;
  description: string;
  hitDie: number;
  baseHP: number;
  babProgression: 'full' | 'medium' | 'low';
  baseBab: number;
  saves: {
    fortitude: 'good' | 'poor';
    reflex: 'good' | 'poor';
    will: 'good' | 'poor';
  };
  baseSaves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  recommendedAttributes: Attributes;
  startingWeapon: WeaponType;
  startingArmor: ArmorType;
  hasShield: boolean;
  startingFeats?: FeatName[];
  proficiencies: {  // NEW
    weapons: ('simple' | 'martial' | 'martial-finesse')[];
    armor: ('light' | 'medium' | 'heavy')[];
  };
}
```

**Step 2: Add proficiencies to Fighter class**

Add proficiencies field to Fighter (after `hasShield: true,` at line 60):

```typescript
  Fighter: {
    // ... existing fields
    hasShield: true,
    proficiencies: {
      weapons: ['simple', 'martial'],
      armor: ['light', 'medium', 'heavy'],
    },
  },
```

**Step 3: Add proficiencies to Rogue class**

Add after `hasShield: false,` (around line 90):

```typescript
  Rogue: {
    // ... existing fields
    hasShield: false,
    proficiencies: {
      weapons: ['simple', 'martial-finesse'],
      armor: ['light'],
    },
  },
```

**Step 4: Add proficiencies to Wizard class**

Add after `hasShield: false,` (around line 120):

```typescript
  Wizard: {
    // ... existing fields
    hasShield: false,
    proficiencies: {
      weapons: ['simple'],
      armor: [],
    },
  },
```

**Step 5: Add proficiencies to Cleric class**

Add after `hasShield: true,` (around line 151):

```typescript
  Cleric: {
    // ... existing fields
    hasShield: true,
    proficiencies: {
      weapons: ['simple'],
      armor: ['light', 'medium'],
    },
  },
```

**Step 6: Run TypeScript check**

Run: `npm run build`
Expected: Build succeeds

**Step 7: Commit**

```bash
git add src/data/classes.ts
git commit -m "feat: add weapon and armor proficiencies to class definitions"
```

---

## Task 3: Update Weapon Data with Proficiency Requirements

**Files:**
- Modify: `src/data/equipment.ts:3-32`

**Step 1: Add proficiency to weapon definitions**

Update each weapon in WEAPONS object:

```typescript
export const WEAPONS: Record<WeaponType, Weapon> = {
  Longsword: {
    name: 'Longsword',
    damage: '1d8',
    damageType: 'slashing',
    finesse: false,
    description: 'A versatile blade favored by warriors',
    proficiencyRequired: 'martial',
  },
  Rapier: {
    name: 'Rapier',
    damage: '1d6',
    damageType: 'piercing',
    finesse: true,
    description: 'A thin, precise blade perfect for quick strikes',
    proficiencyRequired: 'martial-finesse',
  },
  Dagger: {
    name: 'Dagger',
    damage: '1d4',
    damageType: 'piercing',
    finesse: true,
    description: 'A small blade useful for close combat',
    proficiencyRequired: 'simple',
  },
  Mace: {
    name: 'Mace',
    damage: '1d6',
    damageType: 'bludgeoning',
    finesse: false,
    description: 'A heavy club with a metal head',
    proficiencyRequired: 'simple',
  },
};
```

**Step 2: Add proficiency to armor definitions**

Update ARMORS object:

```typescript
export const ARMORS: Record<ArmorType, Armor> = {
  None: {
    name: 'None',
    baseAC: 10,
    maxDexBonus: null,
    description: 'No armor worn',
    proficiencyRequired: undefined, // No proficiency needed for no armor
  },
  Leather: {
    name: 'Leather',
    baseAC: 12,
    maxDexBonus: null,
    description: 'Light, flexible leather armor',
    proficiencyRequired: 'light',
  },
  Chainmail: {
    name: 'Chainmail',
    baseAC: 16,
    maxDexBonus: 2,
    description: 'Interlocking metal rings providing solid protection',
    proficiencyRequired: 'medium',
  },
};
```

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/data/equipment.ts
git commit -m "feat: add proficiency requirements to weapons and armor"
```

---

## Task 4: Create Item Effects Utility (Part 1: Base Structure)

**Files:**
- Create: `src/utils/itemEffects.ts`

**Step 1: Write the failing test**

Create test file:

```typescript
// src/__tests__/utils/itemEffects.test.ts
import { describe, it, expect } from 'vitest';
import { applyItemEffect } from '../../utils/itemEffects';
import type { Character, ItemEffect } from '../../types';
import { createTestCharacter } from '../helpers/testCharacterFactory';

describe('itemEffects', () => {
  describe('applyItemEffect - healing', () => {
    it('should heal character with 2d8+2 for healing potion', () => {
      const character = createTestCharacter({ hp: 10, maxHp: 30 });
      const effect: ItemEffect = { type: 'heal', amount: '2d8+2' };

      const { character: updated, logMessage } = applyItemEffect(
        character,
        effect,
        true
      );

      expect(updated.hp).toBeGreaterThan(10);
      expect(updated.hp).toBeLessThanOrEqual(30);
      expect(logMessage).toContain('HP restored');
    });

    it('should not overheal above maxHp', () => {
      const character = createTestCharacter({ hp: 28, maxHp: 30 });
      const effect: ItemEffect = { type: 'heal', amount: '2d8+2' };

      const { character: updated } = applyItemEffect(character, effect, true);

      expect(updated.hp).toBe(30);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test itemEffects`
Expected: FAIL - "applyItemEffect is not defined"

**Step 3: Write minimal implementation**

Create the utility file:

```typescript
// src/utils/itemEffects.ts
import { roll } from './dice';
import type { Character, ItemEffect } from '../types';

export function applyItemEffect(
  character: Character,
  effect: ItemEffect,
  inCombat: boolean
): { character: Character; logMessage: string } {
  try {
    let updatedCharacter = { ...character };
    let logMessage = '';

    switch (effect.type) {
      case 'heal':
        const healRoll = roll(effect.amount);
        const healAmount = Math.min(healRoll.total, character.maxHp - character.hp);
        updatedCharacter.hp = Math.min(character.hp + healRoll.total, character.maxHp);
        logMessage = `${effect.amount}: ${healRoll.output} = ${healAmount} HP restored`;
        break;

      case 'escape':
        logMessage = inCombat ? 'Escaped from combat!' : 'No effect outside combat';
        break;

      case 'remove-condition':
        // Phase 1.4 integration - for now just log it
        logMessage = `Removed ${effect.condition} condition`;
        break;

      case 'buff':
        // Phase 1.3+ buffs
        logMessage = `+${effect.bonus} ${effect.stat} for ${effect.duration} turns`;
        break;

      case 'damage':
        // Throwable items (future)
        logMessage = `Deals ${effect.amount} damage`;
        break;

      case 'spell':
        // Arcane scrolls (future)
        logMessage = `Casts ${effect.spellName}`;
        break;

      default:
        logMessage = 'Unknown effect';
    }

    return { character: updatedCharacter, logMessage };
  } catch (error) {
    console.error('Item effect failed:', error);
    return {
      character,
      logMessage: 'Item effect failed',
    };
  }
}
```

**Step 4: Run test to verify it passes**

Run: `npm test itemEffects`
Expected: PASS (2 tests)

**Step 5: Commit**

```bash
git add src/utils/itemEffects.ts src/__tests__/utils/itemEffects.test.ts
git commit -m "feat: add itemEffects utility for healing and basic effects"
```

---

## Task 5: Add Escape and Condition Tests for Item Effects

**Files:**
- Modify: `src/__tests__/utils/itemEffects.test.ts`

**Step 1: Write escape item tests**

Add to test file:

```typescript
  describe('applyItemEffect - escape', () => {
    it('should handle escape items only in combat', () => {
      const character = createTestCharacter();
      const effect: ItemEffect = { type: 'escape' };

      const inCombat = applyItemEffect(character, effect, true);
      const outOfCombat = applyItemEffect(character, effect, false);

      expect(inCombat.logMessage).toContain('Escaped');
      expect(outOfCombat.logMessage).toContain('No effect');
    });
  });

  describe('applyItemEffect - remove-condition', () => {
    it('should log condition removal', () => {
      const character = createTestCharacter();
      const effect: ItemEffect = { type: 'remove-condition', condition: 'poisoned' };

      const { logMessage } = applyItemEffect(character, effect, true);

      expect(logMessage).toContain('poisoned');
      expect(logMessage).toContain('Removed');
    });
  });
```

**Step 2: Run tests**

Run: `npm test itemEffects`
Expected: PASS (4 tests)

**Step 3: Commit**

```bash
git add src/__tests__/utils/itemEffects.test.ts
git commit -m "test: add escape and condition removal tests for itemEffects"
```

---

## Task 6: Update Character Creation to Initialize Weapons Array

**Files:**
- Modify: `src/utils/characterCreation.ts`

**Step 1: Find where equipment is initialized**

Read the file to find the createCharacter function:

```bash
# Read the file to locate equipment initialization
```

**Step 2: Update equipment initialization**

Look for where `equipment` object is created and update to include `weapons` array. The equipped weapon should also be in the weapons array:

```typescript
// OLD:
equipment: {
  weapon: startingWeapon,
  armor: startingArmor,
  shield: hasShield ? { equipped: true, acBonus: 2 } : null,
  items: startingItems,
}

// NEW:
equipment: {
  weapon: startingWeapon,
  weapons: [startingWeapon], // All owned weapons (includes equipped)
  armor: startingArmor,
  shield: hasShield ? { equipped: true, acBonus: 2 } : null,
  items: startingItems,
}
```

**Step 3: Run build and tests**

Run: `npm run build && npm test characterCreation`
Expected: Build succeeds, tests pass

**Step 4: Commit**

```bash
git add src/utils/characterCreation.ts
git commit -m "feat: initialize weapons array in character creation"
```

---

## Task 7: Update Combat Actions to Support use_item

**Files:**
- Modify: `src/utils/actions.ts:82-116`

**Step 1: Remove TODO and implement use_item check**

Replace the TODO comment at line 82-83:

```typescript
  // 4. Use Item - healing potions (Phase 1.3+)
  // TODO: Implement item usage when inventory system is added
```

With:

```typescript
  // 4. Use Item
  // Note: Items handled separately via Items button popover, not individual actions
  // This keeps the action grid clean and mobile-friendly
```

Update `canPerformAction` function (line 114-116):

```typescript
    case 'use_item':
      // Check if item exists and has quantity
      const item = character.equipment.items.find(i => i.id === action.itemId);
      return item ? (item.quantity ?? 0) > 0 : false;
```

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/utils/actions.ts
git commit -m "feat: implement use_item action validation in canPerformAction"
```

---

## Task 8: Update Combat Resolution for Item Usage (Part 1: Test)

**Files:**
- Modify: `src/__tests__/utils/combat.test.ts`

**Step 1: Write failing test for item usage in combat**

Add to test file (find appropriate location or add new describe block):

```typescript
describe('combat - item usage', () => {
  it('should apply healing potion effect during combat', () => {
    const player = createTestCharacter({
      hp: 10,
      maxHp: 30,
      equipment: {
        weapon: WEAPONS.Longsword,
        weapons: [WEAPONS.Longsword],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [
          {
            id: 'healing-potion',
            name: 'Healing Potion',
            description: 'Restores 2d8+2 HP',
            type: 'consumable',
            usableInCombat: true,
            effect: { type: 'heal', amount: '2d8+2' },
            value: 25,
            quantity: 2,
          },
        ],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = {
      type: 'use_item',
      name: 'Use Healing Potion',
      description: '',
      available: true,
      itemId: 'healing-potion',
    };
    const result = resolveCombatRound(combat, action);

    expect(result.playerCharacter.hp).toBeGreaterThan(10);
    expect(result.playerCharacter.hp).toBeLessThanOrEqual(30);
  });

  it('should decrement item quantity after use', () => {
    const player = createTestCharacter({
      equipment: {
        weapon: WEAPONS.Longsword,
        weapons: [WEAPONS.Longsword],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [
          {
            id: 'healing-potion',
            name: 'Healing Potion',
            description: 'Restores 2d8+2 HP',
            type: 'consumable',
            usableInCombat: true,
            effect: { type: 'heal', amount: '2d8+2' },
            value: 25,
            quantity: 2,
          },
        ],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = {
      type: 'use_item',
      name: 'Use Healing Potion',
      description: '',
      available: true,
      itemId: 'healing-potion',
    };
    const result = resolveCombatRound(combat, action);

    const item = result.playerCharacter.equipment.items.find(
      i => i.id === 'healing-potion'
    );
    expect(item?.quantity).toBe(1);
  });

  it('should remove item when quantity reaches 0', () => {
    const player = createTestCharacter({
      equipment: {
        weapon: WEAPONS.Longsword,
        weapons: [WEAPONS.Longsword],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [
          {
            id: 'healing-potion',
            name: 'Healing Potion',
            description: 'Restores 2d8+2 HP',
            type: 'consumable',
            usableInCombat: true,
            effect: { type: 'heal', amount: '2d8+2' },
            value: 25,
            quantity: 1,
          },
        ],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = {
      type: 'use_item',
      name: 'Use Healing Potion',
      description: '',
      available: true,
      itemId: 'healing-potion',
    };
    const result = resolveCombatRound(combat, action);

    const item = result.playerCharacter.equipment.items.find(
      i => i.id === 'healing-potion'
    );
    expect(item).toBeUndefined();
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test combat -- --grep "item usage"`
Expected: FAIL - item usage not implemented in resolveCombatRound

**Step 3: Commit test**

```bash
git add src/__tests__/utils/combat.test.ts
git commit -m "test: add item usage tests for combat resolution"
```

---

## Task 9: Update Combat Resolution for Item Usage (Part 2: Implementation)

**Files:**
- Modify: `src/utils/combat.ts`

**Step 1: Import itemEffects utility**

Add to imports at top of file:

```typescript
import { applyItemEffect } from './itemEffects';
```

**Step 2: Find resolveCombatRound function and add item handling**

Locate the function (around line 150+) and find where player action is handled. Add item usage logic before or alongside other action types:

```typescript
export function resolveCombatRound(
  state: CombatState,
  playerAction: Action
): CombatState {
  // ... existing code for initiative, turn order, etc.

  // Handle player action based on type
  if (playerAction.type === 'use_item' && playerAction.itemId) {
    const item = updatedState.playerCharacter.equipment.items.find(
      i => i.id === playerAction.itemId
    );

    if (item && item.effect) {
      // Apply item effect
      const { character, logMessage } = applyItemEffect(
        updatedState.playerCharacter,
        item.effect,
        true // inCombat = true
      );

      updatedState.playerCharacter = character;

      // Decrement item quantity
      const updatedItems = character.equipment.items
        .map(i =>
          i.id === item.id
            ? { ...i, quantity: (i.quantity ?? 1) - 1 }
            : i
        )
        .filter(i => (i.quantity ?? 0) > 0); // Remove if quantity = 0

      updatedState.playerCharacter.equipment.items = updatedItems;

      // Add log entry
      logEntries.push({
        turn: updatedState.turn,
        actor: 'player',
        message: `${updatedState.playerCharacter.name} uses ${item.name}: ${logMessage}`,
      });

      // Handle escape items (special case: end combat immediately)
      if (item.effect.type === 'escape') {
        updatedState.winner = 'player'; // Escaped successfully
        updatedState.log = [...updatedState.log, ...logEntries];
        return updatedState;
      }
    }
  }

  // ... rest of combat logic (attacks, spells, enemy turn, etc.)
}
```

**Step 3: Run tests**

Run: `npm test combat -- --grep "item usage"`
Expected: PASS (3 tests)

**Step 4: Run full test suite**

Run: `npm test`
Expected: All tests pass

**Step 5: Commit**

```bash
git add src/utils/combat.ts
git commit -m "feat: implement item usage in combat resolution"
```

---

## Task 10: Add Combat Log Test for Item Usage

**Files:**
- Modify: `src/__tests__/utils/combat.test.ts`

**Step 1: Write test for combat log**

Add to the "combat - item usage" describe block:

```typescript
  it('should add item usage to combat log', () => {
    const player = createTestCharacter({
      equipment: {
        weapon: WEAPONS.Longsword,
        weapons: [WEAPONS.Longsword],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [
          {
            id: 'healing-potion',
            name: 'Healing Potion',
            description: 'Restores 2d8+2 HP',
            type: 'consumable',
            usableInCombat: true,
            effect: { type: 'heal', amount: '2d8+2' },
            value: 25,
            quantity: 1,
          },
        ],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = {
      type: 'use_item',
      name: 'Use Healing Potion',
      description: '',
      available: true,
      itemId: 'healing-potion',
    };
    const result = resolveCombatRound(combat, action);

    const logEntry = result.log.find(l => l.message.includes('Healing Potion'));
    expect(logEntry).toBeDefined();
    expect(logEntry?.actor).toBe('player');
    expect(logEntry?.message).toContain('HP restored');
  });
```

**Step 2: Run test**

Run: `npm test combat -- --grep "combat log"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/__tests__/utils/combat.test.ts
git commit -m "test: verify item usage appears in combat log"
```

---

## Task 11: Add Smoke Bomb Escape Test

**Files:**
- Modify: `src/__tests__/utils/combat.test.ts`

**Step 1: Write test for escape item**

Add to "combat - item usage" describe block:

```typescript
  it('should handle smoke bomb escape', () => {
    const player = createTestCharacter({
      equipment: {
        weapon: WEAPONS.Rapier,
        weapons: [WEAPONS.Rapier],
        armor: ARMORS.Leather,
        shield: null,
        items: [
          {
            id: 'smoke-bomb',
            name: 'Smoke Bomb',
            description: 'Escape combat',
            type: 'consumable',
            usableInCombat: true,
            effect: { type: 'escape' },
            value: 30,
            quantity: 1,
          },
        ],
      },
    });
    const enemy = createTestEnemy();
    const combat = createCombatState(player, enemy);

    const action: UseItemAction = {
      type: 'use_item',
      name: 'Use Smoke Bomb',
      description: '',
      available: true,
      itemId: 'smoke-bomb',
    };
    const result = resolveCombatRound(combat, action);

    expect(result.winner).toBe('player'); // Escaped
    expect(result.log.some(l => l.message.includes('Escaped'))).toBe(true);
  });
```

**Step 2: Run test**

Run: `npm test combat -- --grep "smoke bomb"`
Expected: PASS

**Step 3: Commit**

```bash
git add src/__tests__/utils/combat.test.ts
git commit -m "test: verify smoke bomb escape item functionality"
```

---

## Task 12: Add Weapon Swapping to Combat Store (Part 1: Test)

**Files:**
- Modify: `src/__tests__/stores/combatStore.test.ts`

**Step 1: Write failing tests for weapon swapping**

Create or add to combat store test file:

```typescript
describe('combatStore - weapon swapping', () => {
  it('should swap weapons and update combat state', () => {
    const longsword = { ...WEAPONS.Longsword, id: 'longsword' };
    const rapier = { ...WEAPONS.Rapier, id: 'rapier' };

    const player = createTestCharacter({
      equipment: {
        weapon: longsword,
        weapons: [longsword, rapier],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [],
      },
    });
    const enemy = createTestEnemy();

    useCombatStore.getState().startCombat(player, enemy);
    useCombatStore.getState().swapWeapon('rapier');

    const combat = useCombatStore.getState().combat;
    expect(combat?.playerCharacter.equipment.weapon?.name).toBe('Rapier');
  });

  it('should add weapon swap to combat log', () => {
    const longsword = { ...WEAPONS.Longsword, id: 'longsword' };
    const rapier = { ...WEAPONS.Rapier, id: 'rapier' };

    const player = createTestCharacter({
      equipment: {
        weapon: longsword,
        weapons: [longsword, rapier],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [],
      },
    });
    const enemy = createTestEnemy();

    useCombatStore.getState().startCombat(player, enemy);
    useCombatStore.getState().swapWeapon('rapier');

    const combat = useCombatStore.getState().combat;
    expect(combat?.log.some(l => l.message.includes('Switched to Rapier'))).toBe(true);
  });

  it('should not swap to non-existent weapon', () => {
    const longsword = { ...WEAPONS.Longsword, id: 'longsword' };

    const player = createTestCharacter({
      equipment: {
        weapon: longsword,
        weapons: [longsword],
        armor: ARMORS.Chainmail,
        shield: { equipped: true, acBonus: 2 },
        items: [],
      },
    });
    const enemy = createTestEnemy();

    useCombatStore.getState().startCombat(player, enemy);
    useCombatStore.getState().swapWeapon('fake-weapon-id');

    const combat = useCombatStore.getState().combat;
    expect(combat?.playerCharacter.equipment.weapon?.name).toBe('Longsword'); // Unchanged
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test combatStore -- --grep "weapon swapping"`
Expected: FAIL - "swapWeapon is not a function"

**Step 3: Commit test**

```bash
git add src/__tests__/stores/combatStore.test.ts
git commit -m "test: add weapon swapping tests for combat store"
```

---

## Task 13: Add Weapon Swapping to Combat Store (Part 2: Implementation)

**Files:**
- Modify: `src/stores/combatStore.ts:9-19`
- Modify: `src/stores/combatStore.ts:98-100+`

**Step 1: Add swapWeapon to interface**

Update CombatStore interface:

```typescript
interface CombatStore {
  combat: CombatState | null;
  startCombat: (player: Character, enemy: Creature) => void;
  executeTurn: (playerAction: Action) => void;
  swapWeapon: (weaponId: string) => void;  // NEW
  resetCombat: () => void;
  retreat: () => {
    player: Character;
    retreatFlag?: string;
    safeNodeId: string;
  } | null;
}
```

**Step 2: Implement swapWeapon function**

Add after `resetCombat` (around line 98):

```typescript
  swapWeapon: (weaponId: string) => {
    set((state) => {
      if (!state.combat) {
        console.warn('Cannot swap weapon: no active combat');
        return state;
      }

      const newWeapon = state.combat.playerCharacter.equipment.weapons.find(
        w => w.id === weaponId
      );

      if (!newWeapon) {
        console.error(`Weapon not found: ${weaponId}`);
        return state; // No-op if weapon doesn't exist
      }

      const updatedPlayer = {
        ...state.combat.playerCharacter,
        equipment: {
          ...state.combat.playerCharacter.equipment,
          weapon: newWeapon,
        },
      };

      // Recalculate AC if weapon affects it (finesse weapons may use DEX)
      // AC calculation is done in characterCreation/equipment utils
      // For now, keep AC as-is since weapon changes don't typically affect AC
      // (unless weapon properties change, which we'll handle in future)

      return {
        combat: {
          ...state.combat,
          playerCharacter: updatedPlayer,
          log: [
            ...state.combat.log,
            {
              turn: state.combat.turn,
              actor: 'system',
              message: `Switched to ${newWeapon.name}`,
            },
          ],
        },
      };
    });
  },
```

**Step 3: Run tests**

Run: `npm test combatStore -- --grep "weapon swapping"`
Expected: PASS (3 tests)

**Step 4: Commit**

```bash
git add src/stores/combatStore.ts
git commit -m "feat: implement weapon swapping in combat store"
```

---

## Task 14: Add Weapon ID Field to Equipment Data

**Files:**
- Modify: `src/types/equipment.ts:5-11`

**Step 1: Add id field to Weapon interface**

Update Weapon interface:

```typescript
export interface Weapon {
  id?: string;  // NEW: Unique identifier for weapon instances
  name: WeaponType;
  damage: string;
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  finesse: boolean;
  description: string;
  proficiencyRequired?: 'simple' | 'martial' | 'martial-finesse';
}
```

**Step 2: Update character creation to add IDs**

Find where weapons are created in characterCreation and add IDs:

```typescript
// When creating starting weapon:
const startingWeapon: Weapon = {
  ...WEAPONS[startingWeaponType],
  id: `${startingWeaponType.toLowerCase()}-${Date.now()}`, // Unique ID
};
```

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/types/equipment.ts src/utils/characterCreation.ts
git commit -m "feat: add id field to Weapon type for swapping"
```

---

## Task 15: Create Equipment Helper Functions

**Files:**
- Create: `src/utils/equipmentHelpers.ts`

**Step 1: Write tests for proficiency helpers**

Create test file:

```typescript
// src/__tests__/utils/equipmentHelpers.test.ts
import { describe, it, expect } from 'vitest';
import { hasWeaponProficiency, hasArmorProficiency } from '../../utils/equipmentHelpers';
import { WEAPONS, ARMORS } from '../../data/equipment';
import { createTestCharacter } from '../helpers/testCharacterFactory';

describe('equipmentHelpers', () => {
  describe('hasWeaponProficiency', () => {
    it('Fighter should be proficient with all weapons', () => {
      const fighter = createTestCharacter({ class: 'Fighter' });

      expect(hasWeaponProficiency(fighter, WEAPONS.Longsword)).toBe(true);
      expect(hasWeaponProficiency(fighter, WEAPONS.Rapier)).toBe(true);
      expect(hasWeaponProficiency(fighter, WEAPONS.Dagger)).toBe(true);
    });

    it('Wizard should only be proficient with simple weapons', () => {
      const wizard = createTestCharacter({ class: 'Wizard' });

      expect(hasWeaponProficiency(wizard, WEAPONS.Dagger)).toBe(true);
      expect(hasWeaponProficiency(wizard, WEAPONS.Longsword)).toBe(false);
      expect(hasWeaponProficiency(wizard, WEAPONS.Rapier)).toBe(false);
    });

    it('Rogue should be proficient with finesse weapons', () => {
      const rogue = createTestCharacter({ class: 'Rogue' });

      expect(hasWeaponProficiency(rogue, WEAPONS.Rapier)).toBe(true);
      expect(hasWeaponProficiency(rogue, WEAPONS.Dagger)).toBe(true);
      expect(hasWeaponProficiency(rogue, WEAPONS.Longsword)).toBe(false);
    });

    it('Cleric should be proficient with simple weapons only', () => {
      const cleric = createTestCharacter({ class: 'Cleric' });

      expect(hasWeaponProficiency(cleric, WEAPONS.Mace)).toBe(true);
      expect(hasWeaponProficiency(cleric, WEAPONS.Dagger)).toBe(true);
      expect(hasWeaponProficiency(cleric, WEAPONS.Longsword)).toBe(false);
    });
  });

  describe('hasArmorProficiency', () => {
    it('Fighter should be proficient with all armor', () => {
      const fighter = createTestCharacter({ class: 'Fighter' });

      expect(hasArmorProficiency(fighter, ARMORS.Leather)).toBe(true);
      expect(hasArmorProficiency(fighter, ARMORS.Chainmail)).toBe(true);
    });

    it('Wizard should not be proficient with any armor', () => {
      const wizard = createTestCharacter({ class: 'Wizard' });

      expect(hasArmorProficiency(wizard, ARMORS.Leather)).toBe(false);
      expect(hasArmorProficiency(wizard, ARMORS.Chainmail)).toBe(false);
    });
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test equipmentHelpers`
Expected: FAIL - "hasWeaponProficiency is not defined"

**Step 3: Implement helper functions**

Create the helper file:

```typescript
// src/utils/equipmentHelpers.ts
import type { Character, Weapon, Armor } from '../types';
import { CLASSES } from '../data/classes';

/**
 * Check if character has proficiency with a weapon
 */
export function hasWeaponProficiency(character: Character, weapon: Weapon): boolean {
  const classProficiencies = CLASSES[character.class].proficiencies.weapons;
  const required = weapon.proficiencyRequired ?? 'simple';
  return classProficiencies.includes(required);
}

/**
 * Check if character has proficiency with armor
 */
export function hasArmorProficiency(character: Character, armor: Armor): boolean {
  const classProficiencies = CLASSES[character.class].proficiencies.armor;
  const required = armor.proficiencyRequired;

  // No proficiency required for no armor
  if (!required) return true;

  return classProficiencies.includes(required);
}

/**
 * Check if character can use an item based on state
 */
export function canUseItem(
  character: Character,
  item: { quantity?: number; effect?: any },
  inCombat: boolean
): boolean {
  // No quantity left
  if ((item.quantity ?? 0) === 0) return false;

  // Context-based restrictions
  if (item.effect?.type === 'heal') {
    return character.hp < character.maxHp; // Only if damaged
  }
  if (item.effect?.type === 'escape') {
    return inCombat; // Only during combat
  }
  if (item.effect?.type === 'remove-condition') {
    // Check if character has the condition (Phase 1.4+)
    return character.conditions?.some(c => c.type === item.effect.condition) ?? false;
  }

  // Default: usable
  return true;
}

/**
 * Get reason why item is disabled
 */
export function getItemDisabledReason(
  character: Character,
  item: { quantity?: number; effect?: any },
  inCombat: boolean
): string {
  if ((item.quantity ?? 0) === 0) return 'None left';
  if (item.effect?.type === 'heal' && character.hp >= character.maxHp) return 'At full HP';
  if (item.effect?.type === 'escape' && !inCombat) return 'Only usable in combat';
  return '';
}
```

**Step 4: Run tests**

Run: `npm test equipmentHelpers`
Expected: PASS (all tests)

**Step 5: Commit**

```bash
git add src/utils/equipmentHelpers.ts src/__tests__/utils/equipmentHelpers.test.ts
git commit -m "feat: add equipment proficiency and item usage helpers"
```

---

## Task 16: Create Items Action Button Component (Part 1: Base Component)

**Files:**
- Create: `src/components/combat/ItemsActionButton.tsx`

**Step 1: Create base component structure**

```typescript
// src/components/combat/ItemsActionButton.tsx
import React, { useState } from 'react';
import type { Item } from '../../types';
import { Icon } from '../Icon';

interface ItemsActionButtonProps {
  items: Item[];
  onUseItem: (itemId: string) => void;
}

export function ItemsActionButton({ items, onUseItem }: ItemsActionButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (items.length === 0) return null;

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 rounded-lg font-semibold button-text
                   bg-gradient-to-br from-amber-600 to-amber-800
                   hover:from-amber-500 hover:to-amber-700
                   active:scale-95 transition-all shadow-md"
      >
        <div className="flex items-center justify-center space-x-2">
          <Icon name="Backpack" size={16} />
          <span>Items</span>
        </div>
      </button>

      {/* Popover */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50">
          <div className="p-3 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onUseItem(item.id);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded
                           bg-slate-900/50 hover:bg-slate-700
                           border border-slate-600 hover:border-amber-500
                           transition-colors"
              >
                <div className="flex justify-between items-center">
                  <span className="body-primary">{item.name}</span>
                  <span className="text-amber-400 text-sm">×{item.quantity}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{item.description}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Step 2: Run build**

Run: `npm run build`
Expected: May show errors if Icon component doesn't exist - we'll handle that

**Step 3: Commit**

```bash
git add src/components/combat/ItemsActionButton.tsx
git commit -m "feat: create ItemsActionButton component for combat UI"
```

---

## Task 17: Integrate Items Button into Combat Screen

**Files:**
- Modify: `src/screens/CombatScreen.tsx`

**Step 1: Import ItemsActionButton**

Add to imports:

```typescript
import { ItemsActionButton } from '../components/combat/ItemsActionButton';
```

**Step 2: Find action grid and add Items button**

Locate where combat actions are rendered (around line 270+). Add before or after other action buttons:

```typescript
{/* Items Button - only show if player has usable items */}
{(() => {
  const usableItems = combat.playerCharacter.equipment.items.filter(
    item => item.usableInCombat && (item.quantity ?? 0) > 0
  );

  if (usableItems.length === 0) return null;

  return (
    <ItemsActionButton
      items={usableItems}
      onUseItem={(itemId) => {
        executeTurn({
          type: 'use_item',
          name: 'Use Item',
          description: '',
          available: true,
          itemId,
        });
      }}
    />
  );
})()}
```

**Step 3: Run dev server and manually test**

Run: `npm run dev`
Expected: Items button appears if character has items

**Step 4: Commit**

```bash
git add src/screens/CombatScreen.tsx
git commit -m "feat: integrate Items button into combat action grid"
```

---

## Task 18: Create Weapon Swap Button in Combat UI

**Files:**
- Modify: `src/screens/CombatScreen.tsx`

**Step 1: Find CompactCombatant component**

Locate the player card section (CompactCombatant for player around line 370-476).

**Step 2: Add swap button to stats row**

Find the stats row that shows AC and BAB. Add swap button:

```typescript
{/* Stats Row - AC, BAB, Swap */}
<div className="flex space-x-1.5">
  {/* AC */}
  <div className="flex-1 bg-slate-900/50 border border-emerald-900/30 rounded p-1.5">
    <div className="text-[9px] text-slate-500 label-secondary">AC</div>
    <div className="stat-modifier">{character.ac}</div>
  </div>

  {/* BAB */}
  <div className="flex-1 bg-slate-900/50 border border-emerald-900/30 rounded p-1.5">
    <div className="text-[9px] text-slate-500 label-secondary">BAB</div>
    <div className="stat-modifier">{formatModifier(character.bab)}</div>
  </div>

  {/* Swap Weapon Button (only if 2+ weapons) */}
  {variant === 'player' && character.equipment.weapons.length > 1 && (
    <button
      onClick={() => {
        // Cycle to next weapon
        const currentIndex = character.equipment.weapons.findIndex(
          w => w.id === character.equipment.weapon?.id
        );
        const nextIndex = (currentIndex + 1) % character.equipment.weapons.length;
        const nextWeapon = character.equipment.weapons[nextIndex];
        swapWeapon(nextWeapon.id || nextWeapon.name);
      }}
      className="flex-1 bg-slate-900/50 border border-emerald-900/30 rounded p-1.5
                 hover:bg-slate-800/50 hover:border-emerald-700/50 transition-colors
                 flex flex-col items-center justify-center"
      title="Swap Weapon"
    >
      <Icon name="RefreshCw" size={12} />
      <span className="text-[9px] text-slate-500 label-secondary mt-0.5">Swap</span>
    </button>
  )}
</div>
```

**Step 3: Import swapWeapon from store**

At top of CombatScreen, get swapWeapon from store:

```typescript
const { combat, executeTurn, swapWeapon } = useCombatStore();
```

**Step 4: Run dev and test**

Run: `npm run dev`
Expected: Swap button appears if player has 2+ weapons

**Step 5: Commit**

```bash
git add src/screens/CombatScreen.tsx
git commit -m "feat: add weapon swap button to combat player card"
```

---

## Task 19: Update Character Sheet for Item Usage (Part 1: Structure)

**Files:**
- Modify: `src/screens/CharacterSheetScreen.tsx`

**Step 1: Import helpers**

Add to imports:

```typescript
import { canUseItem, getItemDisabledReason } from '../utils/equipmentHelpers';
import { applyItemEffect } from '../utils/itemEffects';
import { useCombatStore } from '../stores/combatStore';
```

**Step 2: Find items section in Equipment tab**

Locate where items are displayed (search for "equipment.items"). Update to add Use buttons:

```typescript
{/* Consumables Section */}
{character.equipment.items.length > 0 && (
  <div className="mt-4">
    <h3 className="heading-tertiary mb-2">Consumables</h3>
    <div className="space-y-2">
      {character.equipment.items.map((item, idx) => {
        const inCombat = useCombatStore.getState().combat !== null;
        const canUse = canUseItem(character, item, inCombat);
        const disabledReason = !canUse ? getItemDisabledReason(character, item, inCombat) : '';

        return (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800">
            <div className="flex-1">
              <span className="body-primary">{item.name}</span>
              <span className="text-slate-500 ml-2">×{item.quantity}</span>
              {disabledReason && (
                <span className="ml-2 text-slate-500 text-xs">({disabledReason})</span>
              )}
            </div>
            <button
              onClick={() => handleUseItem(item.id)}
              disabled={!canUse}
              className={`px-3 py-1 rounded button-text text-sm ${
                canUse
                  ? 'bg-amber-700 hover:bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              Use
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}
```

**Step 3: Run build**

Run: `npm run build`
Expected: Build may fail because handleUseItem not defined yet

**Step 4: Commit**

```bash
git add src/screens/CharacterSheetScreen.tsx
git commit -m "feat: add Use buttons to consumables in character sheet"
```

---

## Task 20: Update Character Sheet for Item Usage (Part 2: Handler)

**Files:**
- Modify: `src/screens/CharacterSheetScreen.tsx`

**Step 1: Add handleUseItem function**

Add inside CharacterSheetScreen component:

```typescript
const handleUseItem = (itemId: string) => {
  if (!character) return;

  const item = character.equipment.items.find(i => i.id === itemId);
  if (!item || !item.effect) return;

  // Apply effect
  const inCombat = useCombatStore.getState().combat !== null;
  const { character: updated, logMessage } = applyItemEffect(character, item.effect, inCombat);

  // Decrement quantity
  const updatedItems = updated.equipment.items
    .map(i =>
      i.id === itemId
        ? { ...i, quantity: (i.quantity ?? 1) - 1 }
        : i
    )
    .filter(i => (i.quantity ?? 0) > 0);

  updated.equipment.items = updatedItems;

  // Update character store
  useCharacterStore.getState().setCharacter(updated);

  // Show feedback (optional: add toast notification)
  console.log(`Used ${item.name}: ${logMessage}`);
};
```

**Step 2: Import useCharacterStore**

Add to imports if not already present:

```typescript
import { useCharacterStore } from '../stores/characterStore';
```

**Step 3: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Test manually**

Run: `npm run dev`
Expected: Can use items from character sheet

**Step 5: Commit**

```bash
git add src/screens/CharacterSheetScreen.tsx
git commit -m "feat: implement handleUseItem for character sheet"
```

---

## Task 21: Add Weapons Section to Character Sheet (Part 1: Structure)

**Files:**
- Modify: `src/screens/CharacterSheetScreen.tsx`

**Step 1: Import weapon proficiency helper**

Already imported in previous task, verify it's there:

```typescript
import { hasWeaponProficiency } from '../utils/equipmentHelpers';
```

**Step 2: Add weapons section to Equipment tab**

Add after items section:

```typescript
{/* Weapons Section */}
{character.equipment.weapons.length > 0 && (
  <div className="mt-4">
    <h3 className="heading-tertiary mb-2">Weapons</h3>
    <div className="space-y-2">
      {character.equipment.weapons.map((weapon, idx) => {
        const isEquipped = character.equipment.weapon?.id === weapon.id ||
                          character.equipment.weapon?.name === weapon.name;
        const canEquip = hasWeaponProficiency(character, weapon);

        return (
          <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-800">
            <div className="flex-1">
              <span className="body-primary">{weapon.name}</span>
              <span className="text-slate-500 ml-2 text-xs">
                {weapon.damage} {weapon.damageType}
              </span>
              {isEquipped && (
                <span className="ml-2 text-emerald-400 text-xs">✓ Equipped</span>
              )}
              {!canEquip && (
                <span className="ml-2 text-red-400 text-xs">
                  ⚠️ Requires {weapon.proficiencyRequired} proficiency
                </span>
              )}
            </div>
            <button
              onClick={() => handleEquipWeapon(weapon.id || weapon.name)}
              disabled={isEquipped || !canEquip}
              className={`px-3 py-1 rounded button-text text-sm ${
                !isEquipped && canEquip
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
            >
              {isEquipped ? 'Equipped' : 'Equip'}
            </button>
          </div>
        );
      })}
    </div>
  </div>
)}
```

**Step 3: Run build**

Run: `npm run build`
Expected: Build may fail because handleEquipWeapon not defined yet

**Step 4: Commit**

```bash
git add src/screens/CharacterSheetScreen.tsx
git commit -m "feat: add weapons section with Equip buttons to character sheet"
```

---

## Task 22: Add Weapons Section to Character Sheet (Part 2: Handler)

**Files:**
- Modify: `src/screens/CharacterSheetScreen.tsx`

**Step 1: Add handleEquipWeapon function**

Add inside CharacterSheetScreen component:

```typescript
const handleEquipWeapon = (weaponId: string) => {
  if (!character) return;

  const weapon = character.equipment.weapons.find(
    w => w.id === weaponId || w.name === weaponId
  );
  if (!weapon) return;

  // Check proficiency
  if (!hasWeaponProficiency(character, weapon)) {
    console.warn('Cannot equip: not proficient');
    return;
  }

  // Equip weapon
  const updated = {
    ...character,
    equipment: {
      ...character.equipment,
      weapon,
    },
  };

  // Note: AC recalculation not typically needed for weapon swaps
  // unless weapon properties affect AC (which they don't in our system)

  useCharacterStore.getState().setCharacter(updated);

  // If in combat, also update combat store
  const combat = useCombatStore.getState().combat;
  if (combat && combat.playerCharacter) {
    useCombatStore.getState().swapWeapon(weapon.id || weapon.name);
  }
};
```

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Test manually**

Run: `npm run dev`
Expected: Can equip weapons from character sheet

**Step 4: Commit**

```bash
git add src/screens/CharacterSheetScreen.tsx
git commit -m "feat: implement handleEquipWeapon for character sheet"
```

---

## Task 23: Run Full Test Suite and Fix Errors

**Files:**
- Various (as needed)

**Step 1: Run all tests**

Run: `npm test`
Expected: Some tests may fail due to Equipment structure changes

**Step 2: Fix any failing tests**

Review test failures and update test fixtures to include `weapons` array:

```typescript
// Example fix in test helpers:
equipment: {
  weapon: WEAPONS.Longsword,
  weapons: [WEAPONS.Longsword], // Add this
  armor: ARMORS.Chainmail,
  shield: { equipped: true, acBonus: 2 },
  items: [],
}
```

**Step 3: Re-run tests**

Run: `npm test`
Expected: All tests pass

**Step 4: Commit fixes**

```bash
git add src/__tests__/**/*.ts
git commit -m "test: fix test fixtures for Equipment weapons array"
```

---

## Task 24: Run Linter and Fix Issues

**Files:**
- Various (as needed)

**Step 1: Run linter**

Run: `npm run lint`
Expected: May show some warnings

**Step 2: Fix lint issues**

Address any unused imports, missing types, etc.

**Step 3: Re-run linter**

Run: `npm run lint`
Expected: No errors

**Step 4: Commit fixes**

```bash
git add .
git commit -m "chore: fix linting issues"
```

---

## Task 25: Run Production Build

**Files:**
- N/A

**Step 1: Run production build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: If build fails, fix errors**

Address any TypeScript errors that only appear in production build.

**Step 3: Commit any fixes**

```bash
git add .
git commit -m "fix: resolve production build errors"
```

---

## Task 26: Manual Testing - Item Usage in Combat

**Files:**
- N/A (manual testing)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Test item usage in combat**

- Create character with healing potions
- Enter combat
- Click "Items" button
- Use healing potion
- Verify:
  - HP increases
  - Quantity decrements
  - Combat log shows usage
  - Item removed when quantity = 0

**Step 3: Document results**

Note any issues found.

---

## Task 27: Manual Testing - Weapon Swapping

**Files:**
- N/A (manual testing)

**Step 1: Create character with multiple weapons**

- Give character 2+ weapons in inventory

**Step 2: Test weapon swap in combat**

- Enter combat
- Click "Swap" button
- Verify:
  - Weapon changes
  - Combat log shows swap
  - Stats update if weapon affects them
  - Can cycle through all weapons

**Step 3: Test weapon equip from character sheet**

- Open character sheet
- Click "Equip" on different weapon
- Verify:
  - Weapon changes
  - Proficiency restrictions work
  - Already equipped weapon disabled

**Step 4: Document results**

Note any issues found.

---

## Task 28: Manual Testing - Proficiency Restrictions

**Files:**
- N/A (manual testing)

**Step 1: Test Fighter proficiencies**

- Create Fighter
- Give them various weapons
- Verify can equip all weapons

**Step 2: Test Wizard proficiencies**

- Create Wizard
- Give them Longsword (martial)
- Verify cannot equip (shows warning)
- Verify can equip Dagger (simple)

**Step 3: Test Rogue proficiencies**

- Create Rogue
- Give them Rapier (finesse) and Longsword (martial)
- Verify can equip Rapier, not Longsword

**Step 4: Document results**

Note any issues found.

---

## Task 29: Final Cleanup and Documentation

**Files:**
- Modify: `docs/plans/2025-12-18-item-usage-weapon-swapping-design.md`

**Step 1: Update design doc checklist**

Mark all implementation items as complete in the design doc.

**Step 2: Add any implementation notes**

Document any deviations from the plan or important decisions made.

**Step 3: Commit**

```bash
git add docs/plans/2025-12-18-item-usage-weapon-swapping-design.md
git commit -m "docs: mark item usage and weapon swapping implementation complete"
```

---

## Task 30: Final Commit and Push

**Files:**
- N/A

**Step 1: Review all changes**

Run: `git status`
Verify all files are committed.

**Step 2: Run final checks**

```bash
npm run lint
npm test
npm run build
```

Expected: All pass

**Step 3: Push to branch**

Run: `git push -u origin claude/weapon-swapping-plan-a3Wg1`
Expected: Push succeeds

---

## Success Metrics Verification

Before completing implementation, verify all success metrics from design doc:

- [ ] Player can use healing potion via Items button in combat
- [ ] Player can use healing potion via character sheet (in/out of combat)
- [ ] Healing potion rolls 2d8+2 and applies healing correctly
- [ ] Item quantity decrements after use
- [ ] Item removed when quantity = 0
- [ ] Player can swap weapons via swap button (cycles through all weapons)
- [ ] Player can equip weapons via character sheet
- [ ] Proficiency restrictions prevent equipping non-proficient weapons
- [ ] Combat log shows item usage and weapon swaps with detailed feedback
- [ ] All tests pass
- [ ] No console errors or warnings
- [ ] Build succeeds (`npm run build`)
- [ ] Lint succeeds (`npm run lint`)

---

## Notes

- Each task is designed to take 2-5 minutes
- Follow TDD: write test, verify fail, implement, verify pass, commit
- Keep commits small and focused
- Run tests frequently to catch issues early
- Test manually after UI changes
- Document any deviations from the plan

---

## Troubleshooting Common Issues

### Issue: Equipment type errors in existing code

**Solution:** Update all places where Equipment is created to include `weapons` array:

```typescript
equipment: {
  weapon: someWeapon,
  weapons: [someWeapon], // Add this
  // ... rest
}
```

### Issue: Weapon IDs are undefined

**Solution:** Ensure weapon IDs are generated when creating weapons:

```typescript
const weapon = {
  ...WEAPONS.Longsword,
  id: `longsword-${Date.now()}`,
};
```

### Issue: Items button not showing

**Solution:** Verify character has items with:
- `usableInCombat: true`
- `quantity > 0`
- `effect` field defined

### Issue: Proficiency checks failing

**Solution:** Verify class definitions have `proficiencies` field and weapons have `proficiencyRequired` field.

---

**End of Implementation Plan**
