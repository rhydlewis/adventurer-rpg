# Enemy Spell Casting Implementation Plan

**Date**: 2025-12-29
**Status**: Planning
**Branch**: `claude/add-enemy-spells-V7WFs`

## Overview

Enable enemies to cast spells during combat, making encounters more challenging and diverse. Starting with Lich and Wraith enemies as examples, implementing new spells (Paralyzing Touch, Thunderwave) alongside existing spells (Ray of Frost).

## Problem Statement

Currently, enemies can only perform melee attacks during combat, even when they have spell slots allocated (Wraith and Lich have Wizard baseClass and receive spell slots during generation). The spell casting system is fully functional for player characters, but there is no enemy AI or combat integration to allow enemies to cast spells.

### Current State Analysis

**What Works:**
- ✅ Spell slots are generated for Wizard/Cleric enemies (`src/utils/enemyGeneration.ts:181-190`)
- ✅ Spell casting system works for any Entity (`src/utils/spellcasting.ts`)
- ✅ Player characters can cast spells successfully
- ✅ Infrastructure for attack spells, save spells, buffs, and conditions exists

**What's Missing:**
- ❌ Enemy combat logic only performs attacks (`src/utils/combat.ts:634-648`)
- ❌ No spell lists defined in enemy templates
- ❌ No AI decision logic for choosing between attack and spell casting
- ❌ No spell selection strategy for enemies
- ❌ Missing spells: Paralyzing Touch and Thunderwave

### Affected Enemies

**Wraith** (`src/data/enemies.json:78-115`):
- `baseClass: "Wizard"`
- High INT (15-17), WIS (13-15)
- Currently has spell slots but can't use them
- Thematically appropriate for necromancy spells

**Lich** (`src/data/enemies.json:331-371`):
- `baseClass: "Wizard"`
- Very high INT (19-20)
- Boss-level enemy (level 20-22)
- Should have access to more powerful spells

## Design Goals

1. **Additive, not destructive**: Don't break existing combat mechanics
2. **Extensible**: Make it easy to add spells to other enemies in the future
3. **Balanced**: Enemies should be more challenging but not unfair
4. **Clear feedback**: Players should understand what spell was cast
5. **Type-safe**: Leverage TypeScript for compile-time safety

## New Spells

### 1. Paralyzing Touch

**Type**: Necromancy cantrip (Level 0)
**Mechanic**: Melee spell attack
**Effect**: 1d3 necrotic damage + Stunned condition (1 turn) on hit
**Save**: Fortitude save negates Stunned condition
**Thematic**: Appropriate for undead enemies (Wraith, Lich)
**Balance**: Low damage but powerful debuff

```typescript
export const PARALYZING_TOUCH: Spell = {
  id: 'paralyzing_touch',
  name: 'Paralyzing Touch',
  level: 0,
  school: 'necromancy',
  target: 'single',
  effect: {
    type: 'damage',
    damageDice: '1d3',
    damageType: 'necrotic',
  },
  savingThrow: {
    type: 'fortitude',
    onSuccess: 'negates_condition', // Damage still applies, condition negated
  },
  description: 'A touch of necrotic energy paralyzes your foe. Melee spell attack for 1d3 necrotic damage, Fortitude save or be Stunned for 1 turn.',
};
```

### 2. Thunderwave

**Type**: Evocation spell (Level 1)
**Mechanic**: Save-based spell
**Effect**: 2d6 thunder damage
**Save**: Fortitude save for half damage
**Thematic**: Powerful area-effect spell for boss enemies
**Balance**: Consumes spell slot, moderate damage

```typescript
export const THUNDERWAVE: Spell = {
  id: 'thunderwave',
  name: 'Thunderwave',
  level: 1,
  school: 'evocation',
  target: 'single', // Note: In full D&D this is area, simplified for our system
  effect: {
    type: 'damage',
    damageDice: '2d6',
    damageType: 'thunder',
  },
  savingThrow: {
    type: 'fortitude',
    onSuccess: 'half',
  },
  description: 'A wave of thunderous force sweeps out from you. Fortitude save for half damage.',
};
```

### 3. Ray of Frost (Existing)

**Type**: Evocation cantrip (Level 0)
**Mechanic**: Ranged spell attack
**Effect**: 1d3 cold damage
**Already implemented**: `src/data/spells.ts:7-19`

## Implementation Plan

### Phase 0: Migrate Spells to JSON + Zod Schema

**Rationale**: Follow established pattern for game content (enemies, weapons, armor, items). This provides:
- Build-time validation via Zod schemas
- Separation of data from code
- Easier content editing (non-programmers can add spells)
- Consistent architecture across all game content

#### 0.1 Create Spell Zod Schema

**File**: `src/schemas/spell.schema.ts` (new file)

