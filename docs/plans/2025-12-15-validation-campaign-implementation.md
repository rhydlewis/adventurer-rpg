# Validation Campaign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Do not use Subagent-Driven approach or worktrees. Work sequentially. 

**Goal:** Build a 15-20 minute validation campaign to test exploration, progression, combat polish, and character creation systems before writing the full campaign.

**Architecture:** Extend existing d20 combat system with exploration tables, merchant/inventory, retreat mechanics, level-up flow, and two-phase character creation. Test via minimal 8-node validation campaign.

**Tech Stack:** TypeScript, React, Zustand (existing), Vitest for testing

**Related Docs:**
- Design: `docs/plans/2025-12-15-validation-campaign-design.md`
- Character Creation: `docs/specs/2025-12-14-character-creation-revised-design.md`

---

## Implementation Overview

**Phases:**
1. **Type Extensions** - Extend Character, CombatState, narrative types
2. **Core Systems**  - Exploration, merchant, retreat, level-up, quirks
3. **Data Content** - Items, enemies with taunts, backgrounds, traits
4. **Validation Campaign** - 8-node campaign wire-up
5. **UI Integration**  - Combat items, retreat button, merchant screen, level-up screen

**Testing Strategy:** TDD throughout - write failing test, implement, verify, commit

---

## Phase 1: Type Extensions

### Task 1: Extend Character Type for Inventory & Gold

**Files:**
- Modify: `src/types/character.ts:9-28`
- Modify: `src/types/equipment.ts:1-43`
- Test: `src/__tests__/types/character.test.ts` (new file)

**Step 1: Add gold and inventory fields to Character**

In `src/types/character.ts`, add after line 17 (`resources: Resources;`):

```typescript
  // Validation campaign: Inventory & Gold
  gold: number;
  inventory: InventoryItem[];
  maxInventorySlots: number;
```

**Step 2: Define InventoryItem type**

In `src/types/equipment.ts`, replace lines 25-36 (Item interface) with:

```typescript
// Enhanced for validation campaign
export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  type: 'consumable' | 'equipment' | 'quest';
  usableInCombat: boolean;
  effect?: ItemEffect;
  value: number; // Sell price (typically 50% of buy price)
  quantity?: number; // For stackable items
}

// Backward compatibility
export type Item = InventoryItem;
```

**Step 3: Extend ItemEffect for more variety**

In `src/types/equipment.ts`, replace `ItemEffect` (lines 32-35):

```typescript
export type ItemEffect =
  | { type: 'heal'; amount: string } // e.g., '2d8+2'
  | { type: 'buff'; stat: string; bonus: number; duration: number }
  | { type: 'damage'; amount: string } // throwable items
  | { type: 'escape' } // Smoke bomb (keep for backward compat)
  | { type: 'spell'; spellName: string } // Arcane scroll (keep for backward compat)
  | { type: 'remove-condition'; condition: string }; // NEW: Antidote
```

**Step 4: Write validation test**

Create `src/__tests__/types/character.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { Character, InventoryItem } from '@/types/character';

describe('Character Type Extensions', () => {
  it('should support gold field', () => {
    const character: Partial<Character> = {
      gold: 100,
    };

    expect(character.gold).toBe(100);
  });

  it('should support inventory field', () => {
    const potion: InventoryItem = {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores health',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'heal', amount: '2d8+2' },
      value: 25,
    };

    const character: Partial<Character> = {
      inventory: [potion],
      maxInventorySlots: 10,
    };

    expect(character.inventory).toHaveLength(1);
    expect(character.inventory![0].usableInCombat).toBe(true);
  });
});
```

**Step 5: Run test**

Run: `npm test src/__tests__/types/character.test.ts`
Expected: PASS (type validation)

**Step 6: Commit**

```bash
git add src/types/character.ts src/types/equipment.ts src/__tests__/types/character.test.ts
git commit -m "feat: add gold and inventory to Character type"
```

---

### Task 2: Extend Character Type for Backgrounds & Traits

**Files:**
- Create: `src/types/background.ts`
- Create: `src/types/trait.ts`
- Modify: `src/types/character.ts:9-31`

**Step 1: Create Background type**

Create `src/types/background.ts`:

```typescript
import type { Attributes } from './attributes';
import type { CharacterClass } from './character';

export type StartingQuirk =
  | 'auto-block-first-attack' // Fighter: Border Guard
  | 'start-hidden' // Rogue: Street Urchin
  | 'bonus-cantrip-turn-1' // Wizard: Academy Dropout
  | 'healing-aura'; // Cleric: Temple Acolyte

export interface Background {
  id: string;
  name: string;
  class: CharacterClass;

  // Narrative
  description: string; // "You enforced the law on the kingdom's frontier"
  dialogueTags: string[]; // ['authority', 'law', 'military']

  // Mechanical (Phase 2 pre-fill)
  attributeBias: Partial<Attributes>; // { str: 14, con: 13, wis: 12 }
  taggedSkills: string[]; // ['Intimidate', 'Perception']

  // Quirks & Abilities
  startingQuirk: StartingQuirk;
  puzzleAbility?: string; // 'physical-shortcut', 'lock-hints', etc.
}
```

**Step 2: Create Trait type**

Create `src/types/trait.ts`:

```typescript
import type { Character } from './character';
import type { CombatState } from './combat';

export interface DefiningTrait {
  id: string;
  name: string;
  description: string;

  upside: {
    description: string; // "+2 initiative"
    apply: (character: Character) => Character;
  };

  downside: {
    description: string; // "-2 AC if acting last"
    apply: (character: Character, context?: CombatState) => Character;
  };
}
```

**Step 3: Add background, trait, quirk to Character**

In `src/types/character.ts`, add these imports at top:

```typescript
import type { Background } from './background';
import type { DefiningTrait } from './trait';
import type { StartingQuirk } from './background';
```

Then add to Character interface after line 27 (before `gold`):

```typescript
  // Validation campaign: Character creation
  background?: Background;
  trait?: DefiningTrait;
  startingQuirk?: StartingQuirk;
  mechanicsLocked: boolean; // false until Phase 2 complete
```

**Step 4: Export new types**

In `src/types/index.ts`, add:

```typescript
export * from './background';
export * from './trait';
```

**Step 5: Commit**

```bash
git add src/types/background.ts src/types/trait.ts src/types/character.ts src/types/index.ts
git commit -m "feat: add Background and Trait types for character creation"
```

---

### Task 3: Extend Narrative Types for Exploration

**Files:**
- Modify: `src/types/narrative.ts:7-53`
- Test: `src/__tests__/types/narrative.test.ts` (new file)

**Step 1: Add exploration types**

In `src/types/narrative.ts`, add after `ChoiceOutcome` definition (around line 31):

```typescript
// =============================================================================
// Exploration System - Multi-outcome encounters
// =============================================================================

export type ExplorationOutcome =
  | { type: 'combat'; enemyId: string; goldReward: number; itemReward?: string }
  | { type: 'treasure'; gold: number; items: string[] }
  | { type: 'vignette'; description: string; flavorOnly: true }
  | { type: 'nothing'; message: string };

export interface ExplorationTable {
  id: string;
  locationId: string;
  encounters: {
    weight: number; // 60 for combat, 20 for treasure, etc.
    outcome: ExplorationOutcome;
  }[];
}
```

**Step 2: Add explore outcome to ChoiceOutcome**

In `src/types/narrative.ts`, add to `ChoiceOutcome` union (after line 31):

```typescript
  | { type: 'explore'; tableId: string; onceOnly: boolean };
```

**Step 3: Add merchant outcome to ChoiceOutcome**

In `src/types/narrative.ts`, add to `ChoiceOutcome` union:

```typescript
  | { type: 'merchant'; shopInventory: string[]; buyPrices: Record<string, number> };
```

**Step 4: Add levelUp to NodeEffect**

In `src/types/narrative.ts`, add to `NodeEffect` union (around line 52):

```typescript
  | { type: 'levelUp'; newLevel: number; featChoices: string[] }
  | { type: 'giveGold'; amount: number };
```

**Step 5: Write test**

