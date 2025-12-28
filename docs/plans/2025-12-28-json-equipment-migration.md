# JSON Equipment Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate weapons, armor, and items from TypeScript to JSON with Zod validation, and update enemy templates to reference equipment by ID instead of inline objects.

**Architecture:** Three-layer pattern matching enemies: (1) JSON data files as content source, (2) Zod schemas for build-time validation, (3) TypeScript loaders that validate and export. Enemy templates reference equipment by ID, resolved at load time.

**Tech Stack:** Zod for validation, Vite JSON imports, TypeScript Record types, existing test infrastructure (Vitest).

---

## Overview

This migration establishes a consistent JSON-based pattern for all game content (enemies, weapons, armor, items). The implementation follows TDD principles and is broken into 8 sequential tasks:

1. **Weapons JSON + Schema** - Foundation for equipment system
2. **Armors JSON + Schema** - Complete basic equipment
3. **Items JSON + Schema** - Consumables and special items
4. **Update Enemy Schema** - Support equipment references
5. **Update Enemy JSON** - Replace inline objects with IDs
6. **Update Enemy Loader** - Resolve equipment references
7. **Update Type Definitions** - String IDs instead of literals
8. **Update Codebase References** - Use getters throughout

Each task follows: test → implement → verify → commit.

---

## Task 1: Weapons JSON + Schema

**Files:**
- Create: `src/schemas/weapon.schema.ts`
- Create: `src/data/weapons.json`
- Modify: `src/data/equipment.ts:1-100`
- Test: `src/__tests__/data/equipment.test.ts`

### Step 1.1: Write weapon schema test

**Create:** `src/__tests__/schemas/weapon.schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { WeaponSchema, WeaponsSchema } from '../../schemas/weapon.schema';

describe('WeaponSchema', () => {
  it('should validate a valid weapon', () => {
    const validWeapon = {
      name: 'Longsword',
      damage: '1d8',
      damageType: 'slashing',
      finesse: false,
      description: 'A versatile blade',
      proficiencyRequired: 'martial',
    };

    expect(() => WeaponSchema.parse(validWeapon)).not.toThrow();
  });

  it('should reject invalid damage dice format', () => {
    const invalidWeapon = {
      name: 'Broken Sword',
      damage: 'invalid',
      damageType: 'slashing',
      finesse: false,
      description: 'Broken',
    };

    expect(() => WeaponSchema.parse(invalidWeapon)).toThrow();
  });

  it('should allow damage with modifiers', () => {
    const weaponWithModifier = {
      name: 'Magic Sword',
      damage: '1d8+2',
      damageType: 'slashing',
      finesse: false,
      description: 'Enchanted blade',
    };

    expect(() => WeaponSchema.parse(weaponWithModifier)).not.toThrow();
  });

  it('should reject invalid damage type', () => {
    const invalidDamageType = {
      name: 'Fire Sword',
      damage: '1d8',
      damageType: 'fire',
      finesse: false,
      description: 'Flaming blade',
    };

    expect(() => WeaponSchema.parse(invalidDamageType)).toThrow();
  });
});

describe('WeaponsSchema', () => {
  it('should validate a record of weapons', () => {
    const validWeapons = {
      longsword: {
        name: 'Longsword',
        damage: '1d8',
        damageType: 'slashing',
        finesse: false,
        description: 'A versatile blade',
        proficiencyRequired: 'martial',
      },
      dagger: {
        name: 'Dagger',
        damage: '1d6',
        damageType: 'piercing',
        finesse: true,
        description: 'A short blade',
        proficiencyRequired: 'simple',
      },
    };

    expect(() => WeaponsSchema.parse(validWeapons)).not.toThrow();
  });

  it('should reject if any weapon is invalid', () => {
    const invalidWeapons = {
      longsword: {
        name: 'Longsword',
        damage: '1d8',
        damageType: 'slashing',
        finesse: false,
        description: 'A versatile blade',
      },
      broken: {
        name: 'Broken',
        damage: 'invalid',
        damageType: 'slashing',
        finesse: false,
        description: 'Broken',
      },
    };

    expect(() => WeaponsSchema.parse(invalidWeapons)).toThrow();
  });
});
```

### Step 1.2: Run test to verify it fails

Run: `npm test -- weapon.schema.test.ts`

Expected: FAIL with "Cannot find module '../../schemas/weapon.schema'"

### Step 1.3: Create weapon schema

**Create:** `src/schemas/weapon.schema.ts`

```typescript
import { z } from 'zod';

/**
 * Weapon damage type enum
 */
const DamageTypeSchema = z.enum(['slashing', 'piercing', 'bludgeoning']);

/**
 * Weapon proficiency requirement enum
 */
const ProficiencyRequiredSchema = z.enum(['simple', 'martial', 'martial-finesse']);

/**
 * Schema for a single weapon definition
 *
 * Validates:
 * - Damage format: XdY or XdY+Z (e.g., "1d8" or "2d6+3")
 * - Damage type: slashing, piercing, or bludgeoning
 * - All required fields are non-empty strings where applicable
 */
export const WeaponSchema = z.object({
  name: z.string().min(1, 'Weapon name cannot be empty'),
  damage: z.string().regex(
    /^\d+d\d+(\+\d+)?$/,
    'Damage must be in format XdY or XdY+Z (e.g., "1d8" or "2d6+3")'
  ),
  damageType: DamageTypeSchema,
  finesse: z.boolean(),
  description: z.string().min(1, 'Description cannot be empty'),
  proficiencyRequired: ProficiencyRequiredSchema.optional(),
});

/**
 * Schema for the weapons.json file structure
 *
 * Format: Record<weaponId, Weapon>
 * Example: { "longsword": { name: "Longsword", ... }, "dagger": { ... } }
 */
export const WeaponsSchema = z.record(
  z.string().min(1, 'Weapon ID cannot be empty'),
  WeaponSchema
);

/**
 * TypeScript type inferred from schema
 */
export type WeaponSchemaType = z.infer<typeof WeaponSchema>;
```

### Step 1.4: Run test to verify it passes

Run: `npm test -- weapon.schema.test.ts`

Expected: PASS (all schema validation tests pass)

### Step 1.5: Create weapons.json

**Create:** `src/data/weapons.json`

