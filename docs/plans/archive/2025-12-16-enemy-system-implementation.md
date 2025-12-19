# Enemy System Redesign - Implementation Plan

**Date:** 2025-12-16
**Status:** Ready for Implementation
**Design Doc:** [2025-12-16-enemy-system-redesign.md](./2025-12-16-enemy-system-redesign.md)

## Completed

✅ **Phase 1: Type Hierarchy** - Entity base type created, Character and Creature extend Entity, Equipment supports null values

## Remaining Work

This plan covers Phase 2 (Data & Utils), Phase 4 (Combat Integration), and Phase 5 (Cleanup).

---

## Phase 2: Add Data and Utils (Non-Breaking)

### Task 2.1: Create CreatureClass Traits Definition

**File:** `src/data/creatureClasses.ts`

**Implementation:**
```typescript
import type { CreatureClass } from '../types/creature';

interface CreatureClassTraits {
  name: CreatureClass;
  displayName: string;
  description: string;
  mechanicalEffects: {
    saveBonus?: { fortitude?: number; reflex?: number; will?: number };
    naturalArmorBonus?: number;
    immunities?: string[];
  };
}

export const CREATURE_CLASS_TRAITS: Record<CreatureClass, CreatureClassTraits> = {
  Beast: {
    name: 'Beast',
    displayName: 'Beast',
    description: 'Animals and monstrous creatures',
    mechanicalEffects: {
      naturalArmorBonus: 2,
    },
  },
  Humanoid: {
    name: 'Humanoid',
    displayName: 'Humanoid',
    description: 'Human-like creatures',
    mechanicalEffects: {},
  },
  Undead: {
    name: 'Undead',
    displayName: 'Undead',
    description: 'Reanimated dead with unnatural resilience',
    mechanicalEffects: {
      saveBonus: { fortitude: 2, reflex: 2, will: 2 },
      immunities: ['poison', 'disease'],
    },
  },
};

/**
 * Get creature class traits by type
 */
export function getCreatureClassTraits(creatureClass: CreatureClass): CreatureClassTraits {
  return CREATURE_CLASS_TRAITS[creatureClass];
}

/**
 * Apply creature class mechanical effects to base stats
 */
export function applyCreatureClassEffects(
  baseStats: { ac: number; saves: { fortitude: number; reflex: number; will: number } },
  creatureClass: CreatureClass
): { ac: number; saves: { fortitude: number; reflex: number; will: number } } {
  const traits = CREATURE_CLASS_TRAITS[creatureClass];
  const { naturalArmorBonus = 0, saveBonus } = traits.mechanicalEffects;

  return {
    ac: baseStats.ac + naturalArmorBonus,
    saves: {
      fortitude: baseStats.saves.fortitude + (saveBonus?.fortitude ?? 0),
      reflex: baseStats.saves.reflex + (saveBonus?.reflex ?? 0),
      will: baseStats.saves.will + (saveBonus?.will ?? 0),
    },
  };
}
```

**Unit Tests:** `src/__tests__/data/creatureClasses.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { CREATURE_CLASS_TRAITS, getCreatureClassTraits, applyCreatureClassEffects } from '../../data/creatureClasses';

describe('CreatureClass Traits', () => {
  it('should have traits for all creature classes', () => {
    expect(CREATURE_CLASS_TRAITS.Beast).toBeDefined();
    expect(CREATURE_CLASS_TRAITS.Humanoid).toBeDefined();
    expect(CREATURE_CLASS_TRAITS.Undead).toBeDefined();
  });

  it('should return correct traits for Beast', () => {
    const traits = getCreatureClassTraits('Beast');
    expect(traits.name).toBe('Beast');
    expect(traits.mechanicalEffects.naturalArmorBonus).toBe(2);
  });

  it('should return correct traits for Undead', () => {
    const traits = getCreatureClassTraits('Undead');
    expect(traits.mechanicalEffects.saveBonus).toEqual({
      fortitude: 2,
      reflex: 2,
      will: 2,
    });
    expect(traits.mechanicalEffects.immunities).toContain('poison');
  });

  it('should apply Beast natural armor bonus', () => {
    const baseStats = {
      ac: 12,
      saves: { fortitude: 2, reflex: 3, will: 1 },
    };
    const result = applyCreatureClassEffects(baseStats, 'Beast');
    expect(result.ac).toBe(14); // +2 natural armor
    expect(result.saves).toEqual(baseStats.saves); // No save bonuses
  });

  it('should apply Undead save bonuses', () => {
    const baseStats = {
      ac: 10,
      saves: { fortitude: 0, reflex: 2, will: 0 },
    };
    const result = applyCreatureClassEffects(baseStats, 'Undead');
    expect(result.ac).toBe(10); // No AC bonus
    expect(result.saves).toEqual({
      fortitude: 2,
      reflex: 4,
      will: 2,
    });
  });

  it('should not modify stats for Humanoid', () => {
    const baseStats = {
      ac: 13,
      saves: { fortitude: 2, reflex: 2, will: 1 },
    };
    const result = applyCreatureClassEffects(baseStats, 'Humanoid');
    expect(result).toEqual(baseStats); // No changes
  });
});
```