Create `src/__tests__/types/narrative.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import type { ExplorationTable, ExplorationOutcome, ChoiceOutcome, NodeEffect } from '@/types/narrative';

describe('Narrative Type Extensions', () => {
  it('should define exploration table with weighted encounters', () => {
    const table: ExplorationTable = {
      id: 'forest-exploration',
      locationId: 'validation-forest',
      encounters: [
        { weight: 60, outcome: { type: 'combat', enemyId: 'wolf', goldReward: 30 } },
        { weight: 20, outcome: { type: 'treasure', gold: 50, items: ['healing-potion'] } },
        { weight: 10, outcome: { type: 'vignette', description: 'Ancient carvings...', flavorOnly: true } },
        { weight: 10, outcome: { type: 'nothing', message: 'Empty clearing' } },
      ],
    };

    const totalWeight = table.encounters.reduce((sum, e) => sum + e.weight, 0);
    expect(totalWeight).toBe(100);
  });

  it('should support explore choice outcome', () => {
    const outcome: ChoiceOutcome = {
      type: 'explore',
      tableId: 'forest-exploration',
      onceOnly: true,
    };

    expect(outcome.type).toBe('explore');
  });

  it('should support merchant choice outcome', () => {
    const outcome: ChoiceOutcome = {
      type: 'merchant',
      shopInventory: ['healing-potion', 'antidote'],
      buyPrices: { 'healing-potion': 50, 'antidote': 30 },
    };

    expect(outcome.shopInventory).toHaveLength(2);
  });

  it('should support levelUp node effect', () => {
    const effect: NodeEffect = {
      type: 'levelUp',
      newLevel: 2,
      featChoices: ['power-attack', 'improved-initiative', 'weapon-focus'],
    };

    expect(effect.newLevel).toBe(2);
    expect(effect.featChoices).toHaveLength(3);
  });
});
```

**Step 6: Run test**

Run: `npm test src/__tests__/types/narrative.test.ts`
Expected: PASS

**Step 7: Commit**

```bash
git add src/types/narrative.ts src/__tests__/types/narrative.test.ts
git commit -m "feat: add exploration and merchant types to narrative system"
```

---

### Task 4: Extend Combat Types for Retreat & Taunts

**Files:**
- Modify: `src/types/combat.ts:1-60`
- Modify: `src/types/action.ts` (check if exists)

**Step 1: Add retreat fields to CombatState**

In `src/types/combat.ts`, add to `CombatState` interface (after `activeConditions`):

```typescript
  // Validation campaign: Retreat mechanics
  canRetreat: boolean; // tutorial fights disable this
  retreatPenalty?: {
    goldLost: number;
    damageOnFlee: number;
    narrativeFlag?: string; // "fled_from_skeleton"
    safeNodeId: string; // Where to return after retreat
  };
```

**Step 2: Add taunts and visual effects to CombatLogEntry**

In `src/types/combat.ts`, modify `CombatLogEntry` (around line 8-12):

```typescript
export interface CombatLogEntry {
  turn: number;
  actor: 'player' | 'enemy' | 'system';
  message: string;
  // Validation campaign: Combat polish
  taunt?: string; // "The goblin sneers: 'Is that all you've got?'"
  visualEffect?: 'strike-flash' | 'critical-hit' | 'heal-glow' | 'miss-fade';
}
```

**Step 3: Add taunts to Creature type**

Create new field in Creature. Since Creature = Character, we need a separate type. In `src/types/combat.ts`, replace line 6:

```typescript
// Creatures are similar to Characters but have additional combat data
export interface Creature extends Character {
  taunts?: {
    onCombatStart?: string[];
    onPlayerMiss?: string[];
    onEnemyHit?: string[];
    onLowHealth?: string[];
  };
}
```

**Step 4: Check if Action type needs retreat**

Read `src/types/action.ts` to see if CombatAction is defined there. If yes, add retreat action. If not defined, add it to `combat.ts`:

```typescript
export type CombatAction =
  | { type: 'attack' }
  | { type: 'defend' }
  | { type: 'spell'; spellId: string }
  | { type: 'item'; itemId: string } // NEW for validation campaign
  | { type: 'retreat' }; // NEW for validation campaign
```

**Step 5: Commit**

```bash
git add src/types/combat.ts src/types/action.ts
git commit -m "feat: add retreat, taunts, and combat polish to combat types"
```

---

## Phase 2: Core Systems

### Task 5: Exploration System - Utils

**Files:**
- Create: `src/utils/exploration.ts`
- Test: `src/__tests__/utils/exploration.test.ts`

**Step 1: Write failing test**

Create `src/__tests__/utils/exploration.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { resolveExploration, rollExplorationTable } from '@/utils/exploration';
import type { ExplorationTable } from '@/types/narrative';

describe('Exploration System', () => {
  const mockTable: ExplorationTable = {
    id: 'test-forest',
    locationId: 'forest',
    encounters: [
      { weight: 60, outcome: { type: 'combat', enemyId: 'wolf', goldReward: 30 } },
      { weight: 20, outcome: { type: 'treasure', gold: 50, items: ['healing-potion'] } },
      { weight: 10, outcome: { type: 'vignette', description: 'Ancient carvings...', flavorOnly: true } },
      { weight: 10, outcome: { type: 'nothing', message: 'Empty clearing' } },
    ],
  };

  it('should roll combat on d100 <= 60', () => {
    // Mock d100 roll to 30 (within combat range 1-60)
    vi.spyOn(Math, 'random').mockReturnValue(0.29); // 0.29 * 100 = 29

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('combat');
    if (outcome.type === 'combat') {
      expect(outcome.enemyId).toBe('wolf');
      expect(outcome.goldReward).toBe(30);
    }
  });

  it('should roll treasure on d100 61-80', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.70); // 70 (within treasure range 61-80)

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('treasure');
    if (outcome.type === 'treasure') {
      expect(outcome.gold).toBe(50);
      expect(outcome.items).toContain('healing-potion');
    }
  });

  it('should roll vignette on d100 81-90', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.85); // 85

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('vignette');
  });

  it('should roll nothing on d100 91-100', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.95); // 95

    const outcome = rollExplorationTable(mockTable);

    expect(outcome.type).toBe('nothing');
  });

  it('should validate total weights equal 100', () => {
    const totalWeight = mockTable.encounters.reduce((sum, e) => sum + e.weight, 0);
    expect(totalWeight).toBe(100);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/utils/exploration.test.ts`
Expected: FAIL with "Cannot find module '@/utils/exploration'"

**Step 3: Implement exploration utils**

Create `src/utils/exploration.ts`:

```typescript
import type { ExplorationTable, ExplorationOutcome } from '@/types/narrative';

/**
 * Roll on an exploration table to determine outcome
 * Uses d100 with weighted ranges (e.g., 1-60 = combat, 61-80 = treasure)
 */
export function rollExplorationTable(table: ExplorationTable): ExplorationOutcome {
  // Roll d100 (1-100)
  const roll = Math.floor(Math.random() * 100) + 1;

  // Calculate cumulative weights
  let cumulative = 0;
  for (const encounter of table.encounters) {
    cumulative += encounter.weight;
    if (roll <= cumulative) {
      return encounter.outcome;
    }
  }

  // Fallback to last encounter if something goes wrong
  return table.encounters[table.encounters.length - 1].outcome;
}

/**
 * Resolve exploration by table ID
 * Looks up table, rolls for outcome
 */
export function resolveExploration(
  tableId: string,
  tables: Record<string, ExplorationTable>
): ExplorationOutcome {
  const table = tables[tableId];
  if (!table) {
    throw new Error(`Exploration table not found: ${tableId}`);
  }

  return rollExplorationTable(table);
}

/**
 * Validate exploration table weights sum to 100
 */
export function validateExplorationTable(table: ExplorationTable): boolean {
  const total = table.encounters.reduce((sum, e) => sum + e.weight, 0);
  return total === 100;
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/utils/exploration.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/exploration.ts src/__tests__/utils/exploration.test.ts
git commit -m "feat: add exploration table rolling system with weighted encounters"
```

---

### Task 6: Merchant System - Utils

**Files:**
- Create: `src/utils/merchant.ts`
- Test: `src/__tests__/utils/merchant.test.ts`

**Step 1: Write failing test**