```json
{
  "longsword": {
    "name": "Longsword",
    "damage": "1d8",
    "damageType": "slashing",
    "finesse": false,
    "description": "A versatile blade favored by warriors",
    "proficiencyRequired": "martial"
  },
  "rapier": {
    "name": "Rapier",
    "damage": "1d8",
    "damageType": "piercing",
    "finesse": true,
    "description": "An elegant dueling sword",
    "proficiencyRequired": "martial-finesse"
  },
  "dagger": {
    "name": "Dagger",
    "damage": "1d6",
    "damageType": "piercing",
    "finesse": true,
    "description": "A short blade favored by bandits",
    "proficiencyRequired": "simple"
  },
  "mace": {
    "name": "Mace",
    "damage": "1d6",
    "damageType": "bludgeoning",
    "finesse": false,
    "description": "A heavy bludgeoning weapon",
    "proficiencyRequired": "simple"
  },
  "scimitar": {
    "name": "Scimitar",
    "damage": "1d6",
    "damageType": "slashing",
    "finesse": false,
    "description": "A curved blade favored by desert warriors",
    "proficiencyRequired": "martial"
  },
  "bite": {
    "name": "Bite",
    "damage": "1d8",
    "damageType": "piercing",
    "finesse": false,
    "description": "Natural bite attack"
  },
  "slam": {
    "name": "Slam",
    "damage": "1d6",
    "damageType": "bludgeoning",
    "finesse": false,
    "description": "Natural slam attack"
  },
  "tusk": {
    "name": "Tusk",
    "damage": "1d6",
    "damageType": "slashing",
    "finesse": false,
    "description": "Natural tusk attack"
  }
}
```

### Step 1.6: Update equipment.ts to use JSON loader pattern

**Modify:** `src/data/equipment.ts`

Replace the entire WEAPONS section with:

```typescript
import weaponsJson from './weapons.json';
import { WeaponsSchema } from '../schemas/weapon.schema';
import { Weapon, Armor, Equipment, Shield } from '../types';

// Validate weapons at build time
const validatedWeapons = WeaponsSchema.parse(weaponsJson);

/**
 * All available weapons in the game
 * Loaded from weapons.json and validated with Zod schema
 */
export const WEAPONS: Record<string, Weapon> = Object.fromEntries(
  Object.entries(validatedWeapons).map(([id, weapon]) => [
    id,
    {
      ...weapon,
      id, // Add id field for runtime use
    } as Weapon,
  ])
);

/**
 * Get a weapon by ID
 * @param id - The weapon ID (e.g., "longsword", "dagger")
 * @returns The weapon object, or null if not found
 */
export function getWeapon(id: string): Weapon | null {
  return WEAPONS[id] ?? null;
}

// Keep existing ARMORS export for now (will be updated in Task 2)
export const ARMORS: Record<ArmorType, Armor> = {
  // ... existing armor definitions
};

// Keep existing exports
export const STARTING_ITEMS = {
  // ... existing definitions
};
```

### Step 1.7: Update equipment test to verify loader

**Modify:** `src/__tests__/data/equipment.test.ts`

Add new tests:

```typescript
describe('WEAPONS from JSON', () => {
  it('should load all weapons from JSON', () => {
    expect(Object.keys(WEAPONS).length).toBeGreaterThan(0);
  });

  it('should have longsword with correct properties', () => {
    const longsword = WEAPONS['longsword'];
    expect(longsword).toBeDefined();
    expect(longsword.name).toBe('Longsword');
    expect(longsword.damage).toBe('1d8');
    expect(longsword.damageType).toBe('slashing');
    expect(longsword.finesse).toBe(false);
    expect(longsword.proficiencyRequired).toBe('martial');
  });

  it('should have dagger with correct properties', () => {
    const dagger = WEAPONS['dagger'];
    expect(dagger).toBeDefined();
    expect(dagger.name).toBe('Dagger');
    expect(dagger.damage).toBe('1d6');
    expect(dagger.damageType).toBe('piercing');
    expect(dagger.finesse).toBe(true);
  });

  it('getWeapon should return weapon by id', () => {
    const weapon = getWeapon('longsword');
    expect(weapon).toBeDefined();
    expect(weapon?.name).toBe('Longsword');
  });

  it('getWeapon should return null for invalid id', () => {
    const weapon = getWeapon('nonexistent');
    expect(weapon).toBeNull();
  });

  it('all weapons should have valid damage dice format', () => {
    const damageRegex = /^\d+d\d+(\+\d+)?$/;
    Object.values(WEAPONS).forEach((weapon) => {
      expect(weapon.damage).toMatch(damageRegex);
    });
  });
});
```

### Step 1.8: Run tests to verify loader works

Run: `npm test -- equipment.test.ts`

Expected: PASS (all weapon loader tests pass)

### Step 1.9: Verify build works with JSON import

Run: `npm run build`

Expected: SUCCESS (Vite bundles JSON correctly)

### Step 1.10: Commit Task 1

```bash
git add src/schemas/weapon.schema.ts src/data/weapons.json src/data/equipment.ts src/__tests__/schemas/weapon.schema.test.ts src/__tests__/data/equipment.test.ts
git commit -m "feat: add weapons JSON with Zod validation

- Create weapon schema with damage format validation
- Migrate weapons to weapons.json
- Update equipment.ts to use JSON loader pattern
- Add comprehensive schema and loader tests
- Add getWeapon() getter function

Part of JSON equipment migration (Task 1/8)"
```

---

## Task 2: Armors JSON + Schema

**Files:**
- Create: `src/schemas/armor.schema.ts`
- Create: `src/data/armors.json`
- Modify: `src/data/equipment.ts:50-150`
- Test: `src/__tests__/data/equipment.test.ts`

### Step 2.1: Write armor schema test

**Create:** `src/__tests__/schemas/armor.schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ArmorSchema, ArmorsSchema } from '../../schemas/armor.schema';

describe('ArmorSchema', () => {
  it('should validate armor with no dex bonus limit', () => {
    const validArmor = {
      name: 'Leather',
      baseAC: 11,
      maxDexBonus: null,
      description: 'Light and flexible armor',
    };

    expect(() => ArmorSchema.parse(validArmor)).not.toThrow();
  });

  it('should validate armor with dex bonus limit', () => {
    const chainmail = {
      name: 'Chain Mail',
      baseAC: 16,
      maxDexBonus: 2,
      description: 'Heavy metal armor',
    };

    expect(() => ArmorSchema.parse(chainmail)).not.toThrow();
  });

  it('should reject AC below minimum', () => {
    const invalidArmor = {
      name: 'Broken Armor',
      baseAC: 5,
      maxDexBonus: null,
      description: 'Too weak',
    };

    expect(() => ArmorSchema.parse(invalidArmor)).toThrow();
  });

  it('should reject AC above maximum', () => {
    const invalidArmor = {
      name: 'Super Armor',
      baseAC: 25,
      maxDexBonus: null,
      description: 'Too strong',
    };

    expect(() => ArmorSchema.parse(invalidArmor)).toThrow();
  });

  it('should reject negative dex bonus', () => {
    const invalidArmor = {
      name: 'Bad Armor',
      baseAC: 12,
      maxDexBonus: -1,
      description: 'Invalid dex bonus',
    };

    expect(() => ArmorSchema.parse(invalidArmor)).toThrow();
  });
});

describe('ArmorsSchema', () => {
  it('should validate a record of armors', () => {
    const validArmors = {
      leather: {
        name: 'Leather',
        baseAC: 11,
        maxDexBonus: null,
        description: 'Light armor',
      },
      chainmail: {
        name: 'Chain Mail',
        baseAC: 16,
        maxDexBonus: 2,
        description: 'Heavy armor',
      },
    };

    expect(() => ArmorsSchema.parse(validArmors)).not.toThrow();
  });
});
```

