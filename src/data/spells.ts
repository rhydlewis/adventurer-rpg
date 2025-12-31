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
  Object.entries(validatedSpells).map(([id, spell]) => {
    // Add targetRestriction for Daze spell (can't be serialized in JSON)
    if (id === 'daze') {
      return [
        id,
        {
          ...spell,
          effect: {
            ...spell.effect,
            targetRestriction: (target: { hp: number }) => target.hp <= 5,
          },
        } as Spell,
      ];
    }
    return [id, spell as Spell];
  })
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
 * Wizard Level 1 Spells (requires spell slots)
 */
export const WIZARD_LEVEL1_SPELLS: Spell[] = [
  SPELLS.magic_missile,
  SPELLS.shield,
];

/**
 * Cleric Level 1 Spells (requires spell slots)
 */
export const CLERIC_LEVEL1_SPELLS: Spell[] = [
  SPELLS.cure_wounds,
  SPELLS.shield_of_faith,
  SPELLS.bless_weapon,
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

/**
 * Get level 1 spells for a character class
 */
export function getLevel1SpellsForClass(className: string): Spell[] {
  switch (className) {
    case 'Wizard':
      return WIZARD_LEVEL1_SPELLS;
    case 'Cleric':
      return CLERIC_LEVEL1_SPELLS;
    default:
      return [];
  }
}

// Legacy exports for backward compatibility
export const RAY_OF_FROST = SPELLS.ray_of_frost;
export const ACID_SPLASH = SPELLS.acid_splash;
export const DAZE = SPELLS.daze;
export const DIVINE_FAVOR = SPELLS.divine_favor;
export const RESISTANCE = SPELLS.resistance;
export const SACRED_FLAME = SPELLS.sacred_flame;
