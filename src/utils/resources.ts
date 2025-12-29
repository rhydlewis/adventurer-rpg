import type { Character } from '../types/character';

/**
 * Restore all character resources to maximum
 * Called after combat ends or on long rest
 */
export function restoreResources(character: Character): Character {
  const restored = { ...character };

  // Restore ability resources (Second Wind, Dodge, Channel Energy, Turn Undead, etc.)
  const restoredAbilities = character.resources.abilities.map((ability) => ({
    ...ability,
    currentUses: ability.maxUses,
  }));

  // Restore spell slots
  let restoredSlots = character.resources.spellSlots;
  if (restoredSlots) {
    restoredSlots = {
      level0: { ...restoredSlots.level0, current: restoredSlots.level0.max },
      level1: { ...restoredSlots.level1, current: restoredSlots.level1.max },
    };
  }

  return {
    ...restored,
    resources: {
      abilities: restoredAbilities,
      spellSlots: restoredSlots,
    },
  };
}

/**
 * Consume an ability resource (Second Wind, Channel Energy, etc.)
 * Returns updated character or null if resource is unavailable
 */
export function consumeAbilityResource(
  character: Character,
  abilityName: string
): Character | null {
  const ability = character.resources.abilities.find((a) => a.name === abilityName);

  if (!ability || ability.currentUses <= 0) {
    return null; // Cannot use
  }

  const updatedAbilities = character.resources.abilities.map((a) =>
    a.name === abilityName ? { ...a, currentUses: a.currentUses - 1 } : a
  );

  return {
    ...character,
    resources: {
      ...character.resources,
      abilities: updatedAbilities,
    },
  };
}

/**
 * Check if ability resource is available
 */
export function hasAbilityResource(character: Character, abilityName: string): boolean {
  const ability = character.resources.abilities.find((a) => a.name === abilityName);
  return ability ? ability.currentUses > 0 || ability.type === 'at-will' : false;
}

/**
 * Consume a spell slot
 * Returns updated character or null if slot is unavailable
 */
export function consumeSpellSlot(character: Character, level: 0 | 1): Character | null {
  if (!character.resources.spellSlots) return null;

  const slotKey = `level${level}` as keyof typeof character.resources.spellSlots;
  const slot = character.resources.spellSlots[slotKey];

  if (!slot || slot.current <= 0) return null;

  return {
    ...character,
    resources: {
      ...character.resources,
      spellSlots: {
        ...character.resources.spellSlots,
        [slotKey]: {
          ...slot,
          current: slot.current - 1,
        },
      },
    },
  };
}

/**
 * Check if spell slot is available
 */
export function hasSpellSlot(character: Character, level: 0 | 1): boolean {
  if (!character.resources.spellSlots) return false;
  const slotKey = `level${level}` as keyof typeof character.resources.spellSlots;
  const slot = character.resources.spellSlots[slotKey];
  return slot ? slot.current > 0 : false;
}

/**
 * Check if character has a specific resource type available
 * Generic function that works for both abilities and spell slots
 */
export function hasResource(
  character: Character,
  resourceType: 'channel_energy' | 'spell_slot',
  level?: number
): boolean {
  if (resourceType === 'channel_energy') {
    return hasAbilityResource(character, 'Channel Energy');
  }

  if (resourceType === 'spell_slot' && level !== undefined) {
    return hasSpellSlot(character, level as 0 | 1);
  }

  return false;
}

/**
 * Consume a resource by type
 * Generic function that works for both abilities and spell slots
 */
export function consumeResource(
  character: Character,
  resourceType: 'channel_energy' | 'spell_slot',
  level?: number
): Character | null {
  if (resourceType === 'channel_energy') {
    return consumeAbilityResource(character, 'Channel Energy');
  }

  if (resourceType === 'spell_slot' && level !== undefined) {
    return consumeSpellSlot(character, level as 0 | 1);
  }

  return null;
}