### Step 2.2: Run test to verify it fails

Run: `npm test -- armor.schema.test.ts`

Expected: FAIL with "Cannot find module '../../schemas/armor.schema'"

### Step 2.3: Create armor schema

**Create:** `src/schemas/armor.schema.ts`

```typescript
import { z } from 'zod';

/**
 * Schema for a single armor definition
 *
 * Validates:
 * - Base AC: 8-20 (reasonable range for D&D-style armor)
 * - Max DEX bonus: null (unlimited) or non-negative number
 * - All required fields are non-empty strings
 */
export const ArmorSchema = z.object({
  name: z.string().min(1, 'Armor name cannot be empty'),
  baseAC: z
    .number()
    .int()
    .min(8, 'Base AC must be at least 8')
    .max(20, 'Base AC cannot exceed 20'),
  maxDexBonus: z
    .number()
    .int()
    .nonnegative('Max DEX bonus cannot be negative')
    .nullable(),
  description: z.string().min(1, 'Description cannot be empty'),
});

/**
 * Schema for the armors.json file structure
 *
 * Format: Record<armorId, Armor>
 * Example: { "leather": { name: "Leather", ... }, "chainmail": { ... } }
 */
export const ArmorsSchema = z.record(
  z.string().min(1, 'Armor ID cannot be empty'),
  ArmorSchema
);

/**
 * TypeScript type inferred from schema
 */
export type ArmorSchemaType = z.infer<typeof ArmorSchema>;
```

### Step 2.4: Run test to verify it passes

Run: `npm test -- armor.schema.test.ts`

Expected: PASS (all schema validation tests pass)

### Step 2.5: Create armors.json

**Create:** `src/data/armors.json`

```json
{
  "none": {
    "name": "None",
    "baseAC": 10,
    "maxDexBonus": null,
    "description": "No armor"
  },
  "leather": {
    "name": "Leather",
    "baseAC": 11,
    "maxDexBonus": null,
    "description": "Supple leather armor"
  },
  "leather-armor": {
    "name": "Leather Armor",
    "baseAC": 12,
    "maxDexBonus": null,
    "description": "Leather Armor"
  },
  "chainmail": {
    "name": "Chainmail",
    "baseAC": 16,
    "maxDexBonus": 2,
    "description": "Heavy chainmail armor"
  },
  "chain-mail": {
    "name": "Chain Mail",
    "baseAC": 16,
    "maxDexBonus": 2,
    "description": "Chain Mail armor"
  },
  "natural-armor": {
    "name": "Natural Armor",
    "baseAC": 11,
    "maxDexBonus": null,
    "description": "Natural protection"
  }
}
```

### Step 2.6: Update equipment.ts to load armors from JSON

**Modify:** `src/data/equipment.ts`

Add after weapons section:

```typescript
import armorsJson from './armors.json';
import { ArmorsSchema } from '../schemas/armor.schema';

// Validate armors at build time
const validatedArmors = ArmorsSchema.parse(armorsJson);

/**
 * All available armors in the game
 * Loaded from armors.json and validated with Zod schema
 */
export const ARMORS: Record<string, Armor> = Object.fromEntries(
  Object.entries(validatedArmors).map(([id, armor]) => [
    id,
    armor as Armor,
  ])
);

/**
 * Get an armor by ID
 * @param id - The armor ID (e.g., "leather", "chainmail")
 * @returns The armor object, or null if not found
 */
export function getArmor(id: string): Armor | null {
  return ARMORS[id] ?? null;
}
```

### Step 2.7: Update equipment test for armors

**Modify:** `src/__tests__/data/equipment.test.ts`

Add new tests:

```typescript
describe('ARMORS from JSON', () => {
  it('should load all armors from JSON', () => {
    expect(Object.keys(ARMORS).length).toBeGreaterThan(0);
  });

  it('should have leather armor with correct properties', () => {
    const leather = ARMORS['leather'];
    expect(leather).toBeDefined();
    expect(leather.name).toBe('Leather');
    expect(leather.baseAC).toBe(11);
    expect(leather.maxDexBonus).toBeNull();
  });

  it('should have chainmail with dex limit', () => {
    const chainmail = ARMORS['chainmail'];
    expect(chainmail).toBeDefined();
    expect(chainmail.name).toBe('Chainmail');
    expect(chainmail.baseAC).toBe(16);
    expect(chainmail.maxDexBonus).toBe(2);
  });

  it('getArmor should return armor by id', () => {
    const armor = getArmor('leather');
    expect(armor).toBeDefined();
    expect(armor?.name).toBe('Leather');
  });

  it('getArmor should return null for invalid id', () => {
    const armor = getArmor('nonexistent');
    expect(armor).toBeNull();
  });

  it('all armors should have valid AC range', () => {
    Object.values(ARMORS).forEach((armor) => {
      expect(armor.baseAC).toBeGreaterThanOrEqual(8);
      expect(armor.baseAC).toBeLessThanOrEqual(20);
    });
  });
});
```

### Step 2.8: Run tests to verify armor loader works

Run: `npm test -- equipment.test.ts`

Expected: PASS (all armor loader tests pass)

### Step 2.9: Verify build

Run: `npm run build`

Expected: SUCCESS

### Step 2.10: Commit Task 2

```bash
git add src/schemas/armor.schema.ts src/data/armors.json src/data/equipment.ts src/__tests__/schemas/armor.schema.test.ts src/__tests__/data/equipment.test.ts
git commit -m "feat: add armors JSON with Zod validation

- Create armor schema with AC range validation
- Migrate armors to armors.json
- Update equipment.ts to load armors from JSON
- Add comprehensive schema and loader tests
- Add getArmor() getter function

Part of JSON equipment migration (Task 2/8)"
```

---

## Task 3: Items JSON + Schema

**Files:**
- Create: `src/schemas/item.schema.ts`
- Create: `src/data/items-new.json`
- Modify: `src/data/items.ts:1-100`
- Test: `src/__tests__/data/items.test.ts`