Create `src/__tests__/utils/merchant.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { buyItem, sellItem, canAfford, hasInventorySpace } from '@/utils/merchant';
import type { Character, InventoryItem } from '@/types/character';

describe('Merchant System', () => {
  const mockCharacter: Partial<Character> = {
    gold: 100,
    inventory: [],
    maxInventorySlots: 10,
  };

  const healingPotion: InventoryItem = {
    id: 'healing-potion',
    name: 'Healing Potion',
    description: 'Restores 2d8+2 HP',
    type: 'consumable',
    usableInCombat: true,
    effect: { type: 'heal', amount: '2d8+2' },
    value: 25, // sell price
  };

  it('should buy item if enough gold and inventory space', () => {
    const result = buyItem(mockCharacter as Character, healingPotion, 50);

    expect(result.gold).toBe(50); // 100 - 50
    expect(result.inventory).toHaveLength(1);
    expect(result.inventory[0].id).toBe('healing-potion');
  });

  it('should fail to buy if not enough gold', () => {
    const poorCharacter = { ...mockCharacter, gold: 10 };

    expect(() => buyItem(poorCharacter as Character, healingPotion, 50))
      .toThrow('Not enough gold');
  });

  it('should fail to buy if inventory full', () => {
    const fullCharacter = {
      ...mockCharacter,
      inventory: Array(10).fill(healingPotion),
    };

    expect(() => buyItem(fullCharacter as Character, healingPotion, 50))
      .toThrow('Inventory full');
  });

  it('should sell item and add gold', () => {
    const characterWithItem: Partial<Character> = {
      gold: 50,
      inventory: [healingPotion],
      maxInventorySlots: 10,
    };

    const result = sellItem(characterWithItem as Character, 'healing-potion');

    expect(result.gold).toBe(75); // 50 + 25 (value)
    expect(result.inventory).toHaveLength(0);
  });

  it('should fail to sell if item not in inventory', () => {
    expect(() => sellItem(mockCharacter as Character, 'non-existent-item'))
      .toThrow('Item not found in inventory');
  });

  it('should check if character can afford item', () => {
    expect(canAfford(mockCharacter as Character, 50)).toBe(true);
    expect(canAfford(mockCharacter as Character, 150)).toBe(false);
  });

  it('should check if character has inventory space', () => {
    expect(hasInventorySpace(mockCharacter as Character)).toBe(true);

    const fullCharacter = {
      ...mockCharacter,
      inventory: Array(10).fill(healingPotion),
    };
    expect(hasInventorySpace(fullCharacter as Character)).toBe(false);
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/utils/merchant.test.ts`
Expected: FAIL

**Step 3: Implement merchant utils**

Create `src/utils/merchant.ts`:

```typescript
import type { Character, InventoryItem } from '@/types/character';

/**
 * Check if character can afford a purchase
 */
export function canAfford(character: Character, price: number): boolean {
  return character.gold >= price;
}

/**
 * Check if character has inventory space
 */
export function hasInventorySpace(character: Character): boolean {
  return character.inventory.length < character.maxInventorySlots;
}

/**
 * Buy an item from a merchant
 * @throws Error if not enough gold or inventory full
 */
export function buyItem(
  character: Character,
  item: InventoryItem,
  price: number
): Character {
  if (!canAfford(character, price)) {
    throw new Error('Not enough gold');
  }

  if (!hasInventorySpace(character)) {
    throw new Error('Inventory full');
  }

  return {
    ...character,
    gold: character.gold - price,
    inventory: [...character.inventory, item],
  };
}

/**
 * Sell an item to a merchant
 * @throws Error if item not found in inventory
 */
export function sellItem(character: Character, itemId: string): Character {
  const itemIndex = character.inventory.findIndex(i => i.id === itemId);

  if (itemIndex === -1) {
    throw new Error('Item not found in inventory');
  }

  const item = character.inventory[itemIndex];
  const newInventory = character.inventory.filter((_, i) => i !== itemIndex);

  return {
    ...character,
    gold: character.gold + item.value,
    inventory: newInventory,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/utils/merchant.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/merchant.ts src/__tests__/utils/merchant.test.ts
git commit -m "feat: add merchant buy/sell system with inventory management"
```

---

### Task 7: Retreat System - Utils

**Files:**
- Modify: `src/utils/combat.ts` (add retreat handling)
- Test: `src/__tests__/utils/combat.test.ts` (extend existing tests)

**Step 1: Write failing test**

In `src/__tests__/utils/combat.test.ts`, add:

```typescript
import { describe, it, expect } from 'vitest';
import { handleRetreat } from '@/utils/combat';
import type { CombatState, Character } from '@/types';

describe('Retreat Mechanics', () => {
  const mockPlayer: Partial<Character> = {
    name: 'Test Fighter',
    hp: 20,
    maxHp: 30,
    gold: 100,
  };

  const mockCombat: Partial<CombatState> = {
    playerCharacter: mockPlayer as Character,
    canRetreat: true,
    retreatPenalty: {
      goldLost: 20,
      damageOnFlee: 5,
      narrativeFlag: 'fled_from_skeleton',
      safeNodeId: 'safe-area',
    },
  };

  it('should apply retreat penalties (gold and damage)', () => {
    const result = handleRetreat(mockCombat as CombatState);

    expect(result.playerCharacter.gold).toBe(80); // 100 - 20
    expect(result.playerCharacter.hp).toBe(15); // 20 - 5
    expect(result.retreatFlag).toBe('fled_from_skeleton');
    expect(result.safeNodeId).toBe('safe-area');
  });

  it('should not allow retreat if canRetreat is false', () => {
    const noRetreatCombat = { ...mockCombat, canRetreat: false };

    expect(() => handleRetreat(noRetreatCombat as CombatState))
      .toThrow('Retreat not allowed');
  });

  it('should not reduce HP below 1 on retreat damage', () => {
    const lowHpPlayer = { ...mockPlayer, hp: 3 };
    const lowHpCombat = { ...mockCombat, playerCharacter: lowHpPlayer as Character };

    const result = handleRetreat(lowHpCombat as CombatState);

    expect(result.playerCharacter.hp).toBe(1); // Not 0 or negative
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/utils/combat.test.ts`
Expected: FAIL (handleRetreat not defined)

**Step 3: Implement retreat handler**

In `src/utils/combat.ts`, add:

```typescript
/**
 * Handle player retreat from combat
 * Applies penalties: gold lost, damage taken, narrative flag
 */
export function handleRetreat(combat: CombatState): {
  playerCharacter: Character;
  retreatFlag?: string;
  safeNodeId: string;
} {
  if (!combat.canRetreat) {
    throw new Error('Retreat not allowed');
  }

  if (!combat.retreatPenalty) {
    throw new Error('Retreat penalty not defined');
  }

  const { goldLost, damageOnFlee, narrativeFlag, safeNodeId } = combat.retreatPenalty;

  const updatedPlayer: Character = {
    ...combat.playerCharacter,
    gold: Math.max(0, combat.playerCharacter.gold - goldLost),
    hp: Math.max(1, combat.playerCharacter.hp - damageOnFlee), // Never go below 1
  };

  return {
    playerCharacter: updatedPlayer,
    retreatFlag: narrativeFlag,
    safeNodeId,
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/utils/combat.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/combat.ts src/__tests__/utils/combat.test.ts
git commit -m "feat: add retreat mechanics with gold/damage penalties"
```

---

### Task 8: Level-Up System - Utils

**Files:**
- Create: `src/utils/levelUp.ts`
- Test: `src/__tests__/utils/levelUp.test.ts`

**Step 1: Write failing test**

Create `src/__tests__/utils/levelUp.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { applyLevelUp, calculateHPIncrease, calculateBABIncrease } from '@/utils/levelUp';
import type { Character, Feat } from '@/types';

describe('Level-Up System', () => {
  const mockCharacter: Partial<Character> = {
    name: 'Test Fighter',
    class: 'Fighter',
    level: 1,
    maxHp: 12,
    hp: 10,
    bab: 1,
    attributes: {
      STR: 16,
      DEX: 12,
      CON: 14,
      INT: 10,
      WIS: 10,
      CHA: 8,
    },
  };

  const mockFeat: Feat = {
    id: 'power-attack',
    name: 'Power Attack',
    description: 'Trade attack for damage',
    prerequisites: [],
    benefit: 'You can take a penalty on attack rolls to gain bonus damage',
  };

  it('should increase level from 1 to 2', () => {
    const result = applyLevelUp(mockCharacter as Character, 2, mockFeat);

    expect(result.level).toBe(2);
  });

  it('should increase HP by class hit die + CON modifier', () => {
    // Fighter HD = d10, CON 14 = +2 modifier
    // Level 1: 10 + 2 = 12 HP
    // Level 2: 12 + (d10/2 + 1) + 2 = 12 + 6 + 2 = 20 HP (average)
    const hpIncrease = calculateHPIncrease('Fighter', 14); // CON 14

    expect(hpIncrease).toBe(8); // Average d10 (5.5 → 6) + 2 CON
  });

  it('should increase BAB by class progression', () => {
    // Fighter BAB progression: +1 per level
    const babIncrease = calculateBABIncrease('Fighter', 1, 2);

    expect(babIncrease).toBe(1); // From +1 to +2
  });

  it('should add feat to character', () => {
    const result = applyLevelUp(mockCharacter as Character, 2, mockFeat);

    expect(result.feats).toContainEqual(mockFeat);
  });

  it('should increase maxHp and restore full HP on level-up', () => {
    const damagedCharacter = { ...mockCharacter, hp: 5, maxHp: 12 };
    const result = applyLevelUp(damagedCharacter as Character, 2, mockFeat);

    expect(result.maxHp).toBe(20); // 12 + 8
    expect(result.hp).toBe(20); // Fully healed
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/utils/levelUp.test.ts`
Expected: FAIL

