import type { Character, Weapon, Armor, ItemEffect } from '../types';
import { CLASSES } from '../data/classes';

/**
 * Check if character has proficiency with a weapon
 */
export function hasWeaponProficiency(character: Character, weapon: Weapon): boolean {
  const classProficiencies = CLASSES[character.class].proficiencies.weapons;
  const required = weapon.proficiencyRequired ?? 'simple';

  // Check exact match
  if (classProficiencies.includes(required)) {
    return true;
  }

  // Martial proficiency includes martial-finesse weapons
  if (required === 'martial-finesse' && classProficiencies.includes('martial')) {
    return true;
  }

  return false;
}

/**
 * Check if character has proficiency with armor
 */
export function hasArmorProficiency(character: Character, armor: Armor): boolean {
  const classProficiencies = CLASSES[character.class].proficiencies.armor;
  const required = armor.proficiencyRequired;

  // No proficiency required for no armor
  if (!required) return true;

  return classProficiencies.includes(required);
}

/**
 * Check if character can use an item based on state
 */
export function canUseItem(
  character: Character,
  item: { quantity?: number; effect?: ItemEffect },
  inCombat: boolean
): boolean {
  // No quantity left
  if ((item.quantity ?? 0) === 0) return false;

  // Context-based restrictions
  if (item.effect?.type === 'heal') {
    return character.hp < character.maxHp; // Only if damaged
  }
  if (item.effect?.type === 'escape') {
    return inCombat; // Only during combat
  }
  if (item.effect?.type === 'remove-condition') {
    // Check if character has the condition (Phase 1.4+)
    // TODO: Implement conditions system in Phase 1.4
    // For now, return false as conditions are not yet implemented on Character
    return false;
  }

  // Default: usable
  return true;
}

/**
 * Get reason why item is disabled
 */
export function getItemDisabledReason(
  character: Character,
  item: { quantity?: number; effect?: ItemEffect },
  inCombat: boolean
): string {
  if ((item.quantity ?? 0) === 0) return 'None left';
  if (item.effect?.type === 'heal' && character.hp >= character.maxHp) return 'At full HP';
  if (item.effect?.type === 'escape' && !inCombat) return 'Only usable in combat';
  return '';
}