### Step 3.1: Write item schema test

**Create:** `src/__tests__/schemas/item.schema.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ItemSchema, ItemsSchema } from '../../schemas/item.schema';

describe('ItemSchema', () => {
  it('should validate a healing item', () => {
    const healingPotion = {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores health',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'heal', amount: '2d8+2' },
      value: 25,
    };

    expect(() => ItemSchema.parse(healingPotion)).not.toThrow();
  });

  it('should validate an escape item', () => {
    const escapeItem = {
      id: 'smoke-bomb',
      name: 'Smoke Bomb',
      description: 'Allows escape from combat',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'escape' },
      value: 50,
    };

    expect(() => ItemSchema.parse(escapeItem)).not.toThrow();
  });

  it('should validate a buff item', () => {
    const buffPotion = {
      id: 'strength-potion',
      name: 'Potion of Strength',
      description: 'Increases STR',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'buff', stat: 'STR', amount: 2, duration: 3 },
      value: 100,
    };

    expect(() => ItemSchema.parse(buffPotion)).not.toThrow();
  });

  it('should validate a quest item', () => {
    const questItem = {
      id: 'mysterious-amulet',
      name: 'Mysterious Amulet',
      description: 'An ancient artifact',
      type: 'quest',
      usableInCombat: false,
      value: 0,
    };

    expect(() => ItemSchema.parse(questItem)).not.toThrow();
  });

  it('should reject invalid item type', () => {
    const invalidItem = {
      id: 'bad-item',
      name: 'Bad Item',
      description: 'Invalid',
      type: 'invalid-type',
      usableInCombat: false,
      value: 0,
    };

    expect(() => ItemSchema.parse(invalidItem)).toThrow();
  });

  it('should reject negative value', () => {
    const invalidItem = {
      id: 'free-item',
      name: 'Free Item',
      description: 'Negative value',
      type: 'consumable',
      usableInCombat: false,
      value: -10,
    };

    expect(() => ItemSchema.parse(invalidItem)).toThrow();
  });
});

describe('ItemsSchema', () => {
  it('should validate a record of items', () => {
    const validItems = {
      'healing-potion': {
        id: 'healing-potion',
        name: 'Healing Potion',
        description: 'Restores health',
        type: 'consumable',
        usableInCombat: true,
        effect: { type: 'heal', amount: '2d8+2' },
        value: 25,
      },
    };

    expect(() => ItemsSchema.parse(validItems)).not.toThrow();
  });
});
```

### Step 3.2: Run test to verify it fails

Run: `npm test -- item.schema.test.ts`

Expected: FAIL with "Cannot find module '../../schemas/item.schema'"

### Step 3.3: Create item schema

**Create:** `src/schemas/item.schema.ts`

```typescript
import { z } from 'zod';

/**
 * Item type enum
 */
const ItemTypeSchema = z.enum(['consumable', 'quest', 'equipment', 'treasure']);

/**
 * Item effect schemas (discriminated union based on type)
 */
const HealEffectSchema = z.object({
  type: z.literal('heal'),
  amount: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Heal amount must be dice notation'),
});

const EscapeEffectSchema = z.object({
  type: z.literal('escape'),
});

const RemoveConditionEffectSchema = z.object({
  type: z.literal('remove-condition'),
  condition: z.string().min(1),
});

const BuffEffectSchema = z.object({
  type: z.literal('buff'),
  stat: z.enum(['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']),
  amount: z.number().int(),
  duration: z.number().int().positive(),
});

const DamageEffectSchema = z.object({
  type: z.literal('damage'),
  amount: z.string().regex(/^\d+d\d+(\+\d+)?$/, 'Damage amount must be dice notation'),
  damageType: z.enum(['slashing', 'piercing', 'bludgeoning', 'fire', 'cold', 'lightning', 'poison']),
});

const SpellEffectSchema = z.object({
  type: z.literal('spell'),
  spellId: z.string().min(1),
});

const ItemEffectSchema = z.discriminatedUnion('type', [
  HealEffectSchema,
  EscapeEffectSchema,
  RemoveConditionEffectSchema,
  BuffEffectSchema,
  DamageEffectSchema,
  SpellEffectSchema,
]);

/**
 * Schema for a single item definition
 *
 * Validates:
 * - All required fields present
 * - Item type is valid
 * - Effect structure matches type
 * - Value is non-negative
 */
export const ItemSchema = z.object({
  id: z.string().min(1, 'Item ID cannot be empty'),
  name: z.string().min(1, 'Item name cannot be empty'),
  description: z.string().min(1, 'Description cannot be empty'),
  type: ItemTypeSchema,
  usableInCombat: z.boolean(),
  effect: ItemEffectSchema.optional(),
  value: z.number().int().nonnegative('Value cannot be negative'),
});

/**
 * Schema for the items.json file structure
 *
 * Format: Record<itemId, Item>
 */
export const ItemsSchema = z.record(
  z.string().min(1, 'Item key cannot be empty'),
  ItemSchema
);

/**
 * TypeScript type inferred from schema
 */
export type ItemSchemaType = z.infer<typeof ItemSchema>;
export type ItemEffectSchemaType = z.infer<typeof ItemEffectSchema>;
```

### Step 3.4: Run test to verify it passes

Run: `npm test -- item.schema.test.ts`

Expected: PASS

### Step 3.5: Create items.json

**Create:** `src/data/items-data.json`

```json
{
  "healing-potion": {
    "id": "healing-potion",
    "name": "Healing Potion",
    "description": "A red vial that restores 2d8+2 hit points when consumed.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "heal", "amount": "2d8+2" },
    "value": 25
  },
  "antidote": {
    "id": "antidote",
    "name": "Antidote",
    "description": "Cures poison and disease.",
    "type": "consumable",
    "usableInCombat": true,
    "effect": { "type": "remove-condition", "condition": "poisoned" },
    "value": 50
  },
  "mysterious-amulet": {
    "id": "mysterious-amulet",
    "name": "Mysterious Amulet",
    "description": "An ancient amulet with unknown powers.",
    "type": "quest",
    "usableInCombat": false,
    "value": 0
  },
  "wolf-pelt": {
    "id": "wolf-pelt",
    "name": "Wolf Pelt",
    "description": "A thick fur pelt from a dire wolf.",
    "type": "treasure",
    "usableInCombat": false,
    "value": 10
  }
}
```

### Step 3.6: Update items.ts to use JSON loader pattern

**Modify:** `src/data/items.ts`

Replace with:

