# Enemy System Redesign

**Date:** 2025-12-16
**Status:** Design Complete, Ready for Implementation

## Overview

Redesign the enemy modeling system to separate player Characters from enemy Creatures while maintaining shared combat mechanics. Add support for creature types, randomized enemy generation, and loot drops.

## Requirements

1. Separate Character and Creature types (no more player-only fields on enemies)
2. Add CreatureClass ('Beast', 'Humanoid', 'Undead') with mechanical effects
3. Randomize attributes and avatars for enemy variety
4. Implement loot table system with probability-based drops
5. Support optional equipment (null weapons/armor for natural attackers)

## Architecture

### 1. Type Hierarchy with Entity Base

**Entity** is the foundation for all combatants:

```typescript
// types/entity.ts - NEW FILE
interface Entity {
  name: string;
  avatarPath: string;
  level: number;
  attributes: Attributes;
  hp: number;
  maxHp: number;
  ac: number;
  bab: number;
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
  skills: SkillRanks;
  feats: Feat[];
  equipment: Equipment;
  resources: Resources; // Spell slots, abilities
}
```

**Character** extends Entity with player-specific features:

```typescript
// types/character.ts - MODIFIED
interface Character extends Entity {
  class: CharacterClass; // 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric'
  background?: Background;
  traits?: CharacterTrait[];
  gold?: number;
  inventory?: InventoryItem[];
  maxInventorySlots?: number;
  startingQuirk?: StartingQuirk;
  mechanicsLocked?: boolean;
}
```

**Creature** extends Entity with enemy-specific features:

```typescript
// types/creature.ts - NEW FILE (move from combat.ts)
export type CreatureClass = 'Beast' | 'Humanoid' | 'Undead';

interface Creature extends Entity {
  creatureClass: CreatureClass;
  taunts?: {
    onCombatStart?: string[];
    onPlayerMiss?: string[];
    onEnemyHit?: string[];
    onLowHealth?: string[];
  };
  lootTableId: string; // Links to loot table for drops
}
```

### 2. CreatureClass Mechanics

Each CreatureClass provides mechanical bonuses:

```typescript
// data/creatureClasses.ts - NEW FILE
interface CreatureClassTraits {
  name: CreatureClass;
  displayName: string;
  description: string;
  mechanicalEffects: {
    saveBonus?: { fortitude?: number; reflex?: number; will?: number };
    naturalArmorBonus?: number;
    immunities?: string[]; // e.g., ['poison', 'disease']
  };
}

export const CREATURE_CLASS_TRAITS: Record<CreatureClass, CreatureClassTraits> = {
  Beast: {
    name: 'Beast',
    displayName: 'Beast',
    description: 'Animals and monstrous creatures',
    mechanicalEffects: {
      naturalArmorBonus: 2, // Tough hide/exoskeleton
    },
  },

  Humanoid: {
    name: 'Humanoid',
    displayName: 'Humanoid',
    description: 'Human-like creatures',
    mechanicalEffects: {}, // No inherent bonuses
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
```

**Equipment handling:** No rigid rules. Creatures define equipment directly or leave as `null`/`[]`:
- Giant Spider: `weapon: null, armor: null` (natural attacks)
- Goblin (Beast): `weapon: { ... }, armor: { ... }` (tool-using beast)
- Skeleton (Undead): `weapon: { ... }, shield: { ... }` (armed undead)

### 3. Enemy Templates and Randomization

Enemy definitions become **templates** that generate varied instances:

```typescript
// types/enemyTemplate.ts - NEW FILE
interface AttributeRange {
  min: number;
  max: number;
}

interface EnemyTemplate {
  id: string; // 'bandit', 'skeleton', etc.
  baseName: string; // 'Bandit' - can be prefixed with variants
  creatureClass: CreatureClass;

  // Multiple avatars to choose from randomly
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

  // Static properties (same for all instances)
  baseClass: CharacterClass; // For BAB/save calculations
  equipment: Equipment; // Template equipment (can have null fields)
  skills: SkillRanks;
  feats: Feat[];
  taunts?: { ... };
  lootTableId: string;
}
```

