import type { Character } from '../types/character';
import type { ItemType, ItemEffect } from '../types/equipment';
import { calculateModifier } from './dice';
import { STARTING_ITEMS } from '../data/equipment';

export interface WeaponDamageInfo {
  damageDice: string; // e.g., '1d8'
  modifier: number; // Ability modifier
  totalNotation: string; // e.g., '1d8+3' or '1d8-1'
}

/**
 * Get weapon damage notation with appropriate ability modifier
 * @param character Character wielding the weapon
 * @returns Weapon damage information
 */
export function getWeaponDamage(character: Character): WeaponDamageInfo {
  const weapon = character.equipment.weapon;
  const strMod = calculateModifier(character.attributes.STR);
  const dexMod = calculateModifier(character.attributes.DEX);

  // Finesse weapons can use DEX or STR (whichever is higher)
  const modifier = weapon.finesse ? Math.max(strMod, dexMod) : strMod;

  // Build notation string
  const totalNotation =
    modifier >= 0 ? `${weapon.damage}+${modifier}` : `${weapon.damage}${modifier}`;

  return {
    damageDice: weapon.damage,
    modifier,
    totalNotation,
  };
}

/**
 * Get weapon attack bonus (BAB + ability modifier)
 * @param character Character making the attack
 * @returns Attack bonus
 */
export function getWeaponAttackBonus(character: Character): number {
  const weapon = character.equipment.weapon;
  const strMod = calculateModifier(character.attributes.STR);
  const dexMod = calculateModifier(character.attributes.DEX);

  // Finesse weapons can use DEX or STR (whichever is higher)
  const abilityMod = weapon.finesse ? Math.max(strMod, dexMod) : strMod;

  return character.bab + abilityMod;
}

/**
 * Check if character can use an item
 * @param character Character to check
 * @param itemName Name of the item
 * @returns true if item exists and quantity > 0
 */
export function canUseItem(character: Character, itemName: ItemType): boolean {
  const item = character.equipment.items.find((i) => i.name === itemName);
  return item !== undefined && (item.quantity ?? 0) > 0;
}

/**
 * Get the effect of an item by name
 * @param itemName Name of the item
 * @returns Item effect
 * @throws Error if item not found
 */
export function getItemEffect(itemName: ItemType): ItemEffect {
  // Search through all starting item lists
  const allItems = [
    ...STARTING_ITEMS.all,
    ...(STARTING_ITEMS.Rogue || []),
    ...(STARTING_ITEMS.Wizard || []),
  ];

  const item = allItems.find((i) => i.name === itemName);
  if (!item) {
    throw new Error(`Item not found: ${itemName}`);
  }

  if (!item.effect) {
    throw new Error(`Item has no effect: ${itemName}`);
  }

  return item.effect;
}