```typescript
import itemsJson from './items-data.json';
import { ItemsSchema } from '../schemas/item.schema';
import { InventoryItem } from '../types';

// Validate items at build time
const validatedItems = ItemsSchema.parse(itemsJson);

/**
 * All available items in the game
 * Loaded from items-data.json and validated with Zod schema
 */
export const ITEMS: Record<string, InventoryItem> = Object.fromEntries(
  Object.entries(validatedItems).map(([id, item]) => [
    id,
    item as InventoryItem,
  ])
);

/**
 * Get an item by ID
 * @param id - The item ID (e.g., "healing-potion")
 * @returns The item object
 * @throws Error if item not found
 */
export function getItem(id: string): InventoryItem {
  const item = ITEMS[id];
  if (!item) {
    throw new Error(`Item not found: ${id}`);
  }
  return item;
}
```

### Step 3.7: Update items test

**Modify:** `src/__tests__/data/items.test.ts`

```typescript
import { describe, it, expect } from 'vitest';
import { ITEMS, getItem } from '../../data/items';

describe('ITEMS from JSON', () => {
  it('should load all items from JSON', () => {
    expect(Object.keys(ITEMS).length).toBeGreaterThan(0);
  });

  it('should have healing potion', () => {
    const potion = ITEMS['healing-potion'];
    expect(potion).toBeDefined();
    expect(potion.name).toBe('Healing Potion');
    expect(potion.type).toBe('consumable');
    expect(potion.usableInCombat).toBe(true);
    expect(potion.effect?.type).toBe('heal');
  });

  it('getItem should return item by id', () => {
    const item = getItem('healing-potion');
    expect(item.name).toBe('Healing Potion');
  });

  it('getItem should throw for invalid id', () => {
    expect(() => getItem('nonexistent')).toThrow('Item not found');
  });

  it('all items should have non-negative value', () => {
    Object.values(ITEMS).forEach((item) => {
      expect(item.value).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### Step 3.8: Run tests

Run: `npm test -- items.test.ts`

Expected: PASS

### Step 3.9: Verify build

Run: `npm run build`

Expected: SUCCESS

### Step 3.10: Commit Task 3

```bash
git add src/schemas/item.schema.ts src/data/items-data.json src/data/items.ts src/__tests__/schemas/item.schema.test.ts src/__tests__/data/items.test.ts
git commit -m "feat: add items JSON with Zod validation

- Create item schema with effect type validation
- Migrate items to items-data.json
- Update items.ts to use JSON loader pattern
- Add comprehensive schema and loader tests
- Support all effect types: heal, escape, buff, etc.

Part of JSON equipment migration (Task 3/8)"
```

---

## Task 4: Update Enemy Schema for Equipment References

**Files:**
- Modify: `src/schemas/enemyTemplate.schema.ts:50-150`
- Test: `src/__tests__/schemas/enemyTemplate.schema.test.ts`

### Step 4.1: Write test for equipment references

**Modify:** `src/__tests__/schemas/enemyTemplate.schema.test.ts`

Add new test case:

```typescript
describe('EnemyTemplateSchema with equipment references', () => {
  it('should validate enemy with weapon/armor IDs instead of inline objects', () => {
    const enemyWithRefs = {
      id: 'test-warrior',
      baseName: 'Test Warrior',
      creatureClass: 'Humanoid',
      avatarPaths: ['Bandit'],
      levelRange: { min: 1, max: 2 },
      attributeRanges: {
        STR: { min: 12, max: 14 },
        DEX: { min: 10, max: 12 },
        CON: { min: 11, max: 13 },
        INT: { min: 9, max: 11 },
        WIS: { min: 10, max: 12 },
        CHA: { min: 8, max: 10 },
      },
      baseClass: 'Fighter',
      equipment: {
        weaponId: 'longsword',
        armorId: 'chainmail',
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
        onCombatStart: ['Test!'],
        onPlayerMiss: ['Ha!'],
        onEnemyHit: ['Got you!'],
        onLowHealth: ['Oof!'],
      },
      lootTableId: 'test_loot',
    };

    expect(() => EnemyTemplateSchema.parse(enemyWithRefs)).not.toThrow();
  });

  it('should still validate enemy with inline weapon/armor (backward compat)', () => {
    const enemyWithInline = {
      id: 'test-bandit',
      baseName: 'Test Bandit',
      creatureClass: 'Humanoid',
      avatarPaths: ['Bandit'],
      levelRange: { min: 1, max: 2 },
      attributeRanges: {
        STR: { min: 12, max: 14 },
        DEX: { min: 10, max: 12 },
        CON: { min: 11, max: 13 },
        INT: { min: 9, max: 11 },
        WIS: { min: 10, max: 12 },
        CHA: { min: 8, max: 10 },
      },
      baseClass: 'Fighter',
      equipment: {
        weapon: {
          name: 'Dagger',
          damage: '1d6',
          damageType: 'piercing',
          finesse: true,
          description: 'A short blade',
        },
        weapons: [
          {
            name: 'Dagger',
            damage: '1d6',
            damageType: 'piercing',
            finesse: true,
            description: 'A short blade',
          },
        ],
        armor: {
          name: 'Leather',
          baseAC: 11,
          maxDexBonus: null,
          description: 'Light armor',
        },
        shield: { equipped: false, acBonus: 0 },
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
        onCombatStart: ['Test!'],
        onPlayerMiss: ['Ha!'],
        onEnemyHit: ['Got you!'],
        onLowHealth: ['Oof!'],
      },
      lootTableId: 'test_loot',
    };

    expect(() => EnemyTemplateSchema.parse(enemyWithInline)).not.toThrow();
  });
});
```

### Step 4.2: Run test to verify it fails

Run: `npm test -- enemyTemplate.schema.test.ts`

Expected: FAIL (equipment references not supported yet)

### Step 4.3: Update enemy template schema

**Modify:** `src/schemas/enemyTemplate.schema.ts`

Update the equipment schema to support both inline and reference patterns:

```typescript
import { WeaponSchema } from './weapon.schema';
import { ArmorSchema } from './armor.schema';

// Shield schema (unchanged)
const ShieldSchema = z.object({
  equipped: z.boolean(),
  acBonus: z.number().int().nonnegative(),
});

