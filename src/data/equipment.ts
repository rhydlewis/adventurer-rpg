import type { Weapon, Armor, Item } from '../types';
import weaponsJson from './weapons.json';
import { WeaponsSchema } from '../schemas/weapon.schema';
import armorsJson from './armors.json';
import { ArmorsSchema } from '../schemas/armor.schema';

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

// Starting items by type
export const STARTING_ITEMS: Record<string, Item[]> = {
  all: [
    {
      id: 'healing-potion',
      name: 'Healing Potion',
      description: 'Restores 2d8+2 hit points',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'heal', amount: '2d8+2' },
      value: 25,
      quantity: 2,
    },
  ],
  Rogue: [
    {
      id: 'smoke-bomb',
      name: 'Smoke Bomb',
      description: 'Automatically escape from combat (one use)',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'escape' },
      value: 30,
      quantity: 1,
    },
  ],
  Wizard: [
    {
      id: 'arcane-scroll',
      name: 'Arcane Scroll',
      description: 'Cast an extra spell (one use per scroll)',
      type: 'consumable',
      usableInCombat: true,
      effect: { type: 'spell', spellName: 'any' },
      value: 50,
      quantity: 2,
    },
  ],
};
