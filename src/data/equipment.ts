import type { Weapon, Armor, WeaponType, ArmorType, Item } from '../types';

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
    finesse: true, // Can use DEX for attack and damage
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
  Scimitar: {
    name: 'Scimitar',
    damage: '1d6',
    damageType: 'slashing',
    finesse: false,
    description: 'A curved blade favored by raiders',
    proficiencyRequired: 'martial',
  },
  Bite: {
    name: 'Bite',
    damage: '1d6',
    damageType: 'piercing',
    finesse: false,
    description: 'Natural bite attack',
    proficiencyRequired: 'simple',
  },
  Slam: {
    name: 'Slam',
    damage: '1d6',
    damageType: 'bludgeoning',
    finesse: false,
    description: 'Natural slam attack',
    proficiencyRequired: 'simple',
  },
  Tusk: {
    name: 'Tusk',
    damage: '1d6',
    damageType: 'slashing',
    finesse: false,
    description: 'Natural tusk attack',
    proficiencyRequired: 'simple',
  },
};

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