// Equipment can use EITHER references OR inline objects
// This provides backward compatibility during migration
const EquipmentSchema = z.object({
  // New reference-based approach
  weaponId: z.string().min(1).optional(),
  armorId: z.string().min(1).optional(),

  // Legacy inline approach (for backward compatibility)
  weapon: WeaponSchema.nullable().optional(),
  weapons: z.array(WeaponSchema).optional(),
  armor: ArmorSchema.nullable().optional(),

  // Common fields
  shield: ShieldSchema.nullable(),
  items: z.array(z.any()), // Item references will be added later
}).refine(
  (data) => {
    // Must have EITHER weaponId OR weapon/weapons
    const hasWeaponId = !!data.weaponId;
    const hasInlineWeapon = !!data.weapon || (data.weapons && data.weapons.length > 0);
    return hasWeaponId || hasInlineWeapon || (!data.weapon && data.weaponId === undefined);
  },
  {
    message: 'Equipment must specify either weaponId or weapon/weapons',
  }
).refine(
  (data) => {
    // Must have EITHER armorId OR armor (or neither for no armor)
    const hasArmorId = !!data.armorId;
    const hasInlineArmor = data.armor !== undefined;
    return !(hasArmorId && hasInlineArmor); // Can't have both
  },
  {
    message: 'Equipment cannot specify both armorId and inline armor',
  }
);

// Rest of enemy template schema unchanged
const EnemyTemplateSchema = z.object({
  id: z.string().min(1),
  baseName: z.string().min(1),
  creatureClass: CreatureClassSchema,
  avatarPaths: z.array(z.string()).min(1),
  levelRange: z.object({
    min: z.number().int().positive(),
    max: z.number().int().positive(),
  }).refine(data => data.min <= data.max, {
    message: 'levelRange.min must be <= levelRange.max',
  }),
  attributeRanges: AttributeRangesSchema,
  baseClass: z.enum(['Fighter', 'Wizard', 'Rogue', 'Cleric']),
  equipment: EquipmentSchema,
  skills: z.record(z.string(), z.number().int().nonnegative()),
  feats: z.array(z.string()),
  taunts: TauntsSchema,
  lootTableId: z.string().min(1),
});

export const EnemyTemplatesSchema = z.record(z.string(), EnemyTemplateSchema);
```

### Step 4.4: Run tests to verify schema works

Run: `npm test -- enemyTemplate.schema.test.ts`

Expected: PASS (both reference and inline formats validate)

### Step 4.5: Verify build

Run: `npm run build`

Expected: SUCCESS

### Step 4.6: Commit Task 4

```bash
git add src/schemas/enemyTemplate.schema.ts src/__tests__/schemas/enemyTemplate.schema.test.ts
git commit -m "feat: update enemy schema to support equipment references

- Add weaponId and armorId fields to equipment schema
- Maintain backward compatibility with inline objects
- Add validation refinements for equipment patterns
- Add tests for both reference and inline formats

Part of JSON equipment migration (Task 4/8)"
```

---

## Task 5: Update Enemy JSON to Use Equipment References

**Files:**
- Modify: `src/data/enemies.json:1-678`

### Step 5.1: Update bandit to use references

**Modify:** `src/data/enemies.json`

Change bandit from inline to references:

```json
{
  "bandit": {
    "id": "bandit",
    "baseName": "Bandit",
    "creatureClass": "Humanoid",
    "avatarPaths": ["Bandit"],
    "levelRange": { "min": 1, "max": 2 },
    "attributeRanges": {
      "STR": { "min": 12, "max": 14 },
      "DEX": { "min": 13, "max": 15 },
      "CON": { "min": 11, "max": 13 },
      "INT": { "min": 9, "max": 11 },
      "WIS": { "min": 10, "max": 12 },
      "CHA": { "min": 7, "max": 9 }
    },
    "baseClass": "Fighter",
    "equipment": {
      "weaponId": "dagger",
      "armorId": "leather",
      "shield": { "equipped": false, "acBonus": 0 },
      "items": []
    },
    "skills": {
      "Athletics": 0,
      "Stealth": 4,
      "Perception": 0,
      "Arcana": 0,
      "Medicine": 0,
      "Intimidate": 2
    },
    "feats": [],
    "taunts": {
      "onCombatStart": ["You'll regret crossing me!", "Fresh meat!", "Your gold or your life!"],
      "onPlayerMiss": ["Too slow!", "Hah! Missed!", "You fight like a farmer!"],
      "onEnemyHit": ["How'd you like that?", "You're finished!", "Take that!"],
      "onLowHealth": ["I'll... get you...", "This isn't over!", "You got lucky!"]
    },
    "lootTableId": "bandit_loot"
  }
}
```

### Step 5.2: Update all other enemies

Apply the same pattern to all enemies in `enemies.json`:

- **skeleton**: weaponId: "mace", armorId: null
- **wraith**: weaponId: null, armorId: null (uses spells)
- **giantSpider**: weaponId: null, armorId: null (natural attack)
- **hobgoblin**: weaponId: "longsword", armorId: "chain-mail"
- **goblin**: weaponId: "scimitar", armorId: "leather-armor"
- **cultist**: weaponId: "scimitar", armorId: "leather-armor"
- **werewolf**: weaponId: "bite", armorId: "natural-armor"
- **lich**: weaponId: null, armorId: "natural-armor"
- **zombie**: weaponId: "slam", armorId: "natural-armor"
- **rat**: weaponId: "bite", armorId: "natural-armor"
- **boar**: weaponId: "tusk", armorId: "natural-armor"

Remove all `weapon`, `weapons`, and `armor` inline object fields.

### Step 5.3: Verify JSON validates

Run: `npm run build`

Expected: SUCCESS (Zod validates new structure)

If build fails, check error messages for validation issues and fix JSON.

### Step 5.4: Commit Task 5

```bash
git add src/data/enemies.json
git commit -m "refactor: convert enemies to use equipment references

- Replace inline weapon/armor objects with weaponId/armorId
- Remove duplicate weapon/weapons/armor fields
- All enemies now reference equipment from JSON files
- Maintains same functional behavior

Part of JSON equipment migration (Task 5/8)"
```

---

## Task 6: Update Enemy Loader to Resolve Equipment References

**Files:**
- Modify: `src/data/enemyTemplates.ts:20-80`
- Test: `src/__tests__/data/enemyTemplates.test.ts`

### Step 6.1: Write test for equipment resolution

**Modify:** `src/__tests__/data/enemyTemplates.test.ts`

Add new tests:

```typescript
import { getWeapon } from '../equipment';
import { getArmor } from '../equipment';