```typescript
import { z } from 'zod';

/**
 * Spell level enum (0 = cantrip, 1-9 = leveled spells)
 */
const SpellLevelSchema = z.union([
  z.literal(0),
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
]);

/**
 * Spell school enum
 */
const SpellSchoolSchema = z.enum([
  'evocation',
  'conjuration',
  'enchantment',
  'abjuration',
  'transmutation',
  'necromancy',
  'divination',
  'illusion',
]);

/**
 * Damage type enum
 */
const DamageTypeSchema = z.enum([
  'cold',
  'fire',
  'acid',
  'radiant',
  'force',
  'necrotic',
  'thunder',
  'lightning',
  'poison',
  'slashing',
  'piercing',
  'bludgeoning',
]);

/**
 * Spell target enum
 */
const SpellTargetSchema = z.enum(['self', 'single', 'area']);

/**
 * Save type enum
 */
const SaveTypeSchema = z.enum(['fortitude', 'reflex', 'will']);

/**
 * Spell effect schemas (discriminated union based on type)
 */
const DamageEffectSchema = z.object({
  type: z.literal('damage'),
  damageDice: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Damage must be dice notation'),
  damageType: DamageTypeSchema,
});

const HealEffectSchema = z.object({
  type: z.literal('heal'),
  healDice: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Heal must be dice notation'),
});

const BuffEffectSchema = z.object({
  type: z.literal('buff'),
  buffType: z.enum(['attack', 'save', 'ac', 'damage']),
  buffAmount: z.number().int(),
  buffDuration: z.number().int().positive(),
});

const ConditionEffectSchema = z.object({
  type: z.literal('condition'),
  conditionType: z.string().min(1),
  conditionDuration: z.number().int().positive(),
});

const SpellEffectSchema = z.discriminatedUnion('type', [
  DamageEffectSchema,
  HealEffectSchema,
  BuffEffectSchema,
  ConditionEffectSchema,
]);

/**
 * Saving throw schema
 */
const SavingThrowSchema = z.object({
  type: SaveTypeSchema,
  onSuccess: z.enum(['negates', 'half', 'partial']),
});

/**
 * Schema for a single spell definition
 *
 * Validates:
 * - All required fields present
 * - Spell level is valid (0-9)
 * - School and target are valid enums
 * - Effect structure matches type
 * - Saving throw (if present) is valid
 */
export const SpellSchema = z.object({
  id: z.string().min(1, 'Spell ID cannot be empty'),
  name: z.string().min(1, 'Spell name cannot be empty'),
  level: SpellLevelSchema,
  school: SpellSchoolSchema,
  target: SpellTargetSchema,
  effect: SpellEffectSchema,
  savingThrow: SavingThrowSchema.optional(),
  description: z.string().min(1, 'Description cannot be empty'),
});

/**
 * Schema for the spells.json file structure
 *
 * Format: Record<spellId, Spell>
 */
export const SpellsSchema = z.record(
  z.string().min(1, 'Spell key cannot be empty'),
  SpellSchema
);

/**
 * TypeScript types inferred from schema
 */
export type SpellSchemaType = z.infer<typeof SpellSchema>;
export type SpellEffectSchemaType = z.infer<typeof SpellEffectSchema>;
```

#### 0.2 Create Spells JSON Data File

**File**: `src/data/spells.json` (new file)

```json
{
  "ray_of_frost": {
    "id": "ray_of_frost",
    "name": "Ray of Frost",
    "level": 0,
    "school": "evocation",
    "target": "single",
    "effect": {
      "type": "damage",
      "damageDice": "1d3",
      "damageType": "cold"
    },
    "description": "A ray of freezing air and ice shoots toward your target. Ranged spell attack."
  },
  "acid_splash": {
    "id": "acid_splash",
    "name": "Acid Splash",
    "level": 0,
    "school": "conjuration",
    "target": "single",
    "effect": {
      "type": "damage",
      "damageDice": "1d3",
      "damageType": "acid"
    },
    "description": "You hurl a bubble of acid at your target. Ranged spell attack."
  },
  "daze": {
    "id": "daze",
    "name": "Daze",
    "level": 0,
    "school": "enchantment",
    "target": "single",
    "effect": {
      "type": "condition",
      "conditionType": "Stunned",
      "conditionDuration": 1
    },
    "savingThrow": {
      "type": "will",
      "onSuccess": "negates"
    },
    "description": "Daze a creature with 5 HP or less. Will save negates. Stunned for 1 turn."
  },
  "divine_favor": {
    "id": "divine_favor",
    "name": "Divine Favor",
    "level": 0,
    "school": "divination",
    "target": "self",
    "effect": {
      "type": "buff",
      "buffType": "attack",
      "buffAmount": 1,
      "buffDuration": 1
    },
    "description": "Divine power guides your next attack or saving throw (+1)."
  },
  "resistance": {
    "id": "resistance",
    "name": "Resistance",
    "level": 0,
    "school": "abjuration",
    "target": "self",
    "effect": {
      "type": "buff",
      "buffType": "save",
      "buffAmount": 1,
      "buffDuration": 1
    },
    "description": "You gain divine protection on your next saving throw (+1)."
  },
  "sacred_flame": {
    "id": "sacred_flame",
    "name": "Sacred Flame",
    "level": 0,
    "school": "evocation",
    "target": "single",
    "effect": {
      "type": "damage",
      "damageDice": "1d4",
      "damageType": "radiant"
    },
    "savingThrow": {
      "type": "will",
      "onSuccess": "negates"
    },
    "description": "Flame-like radiance descends on a creature. Will save negates."
  },
  "paralyzing_touch": {
    "id": "paralyzing_touch",
    "name": "Paralyzing Touch",
    "level": 0,
    "school": "necromancy",
    "target": "single",
    "effect": {
      "type": "damage",
      "damageDice": "1d3",
      "damageType": "necrotic"
    },
    "savingThrow": {
      "type": "fortitude",
      "onSuccess": "negates"
    },
    "description": "A touch of necrotic energy paralyzes your foe. Melee spell attack for 1d3 necrotic damage, Fortitude save or be Stunned for 1 turn."
  },
  "thunderwave": {
    "id": "thunderwave",
    "name": "Thunderwave",
    "level": 1,
    "school": "evocation",
    "target": "single",
    "effect": {
      "type": "damage",
      "damageDice": "2d6",
      "damageType": "thunder"
    },
    "savingThrow": {
      "type": "fortitude",
      "onSuccess": "half"
    },
    "description": "A wave of thunderous force sweeps out from you. Fortitude save for half damage."
  }
}
```

**Note**: Paralyzing Touch has a condition effect that needs special handling. For now, it's defined with damage + save, and the condition application logic will be in `spellcasting.ts`.

#### 0.3 Create Spell Loader with Validation

**File**: `src/data/spells.ts` (replace existing file)

