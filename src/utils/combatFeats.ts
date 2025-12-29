import type { Character } from '../types/character';
import type { Feat } from '../types/feat';
import type { Condition } from '../types/condition';
import { FEATS } from '../data/feats';
import { consumeResource } from './resources';
import { applyCondition } from './conditions';
import { calculateModifier } from './dice';

export interface FeatCombatResult {
  character: Character;
  attackModifiers?: {
    attackBonus: number;
    damageBonus: number;
    bonusDamage?: string; // Extra dice like "2d6"
    acModifier?: number; // AC bonus (e.g., Combat Expertise)
    label: string;
    useWisForAttack?: boolean;
    useDexForAttack?: boolean;
  };
  conditions?: Condition[];
  conditionsToApply?: { type: string; duration: number }[];
  log: string[];
  success: boolean;
  error?: string;
}

/**
 * Apply feat effects for attack variant feats (e.g., Power Attack, Guided Hand, Channel Smite)
 * Returns updated character, attack modifiers, and any conditions to apply
 */
export function applyAttackFeat(
  character: Character,
  featId: string,
  currentConditions: Condition[],
  _currentTurn: number
): FeatCombatResult {
  const feat = FEATS[featId];

  if (!feat) {
    return {
      character,
      conditions: currentConditions,
      log: [],
      success: false,
      error: `Feat not found: ${featId}`,
    };
  }

  if (feat.type !== 'attack_variant') {
    return {
      character,
      conditions: currentConditions,
      log: [],
      success: false,
      error: `Feat ${feat.name} is not an attack variant`,
    };
  }

  let updatedCharacter = character;
  const log: string[] = [];
  const conditionsToApply: { type: string; duration: number }[] = [];

  // Check and consume resources if needed
  if (feat.effects.consumesResource) {
    const { type, level } = feat.effects.consumesResource;
    const consumed = consumeResource(updatedCharacter, type, level);

    if (!consumed) {
      return {
        character,
        conditions: currentConditions,
        log: [],
        success: false,
        error: `Not enough resources to use ${feat.name}`,
      };
    }

    updatedCharacter = consumed;
    log.push(`Consumed ${type}${level !== undefined ? ` (level ${level})` : ''}`);
  }

  // Build attack modifiers
  const attackModifiers = {
    attackBonus: feat.effects.attackModifier ?? 0,
    damageBonus: feat.effects.damageModifier ?? 0,
    bonusDamage: feat.effects.bonusDamage,
    acModifier: feat.effects.acModifier,
    label: feat.name,
    useWisForAttack: feat.effects.useWisdomForAttack,
    useDexForAttack: feat.effects.useDexForAttack,
  };

  // Check for conditions to apply on hit
  if (feat.effects.appliesCondition && feat.effects.conditionDuration) {
    conditionsToApply.push({
      type: feat.effects.appliesCondition,
      duration: feat.effects.conditionDuration,
    });
  }

  return {
    character: updatedCharacter,
    attackModifiers,
    conditions: currentConditions,
    conditionsToApply,
    log,
    success: true,
  };
}

/**
 * Apply ability feat effects (e.g., Empower Spell, Defensive Channel)
 * Returns updated character and any conditions/states to apply
 */
export function applyAbilityFeat(
  character: Character,
  featId: string,
  currentConditions: Condition[],
  currentTurn: number
): FeatCombatResult {
  const feat = FEATS[featId];

  if (!feat) {
    return {
      character,
      conditions: currentConditions,
      log: [],
      success: false,
      error: `Feat not found: ${featId}`,
    };
  }

  if (feat.type !== 'ability') {
    return {
      character,
      conditions: currentConditions,
      log: [],
      success: false,
      error: `Feat ${feat.name} is not an ability`,
    };
  }

  let updatedCharacter = character;
  let updatedConditions = currentConditions;
  const log: string[] = [];

  // Check and consume resources
  if (feat.effects.consumesResource) {
    const { type, level } = feat.effects.consumesResource;
    const consumed = consumeResource(updatedCharacter, type, level);

    if (!consumed) {
      return {
        character,
        conditions: currentConditions,
        log: [],
        success: false,
        error: `Not enough resources to use ${feat.name}`,
      };
    }

    updatedCharacter = consumed;
    log.push(`Used ${feat.name}`);
  }

  // Apply condition if specified (e.g., Defensive Channel)
  if (feat.effects.appliesCondition && feat.effects.conditionDuration) {
    updatedConditions = applyCondition(
      updatedConditions,
      feat.effects.appliesCondition,
      currentTurn,
      feat.effects.conditionDuration
    );
    log.push(`Gained ${feat.effects.appliesCondition} condition`);
  }

  // Handle state changes (e.g., Empower Spell sets empowered state)
  // This would need to be tracked in combat state for "nextSpell" duration feats
  // For now, we'll return the information and let the caller handle it

  return {
    character: updatedCharacter,
    conditions: updatedConditions,
    log,
    success: true,
  };
}

/**
 * Calculate passive bonuses from character feats
 * This should be called when calculating base stats for combat
 */
export function getPassiveFeatBonuses(_character: Character) {
  // This will be implemented when we have feat storage on character
  // For now, return default values
  return {
    attackBonus: 0,
    damageBonus: 0,
    acBonus: 0,
    criticalRangeBonus: 0,
    useDexForAttack: false,
    addDexToDamage: false,
  };
}

/**
 * Apply damage multiplier from feat (e.g., Vital Strike, Empower Spell)
 */
export function applyFeatDamageMultiplier(baseDamage: number, featId?: string): number {
  if (!featId) return baseDamage;

  const feat = FEATS[featId];
  if (!feat || !feat.effects.damageMultiplier) return baseDamage;

  return Math.floor(baseDamage * feat.effects.damageMultiplier);
}

/**
 * Calculate ability modifier for attack based on feat effects
 * (e.g., Guided Hand uses WIS, Weapon Finesse uses DEX)
 */
export function getFeatAttackModifier(
  character: Character,
  feat?: Feat
): number {
  const strMod = calculateModifier(character.attributes.STR);
  const dexMod = calculateModifier(character.attributes.DEX);
  const wisMod = calculateModifier(character.attributes.WIS);

  // Check feat effects first
  if (feat?.effects.useWisdomForAttack) {
    return wisMod;
  }

  if (feat?.effects.useDexForAttack) {
    return dexMod;
  }

  // Default: finesse weapons can use DEX if higher than STR
  if (character.equipment.weapon?.finesse && dexMod > strMod) {
    return dexMod;
  }

  return strMod;
}