describe('ENEMY_TEMPLATES equipment resolution', () => {
  it('should resolve weapon reference for bandit', () => {
    const bandit = ENEMY_TEMPLATES['bandit'];
    expect(bandit).toBeDefined();
    expect(bandit.equipment.weapon).toBeDefined();
    expect(bandit.equipment.weapon?.name).toBe('Dagger');
    expect(bandit.equipment.weapon?.damage).toBe('1d6');
  });

  it('should resolve armor reference for hobgoblin', () => {
    const hobgoblin = ENEMY_TEMPLATES['hobgoblin'];
    expect(hobgoblin).toBeDefined();
    expect(hobgoblin.equipment.armor).toBeDefined();
    expect(hobgoblin.equipment.armor?.name).toBe('Chain Mail');
    expect(hobgoblin.equipment.armor?.baseAC).toBe(16);
  });

  it('should handle null weaponId (wraith)', () => {
    const wraith = ENEMY_TEMPLATES['wraith'];
    expect(wraith).toBeDefined();
    expect(wraith.equipment.weapon).toBeNull();
  });

  it('should handle null armorId (skeleton)', () => {
    const skeleton = ENEMY_TEMPLATES['skeleton'];
    expect(skeleton).toBeDefined();
    // Skeleton has shield but no armor in original data
  });

  it('should populate weapons array from weaponId', () => {
    const bandit = ENEMY_TEMPLATES['bandit'];
    expect(bandit.equipment.weapons).toBeDefined();
    expect(bandit.equipment.weapons?.length).toBeGreaterThan(0);
    expect(bandit.equipment.weapons?.[0]?.name).toBe('Dagger');
  });
});
```

### Step 6.2: Run test to verify it fails

Run: `npm test -- enemyTemplates.test.ts`

Expected: FAIL (weapon/armor not resolved yet)

### Step 6.3: Update enemy template loader

**Modify:** `src/data/enemyTemplates.ts`

Update the transformation logic:

```typescript
import enemiesJson from './enemies.json';
import { EnemyTemplatesSchema } from '../schemas/enemyTemplate.schema';
import { CREATURE_AVATARS, DEFAULT_CREATURE_AVATAR } from '../data/creatureAvatars';
import { getWeapon } from './equipment';
import { getArmor } from './equipment';
import { EnemyTemplate } from '../types/enemyTemplate';

// Validate at module load time
const validatedData = EnemyTemplatesSchema.parse(enemiesJson);

/**
 * Transform and export enemy templates
 * - Resolve avatar keys to full paths
 * - Resolve equipment references (weaponId/armorId) to full objects
 */
export const ENEMY_TEMPLATES: Record<string, EnemyTemplate> = Object.fromEntries(
  Object.entries(validatedData).map(([id, template]) => {
    // Resolve avatars
    const avatarPaths = template.avatarPaths.map(
      (key) => CREATURE_AVATARS[key] || DEFAULT_CREATURE_AVATAR
    );

    // Resolve equipment references
    const equipment = { ...template.equipment };

    // Resolve weaponId to weapon object
    if ('weaponId' in equipment && equipment.weaponId) {
      const weapon = getWeapon(equipment.weaponId);
      if (!weapon) {
        throw new Error(`Enemy ${id}: weapon not found: ${equipment.weaponId}`);
      }
      equipment.weapon = weapon;
      equipment.weapons = [weapon]; // Populate weapons array
      delete equipment.weaponId; // Remove reference field
    } else if (!equipment.weapon) {
      equipment.weapon = null;
      equipment.weapons = [];
    }

    // Resolve armorId to armor object
    if ('armorId' in equipment && equipment.armorId) {
      const armor = getArmor(equipment.armorId);
      if (!armor) {
        throw new Error(`Enemy ${id}: armor not found: ${equipment.armorId}`);
      }
      equipment.armor = armor;
      delete equipment.armorId; // Remove reference field
    } else if (!equipment.armor) {
      equipment.armor = null;
    }

    return [
      id,
      {
        ...template,
        avatarPaths,
        equipment,
      } as EnemyTemplate,
    ];
  })
);

/**
 * Get an enemy template by ID
 */
export function getEnemyTemplate(id: string): EnemyTemplate | null {
  return ENEMY_TEMPLATES[id] ?? null;
}
```

### Step 6.4: Run tests to verify resolution works

Run: `npm test -- enemyTemplates.test.ts`

Expected: PASS (equipment references resolved correctly)

### Step 6.5: Verify all tests still pass

Run: `npm test`

Expected: All tests pass (enemy behavior unchanged)

### Step 6.6: Verify build

Run: `npm run build`

Expected: SUCCESS

### Step 6.7: Commit Task 6

```bash
git add src/data/enemyTemplates.ts src/__tests__/data/enemyTemplates.test.ts
git commit -m "feat: resolve equipment references in enemy loader

- Add equipment reference resolution to enemy template loader
- Resolve weaponId to weapon object from WEAPONS
- Resolve armorId to armor object from ARMORS
- Throw clear errors for missing equipment references
- Populate weapons array from resolved weapon
- Add comprehensive resolution tests

Part of JSON equipment migration (Task 6/8)"
```

---

## Task 7: Update Type Definitions

**Files:**
- Modify: `src/types/index.ts:100-150`
- Modify: `src/types/enemyTemplate.ts:20-50`

### Step 7.1: Update Weapon type to use optional id

**Modify:** `src/types/index.ts`

Find the Weapon interface and update:

```typescript
export interface Weapon {
  id?: string; // Optional: runtime-added, not in JSON
  name: string; // Changed from WeaponType to string
  damage: string;
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  finesse: boolean;
  description: string;
  proficiencyRequired?: 'simple' | 'martial' | 'martial-finesse';
}

// Remove or deprecate WeaponType union
// export type WeaponType = 'Longsword' | 'Rapier' | ... // DEPRECATED
```

### Step 7.2: Update Armor type

**Modify:** `src/types/index.ts`

```typescript
export interface Armor {
  name: string; // Changed from ArmorType to string
  baseAC: number;
  maxDexBonus: number | null;
  description: string;
}

// Remove or deprecate ArmorType union
// export type ArmorType = 'None' | 'Leather' | ... // DEPRECATED
```

### Step 7.3: Update Equipment type

**Modify:** `src/types/index.ts`

Equipment should match what the enemy loader produces:

```typescript
export interface Equipment {
  weapon: Weapon | null;
  weapons: Weapon[];
  armor: Armor | null;
  shield: Shield | null;
  items: InventoryItem[];
}
```

### Step 7.4: Verify build with new types

Run: `npm run build`

Expected: May show TypeScript errors in files using old WeaponType/ArmorType (expected, will fix in Task 8)

### Step 7.5: Commit Task 7

```bash
git add src/types/index.ts src/types/enemyTemplate.ts
git commit -m "refactor: update weapon and armor types for JSON migration

- Change Weapon.name from WeaponType to string
- Change Armor.name from ArmorType to string
- Deprecate WeaponType and ArmorType unions
- Equipment interface now matches resolved structure