```typescript
import spellsJson from './spells.json';
import { SpellsSchema } from '../schemas/spell.schema';
import type { Spell } from '../types';

// Validate spells at build time
const validatedSpells = SpellsSchema.parse(spellsJson);

/**
 * All available spells in the game
 * Loaded from spells.json and validated with Zod schema
 */
export const SPELLS: Record<string, Spell> = Object.fromEntries(
  Object.entries(validatedSpells).map(([id, spell]) => [
    id,
    spell as Spell,
  ])
);

/**
 * Get a spell by ID
 * @param id - The spell ID (e.g., "ray_of_frost")
 * @returns The spell object or undefined if not found
 */
export function getSpellById(id: string): Spell | undefined {
  return SPELLS[id];
}

/**
 * Get all spells
 * @returns Array of all spells
 */
export function getAllSpells(): Spell[] {
  return Object.values(SPELLS);
}

/**
 * Wizard Cantrips (Level 0, at-will)
 */
export const WIZARD_CANTRIPS: Spell[] = [
  SPELLS.ray_of_frost,
  SPELLS.acid_splash,
  SPELLS.daze,
];

/**
 * Cleric Cantrips (Level 0, at-will)
 */
export const CLERIC_CANTRIPS: Spell[] = [
  SPELLS.divine_favor,
  SPELLS.resistance,
  SPELLS.sacred_flame,
];

/**
 * Get cantrips for a character class
 */
export function getCantripsForClass(className: string): Spell[] {
  switch (className) {
    case 'Wizard':
      return WIZARD_CANTRIPS;
    case 'Cleric':
      return CLERIC_CANTRIPS;
    default:
      return [];
  }
}
```

#### 0.4 Write Schema Tests

**File**: `src/__tests__/schemas/spell.schema.test.ts` (new file)

```typescript
import { describe, it, expect } from 'vitest';
import { SpellSchema, SpellsSchema } from '../../schemas/spell.schema';

describe('SpellSchema', () => {
  it('should validate a valid damage spell', () => {
    const validSpell = {
      id: 'fireball',
      name: 'Fireball',
      level: 3,
      school: 'evocation',
      target: 'area',
      effect: {
        type: 'damage',
        damageDice: '8d6',
        damageType: 'fire',
      },
      description: 'A bright streak flashes from your pointing finger.',
    };

    expect(() => SpellSchema.parse(validSpell)).not.toThrow();
  });

  it('should validate a spell with saving throw', () => {
    const spellWithSave = {
      id: 'thunderwave',
      name: 'Thunderwave',
      level: 1,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: '2d6',
        damageType: 'thunder',
      },
      savingThrow: {
        type: 'fortitude',
        onSuccess: 'half',
      },
      description: 'A wave of thunderous force.',
    };

    expect(() => SpellSchema.parse(spellWithSave)).not.toThrow();
  });

  it('should reject invalid damage dice format', () => {
    const invalidSpell = {
      id: 'broken',
      name: 'Broken Spell',
      level: 0,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: 'invalid',
        damageType: 'fire',
      },
      description: 'Broken',
    };

    expect(() => SpellSchema.parse(invalidSpell)).toThrow();
  });

  it('should reject invalid spell level', () => {
    const invalidLevel = {
      id: 'overpowered',
      name: 'Overpowered Spell',
      level: 99,
      school: 'evocation',
      target: 'single',
      effect: {
        type: 'damage',
        damageDice: '1d6',
        damageType: 'fire',
      },
      description: 'Too powerful',
    };

    expect(() => SpellSchema.parse(invalidLevel)).toThrow();
  });

  it('should validate buff spells', () => {
    const buffSpell = {
      id: 'divine_favor',
      name: 'Divine Favor',
      level: 0,
      school: 'divination',
      target: 'self',
      effect: {
        type: 'buff',
        buffType: 'attack',
        buffAmount: 1,
        buffDuration: 1,
      },
      description: 'Divine power guides your attack.',
    };

    expect(() => SpellSchema.parse(buffSpell)).not.toThrow();
  });

  it('should validate condition spells', () => {
    const conditionSpell = {
      id: 'hold_person',
      name: 'Hold Person',
      level: 2,
      school: 'enchantment',
      target: 'single',
      effect: {
        type: 'condition',
        conditionType: 'Paralyzed',
        conditionDuration: 3,
      },
      savingThrow: {
        type: 'will',
        onSuccess: 'negates',
      },
      description: 'You attempt to paralyze a humanoid.',
    };

    expect(() => SpellSchema.parse(conditionSpell)).not.toThrow();
  });
});

describe('SpellsSchema', () => {
  it('should validate a record of spells', () => {
    const validSpells = {
      ray_of_frost: {
        id: 'ray_of_frost',
        name: 'Ray of Frost',
        level: 0,
        school: 'evocation',
        target: 'single',
        effect: {
          type: 'damage',
          damageDice: '1d3',
          damageType: 'cold',
        },
        description: 'A ray of freezing air.',
      },
      fireball: {
        id: 'fireball',
        name: 'Fireball',
        level: 3,
        school: 'evocation',
        target: 'area',
        effect: {
          type: 'damage',
          damageDice: '8d6',
          damageType: 'fire',
        },
        description: 'A bright streak flashes.',
      },
    };

    expect(() => SpellsSchema.parse(validSpells)).not.toThrow();
  });

  it('should reject if any spell is invalid', () => {
    const invalidSpells = {
      valid: {
        id: 'valid',
        name: 'Valid Spell',
        level: 0,
        school: 'evocation',
        target: 'single',
        effect: {
          type: 'damage',
          damageDice: '1d6',
          damageType: 'fire',
        },
        description: 'Valid',
      },
      invalid: {
        id: 'invalid',
        name: 'Invalid Spell',
        level: 0,
        school: 'evocation',
        target: 'single',
        effect: {
          type: 'damage',
          damageDice: 'broken',
          damageType: 'fire',
        },
        description: 'Invalid',
      },
    };

    expect(() => SpellsSchema.parse(invalidSpells)).toThrow();
  });
});
```

#### 0.5 Update Spell Type Definition

**File**: `src/types/spell.ts`

**First**, add missing damage types to `DamageType` enum:

```typescript
export type DamageType =
  | 'cold'
  | 'fire'
  | 'acid'
  | 'radiant'
  | 'force'
  | 'necrotic'    // NEW - for Paralyzing Touch
  | 'thunder'     // NEW - for Thunderwave
  | 'lightning'   // NEW - for future spells
  | 'poison'      // NEW - for future spells
  | 'slashing'
  | 'piercing'
  | 'bludgeoning';
```

**Then**, update SpellEffect to handle condition effects that may be applied separately:

```typescript
/**
 * Spell effect definition
 * Different effects based on type
 */
export interface SpellEffect {
  type: SpellEffectType;
  // Damage effect
  damageDice?: string; // e.g., "1d3", "1d4"
  damageType?: DamageType;
  // Heal effect
  healDice?: string; // e.g., "1d8+1"
  // Buff effect
  buffType?: 'attack' | 'save' | 'ac' | 'damage';
  buffAmount?: number;
  buffDuration?: number; // turns
  // Condition effect
  conditionType?: string; // e.g., "Stunned", "Blinded"
  conditionDuration?: number; // turns
  // Special conditions (e.g., Daze only works on enemies ≤5 HP)
  targetRestriction?: (target: { hp: number }) => boolean;
}
```

**Note**: The `targetRestriction` function is only for runtime validation and won't be in the JSON. We may need to handle Daze's HP restriction separately in the spell casting logic.

### Phase 1: Update Enemy Templates & Types

#### 1.1 Update EnemyTemplate Type

**File**: `src/types/enemyTemplate.ts`

Add optional spell list field:

```typescript
export interface EnemyTemplate {
    id: string;
    baseName: string;
    creatureClass: CreatureClass;
    avatarPaths: string[];
    levelRange: { min: number; max: number };
    attributeRanges: {
        STR: AttributeRange;
        DEX: AttributeRange;
        CON: AttributeRange;
        INT: AttributeRange;
        WIS: AttributeRange;
        CHA: AttributeRange;
    };
    baseClass: CharacterClass;
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

    // NEW: Optional spell list for spellcasting enemies
    spellIds?: string[]; // Array of spell IDs (e.g., ["ray_of_frost", "paralyzing_touch"])
}
```

**Rationale**:
- Optional field maintains backward compatibility
- String IDs allow late binding (resolve to Spell objects at runtime)
- Simple array keeps data structure clean

#### 1.2 Update Enemy Data

**File**: `src/data/enemies.json`

Update Wraith (lines 78-115):

```json
{
  "wraith": {
    "id": "wraith",
    "baseName": "Wraith",
    "creatureClass": "Undead",
    "avatarPaths": ["Wraith"],
    "levelRange": { "min": 1, "max": 2 },
    "attributeRanges": {
      "STR": { "min": 5, "max": 7 },
      "DEX": { "min": 15, "max": 17 },
      "CON": { "min": 10, "max": 10 },
      "INT": { "min": 15, "max": 17 },
      "WIS": { "min": 13, "max": 15 },
      "CHA": { "min": 7, "max": 9 }
    },
    "baseClass": "Wizard",
    "equipment": {
      "weaponId": "spectral-touch",
      "armorId": null,
      "shield": null,
      "items": []
    },
    "skills": {
      "Athletics": 0,
      "Stealth": 5,
      "Perception": 4,
      "Arcana": 6,
      "Medicine": 0,
      "Intimidate": 2
    },
    "feats": [],
    "spellIds": ["ray_of_frost", "paralyzing_touch"],  // NEW
    "taunts": {
      "onCombatStart": ["*ethereal wailing*", "Your soul will be mine...", "*appears from shadows*"],
      "onPlayerMiss": ["*phases through attack*", "You cannot touch the dead..."],
      "onEnemyHit": ["*life-draining touch*", "Feel the cold of the grave!"],
      "onLowHealth": ["*fading into mist*", "I shall return...", "*dissipating*"]
    },
    "lootTableId": "wraith_loot"
  }
}
```

Update Lich (lines 331-371):

```json
{
  "lich": {
    "id": "lich",
    "baseName": "Lich",
    "creatureClass": "Undead",
    "avatarPaths": ["Lich"],
    "levelRange": { "min": 20, "max": 22 },
    "attributeRanges": {
      "STR": { "min": 10, "max": 12 },
      "DEX": { "min": 15, "max": 17 },
      "CON": { "min": 15, "max": 17 },
      "INT": { "min": 19, "max": 20 },
      "WIS": { "min": 13, "max": 15 },
      "CHA": { "min": 15, "max": 17 }
    },
    "baseClass": "Wizard",
    "equipment": {
      "weaponId": null,
      "armorId": "natural-armor",
      "shield": {
        "equipped": false,
        "acBonus": 0
      },
      "items": []
    },
    "skills": {
      "Athletics": 0,
      "Stealth": 0,
      "Perception": 9,
      "Arcana": 18,
      "Medicine": 0,
      "Intimidate": 0
    },
    "feats": [],
    "spellIds": ["ray_of_frost", "paralyzing_touch", "thunderwave"],  // NEW
    "taunts": {
      "onCombatStart": ["Your mortal flesh will serve me well...", "*raises skeletal hand*", "Witness true power!"],
      "onPlayerMiss": ["Pathetic mortal!", "*phases through the attack*"],
      "onEnemyHit": ["*paralyzing touch*", "Feel death's embrace!", "Your soul is mine!"],
      "onLowHealth": ["My phylactery ensures my return!", "This form is merely temporary...", "*dark ritual begins*"]
    },
    "lootTableId": "lich_loot"
  }
}
```

### Phase 2: Enemy AI Logic

#### 2.1 Create Enemy AI Module

**File**: `src/utils/enemyAI.ts` (new file)

