import type { Weapon, Armor } from '../types';

/**
 * Magical weapons with enchantment bonuses
 * These provide +N to attack and damage rolls
 */
export const MAGICAL_WEAPONS: Record<string, Weapon> = {
  // +1 Weapons
  'longsword-1': {
    id: 'longsword-1',
    name: 'Longsword +1',
    damage: '1d8',
    damageType: 'slashing',
    finesse: false,
    description: 'A masterfully crafted blade with a faint magical glow',
    proficiencyRequired: 'martial',
    enchantmentBonus: 1,
  },
  'rapier-1': {
    id: 'rapier-1',
    name: 'Rapier +1',
    damage: '1d6',
    damageType: 'piercing',
    finesse: true,
    description: 'A perfectly balanced blade that sings through the air',
    proficiencyRequired: 'martial-finesse',
    enchantmentBonus: 1,
  },
  'dagger-1': {
    id: 'dagger-1',
    name: 'Dagger +1',
    damage: '1d4',
    damageType: 'piercing',
    finesse: true,
    description: 'A keen-edged blade that never dulls',
    proficiencyRequired: 'simple',
    enchantmentBonus: 1,
  },
  'mace-1': {
    id: 'mace-1',
    name: 'Mace +1',
    damage: '1d6',
    damageType: 'bludgeoning',
    finesse: false,
    description: 'A divinely blessed weapon that strikes with holy power',
    proficiencyRequired: 'simple',
    enchantmentBonus: 1,
  },

  // +2 Weapons
  'longsword-2': {
    id: 'longsword-2',
    name: 'Longsword +2',
    damage: '1d8',
    damageType: 'slashing',
    finesse: false,
    description: 'An exceptional blade crackling with arcane energy',
    proficiencyRequired: 'martial',
    enchantmentBonus: 2,
  },
  'rapier-2': {
    id: 'rapier-2',
    name: 'Rapier +2',
    damage: '1d6',
    damageType: 'piercing',
    finesse: true,
    description: 'A legendary duelist\'s blade that strikes true',
    proficiencyRequired: 'martial-finesse',
    enchantmentBonus: 2,
  },
  'dagger-2': {
    id: 'dagger-2',
    name: 'Dagger +2',
    damage: '1d4',
    damageType: 'piercing',
    finesse: true,
    description: 'An assassin\'s blade forged in shadow and moonlight',
    proficiencyRequired: 'simple',
    enchantmentBonus: 2,
  },
  'mace-2': {
    id: 'mace-2',
    name: 'Mace +2',
    damage: '1d6',
    damageType: 'bludgeoning',
    finesse: false,
    description: 'A sacred weapon blessed by celestial beings',
    proficiencyRequired: 'simple',
    enchantmentBonus: 2,
  },

  // +3 Weapons
  'longsword-3': {
    id: 'longsword-3',
    name: 'Longsword +3',
    damage: '1d8',
    damageType: 'slashing',
    finesse: false,
    description: 'A legendary blade of incredible power, forged by ancient smiths',
    proficiencyRequired: 'martial',
    enchantmentBonus: 3,
  },
  'rapier-3': {
    id: 'rapier-3',
    name: 'Rapier +3',
    damage: '1d6',
    damageType: 'piercing',
    finesse: true,
    description: 'A master\'s blade that seems to move of its own accord',
    proficiencyRequired: 'martial-finesse',
    enchantmentBonus: 3,
  },
  'dagger-3': {
    id: 'dagger-3',
    name: 'Dagger +3',
    damage: '1d4',
    damageType: 'piercing',
    finesse: true,
    description: 'A mythical blade said to pierce any defense',
    proficiencyRequired: 'simple',
    enchantmentBonus: 3,
  },
  'mace-3': {
    id: 'mace-3',
    name: 'Mace +3',
    damage: '1d6',
    damageType: 'bludgeoning',
    finesse: false,
    description: 'A holy relic radiating divine light and power',
    proficiencyRequired: 'simple',
    enchantmentBonus: 3,
  },
};

/**
 * Magical armor with enchantment bonuses
 * These provide +N to AC
 */
export const MAGICAL_ARMOR: Record<string, Armor> = {
  // +1 Armor
  'leather-1': {
    name: 'Leather +1',
    baseAC: 12,
    maxDexBonus: null,
    description: 'Supple leather armor reinforced with magical wards',
    proficiencyRequired: 'light',
    enchantmentBonus: 1,
  },
  'chainmail-1': {
    name: 'Chainmail +1',
    baseAC: 16,
    maxDexBonus: 2,
    description: 'Expertly crafted chainmail with protective enchantments',
    proficiencyRequired: 'medium',
    enchantmentBonus: 1,
  },

  // +2 Armor
  'leather-2': {
    name: 'Leather +2',
    baseAC: 12,
    maxDexBonus: null,
    description: 'Leather armor imbued with powerful protective magic',
    proficiencyRequired: 'light',
    enchantmentBonus: 2,
  },
  'chainmail-2': {
    name: 'Chainmail +2',
    baseAC: 16,
    maxDexBonus: 2,
    description: 'Masterwork chainmail gleaming with arcane energy',
    proficiencyRequired: 'medium',
    enchantmentBonus: 2,
  },

  // +3 Armor
  'leather-3': {
    name: 'Leather +3',
    baseAC: 12,
    maxDexBonus: null,
    description: 'Legendary armor said to be woven from dragon hide',
    proficiencyRequired: 'light',
    enchantmentBonus: 3,
  },
  'chainmail-3': {
    name: 'Chainmail +3',
    baseAC: 16,
    maxDexBonus: 2,
    description: 'Ancient armor forged in celestial fires, nearly impenetrable',
    proficiencyRequired: 'medium',
    enchantmentBonus: 3,
  },
};

/**
 * Get a magical weapon by ID
 */
export function getMagicalWeapon(id: string): Weapon | null {
  return MAGICAL_WEAPONS[id] ?? null;
}

/**
 * Get a magical armor by ID
 */
export function getMagicalArmor(id: string): Armor | null {
  return MAGICAL_ARMOR[id] ?? null;
}

/**
 * Get all magical weapons of a specific enhancement level
 */
export function getMagicalWeaponsByLevel(enchantmentLevel: 1 | 2 | 3): Weapon[] {
  return Object.values(MAGICAL_WEAPONS).filter(
    w => w.enchantmentBonus === enchantmentLevel
  );
}

/**
 * Get all magical armor of a specific enhancement level
 */
export function getMagicalArmorByLevel(enchantmentLevel: 1 | 2 | 3): Armor[] {
  return Object.values(MAGICAL_ARMOR).filter(
    a => a.enchantmentBonus === enchantmentLevel
  );
}