---

### Task 2.2: Create Loot Type Definitions

**File:** `src/types/loot.ts`

**Implementation:**
```typescript
export interface LootEntry {
  type: 'gold' | 'item' | 'weapon' | 'armor';
  chance: number; // 0.0 to 1.0 (e.g., 0.8 = 80%)

  // For gold
  goldRange?: { min: number; max: number };

  // For items/equipment
  itemId?: string;
  quantity?: number; // Default 1
}

export interface LootTable {
  id: string;
  entries: LootEntry[];
}

export interface LootDrop {
  type: 'gold' | 'item' | 'weapon' | 'armor';
  amount?: number; // For gold
  itemId?: string; // For items/equipment
  quantity?: number; // For items
}
```

---

### Task 2.3: Create Loot Tables

**File:** `src/data/lootTables.ts`

**Implementation:**
```typescript
import type { LootTable } from '../types/loot';

export const LOOT_TABLES: Record<string, LootTable> = {
  bandit_loot: {
    id: 'bandit_loot',
    entries: [
      { type: 'gold', chance: 0.8, goldRange: { min: 3, max: 8 } },
      { type: 'item', chance: 0.2, itemId: 'healing_potion' },
    ],
  },

  skeleton_loot: {
    id: 'skeleton_loot',
    entries: [
      { type: 'gold', chance: 0.3, goldRange: { min: 1, max: 3 } },
    ],
  },

  wraith_loot: {
    id: 'wraith_loot',
    entries: [
      { type: 'gold', chance: 0.5, goldRange: { min: 5, max: 12 } },
      { type: 'item', chance: 0.1, itemId: 'arcane_scroll' },
    ],
  },

  spider_loot: {
    id: 'spider_loot',
    entries: [
      { type: 'gold', chance: 0.2, goldRange: { min: 1, max: 3 } },
    ],
  },

  // Empty loot table for enemies that don't drop anything
  no_loot: {
    id: 'no_loot',
    entries: [],
  },
};

/**
 * Get loot table by ID
 */
export function getLootTable(id: string): LootTable | null {
  return LOOT_TABLES[id] ?? null;
}
```

**Unit Tests:** `src/__tests__/data/lootTables.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { LOOT_TABLES, getLootTable } from '../../data/lootTables';

describe('Loot Tables', () => {
  it('should have loot tables defined', () => {
    expect(Object.keys(LOOT_TABLES).length).toBeGreaterThan(0);
  });

  it('should have bandit_loot table', () => {
    const table = getLootTable('bandit_loot');
    expect(table).toBeDefined();
    expect(table?.id).toBe('bandit_loot');
    expect(table?.entries.length).toBeGreaterThan(0);
  });

  it('should have no_loot table for enemies with no drops', () => {
    const table = getLootTable('no_loot');
    expect(table?.entries).toEqual([]);
  });

  it('should return null for unknown loot table', () => {
    const table = getLootTable('unknown_table');
    expect(table).toBeNull();
  });

  it('should have valid chance values (0-1)', () => {
    Object.values(LOOT_TABLES).forEach(table => {
      table.entries.forEach(entry => {
        expect(entry.chance).toBeGreaterThanOrEqual(0);
        expect(entry.chance).toBeLessThanOrEqual(1);
      });
    });
  });

  it('should have gold ranges with min <= max', () => {
    Object.values(LOOT_TABLES).forEach(table => {
      table.entries.forEach(entry => {
        if (entry.goldRange) {
          expect(entry.goldRange.min).toBeLessThanOrEqual(entry.goldRange.max);
        }
      });
    });
  });
});
```

---

### Task 2.4: Create Loot Rolling Utility

**File:** `src/utils/loot.ts`