```typescript
import type { Creature } from '../types';
import type { Character } from '../types';
import type { Spell } from '../types';
import { getSpellById } from '../data/spells';

/**
 * Enemy action types
 */
export type EnemyActionType = 'attack' | 'cast_spell';

/**
 * Decide whether enemy should attack or cast a spell
 *
 * Simple heuristic for Phase 1:
 * - If enemy has spells and spell slots, 50% chance to cast
 * - Otherwise, attack
 *
 * Future improvements:
 * - Tactical decision making (player HP, enemy HP, conditions)
 * - Spell type awareness (buff when full HP, damage when player low)
 * - Difficulty scaling (higher difficulty = smarter AI)
 */
export function selectEnemyAction(
  enemy: Creature,
  player: Character,
  availableSpells: Spell[]
): EnemyActionType {
  // No spells available - must attack
  if (!availableSpells || availableSpells.length === 0) {
    return 'attack';
  }

  // Check if enemy has any spell slots for non-cantrips
  const hasSpellSlots = enemy.resources?.spellSlots && (
    (enemy.resources.spellSlots.level1?.current ?? 0) > 0 ||
    (enemy.resources.spellSlots.level2?.current ?? 0) > 0 ||
    (enemy.resources.spellSlots.level3?.current ?? 0) > 0
  );

  // Has cantrips available - can always cast
  const hasCantrips = availableSpells.some(spell => spell.level === 0);

  // Can't cast anything - must attack
  if (!hasCantrips && !hasSpellSlots) {
    return 'attack';
  }

  // 50% chance to cast spell
  return Math.random() < 0.5 ? 'cast_spell' : 'attack';
}

/**
 * Select which spell to cast from available spells
 *
 * Simple heuristic for Phase 1:
 * - Filter to spells enemy can afford (has slots for)
 * - Random selection from available spells
 *
 * Future improvements:
 * - Prefer high-damage spells when player is low HP
 * - Prefer debuffs when player is high HP
 * - Don't waste spell slots on nearly-dead players
 * - Consider spell save DCs vs player save bonuses
 */
export function selectSpell(
  enemy: Creature,
  player: Character,
  availableSpells: Spell[]
): Spell {
  // Filter to spells enemy can cast
  const castableSpells = availableSpells.filter(spell => {
    // Cantrips always castable
    if (spell.level === 0) {
      return true;
    }

    // Check if enemy has spell slot for this level
    const spellSlots = enemy.resources?.spellSlots;
    if (!spellSlots) {
      return false;
    }

    const slotKey = `level${spell.level}` as keyof typeof spellSlots;
    const slot = spellSlots[slotKey];
    return slot && slot.current > 0;
  });

  // Shouldn't happen (caller should check), but fallback to first spell
  if (castableSpells.length === 0) {
    return availableSpells[0];
  }

  // Random selection
  const randomIndex = Math.floor(Math.random() * castableSpells.length);
  return castableSpells[randomIndex];
}

/**
 * Get available spells for an enemy based on their template's spellIds
 */
export function getEnemySpells(spellIds: string[] | undefined): Spell[] {
  if (!spellIds || spellIds.length === 0) {
    return [];
  }

  const spells: Spell[] = [];
  for (const spellId of spellIds) {
    const spell = getSpellById(spellId);
    if (spell) {
      spells.push(spell);
    }
  }

  return spells;
}
```

**Design decisions**:
- Pure functions for testability
- Simple heuristics for Phase 1 (can enhance later)
- Type-safe with explicit return types
- Defensive programming (check null/undefined)

#### 2.2 Spell Slot Consumption

**File**: `src/utils/spellcasting.ts` (add to existing file)

Add helper function:

```typescript
/**
 * Consume a spell slot for a leveled spell
 * Returns updated entity with spell slot consumed
 *
 * Note: Cantrips (level 0) don't consume slots
 */
export function consumeSpellSlot<T extends Entity>(
  entity: T,
  spellLevel: number
): T {
  // Cantrips don't consume slots
  if (spellLevel === 0) {
    return entity;
  }

  // No spell slots to consume
  if (!entity.resources?.spellSlots) {
    return entity;
  }

  const slotKey = `level${spellLevel}` as keyof Resources['spellSlots'];
  const slot = entity.resources.spellSlots[slotKey];

  // No slot at this level or already at 0
  if (!slot || slot.current <= 0) {
    return entity;
  }

  // Consume slot (immutable update)
  return {
    ...entity,
    resources: {
      ...entity.resources,
      spellSlots: {
        ...entity.resources.spellSlots,
        [slotKey]: {
          ...slot,
          current: slot.current - 1,
        },
      },
    },
  };
}
```

### Phase 3: Combat Integration

#### 3.1 Modify resolveCombatRound

**File**: `src/utils/combat.ts`

Current code (lines 634-648):

```typescript
// Enemy attacks - check for auto-block first
let enemyAttack;
if (autoBlockActive) {
  // Auto-block: Attack automatically misses
  enemyAttack = {
    hit: false,
    attackRoll: 0,
    attackTotal: 0,
    output: "Attack automatically blocked!",
  };
  autoBlockActive = false; // Clear after use
} else {
  // Normal attack
  enemyAttack = performAttack(enemy, playerCharacter, enemyConditions, playerConditions, undefined, 'enemy');
}
log.push({
  turn: state.turn,
  actor: 'enemy',
  message: enemyAttack.output,
  taunt: enemyAttack.taunt,
});
```

Replace with:

```typescript
// Import at top of file
import { selectEnemyAction, selectSpell, getEnemySpells } from './enemyAI';
import { castSpell, consumeSpellSlot } from './spellcasting';
import { getSpellById } from '../data/spells';

// ... in resolveCombatRound function ...

// Enemy turn - decide between attack or cast spell
const enemySpells = getEnemySpells(enemy.spellIds);
const enemyAction = selectEnemyAction(enemy, playerCharacter, enemySpells);

let enemyAttack;
if (autoBlockActive) {
  // Auto-block: Attack automatically misses
  enemyAttack = {
    hit: false,
    attackRoll: 0,
    attackTotal: 0,
    output: "Attack automatically blocked!",
  };
  autoBlockActive = false; // Clear after use

  log.push({
    turn: state.turn,
    actor: 'enemy',
    message: enemyAttack.output,
    taunt: enemyAttack.taunt,
  });
} else if (enemyAction === 'cast_spell' && enemySpells.length > 0) {
  // Enemy casts spell
  const spell = selectSpell(enemy, playerCharacter, enemySpells);
  const spellResult = castSpell(enemy, playerCharacter, spell);

  // Log spell casting
  log.push({
    turn: state.turn,
    actor: 'enemy',
    message: spellResult.output,
  });

  // Apply damage if successful
  if (spellResult.success && spellResult.damage) {
    playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - spellResult.damage };
  }

  // Apply conditions if successful
  if (spellResult.success && spellResult.conditionApplied) {
    // Parse condition type and duration from spell effect
    const conditionType = spell.effect.conditionType;
    const duration = spell.effect.conditionDuration ?? 1;

    if (conditionType) {
      playerConditions = applyCondition(playerConditions, conditionType, state.turn, duration);
      log.push({
        turn: state.turn,
        actor: 'system',
        message: `You are ${conditionType}!`,
      });
    }
  }

  // Consume spell slot if leveled spell
  if (spell.level > 0) {
    enemy = consumeSpellSlot(enemy, spell.level);
  }
} else {
  // Normal attack
  enemyAttack = performAttack(enemy, playerCharacter, enemyConditions, playerConditions, undefined, 'enemy');

  log.push({
    turn: state.turn,
    actor: 'enemy',
    message: enemyAttack.output,
    taunt: enemyAttack.taunt,
  });

  // Apply damage if hit
  if (enemyAttack.hit && enemyAttack.damage) {
    playerCharacter = { ...playerCharacter, hp: playerCharacter.hp - enemyAttack.damage };

    // Auto-heal quirk: heal to full HP after first hit
    if (autoHealActive) {
      const healedAmount = playerCharacter.maxHp - playerCharacter.hp;
      playerCharacter = { ...playerCharacter, hp: playerCharacter.maxHp };
      autoHealActive = false; // Deactivate after use
      log.push({
        turn: state.turn,
        actor: 'system',
        message: `Divine power restores you (+${healedAmount} HP)!`,
      });
    }
  }
}
```