**Generation function:**

```typescript
// utils/enemyGeneration.ts - NEW FILE
function generateEnemy(templateId: string, options?: { level?: number }): Creature {
  const template = ENEMY_TEMPLATES[templateId];

  // Roll level (or use specified)
  const level = options?.level ?? rollBetween(template.levelRange.min, template.levelRange.max);

  // Roll attributes within ranges
  const attributes = {
    STR: rollBetween(template.attributeRanges.STR.min, template.attributeRanges.STR.max),
    DEX: rollBetween(template.attributeRanges.DEX.min, template.attributeRanges.DEX.max),
    // ... etc
  };

  // Pick random avatar
  const avatarPath = randomPick(template.avatarPaths);

  // Calculate derived stats (HP, AC, BAB, saves) from attributes + level
  const derived = calculateDerivedStats(attributes, level, template.baseClass, template.creatureClass);

  return {
    name: template.baseName,
    avatarPath,
    level,
    creatureClass: template.creatureClass,
    attributes,
    ...derived,
    equipment: deepCopy(template.equipment),
    skills: { ...template.skills },
    feats: [...template.feats],
    taunts: template.taunts,
    lootTableId: template.lootTableId,
  };
}
```

**Benefits:**
- Each encounter generates a fresh enemy with varied stats
- Same template at different levels = different difficulty
- Multiple avatars = visual variety
- Can create specific variants (e.g., "Bandit Captain" template with higher stat ranges)

### 4. Loot Tables and Drop System

Loot tables define probability-based drops:

```typescript
// types/loot.ts - NEW FILE
interface LootEntry {
  type: 'gold' | 'item' | 'weapon' | 'armor';
  chance: number; // 0.0 to 1.0 (e.g., 0.8 = 80% chance)

  // For gold
  goldRange?: { min: number; max: number };

  // For items/equipment
  itemId?: string; // References item/weapon/armor definition
  quantity?: number; // Default 1
}

interface LootTable {
  id: string;
  entries: LootEntry[];
}
```

**Example loot tables:**

```typescript
// data/lootTables.ts - NEW FILE
export const LOOT_TABLES: Record<string, LootTable> = {
  bandit_loot: {
    id: 'bandit_loot',
    entries: [
      { type: 'gold', chance: 0.8, goldRange: { min: 3, max: 8 } },
      { type: 'weapon', chance: 0.2, itemId: 'dagger' },
      { type: 'item', chance: 0.1, itemId: 'healing_potion' },
    ],
  },

  skeleton_loot: {
    id: 'skeleton_loot',
    entries: [
      { type: 'gold', chance: 0.3, goldRange: { min: 1, max: 3 } },
      { type: 'item', chance: 0.05, itemId: 'bone_dust' },
    ],
  },

  spider_loot: {
    id: 'spider_loot',
    entries: [
      { type: 'item', chance: 0.6, itemId: 'spider_silk' },
      { type: 'item', chance: 0.3, itemId: 'venom_gland' },
    ],
  },
};
```

**Loot rolling:**

```typescript
// utils/loot.ts - NEW FILE
function rollLoot(lootTableId: string): LootDrop[] {
  const table = LOOT_TABLES[lootTableId];
  const drops: LootDrop[] = [];

  for (const entry of table.entries) {
    if (Math.random() <= entry.chance) {
      if (entry.type === 'gold') {
        const amount = rollBetween(entry.goldRange.min, entry.goldRange.max);
        drops.push({ type: 'gold', amount });
      } else {
        drops.push({
          type: entry.type,
          itemId: entry.itemId,
          quantity: entry.quantity ?? 1
        });
      }
    }
  }

  return drops;
}
```

**Usage:**
- When enemy defeated: `const loot = rollLoot(enemy.lootTableId)`
- Automatically added to player inventory/gold
- Combat log shows: "You obtained: 5 gold, Dagger"