**Step 3: Implement level-up utils**

Create `src/utils/levelUp.ts`:

```typescript
import type { Character, CharacterClass, Feat } from '@/types';
import { getAttributeModifier } from './attributes';

/**
 * Class hit dice for HP calculation
 */
const CLASS_HIT_DICE: Record<CharacterClass, number> = {
  Fighter: 10,
  Rogue: 8,
  Wizard: 6,
  Cleric: 8,
};

/**
 * BAB progression by class
 * Full BAB (Fighter): +1 per level
 * 3/4 BAB (Rogue, Cleric): +0.75 per level (rounds down)
 * 1/2 BAB (Wizard): +0.5 per level (rounds down)
 */
const CLASS_BAB_PROGRESSION: Record<CharacterClass, (level: number) => number> = {
  Fighter: (level) => level,
  Rogue: (level) => Math.floor((level * 3) / 4),
  Cleric: (level) => Math.floor((level * 3) / 4),
  Wizard: (level) => Math.floor(level / 2),
};

/**
 * Calculate HP increase on level-up
 * Uses average of hit die + CON modifier
 */
export function calculateHPIncrease(
  characterClass: CharacterClass,
  constitution: number
): number {
  const hitDie = CLASS_HIT_DICE[characterClass];
  const averageRoll = Math.floor(hitDie / 2) + 1; // d10 → 6, d8 → 5, d6 → 4
  const conModifier = getAttributeModifier(constitution);

  return averageRoll + conModifier;
}

/**
 * Calculate BAB at a given level
 */
export function calculateBABIncrease(
  characterClass: CharacterClass,
  oldLevel: number,
  newLevel: number
): number {
  const oldBAB = CLASS_BAB_PROGRESSION[characterClass](oldLevel);
  const newBAB = CLASS_BAB_PROGRESSION[characterClass](newLevel);
  return newBAB - oldBAB;
}

/**
 * Apply level-up to character
 * Increases level, HP, BAB, and adds chosen feat
 * Fully restores HP
 */
export function applyLevelUp(
  character: Character,
  newLevel: number,
  chosenFeat: Feat
): Character {
  const hpIncrease = calculateHPIncrease(character.class, character.attributes.CON);
  const babIncrease = calculateBABIncrease(character.class, character.level, newLevel);

  const newMaxHp = character.maxHp + hpIncrease;

  return {
    ...character,
    level: newLevel,
    maxHp: newMaxHp,
    hp: newMaxHp, // Fully restore HP on level-up
    bab: character.bab + babIncrease,
    feats: [...character.feats, chosenFeat],
  };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/utils/levelUp.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/levelUp.ts src/__tests__/utils/levelUp.test.ts
git commit -m "feat: add level-up system with HP/BAB increases and feat selection"
```

---

### Task 9: Quirks System - Utils

**Files:**
- Create: `src/utils/quirks.ts`
- Test: `src/__tests__/utils/quirks.test.ts`

**Step 1: Write failing test**

Create `src/__tests__/utils/quirks.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { applyStartingQuirk } from '@/utils/quirks';
import type { Character, CombatState } from '@/types';

describe('Starting Quirks System', () => {
  const mockPlayer: Partial<Character> = {
    name: 'Test Fighter',
    class: 'Fighter',
    startingQuirk: 'auto-block-first-attack',
  };

  const mockCombat: Partial<CombatState> = {
    playerCharacter: mockPlayer as Character,
    turn: 1,
    log: [],
  };

  it('should apply auto-block quirk on first attack', () => {
    const result = applyStartingQuirk(
      mockPlayer as Character,
      mockCombat as CombatState,
      'first-attack'
    );

    // Check that AC bonus was applied
    expect(result.acBonus).toBe(2);

    // Check that discovery message was added
    const discoveryLog = result.log.find(entry =>
      entry.message.includes('guard training')
    );
    expect(discoveryLog).toBeDefined();
  });

  it('should apply start-hidden quirk on combat start', () => {
    const roguePlayer = { ...mockPlayer, class: 'Rogue', startingQuirk: 'start-hidden' };
    const result = applyStartingQuirk(
      roguePlayer as Character,
      mockCombat as CombatState,
      'combat-start'
    );

    expect(result.playerHidden).toBe(true);
    expect(result.log).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('shadows') })
    );
  });

  it('should apply bonus-cantrip quirk on turn 1', () => {
    const wizardPlayer = { ...mockPlayer, class: 'Wizard', startingQuirk: 'bonus-cantrip-turn-1' };
    const result = applyStartingQuirk(
      wizardPlayer as Character,
      mockCombat as CombatState,
      'turn-1'
    );

    expect(result.playerExtraAction).toBe(true);
    expect(result.log).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('Arcane energy') })
    );
  });

  it('should apply healing-aura quirk on turn 1', () => {
    const clericPlayer: Partial<Character> = {
      ...mockPlayer,
      class: 'Cleric',
      startingQuirk: 'healing-aura',
      hp: 10,
      maxHp: 15,
    };

    const result = applyStartingQuirk(
      clericPlayer as Character,
      mockCombat as CombatState,
      'turn-1'
    );

    expect(result.playerHp).toBe(11); // 10 + 1
    expect(result.log).toContainEqual(
      expect.objectContaining({ message: expect.stringContaining('faith sustains') })
    );
  });

  it('should do nothing if quirk already triggered', () => {
    const result = applyStartingQuirk(
      mockPlayer as Character,
      { ...mockCombat, quirkTriggered: true } as CombatState,
      'first-attack'
    );

    expect(result.log).toHaveLength(0); // No new log entries
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npm test src/__tests__/utils/quirks.test.ts`
Expected: FAIL

**Step 3: Implement quirks utils**

Create `src/utils/quirks.ts`:

```typescript
import type { Character, CombatState, CombatLogEntry } from '@/types';
import type { StartingQuirk } from '@/types/background';

export interface QuirkResult {
  log: CombatLogEntry[];
  acBonus?: number;
  playerHidden?: boolean;
  playerExtraAction?: boolean;
  playerHp?: number;
  quirkTriggered?: boolean;
}

/**
 * Apply starting quirk effect to combat
 * Triggers on specific combat events (combat start, turn 1, first attack)
 */
export function applyStartingQuirk(
  character: Character,
  combat: CombatState,
  trigger: 'combat-start' | 'turn-1' | 'first-attack'
): QuirkResult {
  // Only trigger once per combat
  if ((combat as any).quirkTriggered) {
    return { log: [] };
  }

  const quirk = character.startingQuirk;
  if (!quirk) {
    return { log: [] };
  }

  switch (quirk) {
    case 'auto-block-first-attack':
      if (trigger === 'first-attack' && combat.turn === 1) {
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: "Your guard training kicks in—you deflect the blow!",
          }],
          acBonus: 2,
          quirkTriggered: true,
        };
      }
      break;

    case 'start-hidden':
      if (trigger === 'combat-start') {
        return {
          log: [{
            turn: 1,
            actor: 'system',
            message: "You blend into the shadows...",
          }],
          playerHidden: true,
          quirkTriggered: true,
        };
      }
      break;

    case 'bonus-cantrip-turn-1':
      if (trigger === 'turn-1') {
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: "Arcane energy surges through you!",
          }],
          playerExtraAction: true,
          quirkTriggered: true,
        };
      }
      break;

    case 'healing-aura':
      if (trigger === 'turn-1') {
        const healAmount = Math.min(1, character.maxHp - character.hp);
        return {
          log: [{
            turn: combat.turn,
            actor: 'system',
            message: `Your faith sustains you (+${healAmount} HP)`,
          }],
          playerHp: Math.min(combat.playerCharacter.hp + 1, character.maxHp),
          quirkTriggered: true,
        };
      }
      break;
  }

  return { log: [] };
}
```