**Implementation:**
```typescript
import type { LootTable, LootDrop } from '../types/loot';
import { getLootTable } from '../data/lootTables';

/**
 * Roll for random number between min and max (inclusive)
 */
function rollBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Roll loot from a loot table
 */
export function rollLoot(lootTableId: string): LootDrop[] {
  const table = getLootTable(lootTableId);
  if (!table) {
    console.warn(`Loot table not found: ${lootTableId}`);
    return [];
  }

  const drops: LootDrop[] = [];

  for (const entry of table.entries) {
    const roll = Math.random();
    if (roll <= entry.chance) {
      if (entry.type === 'gold' && entry.goldRange) {
        const amount = rollBetween(entry.goldRange.min, entry.goldRange.max);
        drops.push({ type: 'gold', amount });
      } else if (entry.itemId) {
        drops.push({
          type: entry.type,
          itemId: entry.itemId,
          quantity: entry.quantity ?? 1,
        });
      }
    }
  }

  return drops;
}

/**
 * Format loot drops for display in combat log
 */
export function formatLootMessage(drops: LootDrop[]): string {
  if (drops.length === 0) {
    return 'No loot dropped.';
  }

  const parts: string[] = [];

  for (const drop of drops) {
    if (drop.type === 'gold') {
      parts.push(`${drop.amount} gold`);
    } else if (drop.itemId) {
      const qty = drop.quantity && drop.quantity > 1 ? `${drop.quantity}x ` : '';
      parts.push(`${qty}${drop.itemId}`);
    }
  }

  return `Obtained: ${parts.join(', ')}`;
}
```

**Unit Tests:** `src/__tests__/utils/loot.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { rollLoot, formatLootMessage } from '../../utils/loot';

describe('Loot Rolling', () => {
  it('should return empty array for unknown loot table', () => {
    const drops = rollLoot('unknown_table');
    expect(drops).toEqual([]);
  });

  it('should return empty array for no_loot table', () => {
    const drops = rollLoot('no_loot');
    expect(drops).toEqual([]);
  });

  it('should return loot drops (probabilistic test)', () => {
    // Run multiple times to account for randomness
    let gotGold = false;
    let gotItem = false;

    for (let i = 0; i < 100; i++) {
      const drops = rollLoot('bandit_loot');
      drops.forEach(drop => {
        if (drop.type === 'gold') gotGold = true;
        if (drop.type === 'item') gotItem = true;
      });
    }

    // With 100 runs, we should see at least one gold drop (80% chance per roll)
    expect(gotGold).toBe(true);
  });

  it('should return gold in valid range', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // Force drop

    const drops = rollLoot('bandit_loot');
    const goldDrop = drops.find(d => d.type === 'gold');

    if (goldDrop?.amount) {
      expect(goldDrop.amount).toBeGreaterThanOrEqual(3);
      expect(goldDrop.amount).toBeLessThanOrEqual(8);
    }

    vi.restoreAllMocks();
  });

  it('should format gold drop message', () => {
    const drops = [{ type: 'gold' as const, amount: 5 }];
    const message = formatLootMessage(drops);
    expect(message).toBe('Obtained: 5 gold');
  });

  it('should format item drop message', () => {
    const drops = [{ type: 'item' as const, itemId: 'healing_potion', quantity: 1 }];
    const message = formatLootMessage(drops);
    expect(message).toBe('Obtained: healing_potion');
  });

  it('should format multiple drops', () => {
    const drops = [
      { type: 'gold' as const, amount: 10 },
      { type: 'item' as const, itemId: 'dagger', quantity: 1 },
    ];
    const message = formatLootMessage(drops);
    expect(message).toBe('Obtained: 10 gold, dagger');
  });

  it('should format quantity for stacked items', () => {
    const drops = [{ type: 'item' as const, itemId: 'arrow', quantity: 20 }];
    const message = formatLootMessage(drops);
    expect(message).toBe('Obtained: 20x arrow');
  });

  it('should handle empty drops', () => {
    const message = formatLootMessage([]);
    expect(message).toBe('No loot dropped.');
  });
});
```

---

### Task 2.5: Create Enemy Template Types

**File:** `src/types/enemyTemplate.ts`

**Implementation:**
```typescript
import type { CharacterClass } from './character';
import type { CreatureClass } from './creature';
import type { Equipment } from './equipment';
import type { SkillRanks } from './skill';
import type { Feat } from './feat';

export interface AttributeRange {
  min: number;
  max: number;
}

export interface EnemyTemplate {
  id: string;
  baseName: string;
  creatureClass: CreatureClass;

  // Multiple avatars for variety
  avatarPaths: string[];

  // Randomization ranges
  levelRange: { min: number; max: number };
  attributeRanges: {
    STR: AttributeRange;
    DEX: AttributeRange;
    CON: AttributeRange;
    INT: AttributeRange;
    WIS: AttributeRange;
    CHA: AttributeRange;
  };

  // Static template data
  baseClass: CharacterClass; // For BAB/save calculations
  equipment: Equipment;
  skills: SkillRanks;
  feats: Feat[];
  taunts?: {
    onCombatStart?: string[];
    onPlayerMiss?: string[];
    onEnemyHit?: string[];
    onLowHealth?: string[];
  };
  lootTableId: string;
}
```

---

### Task 2.6: Create Enemy Templates (Convert Existing Enemies)

**File:** `src/data/enemyTemplates.ts`