**Note**: This may need refactoring to reduce complexity. Consider extracting enemy turn logic to separate function.

#### 3.2 Update Creature Type

**File**: `src/types/creature.ts`

Add spellIds to Creature type if it's generated from EnemyTemplate:

```typescript
export interface Creature extends Entity {
  id: string;
  name: string;
  level: number;
  creatureClass: CreatureClass;
  taunts?: {
    onCombatStart?: string;
    onPlayerMiss?: string;
    onEnemyHit?: string;
    onLowHealth?: string;
  };
  lootTableId: string;
  spellIds?: string[]; // NEW: Spell IDs for spellcasting creatures
}
```

#### 3.3 Update Enemy Generation

**File**: `src/utils/enemyGeneration.ts`

Ensure `spellIds` from template is copied to generated creature:

```typescript
export function generateEnemy(template: EnemyTemplate): Creature {
  // ... existing generation logic ...

  return {
    id,
    name,
    level,
    attributes,
    hp: maxHp,
    maxHp,
    ac,
    bab,
    saves,
    equipment,
    skills,
    feats,
    creatureClass: template.creatureClass,
    resources,
    taunts: selectedTaunts,
    lootTableId: template.lootTableId,
    spellIds: template.spellIds, // NEW: Copy spell IDs from template
  };
}
```

### Phase 4: Testing

#### 4.1 Unit Tests for Enemy AI

**File**: `src/__tests__/utils/enemyAI.test.ts` (new file)

```typescript
import { describe, it, expect } from 'vitest';
import { selectEnemyAction, selectSpell, getEnemySpells } from '../../utils/enemyAI';
import { RAY_OF_FROST } from '../../data/spells';
import type { Creature, Character, Spell } from '../../types';

describe('enemyAI', () => {
  describe('getEnemySpells', () => {
    it('should return empty array when no spell IDs provided', () => {
      expect(getEnemySpells(undefined)).toEqual([]);
      expect(getEnemySpells([])).toEqual([]);
    });

    it('should resolve spell IDs to Spell objects', () => {
      const spells = getEnemySpells(['ray_of_frost']);
      expect(spells).toHaveLength(1);
      expect(spells[0].id).toBe('ray_of_frost');
    });

    it('should skip invalid spell IDs', () => {
      const spells = getEnemySpells(['ray_of_frost', 'invalid_spell']);
      expect(spells).toHaveLength(1);
    });
  });

  describe('selectEnemyAction', () => {
    const mockEnemy: Creature = {
      /* ... minimal creature ... */
      resources: {
        abilities: [],
        spellSlots: {
          level0: { max: 3, current: 3 },
          level1: { max: 2, current: 2 },
        },
      },
    } as Creature;

    const mockPlayer: Character = { /* ... */ } as Character;

    it('should return attack when no spells available', () => {
      const action = selectEnemyAction(mockEnemy, mockPlayer, []);
      expect(action).toBe('attack');
    });

    it('should return attack or cast_spell when spells available', () => {
      const spells: Spell[] = [RAY_OF_FROST];
      const action = selectEnemyAction(mockEnemy, mockPlayer, spells);
      expect(['attack', 'cast_spell']).toContain(action);
    });

    it('should return attack when enemy has no spell slots', () => {
      const enemyNoSlots = { ...mockEnemy, resources: undefined };
      const spells: Spell[] = [/* level 1 spell */];

      // Run multiple times since it's random - should always attack
      for (let i = 0; i < 10; i++) {
        const action = selectEnemyAction(enemyNoSlots, mockPlayer, spells);
        expect(action).toBe('attack');
      }
    });
  });

  describe('selectSpell', () => {
    it('should select a cantrip when only cantrips available', () => {
      const mockEnemy: Creature = { /* ... */ } as Creature;
      const mockPlayer: Character = { /* ... */ } as Character;
      const cantrips: Spell[] = [RAY_OF_FROST];

      const spell = selectSpell(mockEnemy, mockPlayer, cantrips);
      expect(spell.level).toBe(0);
    });

    it('should only select spells enemy has slots for', () => {
      const mockEnemy: Creature = {
        resources: {
          abilities: [],
          spellSlots: {
            level0: { max: 3, current: 3 },
            level1: { max: 0, current: 0 }, // No level 1 slots
          },
        },
      } as Creature;

      const spells: Spell[] = [
        RAY_OF_FROST, // level 0
        /* THUNDERWAVE */ // level 1
      ];

      const spell = selectSpell(mockEnemy, {} as Character, spells);
      expect(spell.level).toBe(0); // Should only pick cantrip
    });
  });
});
```

#### 4.2 Combat Integration Tests

**File**: `src/__tests__/utils/combat.test.ts` (add to existing tests)