**Step 4: Run test to verify it passes**

Run: `npm test src/__tests__/utils/quirks.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/utils/quirks.ts src/__tests__/utils/quirks.test.ts
git commit -m "feat: add starting quirks system with 4 class-specific quirks"
```

---

## Phase 3: Data Content

### Task 10: Items Data

**Files:**
- Create: `src/data/items.ts`
- Test: `src/__tests__/data/items.test.ts`

**Step 1: Create items data file**

Create `src/data/items.ts`:

```typescript
import type { InventoryItem } from '@/types';

/**
 * Item Database for Validation Campaign
 */

export const ITEMS: Record<string, InventoryItem> = {
  'healing-potion': {
    id: 'healing-potion',
    name: 'Healing Potion',
    description: 'A red vial that restores 2d8+2 hit points when consumed.',
    type: 'consumable',
    usableInCombat: true,
    effect: { type: 'heal', amount: '2d8+2' },
    value: 25, // Sell for 25g, buy for 50g
  },

  'sword-plus-1': {
    id: 'sword-plus-1',
    name: '+1 Longsword',
    description: 'A finely crafted longsword with a +1 enchantment to attack and damage rolls.',
    type: 'equipment',
    usableInCombat: false, // Equipped before combat, not during
    effect: { type: 'buff', stat: 'attack', bonus: 1, duration: -1 }, // Permanent while equipped
    value: 50, // Sell for 50g, buy for 100g
  },

  'antidote': {
    id: 'antidote',
    name: 'Antidote',
    description: 'Cures poison and removes the poisoned condition.',
    type: 'consumable',
    usableInCombat: true,
    effect: { type: 'remove-condition', condition: 'poisoned' },
    value: 15, // Sell for 15g, buy for 30g
  },

  'wolf-pelt': {
    id: 'wolf-pelt',
    name: 'Wolf Pelt',
    description: 'A rough wolf hide. Can be sold to merchants.',
    type: 'quest',
    usableInCombat: false,
    value: 15,
  },

  'mysterious-amulet': {
    id: 'mysterious-amulet',
    name: 'Mysterious Amulet',
    description: 'A glowing amulet recovered from the wraith. Its purpose is unknown.',
    type: 'quest',
    usableInCombat: false,
    value: 100,
  },
};

// Helper to get item by ID
export function getItem(id: string): InventoryItem {
  const item = ITEMS[id];
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  return item;
}

// Helper for shop prices (buy = 2x sell value)
export function getBuyPrice(itemId: string): number {
  const item = getItem(itemId);
  return item.value * 2;
}
```

**Step 2: Write validation test**

Create `src/__tests__/data/items.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { ITEMS, getItem, getBuyPrice } from '@/data/items';

describe('Items Data', () => {
  it('should have all required items for validation campaign', () => {
    expect(ITEMS['healing-potion']).toBeDefined();
    expect(ITEMS['sword-plus-1']).toBeDefined();
    expect(ITEMS['antidote']).toBeDefined();
    expect(ITEMS['wolf-pelt']).toBeDefined();
    expect(ITEMS['mysterious-amulet']).toBeDefined();
  });

  it('should mark healing potion as combat-usable', () => {
    const potion = getItem('healing-potion');
    expect(potion.usableInCombat).toBe(true);
    expect(potion.type).toBe('consumable');
  });

  it('should calculate buy price as 2x sell value', () => {
    expect(getBuyPrice('healing-potion')).toBe(50); // 25 * 2
    expect(getBuyPrice('sword-plus-1')).toBe(100); // 50 * 2
    expect(getBuyPrice('antidote')).toBe(30); // 15 * 2
  });

  it('should throw error for non-existent item', () => {
    expect(() => getItem('fake-item')).toThrow('Item not found');
  });
});
```

**Step 3: Run test**

Run: `npm test src/__tests__/data/items.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/data/items.ts src/__tests__/data/items.test.ts
git commit -m "feat: add items database for validation campaign (5 items)"
```

---

### Task 11: Enemies with Taunts

**Files:**
- Modify: `src/data/enemies.ts` (add taunts to existing, add wraith)
- Test: `src/__tests__/data/enemies.test.ts`

**Step 1: Add taunts to existing enemies**

In `src/data/enemies.ts`, after the goblin/bandit definitions, add taunts field:

```typescript
// Add to goblin (if exists) or bandit
bandit: {
  // ... existing fields
  taunts: {
    onCombatStart: ["You'll regret crossing me!", "Fresh meat!", "Your gold or your life!"],
    onPlayerMiss: ["Too slow!", "Hah! Missed!", "You fight like a farmer!"],
    onEnemyHit: ["How'd you like that?", "You're finished!", "Take that!"],
    onLowHealth: ["I'll... get you...", "This isn't over!", "You got lucky!"],
  },
},
```

Add to skeleton:

```typescript
skeleton: {
  // ... existing fields
  taunts: {
    onCombatStart: ["*rattles bones menacingly*", "*hollow laughter*"],
    onPlayerMiss: ["*dodges with unnatural speed*"],
    onEnemyHit: ["*bones crack against you*", "*relentless assault*"],
    onLowHealth: ["*bones begin to crumble*"],
  },
},
```

**Step 2: Add wraith enemy**

In `src/data/enemies.ts`, add after skeleton:

```typescript
  wraith: {
    name: 'Wraith',
    avatarPath: CREATURE_AVATARS['Wraith'] || DEFAULT_CREATURE_AVATAR,
    class: 'Fighter', // Undead creature
    level: 3,
    attributes: {
      STR: 10, // +0 (incorporeal, but keep for mechanics)
      DEX: 16, // +3
      CON: 10, // +0
      INT: 12, // +1
      WIS: 14, // +2
      CHA: 16, // +3
    },
    hp: 18,
    maxHp: 18,
    ac: 16, // 10 + 3 DEX + 3 deflection (incorporeal)
    bab: 3,
    saves: {
      fortitude: 3,
      reflex: 6, // 3 DEX + 3 (good save)
      will: 5, // 2 WIS + 3 (good save)
    },
    skills: {
      Athletics: 0,
      Stealth: 8,
      Perception: 5,
      Arcana: 0,
      Medicine: 0,
      Intimidate: 6,
    },
    feats: [],
    equipment: {
      weapon: {
        name: 'Dagger', // Incorporeal touch attack
        damage: '1d6',
        damageType: 'piercing',
        finesse: true,
        description: 'Chilling touch',
      },
      armor: {
        name: 'None',
        baseAC: 10,
        maxDexBonus: null,
        description: 'Incorporeal form',
      },
      shield: {
        equipped: false,
        acBonus: 0,
      },
      items: [],
    },
    resources: {
      abilities: [],
      spellSlots: undefined,
    },
    taunts: {
      onCombatStart: ["*ethereal wailing*", "Your soul will be mine...", "*appears from shadows*"],
      onPlayerMiss: ["*phases through attack*", "You cannot touch the dead..."],
      onEnemyHit: ["*life-draining touch*", "Feel the cold of the grave!"],
      onLowHealth: ["*fading into mist*", "I shall return...", "*dissipating*"],
    },
  },
```

**Step 3: Write test**

Create `src/__tests__/data/enemies.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { enemies } from '@/data/enemies';

describe('Enemies with Taunts', () => {
  it('should have taunts for all validation campaign enemies', () => {
    expect(enemies.skeleton.taunts).toBeDefined();
    expect(enemies.wraith).toBeDefined();
    expect(enemies.wraith.taunts).toBeDefined();
  });

  it('should have taunts for all trigger types', () => {
    const wraith = enemies.wraith;

    expect(wraith.taunts?.onCombatStart).toBeDefined();
    expect(wraith.taunts?.onPlayerMiss).toBeDefined();
    expect(wraith.taunts?.onEnemyHit).toBeDefined();
    expect(wraith.taunts?.onLowHealth).toBeDefined();
  });

  it('should have wraith as CR 1 challenge (level 3)', () => {
    expect(enemies.wraith.level).toBe(3);
    expect(enemies.wraith.ac).toBeGreaterThanOrEqual(15); // Harder than skeleton
  });
});
```