**Implementation:**
```typescript
import type { EnemyTemplate } from '../types/enemyTemplate';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from './creatureAvatars';

export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = {
  bandit: {
    id: 'bandit',
    baseName: 'Bandit',
    creatureClass: 'Humanoid',
    avatarPaths: [CREATURE_AVATARS['Bandit'] || DEFAULT_CREATURE_AVATAR],

    levelRange: { min: 1, max: 2 },
    attributeRanges: {
      STR: { min: 12, max: 14 },
      DEX: { min: 13, max: 15 },
      CON: { min: 11, max: 13 },
      INT: { min: 9, max: 11 },
      WIS: { min: 10, max: 12 },
      CHA: { min: 7, max: 9 },
    },

    baseClass: 'Fighter',
    equipment: {
      weapon: {
        name: 'Dagger',
        damage: '1d6',
        damageType: 'piercing',
        finesse: true,
        description: 'A short blade favored by bandits',
      },
      armor: {
        name: 'Leather',
        baseAC: 11,
        maxDexBonus: null,
        description: 'Supple leather armor',
      },
      shield: { equipped: false, acBonus: 0 },
      items: [],
    },
    skills: {
      Athletics: 0,
      Stealth: 4,
      Perception: 0,
      Arcana: 0,
      Medicine: 0,
      Intimidate: 2,
    },
    feats: [],
    taunts: {
      onCombatStart: ["You'll regret crossing me!", "Fresh meat!", "Your gold or your life!"],
      onPlayerMiss: ["Too slow!", "Hah! Missed!", "You fight like a farmer!"],
      onEnemyHit: ["How'd you like that?", "You're finished!", "Take that!"],
      onLowHealth: ["I'll... get you...", "This isn't over!", "You got lucky!"],
    },
    lootTableId: 'bandit_loot',
  },

  skeleton: {
    id: 'skeleton',
    baseName: 'Skeleton',
    creatureClass: 'Undead',
    avatarPaths: [CREATURE_AVATARS['Skeleton'] || DEFAULT_CREATURE_AVATAR],

    levelRange: { min: 1, max: 2 },
    attributeRanges: {
      STR: { min: 12, max: 14 },
      DEX: { min: 14, max: 16 },
      CON: { min: 10, max: 10 }, // Undead - fixed CON
      INT: { min: 5, max: 7 },
      WIS: { min: 9, max: 11 },
      CHA: { min: 2, max: 4 },
    },

    baseClass: 'Fighter',
    equipment: {
      weapon: {
        name: 'Mace',
        damage: '1d6',
        damageType: 'bludgeoning',
        finesse: false,
        description: 'Rusty mace and claw attacks',
      },
      armor: null, // Natural bone armor
      shield: { equipped: true, acBonus: 2 },
      items: [],
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
    taunts: {
      onCombatStart: ["*rattles bones menacingly*", "*hollow laughter*"],
      onPlayerMiss: ["*dodges with unnatural speed*"],
      onEnemyHit: ["*bones crack against you*", "*relentless assault*"],
      onLowHealth: ["*bones begin to crumble*"],
    },
    lootTableId: 'skeleton_loot',
  },

  wraith: {
    id: 'wraith',
    baseName: 'Wraith',
    creatureClass: 'Undead',
    avatarPaths: [CREATURE_AVATARS['Wraith'] || DEFAULT_CREATURE_AVATAR],

    levelRange: { min: 1, max: 2 },
    attributeRanges: {
      STR: { min: 5, max: 7 },
      DEX: { min: 15, max: 17 },
      CON: { min: 10, max: 10 },
      INT: { min: 15, max: 17 },
      WIS: { min: 13, max: 15 },
      CHA: { min: 7, max: 9 },
    },

    baseClass: 'Wizard',
    equipment: {
      weapon: null, // Life-draining touch (natural attack)
      armor: null,
      shield: null,
      items: [],
    },
    skills: {
      Athletics: 0,
      Stealth: 5,
      Perception: 4,
      Arcana: 6,
      Medicine: 0,
      Intimidate: 2,
    },
    feats: [],
    taunts: {
      onCombatStart: ["*ethereal wailing*", "Your soul will be mine...", "*appears from shadows*"],
      onPlayerMiss: ["*phases through attack*", "You cannot touch the dead..."],
      onEnemyHit: ["*life-draining touch*", "Feel the cold of the grave!"],
      onLowHealth: ["*fading into mist*", "I shall return...", "*dissipating*"],
    },
    lootTableId: 'wraith_loot',
  },

  giantSpider: {
    id: 'giantSpider',
    baseName: 'Giant Spider',
    creatureClass: 'Beast',
    avatarPaths: [CREATURE_AVATARS['Spider'] || DEFAULT_CREATURE_AVATAR],

    levelRange: { min: 1, max: 1 },
    attributeRanges: {
      STR: { min: 10, max: 12 },
      DEX: { min: 13, max: 15 },
      CON: { min: 11, max: 13 },
      INT: { min: 2, max: 2 },
      WIS: { min: 9, max: 11 },
      CHA: { min: 2, max: 2 },
    },

    baseClass: 'Fighter',
    equipment: {
      weapon: null, // Natural bite
      armor: null,  // Natural exoskeleton
      shield: null,
      items: [],
    },
    skills: {
      Athletics: 0,
      Stealth: 6,
      Perception: 4,
      Arcana: 0,
      Medicine: 0,
      Intimidate: 0,
    },
    feats: [],
    taunts: {
      onCombatStart: [
        "*clicks mandibles ominously*",
        "*drops from above on a silken thread*",
        "*hisses and rears up, fangs dripping*"
      ],
      onPlayerMiss: [
        "*skitters aside with unnatural speed*",
        "*the blade passes through its web*"
      ],
      onEnemyHit: [
        "*sinks venomous fangs into your flesh*",
        "*a sticky web strand clings to you*"
      ],
      onLowHealth: [
        "*retreats into the shadows, wounded*",
        "*eight legs tremble as it prepares a final strike*"
      ],
    },
    lootTableId: 'spider_loot',
  },
};

/**
 * Get enemy template by ID
 */
export function getEnemyTemplate(id: string): EnemyTemplate | null {
  return ENEMY_TEMPLATES[id] ?? null;
}
```