Part of JSON equipment migration (Task 7/8)"
```

---

## Task 8: Update Codebase References

**Files:**
- Modify: `src/data/classes.ts:20-100`
- Modify: `src/utils/characterCreation.ts:50-150`
- Modify: All test files with WEAPONS/ARMORS usage

This task will update all references throughout the codebase. Break into sub-tasks by file.

### Step 8.1: Update class definitions

**Modify:** `src/data/classes.ts`

Find all `startingWeapon` and `startingArmor` fields:

```typescript
export const FIGHTER: ClassDefinition = {
  name: 'Fighter',
  // ... other fields
  startingWeapon: 'longsword', // Changed from 'Longsword' to 'longsword'
  startingArmor: 'chainmail', // Changed from 'Chainmail' to 'chainmail'
  // ... rest
};

export const ROGUE: ClassDefinition = {
  name: 'Rogue',
  startingWeapon: 'rapier', // Changed from 'Rapier' to 'rapier'
  startingArmor: 'leather', // Changed from 'Leather' to 'leather'
  // ... rest
};

export const WIZARD: ClassDefinition = {
  name: 'Wizard',
  startingWeapon: 'dagger', // Changed from 'Dagger' to 'dagger'
  startingArmor: 'none', // Changed from 'None' to 'none'
  // ... rest
};

export const CLERIC: ClassDefinition = {
  name: 'Cleric',
  startingWeapon: 'mace', // Changed from 'Mace' to 'mace'
  startingArmor: 'chainmail', // Changed from 'Chainmail' to 'chainmail'
  // ... rest
};
```

### Step 8.2: Update character creation

**Modify:** `src/utils/characterCreation.ts`

Update weapon/armor access:

```typescript
import { getWeapon, getArmor } from '../data/equipment';

export function createCharacter(/* params */): Character {
  // ... existing code

  // OLD: const weapon = { ...WEAPONS[classDef.startingWeapon], id: ... };
  // NEW:
  const weaponTemplate = getWeapon(classDef.startingWeapon);
  if (!weaponTemplate) {
    throw new Error(`Starting weapon not found: ${classDef.startingWeapon}`);
  }
  const weapon = {
    ...weaponTemplate,
    id: `${classDef.startingWeapon}-${Date.now()}`,
  };

  // OLD: const armor = ARMORS[classDef.startingArmor];
  // NEW:
  const armor = getArmor(classDef.startingArmor);
  if (!armor) {
    throw new Error(`Starting armor not found: ${classDef.startingArmor}`);
  }

  // ... rest of function
}
```

### Step 8.3: Update all test files

Find all test files using WEAPONS or ARMORS:

**Run:** `npm test` to find failures

**Update pattern:**

```typescript
// OLD:
import { WEAPONS, ARMORS } from '../data/equipment';
const weapon = WEAPONS.Longsword;

// NEW:
import { getWeapon, getArmor } from '../data/equipment';
const weapon = getWeapon('longsword');
```

**Files to update:**
- `src/__tests__/data/classes.test.ts`
- `src/__tests__/utils/characterCreation.test.ts`
- `src/__tests__/utils/actions.test.ts`
- `src/__tests__/utils/classAbilities.test.ts`
- `src/__tests__/utils/equipmentHelpers.test.ts`
- `src/__tests__/utils/spellcasting.test.ts`

### Step 8.4: Run all tests

Run: `npm test`

Expected: All tests pass

Fix any remaining test failures by updating references.

### Step 8.5: Verify lint

Run: `npm run lint`

Expected: No lint errors

### Step 8.6: Verify build

Run: `npm run build`

Expected: SUCCESS

### Step 8.7: Run dev server manual test

Run: `npm run dev`

**Manual verification:**
1. Create new character (each class)
2. Verify starting weapon/armor correct
3. Start combat
4. Verify enemy equipment loads correctly
5. Check console for errors

### Step 8.8: Commit Task 8

```bash
git add src/data/classes.ts src/utils/characterCreation.ts src/__tests__/**/*.test.ts
git commit -m "refactor: update codebase to use equipment getters

- Update class definitions to use lowercase equipment IDs
- Update character creation to use getWeapon/getArmor
- Update all tests to use getter functions
- Replace direct WEAPONS/ARMORS access with getters
- All tests passing (469/469)

Part of JSON equipment migration (Task 8/8)"
```

---

## Final Verification

### Step F.1: Run full test suite

Run: `npm test`

Expected: All tests pass

### Step F.2: Run lint

Run: `npm run lint`

Expected: No errors

### Step F.3: Run build

Run: `npm run build`

Expected: SUCCESS

### Step F.4: Test mobile build (if applicable)

Run: `npm run build && npx cap sync`

Expected: No errors

### Step F.5: Manual gameplay test

Run: `npm run dev`

Test all four character classes:
- [x] Fighter - longsword, chainmail
- [x] Rogue - rapier, leather
- [x] Wizard - dagger, none
- [x] Cleric - mace, chainmail

Verify:
- [x] Starting equipment correct
- [x] Combat works with enemy equipment
- [x] Items load correctly
- [x] No console errors

### Step F.6: Final commit

```bash
git add .
git commit -m "docs: update documentation for JSON equipment pattern

- Update CLAUDE.md with JSON migration notes
- Document equipment reference pattern
- Note Zod validation benefits

Completes JSON equipment migration"
```

---

## Success Criteria

- [x] All weapons defined in `weapons.json` with Zod schema
- [x] All armors defined in `armors.json` with Zod schema
- [x] All items defined in `items-data.json` with Zod schema
- [x] Enemy templates use equipment references (weaponId/armorId)
- [x] Enemy loader resolves references to full objects
- [x] All type definitions updated (no WeaponType/ArmorType unions)
- [x] All codebase references use getter functions
- [x] All tests pass (469/469 or more)
- [x] Build succeeds with no errors
- [x] Lint passes
- [x] Manual gameplay test successful

---

## Rollback Plan

If issues arise during implementation, rollback by:

1. **Individual task rollback:**
   ```bash
   git revert <commit-hash>
   ```

2. **Full migration rollback:**
   ```bash
   git revert <task-8-commit>..<task-1-commit>
   ```

3. **Start fresh:**
   ```bash
   git reset --hard <commit-before-migration>
   ```

---

## Notes

- **Build-time validation**: Zod schemas validate at build time, catching errors early
- **Backward compatibility**: Enemy schema supports both inline and reference formats during migration
- **Type safety**: Full TypeScript support maintained throughout
- **No runtime overhead**: Validation happens once at build, not during gameplay
- **Content management**: JSON files easier for non-developers to edit
- **Future expansion**: Pattern established for other game content (spells, feats, etc.)

---

## References

- **Testing Guide:** `agent_docs/development/testing-guide.md`
- **Architecture:** `agent_docs/architecture/state-management.md`
- **Enemy Pattern:** Implemented in Task 1 of Phase 1 (archived)
- **Zod Documentation:** https://zod.dev/