**Step 4: Run test**

Run: `npm test src/__tests__/data/enemies.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/data/enemies.ts src/__tests__/data/enemies.test.ts
git commit -m "feat: add enemy taunts and wraith creature for validation campaign"
```

---

### Task 12: Backgrounds Data

**Files:**
- Create: `src/data/backgrounds.ts`
- Test: `src/__tests__/data/backgrounds.test.ts`

**Step 1: Create backgrounds data**

Create `src/data/backgrounds.ts`:

```typescript
import type { Background } from '@/types/background';

/**
 * Background Database
 * One background per class for validation campaign
 */

export const BACKGROUNDS: Record<string, Background> = {
  'border-guard': {
    id: 'border-guard',
    name: 'Border Guard',
    class: 'Fighter',
    description: "You enforced the law on the kingdom's frontier.",
    dialogueTags: ['authority', 'law', 'military'],
    attributeBias: {
      STR: 14,
      DEX: 10,
      CON: 13,
      INT: 8,
      WIS: 12,
      CHA: 9,
    },
    taggedSkills: ['Intimidate', 'Perception'],
    startingQuirk: 'auto-block-first-attack',
    puzzleAbility: 'physical-shortcut',
  },

  'street-urchin': {
    id: 'street-urchin',
    name: 'Street Urchin',
    class: 'Rogue',
    description: "You survived by wit and stealth in the city's shadows.",
    dialogueTags: ['deception', 'streetwise', 'poverty'],
    attributeBias: {
      STR: 8,
      DEX: 14,
      CON: 10,
      INT: 12,
      WIS: 9,
      CHA: 11,
    },
    taggedSkills: ['Stealth', 'Perception'],
    startingQuirk: 'start-hidden',
    puzzleAbility: 'lock-hints',
  },

  'academy-dropout': {
    id: 'academy-dropout',
    name: 'Academy Dropout',
    class: 'Wizard',
    description: 'You left formal training but kept the knowledge.',
    dialogueTags: ['arcane', 'academia', 'arrogance'],
    attributeBias: {
      STR: 8,
      DEX: 11,
      CON: 10,
      INT: 14,
      WIS: 12,
      CHA: 9,
    },
    taggedSkills: ['Arcana', 'Perception'],
    startingQuirk: 'bonus-cantrip-turn-1',
    puzzleAbility: 'arcane-sight',
  },

  'temple-acolyte': {
    id: 'temple-acolyte',
    name: 'Temple Acolyte',
    class: 'Cleric',
    description: 'You served the faith and carry its blessing.',
    dialogueTags: ['faith', 'morality', 'healing'],
    attributeBias: {
      STR: 10,
      DEX: 9,
      CON: 12,
      INT: 8,
      WIS: 14,
      CHA: 11,
    },
    taggedSkills: ['Medicine', 'Perception'],
    startingQuirk: 'healing-aura',
    puzzleAbility: 'sense-corruption',
  },
};

// Helper to get background by class
export function getBackgroundByClass(className: 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric'): Background {
  const background = Object.values(BACKGROUNDS).find(bg => bg.class === className);
  if (!background) {
    throw new Error(`No background found for class: ${className}`);
  }
  return background;
}
```

**Step 2: Write test**

Create `src/__tests__/data/backgrounds.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { BACKGROUNDS, getBackgroundByClass } from '@/data/backgrounds';

describe('Backgrounds Data', () => {
  it('should have exactly one background per class', () => {
    const classes = ['Fighter', 'Rogue', 'Wizard', 'Cleric'] as const;

    classes.forEach(cls => {
      const bg = getBackgroundByClass(cls);
      expect(bg).toBeDefined();
      expect(bg.class).toBe(cls);
    });
  });

  it('should have valid attribute biases (sum to standard array)', () => {
    Object.values(BACKGROUNDS).forEach(bg => {
      const total = Object.values(bg.attributeBias).reduce((sum, val) => sum + (val || 0), 0);
      expect(total).toBe(62); // Standard 28-point buy total
    });
  });

  it('should map quirks correctly to classes', () => {
    expect(BACKGROUNDS['border-guard'].startingQuirk).toBe('auto-block-first-attack');
    expect(BACKGROUNDS['street-urchin'].startingQuirk).toBe('start-hidden');
    expect(BACKGROUNDS['academy-dropout'].startingQuirk).toBe('bonus-cantrip-turn-1');
    expect(BACKGROUNDS['temple-acolyte'].startingQuirk).toBe('healing-aura');
  });

  it('should have dialogue tags for narrative gating', () => {
    expect(BACKGROUNDS['border-guard'].dialogueTags).toContain('authority');
    expect(BACKGROUNDS['street-urchin'].dialogueTags).toContain('streetwise');
    expect(BACKGROUNDS['academy-dropout'].dialogueTags).toContain('arcane');
    expect(BACKGROUNDS['temple-acolyte'].dialogueTags).toContain('faith');
  });
});
```

**Step 3: Run test**

Run: `npm test src/__tests__/data/backgrounds.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/data/backgrounds.ts src/__tests__/data/backgrounds.test.ts
git commit -m "feat: add 4 backgrounds for character creation (one per class)"
```

---

### Task 13: Traits Data

**Files:**
- Create: `src/data/traits.ts`
- Test: `src/__tests__/data/traits.test.ts`

**Step 1: Create traits data**

Create `src/data/traits.ts`:

```typescript
import type { DefiningTrait } from '@/types/trait';
import type { Character } from '@/types';

/**
 * Defining Traits - Universal character traits
 * All classes can choose any trait
 */

export const TRAITS: Record<string, DefiningTrait> = {
  bold: {
    id: 'bold',
    name: 'Bold',
    description: 'You act first, think later.',
    upside: {
      description: '+2 initiative (act first in combat)',
      apply: (character: Character) => ({
        ...character,
        // Initiative bonus applied in combat resolution
      }),
    },
    downside: {
      description: '-2 AC if you act last in turn order',
      apply: (character: Character) => ({
        ...character,
        // Penalty applied conditionally in combat
      }),
    },
  },

  cautious: {
    id: 'cautious',
    name: 'Cautious',
    description: 'You observe before committing.',
    upside: {
      description: '+2 AC (harder to hit)',
      apply: (character: Character) => ({
        ...character,
        ac: character.ac + 2,
      }),
    },
    downside: {
      description: '-2 initiative (act later in combat)',
      apply: (character: Character) => ({
        ...character,
        // Initiative penalty applied in combat resolution
      }),
    },
  },

  'silver-tongued': {
    id: 'silver-tongued',
    name: 'Silver-Tongued',
    description: 'You talk your way through trouble.',
    upside: {
      description: '+2 to all Charisma-based checks (Persuade, Bluff, Intimidate)',
      apply: (character: Character) => ({
        ...character,
        // Applied during skill checks
      }),
    },
    downside: {
      description: 'NPC hostility escalates faster on failed social checks',
      apply: (character: Character) => ({
        ...character,
        // Narrative consequence, not mechanical
      }),
    },
  },
};

// Helper to get trait by ID
export function getTrait(id: string): DefiningTrait {
  const trait = TRAITS[id];
  if (!trait) {
    throw new Error(`Trait not found: ${id}`);
  }
  return trait;
}
```

**Step 2: Write test**

Create `src/__tests__/data/traits.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { TRAITS, getTrait } from '@/data/traits';

describe('Defining Traits Data', () => {
  it('should have exactly 3 universal traits', () => {
    expect(Object.keys(TRAITS)).toHaveLength(3);
    expect(TRAITS.bold).toBeDefined();
    expect(TRAITS.cautious).toBeDefined();
    expect(TRAITS['silver-tongued']).toBeDefined();
  });

  it('should have upside and downside for each trait', () => {
    Object.values(TRAITS).forEach(trait => {
      expect(trait.upside).toBeDefined();
      expect(trait.downside).toBeDefined();
      expect(typeof trait.upside.apply).toBe('function');
      expect(typeof trait.downside.apply).toBe('function');
    });
  });

  it('cautious trait should increase AC by 2', () => {
    const mockCharacter = { ac: 15 } as any;
    const result = TRAITS.cautious.upside.apply(mockCharacter);

    expect(result.ac).toBe(17);
  });

  it('should throw error for non-existent trait', () => {
    expect(() => getTrait('fake-trait')).toThrow('Trait not found');
  });
});
```