**Unit Tests:** `src/__tests__/data/enemyTemplates.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { ENEMY_TEMPLATES, getEnemyTemplate } from '../../data/enemyTemplates';

describe('Enemy Templates', () => {
  it('should have enemy templates defined', () => {
    expect(Object.keys(ENEMY_TEMPLATES).length).toBeGreaterThan(0);
  });

  it('should have bandit template', () => {
    const template = getEnemyTemplate('bandit');
    expect(template).toBeDefined();
    expect(template?.id).toBe('bandit');
    expect(template?.creatureClass).toBe('Humanoid');
  });

  it('should have skeleton template', () => {
    const template = getEnemyTemplate('skeleton');
    expect(template?.creatureClass).toBe('Undead');
  });

  it('should have wraith template with Wizard class', () => {
    const template = getEnemyTemplate('wraith');
    expect(template?.baseClass).toBe('Wizard');
    expect(template?.equipment.weapon).toBeNull(); // Natural attack
  });

  it('should have giantSpider template as Beast', () => {
    const template = getEnemyTemplate('giantSpider');
    expect(template?.creatureClass).toBe('Beast');
    expect(template?.equipment.weapon).toBeNull();
    expect(template?.equipment.armor).toBeNull();
  });

  it('should return null for unknown template', () => {
    const template = getEnemyTemplate('unknown');
    expect(template).toBeNull();
  });

  it('should have valid attribute ranges (min <= max)', () => {
    Object.values(ENEMY_TEMPLATES).forEach(template => {
      Object.entries(template.attributeRanges).forEach(([attr, range]) => {
        expect(range.min).toBeLessThanOrEqual(range.max);
        expect(range.min).toBeGreaterThanOrEqual(1);
        expect(range.max).toBeLessThanOrEqual(20);
      });
    });
  });

  it('should have valid level ranges', () => {
    Object.values(ENEMY_TEMPLATES).forEach(template => {
      expect(template.levelRange.min).toBeGreaterThanOrEqual(1);
      expect(template.levelRange.min).toBeLessThanOrEqual(template.levelRange.max);
    });
  });

  it('should have at least one avatar path', () => {
    Object.values(ENEMY_TEMPLATES).forEach(template => {
      expect(template.avatarPaths.length).toBeGreaterThan(0);
    });
  });

  it('should have valid loot table IDs', () => {
    Object.values(ENEMY_TEMPLATES).forEach(template => {
      expect(template.lootTableId).toBeDefined();
      expect(template.lootTableId.length).toBeGreaterThan(0);
    });
  });
});
```

---

### Task 2.7: Create Enemy Generation Utility

**File:** `src/utils/enemyGeneration.ts`