### 5. Equipment and Resources

**Equipment supports optional fields:**

```typescript
// types/equipment.ts - MODIFIED
export interface Equipment {
  weapon: Weapon | null;      // null for natural attacks
  armor: Armor | null;         // null for natural armor
  shield: Shield | null;       // null for no shield
  items: InventoryItem[];      // empty array [] for no items
}
```

**Resources included in Entity for spellcasting:**

```typescript
// In Entity interface
resources: Resources; // Spell slots, abilities
```

**Examples:**

```typescript
// Beast with natural weapons (Giant Spider)
equipment: {
  weapon: null,
  armor: null,
  shield: null,
  items: [],
}
resources: {
  abilities: [],
  spellSlots: undefined,
}

// Spellcasting creature (Wraith - Undead Wizard)
equipment: {
  weapon: null, // Life-draining touch
  armor: null,
  shield: null,
  items: [],
}
resources: {
  abilities: [],
  spellSlots: {
    level0: { max: 3, current: 3 },
    level1: { max: 2, current: 2 },
  },
}
```

## File Organization

### New files to create:

```
src/types/entity.ts          - Base Entity interface
src/types/creature.ts        - Creature interface + CreatureClass type
src/types/enemyTemplate.ts   - EnemyTemplate interface
src/types/loot.ts            - LootTable and LootEntry interfaces

src/data/creatureClasses.ts  - CREATURE_CLASS_TRAITS definitions
src/data/enemyTemplates.ts   - Enemy template definitions
src/data/lootTables.ts       - Loot table definitions

src/utils/enemyGeneration.ts - generateEnemy() function
src/utils/loot.ts            - rollLoot() function
```

### Files to modify:

```
src/types/character.ts       - Extend Entity instead of defining all fields
src/types/combat.ts          - Remove Creature (moved to creature.ts)
src/types/equipment.ts       - Explicit null support for weapon/armor/shield

src/data/enemies.ts          - DEPRECATED (replaced by enemyTemplates.ts)
src/stores/combatStore.ts    - Use generateEnemy() when starting combat
```

## Migration Strategy

### Phase 1: Add new types (non-breaking)
- Create `types/entity.ts`
- Create `types/creature.ts` with new Creature interface
- Create `types/enemyTemplate.ts`, `types/loot.ts`
- No existing code breaks yet

### Phase 2: Add data and utils (non-breaking)
- Create `data/creatureClasses.ts`
- Create `data/enemyTemplates.ts` (convert existing enemies to templates)
- Create `data/lootTables.ts`
- Create `utils/enemyGeneration.ts`, `utils/loot.ts`
- Old `data/enemies.ts` still works

### Phase 3: Refactor Character to extend Entity
- Update `types/character.ts` to `extends Entity`
- Update `types/equipment.ts` for explicit nulls
- Fix TypeScript errors in combat utils

### Phase 4: Update combat flow
- Modify `combatStore.startCombat()` to call `generateEnemy(templateId)`
- Integrate `rollLoot()` when enemy defeated
- Test thoroughly

### Phase 5: Cleanup
- Remove `data/enemies.ts`
- Remove old Creature definition from `combat.ts`

### Backward compatibility:
- Keep `getEnemy()` wrapper that calls `generateEnemy()` internally during migration
- Gradual migration prevents breaking changes

## Benefits

1. **Clean separation:** Characters and Creatures no longer share irrelevant fields
2. **Type safety:** Equipment properly typed as nullable
3. **Variety:** Each combat encounter generates unique enemies
4. **Scalability:** Easy to add new creature types, templates, and loot tables
5. **Spellcasting support:** Both players and enemies can cast spells
6. **Flexible equipment:** Natural attackers, armed humanoids, and everything in between

## Next Steps

1. Create detailed implementation plan with specific tasks
2. Set up git worktree for isolated development
3. Implement in phases following migration strategy
4. Write tests for enemy generation and loot rolling
5. Update existing enemies to use template system