**Step 3: Run test**

Run: `npm test src/__tests__/data/traits.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/data/traits.ts src/__tests__/data/traits.test.ts
git commit -m "feat: add 3 defining traits for character creation"
```

---

### Task 14: Exploration Tables Data

**Files:**
- Create: `src/data/explorationTables.ts`
- Test: `src/__tests__/data/explorationTables.test.ts`

**Step 1: Create exploration tables data**

Create `src/data/explorationTables.ts`:

```typescript
import type { ExplorationTable } from '@/types/narrative';

/**
 * Exploration Tables for Validation Campaign
 * Weighted encounter tables (weights must sum to 100)
 */

export const EXPLORATION_TABLES: Record<string, ExplorationTable> = {
  'forest-exploration': {
    id: 'forest-exploration',
    locationId: 'validation-forest',
    encounters: [
      // 60% Combat encounter
      {
        weight: 60,
        outcome: {
          type: 'combat',
          enemyId: 'wolf', // TODO: Add wolf enemy
          goldReward: 30,
          itemReward: 'wolf-pelt',
        },
      },

      // 20% Treasure find
      {
        weight: 20,
        outcome: {
          type: 'treasure',
          gold: 50,
          items: ['healing-potion', 'antidote'],
        },
      },

      // 10% Atmospheric vignette
      {
        weight: 10,
        outcome: {
          type: 'vignette',
          description: 'You discover ancient carvings on a gnarled tree. The symbols glow faintly in the dim forest light, telling a story of a great battle fought here centuries ago. The air feels heavy with old magic.',
          flavorOnly: true,
        },
      },

      // 10% Nothing found
      {
        weight: 10,
        outcome: {
          type: 'nothing',
          message: 'You search the area thoroughly but find nothing of interest. An empty clearing greets you, silent and still.',
        },
      },
    ],
  },
};

// Helper to get exploration table by ID
export function getExplorationTable(id: string): ExplorationTable {
  const table = EXPLORATION_TABLES[id];
  if (!table) {
    throw new Error(`Exploration table not found: ${id}`);
  }
  return table;
}
```

**Step 2: Write test**

Create `src/__tests__/data/explorationTables.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { EXPLORATION_TABLES, getExplorationTable } from '@/data/explorationTables';
import { validateExplorationTable } from '@/utils/exploration';

describe('Exploration Tables Data', () => {
  it('should have forest exploration table', () => {
    expect(EXPLORATION_TABLES['forest-exploration']).toBeDefined();
  });

  it('should have weights that sum to 100', () => {
    const table = getExplorationTable('forest-exploration');
    const isValid = validateExplorationTable(table);

    expect(isValid).toBe(true);
  });

  it('should have 4 encounter types (60/20/10/10 split)', () => {
    const table = getExplorationTable('forest-exploration');

    expect(table.encounters).toHaveLength(4);
    expect(table.encounters[0].weight).toBe(60); // Combat
    expect(table.encounters[1].weight).toBe(20); // Treasure
    expect(table.encounters[2].weight).toBe(10); // Vignette
    expect(table.encounters[3].weight).toBe(10); // Nothing
  });

  it('should reference valid item IDs', () => {
    const table = getExplorationTable('forest-exploration');
    const treasureOutcome = table.encounters[1].outcome;

    if (treasureOutcome.type === 'treasure') {
      expect(treasureOutcome.items).toContain('healing-potion');
      expect(treasureOutcome.items).toContain('antidote');
    }
  });
});
```

**Step 3: Run test**

Run: `npm test src/__tests__/data/explorationTables.test.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/data/explorationTables.ts src/__tests__/data/explorationTables.test.ts
git commit -m "feat: add forest exploration table with 60/20/10/10 encounter split"
```

---

## Phase 4: Validation Campaign

### Task 15: Validation Campaign - Nodes 1-4

**Files:**
- Create: `src/data/campaigns/validation-campaign.ts`

**Step 1: Create campaign file with first 4 nodes**

Create `src/data/campaigns/validation-campaign.ts`:

```typescript
import type { Campaign, Act, StoryNode } from '@/types/narrative';

/**
 * Validation Campaign - Mechanical Testing Harness
 *
 * 8-node critical path to validate:
 * 1. Exploration system
 * 2. Inventory/gold/merchant
 * 3. Retreat mechanics
 * 4. Level-up flow
 * 5. Two-phase character creation
 *
 * Total playtime: 15-20 minutes
 */

const validationNodes: StoryNode[] = [
  // === NODE 1: Character Creation Entry Point ===
  {
    id: 'validation-start',
    title: 'Welcome to the Validation Campaign',
    description: 'This campaign tests all core game mechanics in a focused 15-20 minute experience. You will face combat, make choices, explore, trade with merchants, and level up. Let\\'s begin by creating your character.',
    choices: [
      {
        id: 'start-char-creation',
        text: 'Create Character',
        outcome: { type: 'goto', nodeId: 'validation-first-combat' }, // Will trigger char creation UI
      },
    ],
  },

  // === NODE 2: First Combat (Goblin) ===
  {
    id: 'validation-first-combat',
    title: 'Ambush!',
    description: 'As you step onto the forest path, a goblin leaps from the underbrush, brandishing a rusty dagger!',
    locationId: 'darkwood-forest',
    onEnter: [
      {
        type: 'startCombat',
        enemyId: 'goblin', // TODO: Need goblin enemy
        onVictoryNodeId: 'validation-post-combat-1',
      },
    ],
    choices: [], // Combat starts immediately
  },

  // === NODE 2b: Post First Combat ===
  {
    id: 'validation-post-combat-1',
    description: 'The goblin falls with a final screech. You catch your breath and search the area, finding a small pouch of coins and a healing potion.',
    onEnter: [
      { type: 'giveGold', amount: 50 },
      { type: 'giveItem', itemId: 'healing-potion' },
    ],
    choices: [
      {
        id: 'continue-to-exploration',
        text: 'Continue down the path',
        outcome: { type: 'goto', nodeId: 'validation-exploration-choice' },
      },
    ],
  },

  // === NODE 3: Exploration Choice ===
  {
    id: 'validation-exploration-choice',
    title: 'A Forest Crossroads',
    description: 'The path continues ahead toward a distant village. To your left, you notice game trails leading deeper into the forest. You could explore the wilderness... or stay on the safe path.',
    locationHint: 'Darkwood Forest - A dense woodland',
    companionHint: 'Exploration is risky, but fortune favors the bold. Or does it?',
    choices: [
      {
        id: 'explore-forest',
        text: 'Explore the game trails (risk/reward)',
        outcome: {
          type: 'explore',
          tableId: 'forest-exploration',
          onceOnly: true,
        },
      },
      {
        id: 'continue-to-merchant',
        text: 'Stay on the main path to the village',
        outcome: { type: 'goto', nodeId: 'validation-merchant' },
      },
    ],
  },

  // === NODE 4: Merchant ===
  {
    id: 'validation-merchant',
    title: 'The Village Market',
    description: 'You arrive at a small village. A weathered merchant stands behind a wooden cart piled with supplies.',
    speakerName: 'Merchant',
    speakerPortrait: 'portraits/merchant.png',
    locationId: 'village-market',
    choices: [
      {
        id: 'browse-wares',
        text: '"Show me your wares."',
        outcome: {
          type: 'merchant',
          shopInventory: ['healing-potion', 'sword-plus-1', 'antidote'],
          buyPrices: {
            'healing-potion': 50,
            'sword-plus-1': 100,
            'antidote': 30,
          },
        },
      },
      {
        id: 'leave-merchant',
        text: '"Not interested right now."',
        outcome: { type: 'goto', nodeId: 'validation-phase2-unlock' },
      },
    ],
  },
];

// Export just the nodes for now, will add full campaign structure later
export { validationNodes };
```

**Step 2: Commit**

```bash
git add src/data/campaigns/validation-campaign.ts
git commit -m "feat: add validation campaign nodes 1-4 (char creation, combat, exploration, merchant)"
```

---

### Task 16: Validation Campaign - Nodes 5-8

**Files:**
- Modify: `src/data/campaigns/validation-campaign.ts` (add remaining nodes)

**Step 1: Add nodes 5-8**

In `src/data/campaigns/validation-campaign.ts`, add to `validationNodes` array:

```typescript
  // === NODE 4b: Phase 2 Character Creation Unlock ===
  {
    id: 'validation-phase2-unlock',
    description: 'You\'ve proven yourself in battle and trade. You feel more confident in your abilities. Perhaps it\'s time to refine your skills and choose how you\'ve grown.',
    onEnter: [
      // This would trigger Phase 2 UI (point-buy, skill allocation, feat selection)
      // For now, just a placeholder node effect
      { type: 'setFlag', flag: 'phase2_unlocked', value: true },
    ],
    choices: [
      {
        id: 'customize-character',
        text: 'Refine your abilities (Phase 2 customization)',
        outcome: { type: 'goto', nodeId: 'validation-second-combat' },
        // In full implementation, this would open customization UI first
      },
      {
        id: 'skip-customization',
        text: 'Use your current build',
        outcome: { type: 'goto', nodeId: 'validation-second-combat' },
      },
    ],
  },

  // === NODE 5: Second Combat (Skeleton) with Retreat Option ===
  {
    id: 'validation-second-combat',
    title: 'The Crypt Guardian',
    description: 'You descend into an ancient crypt. A skeletal warrior rises from its resting place, eye sockets glowing with unholy light!',
    locationId: 'crypt',
    companionHint: 'This foe is formidable. If the battle turns against you, retreat is an option.',
    onEnter: [
      {
        type: 'startCombat',
        enemyId: 'skeleton',
        onVictoryNodeId: 'validation-post-combat-2',
      },
    ],
    choices: [],
    // Combat state will include: canRetreat: true, retreatPenalty: { goldLost: 20, damageOnFlee: 5, safeNodeId: 'validation-retreat-safe' }
  },

  // === NODE 5b: Post Second Combat ===
  {
    id: 'validation-post-combat-2',
    description: 'The skeleton crumbles to dust. Among the bones, you find a heavy coin purse and a mysterious amulet.',
    onEnter: [
      { type: 'giveGold', amount: 80 },
      { type: 'giveItem', itemId: 'mysterious-amulet' },
    ],
    choices: [
      {
        id: 'continue-to-levelup',
        text: 'Press onward',
        outcome: { type: 'goto', nodeId: 'validation-levelup' },
      },
    ],
  },

  // === NODE 5c: Retreat Safe Zone (if player fled) ===
  {
    id: 'validation-retreat-safe',
    description: 'You flee back up the crypt stairs, breathing heavily. You\'ve lost some gold in the chaos, and your wounds sting. But you\'re alive. You can try again when you\'re ready.',
    choices: [
      {
        id: 'return-to-combat',
        text: 'Steel yourself and return to the crypt',
        outcome: { type: 'goto', nodeId: 'validation-second-combat' },
      },
      {
        id: 'skip-to-levelup',
        text: 'Avoid the crypt and continue your journey (skip combat)',
        outcome: { type: 'goto', nodeId: 'validation-levelup' },
      },
    ],
  },

  // === NODE 6: Level Up to Level 2 ===
  {
    id: 'validation-levelup',
    title: 'Growth',
    description: 'Your trials have made you stronger. You feel the surge of experience as your skills sharpen and your body becomes more resilient. Choose how you\'ve grown.',
    onEnter: [
      {
        type: 'levelUp',
        newLevel: 2,
        featChoices: ['power-attack', 'improved-initiative', 'weapon-focus'],
      },
    ],
    choices: [
      {
        id: 'continue-to-final',
        text: 'Face the final challenge',
        outcome: { type: 'goto', nodeId: 'validation-final-combat' },
      },
    ],
  },

  // === NODE 7: Final Combat (Wraith) ===
  {
    id: 'validation-final-combat',
    title: 'The Wraith',
    description: 'At the deepest chamber, a wraith materializes from the shadows. Its ethereal form flickers between this world and the next. This is the ultimate test of your abilities!',
    locationId: 'void-sanctum',
    companionHint: 'Use everything you\'ve learned. Items, abilities, tactics—this is your moment.',
    onEnter: [
      {
        type: 'startCombat',
        enemyId: 'wraith',
        onVictoryNodeId: 'validation-end',
      },
    ],
    choices: [],
  },

  // === NODE 8: End Summary ===
  {
    id: 'validation-end',
    title: 'Victory!',
    description: 'The wraith dissipates with an otherworldly scream. You stand victorious, battle-tested and proven. The validation campaign is complete.',
    onEnter: [
      { type: 'giveGold', amount: 100 },
      { type: 'setFlag', flag: 'validation_complete', value: true },
    ],
    choices: [
      {
        id: 'view-summary',
        text: 'View Campaign Summary',
        outcome: { type: 'exit' }, // This would show summary screen in full implementation
      },
    ],
  },
];
```

**Step 2: Add campaign and act structure**

At the end of `validation-campaign.ts`, replace the export with:

```typescript
const validationAct: Act = {
  id: 'validation-act',
  title: 'Validation Campaign',
  description: 'A focused test of all game mechanics',
  locationId: 'darkwood-forest',
  startingNodeId: 'validation-start',
  deathNodeId: 'validation-death', // TODO: Add death node
  nodes: validationNodes,
};

export const validationCampaign: Campaign = {
  id: 'validation-campaign',
  title: 'Mechanical Validation',
  description: '15-20 minute campaign to test exploration, progression, combat polish, and character creation',
  companionName: 'The Guide',
  companionDescription: 'A mysterious voice offering tactical advice',
  acts: [validationAct],
};
```

**Step 3: Add death node**

In `validationNodes` array, add:

```typescript
  // === Death Node (for permadeath) ===
  {
    id: 'validation-death',
    title: 'Fallen',
    description: 'You have fallen in battle. Your journey ends here in the darkness of the crypt.',
    choices: [],
  },
```

**Step 4: Commit**

```bash
git add src/data/campaigns/validation-campaign.ts
git commit -m "feat: complete validation campaign with 8 nodes (retreat, level-up, final combat, summary)"
```

---

## Phase 5: UI Integration

**Note:** UI integration details moved to dedicated plan.

**See:** `docs/plans/2025-12-16-phase-5-ui-integration.md` for comprehensive step-by-step implementation.

**Overview:** Integrate merchant screen, level-up screen, exploration results, retreat button, and character effect processing into UI layer following existing store/navigation patterns.

### Task 17: Combat UI - Item Use Button

**Files:**
- Modify: `src/screens/BattleScreen.tsx` (or equivalent combat UI)
- Add "Use Item" button to combat actions
- Filter inventory to `usableInCombat: true` items
- Apply item effects via `utils/combat.ts`

### Task 18: Combat UI - Retreat Button

**Files:**
- Modify: `src/screens/BattleScreen.tsx`
- Show "Retreat" button only if `combat.canRetreat === true`
- Call `handleRetreat()` from utils
- Navigate to `retreatPenalty.safeNodeId`

### Task 19: Merchant UI Screen

**Files:**
- Create: `src/screens/MerchantScreen.tsx`
- Display shop inventory with buy prices
- Show player gold and inventory
- Buy button calls `buyItem()` from utils
- Sell button calls `sellItem()` from utils

### Task 20: Level-Up UI Screen

**Files:**
- Create: `src/screens/LevelUpScreen.tsx`
- Display HP, BAB, save increases
- Show 3 feat options with descriptions
- Player selects 1 feat
- Call `applyLevelUp()` from utils

### Task 21: Phase 2 Character Creation Screen

**Files:**
- Create: `src/screens/CharacterCustomizationScreen.tsx`
- Show current attributes (pre-filled from background)
- Point-buy interface (can override)
- Skill allocation (tagged skills highlighted)
- Feat selection
- "Use Recommended Build" button (accepts defaults)

---

## Summary & Next Steps

**What We've Built:**
- ✅ Type extensions (Character, Combat, Narrative)
- ✅ 5 core systems (exploration, merchant, retreat, level-up, quirks)
- ✅ Data content (items, enemies with taunts, backgrounds, traits, exploration tables)
- ✅ 8-node validation campaign structure
- 🔲 UI integration (requires additional work)

**To Continue:**
1. Run all tests: `npm test`
2. Fix any integration issues
3. Begin UI implementation (Task 17-21)
4. Playtest validation campaign
5. Tune balance based on feedback

**Ready to execute this plan?**
- Use `superpowers:subagent-driven-development` for task-by-task execution in this session
- OR use `superpowers:executing-plans` in a new parallel session for batch execution

---