**Implementation:**
```typescript
import type { Creature } from '../types/creature';
import type { Attributes } from '../types/attributes';
import { getEnemyTemplate } from '../data/enemyTemplates';
import { applyCreatureClassEffects } from '../data/creatureClasses';
import { calculateModifier } from './dice';

/**
 * Roll random number between min and max (inclusive)
 */
function rollBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Pick random element from array
 */
function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Calculate BAB based on class and level
 */
function calculateBAB(baseClass: string, level: number): number {
  // Fighter/Rogue: Full BAB progression
  if (baseClass === 'Fighter' || baseClass === 'Rogue') {
    return level;
  }
  // Wizard/Cleric: Half BAB progression
  return Math.floor(level / 2);
}

/**
 * Calculate base saves based on class and level
 */
function calculateBaseSaves(
  baseClass: string,
  level: number,
  attributes: Attributes
): { fortitude: number; reflex: number; will: number } {
  const conMod = calculateModifier(attributes.CON);
  const dexMod = calculateModifier(attributes.DEX);
  const wisMod = calculateModifier(attributes.WIS);

  // Fighter: Good Fort/Ref, Poor Will
  if (baseClass === 'Fighter') {
    return {
      fortitude: 2 + conMod,
      reflex: 2 + dexMod,
      will: 0 + wisMod,
    };
  }

  // Rogue: Good Ref, Poor Fort/Will
  if (baseClass === 'Rogue') {
    return {
      fortitude: 0 + conMod,
      reflex: 2 + dexMod,
      will: 0 + wisMod,
    };
  }

  // Wizard: Good Will, Poor Fort/Ref
  if (baseClass === 'Wizard') {
    return {
      fortitude: 0 + conMod,
      reflex: 0 + dexMod,
      will: 2 + wisMod,
    };
  }

  // Cleric: Good Fort/Will, Poor Ref
  if (baseClass === 'Cleric') {
    return {
      fortitude: 2 + conMod,
      reflex: 0 + dexMod,
      will: 2 + wisMod,
    };
  }

  // Default
  return {
    fortitude: conMod,
    reflex: dexMod,
    will: wisMod,
  };
}

/**
 * Calculate AC based on equipment and DEX
 */
function calculateAC(
  dexMod: number,
  armorBaseAC: number | null,
  shieldBonus: number
): number {
  const baseAC = armorBaseAC ?? 10;
  return baseAC + dexMod + shieldBonus;
}

/**
 * Calculate max HP based on class and level
 */
function calculateMaxHP(baseClass: string, level: number, conMod: number): number {
  let hitDie = 8; // Default d8

  if (baseClass === 'Fighter') hitDie = 10;
  else if (baseClass === 'Rogue') hitDie = 8;
  else if (baseClass === 'Wizard') hitDie = 4;
  else if (baseClass === 'Cleric') hitDie = 8;

  // First level: max hit die + CON
  // Additional levels: average hit die + CON
  const firstLevelHP = hitDie + conMod;
  const additionalHP = (level - 1) * (Math.floor(hitDie / 2) + 1 + conMod);

  return Math.max(1, firstLevelHP + additionalHP);
}

/**
 * Generate a creature from a template
 */
export function generateEnemy(
  templateId: string,
  options?: { level?: number }
): Creature | null {
  const template = getEnemyTemplate(templateId);
  if (!template) {
    console.error(`Enemy template not found: ${templateId}`);
    return null;
  }

  // Roll level
  const level = options?.level ?? rollBetween(template.levelRange.min, template.levelRange.max);

  // Roll attributes
  const attributes: Attributes = {
    STR: rollBetween(template.attributeRanges.STR.min, template.attributeRanges.STR.max),
    DEX: rollBetween(template.attributeRanges.DEX.min, template.attributeRanges.DEX.max),
    CON: rollBetween(template.attributeRanges.CON.min, template.attributeRanges.CON.max),
    INT: rollBetween(template.attributeRanges.INT.min, template.attributeRanges.INT.max),
    WIS: rollBetween(template.attributeRanges.WIS.min, template.attributeRanges.WIS.max),
    CHA: rollBetween(template.attributeRanges.CHA.min, template.attributeRanges.CHA.max),
  };

  // Pick random avatar
  const avatarPath = randomPick(template.avatarPaths);

  // Calculate derived stats
  const dexMod = calculateModifier(attributes.DEX);
  const conMod = calculateModifier(attributes.CON);
  const bab = calculateBAB(template.baseClass, level);
  const baseSaves = calculateBaseSaves(template.baseClass, level, attributes);

  const armorBaseAC = template.equipment.armor?.baseAC ?? null;
  const shieldBonus = template.equipment.shield?.equipped ? template.equipment.shield.acBonus : 0;
  const baseAC = calculateAC(dexMod, armorBaseAC, shieldBonus);

  const maxHp = calculateMaxHP(template.baseClass, level, conMod);

  // Apply creature class effects
  const { ac, saves } = applyCreatureClassEffects(
    { ac: baseAC, saves: baseSaves },
    template.creatureClass
  );

  // Build resources (spell slots for casters)
  let resources = {
    abilities: [],
    spellSlots: undefined as { level0?: { max: number; current: number }; level1?: { max: number; current: number } } | undefined,
  };

  if (template.baseClass === 'Wizard' || template.baseClass === 'Cleric') {
    resources.spellSlots = {
      level0: { max: 3, current: 3 },
      level1: { max: 2, current: 2 },
    };
  }

  return {
    name: template.baseName,
    avatarPath,
    level,
    creatureClass: template.creatureClass,
    attributes,
    hp: maxHp,
    maxHp,
    ac,
    bab,
    saves,
    skills: { ...template.skills },
    feats: [...template.feats],
    equipment: {
      weapon: template.equipment.weapon ? { ...template.equipment.weapon } : null,
      armor: template.equipment.armor ? { ...template.equipment.armor } : null,
      shield: template.equipment.shield ? { ...template.equipment.shield } : null,
      items: [...template.equipment.items],
    },
    resources,
    taunts: template.taunts,
    lootTableId: template.lootTableId,
  };
}
```

