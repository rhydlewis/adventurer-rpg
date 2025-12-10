import type { Character } from '../types/character';
import type { Action, AttackAction, UseAbilityAction, CastSpellAction } from '../types/action';
import { getCantripsForClass } from '../data/spells';

/**
 * Get all available actions for a character during combat
 * Phase 1.3: Basic action selection UI
 */
export function getAvailableActions(character: Character): Action[] {
  const actions: Action[] = [];

  // 1. Basic Attack - always available
  actions.push({
    type: 'attack',
    name: 'Attack',
    description: `Attack with ${character.equipment.weapon.name}`,
    available: true,
  } as AttackAction);

  // 1b. Fighter Power Attack - modified attack option
  if (character.class === 'Fighter') {
    actions.push({
      type: 'attack',
      variant: 'power_attack',
      name: 'Power Attack',
      description: 'Attack with -2 to hit, +4 damage',
      available: true,
      attackModifier: -2,
      damageModifier: 4,
    } as AttackAction);
  }

  // 2. Class Abilities - check resources
  character.resources.abilities.forEach((ability) => {
    const isAvailable = ability.currentUses > 0 || ability.type === 'at-will';
    actions.push({
      type: 'use_ability',
      name: ability.name,
      description: ability.description,
      available: isAvailable,
      disabled: !isAvailable,
      disabledReason: isAvailable ? undefined : 'No uses remaining',
      abilityId: ability.name,
      usesRemaining: ability.currentUses,
      maxUses: ability.maxUses,
    } as UseAbilityAction);
  });

  // 3. Spell Casting - for Wizard/Cleric
  if (character.resources.spellSlots) {
    const slots = character.resources.spellSlots;

    // Cantrips (at-will) - create an action for each cantrip
    const cantrips = getCantripsForClass(character.class);
    cantrips.forEach((cantrip) => {
      actions.push({
        type: 'cast_spell',
        spellId: cantrip.id,
        name: cantrip.name,
        description: cantrip.description,
        available: true,
        spellLevel: 0,
        requiresSlot: false,
      } as CastSpellAction);
    });

    // Level 1 spells (TODO: Phase 1.3+ - implement specific spell selection UI)
    if (slots.level1.current > 0) {
      actions.push({
        type: 'cast_spell',
        spellId: 'placeholder_level1',
        name: 'Cast Spell (Level 1)',
        description: `Cast a level 1 spell (${slots.level1.current}/${slots.level1.max} slots remaining)`,
        available: true,
        spellLevel: 1,
        requiresSlot: true,
      } as CastSpellAction);
    }
  }

  // 4. Use Item - healing potions (Phase 1.3+)
  // TODO: Implement item usage when inventory system is added

  return actions;
}

/**
 * Check if character can perform a specific action
 */
export function canPerformAction(character: Character, action: Action): boolean {
  if (!action.available) return false;

  switch (action.type) {
    case 'attack':
      return true;

    case 'use_ability': {
      const ability = character.resources.abilities.find(
        (a) => a.name === action.abilityId
      );
      return ability ? ability.currentUses > 0 || ability.type === 'at-will' : false;
    }

    case 'cast_spell': {
      if (!character.resources.spellSlots) return false;
      if (action.spellLevel === 0) return true; // Cantrips always available
      if (action.spellLevel === 1) {
        return character.resources.spellSlots.level1.current > 0;
      }
      return false;
    }

    case 'use_item':
      // TODO: Check inventory
      return false;

    default:
      return false;
  }
}