```typescript
describe('Enemy spell casting', () => {
  it('should allow enemy to cast damage spell', () => {
    const wizard = createTestCharacter('Wizard');
    const wraith = createTestCreature({
      level: 2,
      spellIds: ['ray_of_frost'],
      resources: {
        abilities: [],
        spellSlots: {
          level0: { max: 3, current: 3 },
        },
      },
    });

    const state = startCombat(wizard, wraith);
    const action: AttackAction = { type: 'attack', variant: 'normal' };
    const result = resolveCombatRound(state, action);

    // Check that enemy might have cast spell (non-deterministic)
    const enemyLog = result.log.filter(entry => entry.actor === 'enemy');
    const spellCast = enemyLog.some(entry =>
      entry.message.includes('Ray of Frost') ||
      entry.message.includes('casts')
    );

    // Since it's random, we can't guarantee spell was cast
    // Just verify combat didn't error
    expect(result.log.length).toBeGreaterThan(0);
  });

  it('should consume spell slot when casting leveled spell', () => {
    // Mock Math.random to force spell casting
    const originalRandom = Math.random;
    Math.random = () => 0.1; // Forces cast_spell action

    try {
      const wizard = createTestCharacter('Wizard');
      const lich = createTestCreature({
        level: 20,
        spellIds: ['thunderwave'],
        resources: {
          abilities: [],
          spellSlots: {
            level0: { max: 3, current: 3 },
            level1: { max: 2, current: 2 },
          },
        },
      });

      const state = startCombat(wizard, lich);
      const action: AttackAction = { type: 'attack', variant: 'normal' };
      const result = resolveCombatRound(state, action);

      // Enemy should have consumed a level 1 slot
      expect(result.enemy.resources?.spellSlots?.level1?.current).toBe(1);
    } finally {
      Math.random = originalRandom;
    }
  });

  it('should fall back to attack when enemy has no spell slots', () => {
    const wizard = createTestCharacter('Wizard');
    const lich = createTestCreature({
      level: 20,
      spellIds: ['thunderwave'], // Only has level 1 spell
      resources: {
        abilities: [],
        spellSlots: {
          level1: { max: 2, current: 0 }, // No slots left
        },
      },
    });

    const state = startCombat(wizard, lich);
    const action: AttackAction = { type: 'attack', variant: 'normal' };
    const result = resolveCombatRound(state, action);

    // Enemy should have attacked (not cast spell)
    const enemyLog = result.log.filter(entry => entry.actor === 'enemy');
    const attacked = enemyLog.some(entry =>
      entry.message.includes('attacks') ||
      entry.message.includes('hit') ||
      entry.message.includes('miss')
    );

    expect(attacked).toBe(true);
  });

  it('should apply condition from enemy spell with save', () => {
    // Mock dice rolls and random for deterministic test
    const originalRandom = Math.random;
    Math.random = () => 0.1; // Forces spell cast

    try {
      const wizard = createTestCharacter('Wizard', { level: 1 });
      const wraith = createTestCreature({
        level: 2,
        spellIds: ['paralyzing_touch'],
        attributes: { INT: 16 }, // Good casting stat
      });

      const state = startCombat(wizard, wraith);
      const action: AttackAction = { type: 'attack', variant: 'normal' };

      // Mock player failing save
      const result = resolveCombatRound(state, action);

      // Check if Stunned condition was applied (may require save)
      // This test needs to account for save mechanics
      expect(result.log.length).toBeGreaterThan(0);
    } finally {
      Math.random = originalRandom;
    }
  });
});
```

**Note**: Testing randomness is tricky. Consider adding a `seed` parameter to AI functions for deterministic testing.

#### 4.3 Manual Testing Checklist

**Test Wraith Combat**:
- [ ] Start combat with Wraith
- [ ] Verify Wraith sometimes casts Ray of Frost (cold damage)
- [ ] Verify Wraith sometimes casts Paralyzing Touch (necrotic + stun)
- [ ] Verify Wraith sometimes attacks normally
- [ ] Verify spell names appear clearly in combat log
- [ ] Verify Stunned condition prevents player action

**Test Lich Combat**:
- [ ] Start combat with Lich
- [ ] Verify Lich casts Ray of Frost, Paralyzing Touch, or Thunderwave
- [ ] Verify Thunderwave deals 2d6 damage (check combat log)
- [ ] Verify Lich's spell slots decrease after casting Thunderwave
- [ ] Verify Lich falls back to attacks after spell slots depleted
- [ ] Verify combat is more challenging but still winnable

**Test Edge Cases**:
- [ ] Enemy with no spellIds still attacks normally
- [ ] Enemy with spellIds but no spell slots falls back to attack
- [ ] Player saves against Paralyzing Touch (no stun)
- [ ] Player fails save against Paralyzing Touch (stunned 1 turn)
- [ ] Spell critical hit deals double damage dice

### Phase 5: Polish & Documentation

#### 5.1 Update Combat System Documentation

**File**: `agent_docs/architecture/combat-system.md`

Add section:

```markdown
## Enemy Spell Casting

Enemies with spellcasting abilities (Wizard or Cleric baseClass) can cast spells during combat.

**Enemy AI** (`utils/enemyAI.ts`):
- `selectEnemyAction()` - Decides whether to attack or cast spell (50% chance if spells available)
- `selectSpell()` - Chooses which spell to cast from available list
- `getEnemySpells()` - Resolves spell IDs to Spell objects

**Spell Assignment**:
- Defined in `EnemyTemplate.spellIds` (`src/data/enemies.json`)
- Spell IDs resolve to Spell objects at runtime
- Current spellcasting enemies: Wraith, Lich

**Spell Resources**:
- Cantrips (level 0) have unlimited uses
- Leveled spells consume spell slots (same as player)
- Enemy falls back to normal attack when out of spell slots

**Example Enemies**:
- **Wraith**: Ray of Frost, Paralyzing Touch
- **Lich**: Ray of Frost, Paralyzing Touch, Thunderwave
```

#### 5.2 Add Comments to Code

Ensure all new functions have JSDoc comments explaining:
- Purpose
- Parameters
- Return values
- Side effects
- Examples (where helpful)

## Implementation Order (Batches)

### Batch 0: Spell Data Migration to JSON + Zod
**Goal**: Migrate spell data to JSON with Zod validation (follows established pattern)