**Unit Tests:** `src/__tests__/utils/enemyGeneration.test.ts`
```typescript
import { describe, it, expect, vi } from 'vitest';
import { generateEnemy } from '../../utils/enemyGeneration';

describe('Enemy Generation', () => {
  it('should return null for unknown template', () => {
    const enemy = generateEnemy('unknown');
    expect(enemy).toBeNull();
  });

  it('should generate bandit with valid stats', () => {
    const enemy = generateEnemy('bandit');
    expect(enemy).toBeDefined();
    expect(enemy?.name).toBe('Bandit');
    expect(enemy?.creatureClass).toBe('Humanoid');
    expect(enemy?.level).toBeGreaterThanOrEqual(1);
    expect(enemy?.hp).toBeGreaterThan(0);
    expect(enemy?.maxHp).toBeGreaterThan(0);
    expect(enemy?.ac).toBeGreaterThan(0);
  });

  it('should generate skeleton with Undead bonuses', () => {
    const enemy = generateEnemy('skeleton');
    expect(enemy?.creatureClass).toBe('Undead');
    // Undead get +2 to all saves
    expect(enemy?.saves.fortitude).toBeGreaterThanOrEqual(2);
    expect(enemy?.saves.reflex).toBeGreaterThanOrEqual(2);
    expect(enemy?.saves.will).toBeGreaterThanOrEqual(2);
  });

  it('should generate spider with Beast natural armor', () => {
    const enemy = generateEnemy('giantSpider');
    expect(enemy?.creatureClass).toBe('Beast');
    expect(enemy?.equipment.weapon).toBeNull();
    expect(enemy?.equipment.armor).toBeNull();
    // Beast gets +2 natural armor (base 10 + 2 DEX mod minimum + 2 natural = 14 minimum)
    expect(enemy?.ac).toBeGreaterThanOrEqual(12);
  });

  it('should generate wraith with spell slots', () => {
    const enemy = generateEnemy('wraith');
    expect(enemy?.resources.spellSlots).toBeDefined();
    expect(enemy?.resources.spellSlots?.level0).toEqual({ max: 3, current: 3 });
    expect(enemy?.resources.spellSlots?.level1).toEqual({ max: 2, current: 2 });
  });

  it('should respect level override', () => {
    const enemy = generateEnemy('bandit', { level: 5 });
    expect(enemy?.level).toBe(5);
  });

  it('should generate randomized attributes within range', () => {
    const enemies = Array.from({ length: 10 }, () => generateEnemy('bandit'));

    // Check that we got some variation
    const strValues = enemies.map(e => e?.attributes.STR);
    const uniqueStrs = new Set(strValues);

    // With 10 rolls in range 12-14, we should see some variation
    expect(uniqueStrs.size).toBeGreaterThan(1);
  });

  it('should have valid loot table ID', () => {
    const enemy = generateEnemy('bandit');
    expect(enemy?.lootTableId).toBe('bandit_loot');
  });

  it('should deep copy equipment to prevent template mutation', () => {
    const enemy1 = generateEnemy('bandit');
    const enemy2 = generateEnemy('bandit');

    // Modify enemy1's equipment
    if (enemy1?.equipment.weapon) {
      enemy1.equipment.weapon.damage = '9d9';
    }

    // Enemy2 should be unaffected
    expect(enemy2?.equipment.weapon?.damage).toBe('1d6');
  });
});
```

---

## Phase 4: Update Combat Flow

### Task 4.1: Update Combat Store to Use Enemy Generation

**File:** `src/stores/combatStore.ts` (MODIFY)

**Changes:**
1. Import `generateEnemy` instead of `getEnemy`
2. Update `startCombat` to generate enemies
3. Add loot rolling when enemy is defeated
4. Add loot to combat log

