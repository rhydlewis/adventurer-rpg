import type { Character } from '../types/character';
import type { Feat } from '../types/feat';
import { FEATS } from '../data/feats';
import { hasResource } from './resources';

/**
 * Check if character meets feat prerequisites
 */
export function meetsPrerequisites(feat: Feat, character: Character): boolean {
  const { prerequisites } = feat;

  // Check BAB
  if (prerequisites.bab && character.bab < prerequisites.bab) {
    return false;
  }

  // Check attributes
  if (prerequisites.attributes) {
    for (const [attr, required] of Object.entries(prerequisites.attributes)) {
      if (character.attributes[attr as keyof typeof character.attributes] < required) {
        return false;
      }
    }
  }

  // Check required feats (will need to update once we have feat storage on character)
  if (prerequisites.feats) {
    // For now, assume feats are stored as an array of IDs
    // This will need to be updated based on the actual character.feats structure
    const knownFeats = (character as any).feats?.known || [];
    for (const requiredFeat of prerequisites.feats) {
      if (!knownFeats.includes(requiredFeat)) {
        return false;
      }
    }
  }

  // Check class restrictions
  if (prerequisites.classRestrictions) {
    if (!prerequisites.classRestrictions.includes(character.class)) {
      return false;
    }
  }

  return true;
}

/**
 * Check if feat can be used (has resources available)
 */
export function canUseFeat(feat: Feat, character: Character): boolean {
  // Check prerequisites first
  if (!meetsPrerequisites(feat, character)) {
    return false;
  }

  // Check resource availability
  if (feat.effects.consumesResource) {
    const { type, level } = feat.effects.consumesResource;
    return hasResource(character, type, level);
  }

  return true;
}

/**
 * Get all passive bonuses from character's feats
 */
export function getPassiveBonuses(character: Character) {
  // Get feat IDs from character (will need to adjust based on actual character structure)
  const knownFeatIds = (character as any).feats?.known || [];

  const passives = knownFeatIds
    .map((id: string) => FEATS[id])
    .filter((feat: Feat) => feat && feat.type === 'passive');

  const bonuses = {
    attackModifier: 0,
    damageModifier: 0,
    acModifier: 0,
    criticalRangeBonus: 0,
    useDexForAttack: false,
    addDexToDamage: false,
    useWisdomForAttack: false,
  };

  for (const feat of passives) {
    if (feat.effects.attackModifier) {
      bonuses.attackModifier += feat.effects.attackModifier;
    }
    if (feat.effects.damageModifier) {
      bonuses.damageModifier += feat.effects.damageModifier;
    }
    if (feat.effects.acModifier) {
      bonuses.acModifier += feat.effects.acModifier;
    }
    if (feat.effects.criticalThreatRangeBonus) {
      bonuses.criticalRangeBonus += feat.effects.criticalThreatRangeBonus;
    }
    if (feat.effects.useDexForAttack) {
      bonuses.useDexForAttack = true;
    }
    if (feat.effects.addDexToDamage) {
      bonuses.addDexToDamage = true;
    }
    if (feat.effects.useWisdomForAttack) {
      bonuses.useWisdomForAttack = true;
    }
  }

  return bonuses;
}