1. Update `src/types/spell.ts` - Add missing damage types (necrotic, thunder, lightning, poison)
2. Create `src/schemas/spell.schema.ts` - Zod schema for spell validation
3. Write `src/__tests__/schemas/spell.schema.test.ts` - Schema validation tests
4. Create `src/data/spells.json` - All spells including new ones (Paralyzing Touch, Thunderwave)
5. Update `src/data/spells.ts` - Replace TypeScript constants with JSON loader
6. Run tests to verify schema validation works
7. Update any existing code that imports spells (use `SPELLS.spell_id` instead of constants)

**Verify**:
- `npm test -- spell.schema.test.ts` passes
- `npm run build` succeeds (Zod validates JSON at build time)
- `npm run lint` passes
- All existing spell references still work
- New damage types work correctly in combat

### Batch 1: Update Enemy Templates & Types
**Goal**: Add spell support to enemy data structures

1. Update `src/types/enemyTemplate.ts` - add `spellIds?: string[]`
2. Update `src/types/creature.ts` - add `spellIds?: string[]`
3. Update `src/schemas/enemyTemplate.schema.ts` - add spellIds to Zod schema
4. Update `src/data/enemies.json` - add spellIds to Wraith and Lich
5. Update `src/utils/enemyGeneration.ts` - copy spellIds from template to creature

**Verify**:
- `npm run build` succeeds
- `npm run lint` passes
- Type errors resolved
- Enemy schema tests pass

### Batch 2: Enemy AI Logic
**Goal**: Implement spell selection and action decision logic

1. Create `src/utils/enemyAI.ts`
2. Implement `getEnemySpells()`
3. Implement `selectEnemyAction()`
4. Implement `selectSpell()`
5. Add `consumeSpellSlot()` to `src/utils/spellcasting.ts`
6. Write unit tests in `src/__tests__/utils/enemyAI.test.ts`

**Verify**:
- `npm test` passes (all enemyAI tests)
- `npm run build` succeeds
- `npm run lint` passes

### Batch 3: Combat Integration
**Goal**: Integrate enemy spell casting into combat flow

1. Update `src/utils/enemyGeneration.ts` - copy spellIds to creature
2. Modify `src/utils/combat.ts::resolveCombatRound()` - add spell casting branch
3. Handle spell damage application
4. Handle spell condition application
5. Handle spell slot consumption
6. Add combat integration tests to `src/__tests__/utils/combat.test.ts`

**Verify**:
- `npm test` passes (all tests including new combat tests)
- `npm run build` succeeds
- `npm run lint` passes

### Batch 4: Testing & Polish
**Goal**: Manual testing, bug fixes, documentation

1. Manual testing against Wraith (see checklist above)
2. Manual testing against Lich (see checklist above)
3. Fix any bugs found
4. Update `agent_docs/architecture/combat-system.md`
5. Add code comments and JSDoc
6. Final regression testing

**Verify**:
- All manual test cases pass
- Combat feels balanced
- Spell messages are clear in UI
- No regressions in existing combat
- Documentation is up to date

## Success Criteria

**Spell Migration**:
- [ ] All spells migrated to `spells.json`
- [ ] Zod schema validates all spell data at build time
- [ ] Schema tests cover all spell types (damage, heal, buff, condition)
- [ ] `getSpellById()` function works correctly
- [ ] No regressions in player spell casting

**Enemy Spell Casting**:
- [ ] Wraith can cast Ray of Frost and Paralyzing Touch
- [ ] Lich can cast Ray of Frost, Paralyzing Touch, and Thunderwave
- [ ] Spell slots are consumed correctly for leveled spells
- [ ] Cantrips don't consume spell slots
- [ ] Enemy falls back to attack when out of spell slots
- [ ] Combat log clearly shows which spell was cast
- [ ] Paralyzing Touch applies Stunned condition on failed save
- [ ] Thunderwave deals appropriate damage with save for half
- [ ] Enemy AI makes reasonable spell vs attack decisions

**Quality Assurance**:
- [ ] No regressions in existing combat mechanics
- [ ] All automated tests pass
- [ ] Manual testing checklist completed
- [ ] Documentation updated
- [ ] Code follows established patterns (JSON + Zod)

## Future Enhancements

**Phase 2 Improvements** (not in this implementation):
- Tactical AI: Choose spells based on player HP, conditions, etc.
- More enemy spells: Fireball, Heal, Shield, etc.
- Spell variety: Area-of-effect, multi-target, summons
- Difficulty scaling: Higher difficulty = smarter spell selection
- Enemy healing: Low HP enemies could cast healing spells
- Buff management: Enemies could buff themselves before attacking
- Counter-spelling: React to player actions

**Code Quality**:
- Extract enemy turn logic to separate function (reduce complexity)
- Add seed parameter to AI functions for deterministic testing
- Create spell casting test helpers to reduce test boilerplate
- Consider adding difficulty parameter to enemy AI

## Risks & Mitigations

**Risk**: Enemy spell casting makes combat too difficult
**Mitigation**:
- Start with 50% cast rate (can tune down)
- Use relatively weak spells (cantrips + 1 level 1 spell)
- Only 2 enemies have spells initially (can monitor feedback)

**Risk**: Random AI feels unfair or unpredictable
**Mitigation**:
- Document AI behavior clearly
- Consider showing "The Wraith prepares a spell" message
- Future: Add tactical AI that's more predictable

**Risk**: Type system complexity increases
**Mitigation**:
- Keep spellIds as optional field
- Use defensive programming (check undefined)
- Leverage TypeScript for compile-time safety

**Risk**: Combat code becomes too complex
**Mitigation**:
- Extract enemy turn logic to separate function
- Keep spell casting parallel to player spell casting
- Write comprehensive tests

## References

- Combat system: `agent_docs/architecture/combat-system.md`
- Spell system: `src/types/spell.ts`, `src/data/spells.ts`
- Spell casting utilities: `src/utils/spellcasting.ts`
- Enemy generation: `src/utils/enemyGeneration.ts`
- Combat resolution: `src/utils/combat.ts`
- Enemy templates: `src/data/enemies.json`
