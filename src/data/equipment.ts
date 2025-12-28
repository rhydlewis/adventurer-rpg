import type { Weapon, Armor, ArmorType, Item } from '../types';
import weaponsJson from './weapons.json';
import { WeaponsSchema } from '../schemas/weapon.schema';

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

export const ARMORS: Record<ArmorType, Armor> = {
  None: {
    name: 'None',
    baseAC: 10,
    maxDexBonus: null, // Unlimited DEX bonus
    description: 'No armor worn',
    proficiencyRequired: undefined, // No proficiency needed for no armor
  },
  Leather: {
    name: 'Leather',
    baseAC: 12,
    maxDexBonus: null, // Light armor, unlimited DEX
    description: 'Light, flexible leather armor',
    proficiencyRequired: 'light',
  },
  Chainmail: {
    name: 'Chainmail',
    baseAC: 16,
    maxDexBonus: 2, // Medium armor, max +2 DEX
    description: 'Interlocking metal rings providing solid protection',
    proficiencyRequired: 'medium',
  },
  'Chain Mail': {
    name: 'Chain Mail',
    baseAC: 16,
    maxDexBonus: 2, // Medium armor, max +2 DEX
    description: 'Interlocking metal rings providing solid protection',
    proficiencyRequired: 'medium',
  },
  'Leather Armor': {
    name: 'Leather Armor',
    baseAC: 12,
    maxDexBonus: null, // Light armor, unlimited DEX
    description: 'Light, flexible leather armor',
    proficiencyRequired: 'light',
  },
  'Natural Armor': {
    name: 'Natural Armor',
    baseAC: 10,
    maxDexBonus: null,
    description: 'Natural protection from thick hide or scales',
    proficiencyRequired: undefined,
  },
};

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
