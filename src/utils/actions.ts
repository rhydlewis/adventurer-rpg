import type { Character } from '../types';
import type { Action, AttackAction, UseAbilityAction, CastSpellAction } from '../types/action';
import { getCantripsForClass, getLevel1SpellsForClass } from '../data/spells';
import { meetsPrerequisites } from './feats';
import { hasResource } from './resources';

/**
 * Get all available actions for a character during combat
 * Phase 1.3: Basic action selection UI
 */
export function getAvailableActions(character: Character): Action[] {
  const actions: Action[] = [];

  // 1. Basic Attack - always available
  const weaponName = character.equipment.weapon?.name || 'Unarmed Strike';
  actions.push({
    type: 'attack',
    name: 'Attack',
    description: `Attack with ${weaponName}`,
    available: true,
  } as AttackAction);

  // 1b. Attack Variant Feats - dynamic feat-based attacks
  if (character.feats && character.feats.length > 0) {
    character.feats.forEach((feat) => {
      // Only show attack_variant type feats
      if (feat.type === 'attack_variant') {
        // Check prerequisites
        const meetsPrereqs = meetsPrerequisites(feat, character);

        // Check resource availability
        let hasResources = true;
        let disabledReason: string | undefined;

        if (feat.effects.consumesResource) {
          const { type, level } = feat.effects.consumesResource;
          hasResources = hasResource(character, type, level);
          if (!hasResources) {
            disabledReason = `No ${type.replace('_', ' ')} available`;
          }
        }

        if (!meetsPrereqs) {
          disabledReason = 'Prerequisites not met';
        }

        const isAvailable = meetsPrereqs && hasResources;

        actions.push({
          type: 'attack',
          featId: feat.id,
          name: feat.name,
          description: feat.description,
          available: isAvailable,
          disabled: !isAvailable,
          disabledReason,
          attackModifier: feat.effects.attackModifier,
          damageModifier: feat.effects.damageModifier,
        } as AttackAction);
      }
    });
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

  // 2b. Ability Feats - feats that act like abilities
  if (character.feats && character.feats.length > 0) {
    character.feats.forEach((feat) => {
      // Only show ability type feats
      if (feat.type === 'ability') {
        // Check prerequisites
        const meetsPrereqs = meetsPrerequisites(feat, character);

        // Check resource availability
        let hasResources = true;
        let disabledReason: string | undefined;
        let usesRemaining: number | undefined;
        let maxUses: number | undefined;

        if (feat.effects.consumesResource) {
          const { type } = feat.effects.consumesResource;
          hasResources = hasResource(character, type);

          // Get uses remaining for display
          if (type === 'channel_energy') {
            const channelEnergy = character.resources.abilities.find(a => a.name === 'Channel Energy');
            if (channelEnergy) {
              usesRemaining = channelEnergy.currentUses;
              maxUses = channelEnergy.maxUses;
            }
          }

          if (!hasResources) {
            disabledReason = `No ${type.replace('_', ' ')} available`;
          }
        }

        if (!meetsPrereqs) {
          disabledReason = 'Prerequisites not met';
        }

        const isAvailable = meetsPrereqs && hasResources;

        actions.push({
          type: 'use_ability',
          featId: feat.id,
          name: feat.name,
          description: feat.description,
          available: isAvailable,
          disabled: !isAvailable,
          disabledReason,
          usesRemaining,
          maxUses,
        } as UseAbilityAction);
      }
    });
  }

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

    // Level 1 spells - create an action for each available spell
    if (slots.level1.current > 0) {
      const level1Spells = getLevel1SpellsForClass(character.class);
      level1Spells.forEach((spell) => {
        actions.push({
          type: 'cast_spell',
          spellId: spell.id,
          name: `${spell.name} (Lv1)`,
          description: `${spell.description} [${slots.level1.current}/${slots.level1.max} slots]`,
          available: true,
          spellLevel: 1,
          requiresSlot: true,
        } as CastSpellAction);
      });
    }
  }

  // 4. Use Item
  // Note: Items handled separately via Items button popover, not individual actions
  // This keeps the action grid clean and mobile-friendly

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

    case 'use_item': {
      // Check if item exists and has quantity
      const item = character.equipment.items.find(i => i.id === action.itemId);
      return item ? (item.quantity ?? 0) > 0 : false;
    }

    default:
      return false;
  }
}