**Key modifications:**
```typescript
import { generateEnemy } from '../utils/enemyGeneration';
import { rollLoot, formatLootMessage } from '../utils/loot';

// In startCombat:
const enemy = generateEnemy(enemyId);
if (!enemy) {
  throw new Error(`Failed to generate enemy: ${enemyId}`);
}

// When enemy is defeated (in executeTurn or wherever winner is determined):
if (newState.winner === 'player') {
  const loot = rollLoot(newState.enemy.lootTableId);
  const lootMessage = formatLootMessage(loot);

  // Add loot to combat log
  newState.log.push({
    turn: newState.turn,
    actor: 'system',
    message: lootMessage,
  });

  // Apply loot to player (gold, items)
  // This will require access to characterStore or passing player state
}
```

**Unit Tests:** Update `src/__tests__/stores/combatStore.test.ts`
- Test that combat starts with generated enemies
- Test that loot is rolled when player wins
- Test that loot message appears in combat log
- Test that no loot is rolled when enemy wins

---

### Task 4.2: Update Combat Utilities (if needed)

**File:** `src/utils/combat.ts` (CHECK)

**Validation:**
- Ensure combat utilities work with Creature type
- Verify natural attack handling (null weapon)
- Test Creature class bonuses are applied

---

### Task 4.3: Backward Compatibility Wrapper

**File:** `src/data/enemies.ts` (MODIFY - temporary)

**Add wrapper function:**
```typescript
import { generateEnemy } from '../utils/enemyGeneration';
import type { Creature } from '../types/creature';

/**
 * @deprecated Use generateEnemy() from utils/enemyGeneration.ts instead
 * This wrapper exists for backward compatibility during migration
 */
export function getEnemy(enemyId: string): Creature | null {
  return generateEnemy(enemyId);
}
```

This allows existing code to continue working during migration.

---

## Phase 5: Cleanup

### Task 5.1: Remove Old Enemy Definitions

**File:** `src/data/enemies.ts` (DELETE)

**Before deletion:**
1. Search codebase for imports from `data/enemies`
2. Replace with `utils/enemyGeneration`
3. Update all `getEnemy()` calls to `generateEnemy()`

**Bash command to find usages:**
```bash
grep -r "from.*enemies" src/
grep -r "getEnemy" src/
```

---

### Task 5.2: Remove Old Creature Definition

**File:** `src/types/combat.ts` (ALREADY DONE)

Verify that Creature is imported from `./creature` instead of defined locally.

---

### Task 5.3: Final Validation

Run full test suite and build:
```bash
npm test
npm run build
npm run lint
```

---

## Testing Summary

### New Test Files Created:
1. `src/__tests__/data/creatureClasses.test.ts` (6 tests)
2. `src/__tests__/data/lootTables.test.ts` (6 tests)
3. `src/__tests__/utils/loot.test.ts` (9 tests)
4. `src/__tests__/data/enemyTemplates.test.ts` (9 tests)
5. `src/__tests__/utils/enemyGeneration.test.ts` (9 tests)

### Modified Test Files:
- `src/__tests__/stores/combatStore.test.ts` - Add loot integration tests

**Total new tests:** ~40 tests

---

## Implementation Order (Recommended)

Execute in this sequence to maintain non-breaking changes:

1. **Task 2.1** - CreatureClass traits (independent)
2. **Task 2.2** - Loot types (independent)
3. **Task 2.3** - Loot tables (depends on 2.2)
4. **Task 2.4** - Loot utility (depends on 2.3)
5. **Task 2.5** - Enemy template types (independent)
6. **Task 2.6** - Enemy templates (depends on 2.5)
7. **Task 2.7** - Enemy generation (depends on 2.1, 2.6)
8. **Task 4.3** - Backward compatibility wrapper (depends on 2.7)
9. **Task 4.1** - Update combat store (depends on 2.7, 2.4)
10. **Task 4.2** - Validate combat utils (testing)
11. **Task 5.1** - Remove old enemies.ts (after all migrations)
12. **Task 5.3** - Final validation

---

## Success Criteria

- ✅ All new unit tests pass
- ✅ Existing tests continue to pass
- ✅ Build succeeds with no TypeScript errors
- ✅ Combat system generates varied enemies
- ✅ Loot drops when enemies are defeated
- ✅ No references to old `data/enemies.ts` remain
- ✅ Creature class bonuses apply correctly

---

## Notes

- **Non-breaking until Phase 4:** Phases 2-3 add new code without modifying existing behavior
- **Gradual migration:** Old `getEnemy()` wrapper allows incremental transition
- **Test-driven:** Each task includes comprehensive unit tests
- **Rollback safe:** Each phase can be committed independently for easy rollback

---

## Next Steps After Implementation

1. Add more enemy templates (Phase 1 mentions 6 enemy types total)
2. Expand loot tables with more varied drops
3. Add multiple avatar variants per enemy type
4. Implement enemy level scaling based on player level
5. Add rare/elite enemy variants with better stats and loot
