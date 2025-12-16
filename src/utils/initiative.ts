import type { Entity } from '../types/entity';
import { calculateModifier } from './dice';
import { getTotalSkillBonus } from './skills';

export interface InitiativeResult {
  bonus: number;
  breakdown: {
    dexMod: number;
    featBonus: number;
    skillBonus: number;
  };
}

/**
 * Calculate initiative bonus for an entity
 * Initiative = DEX mod + feat bonuses + skill bonuses
 *
 * Bonuses:
 * - Improved Initiative feat: +4
 * - Perception ≥3 ranks: +2
 * - Stealth total bonus ≥5: +2
 *
 * @param entity Entity to calculate initiative for (Character or Creature)
 * @returns Initiative result with bonus and breakdown
 */
export function calculateInitiativeBonus(entity: Entity): InitiativeResult {
  // Base: DEX modifier
  const dexMod = calculateModifier(entity.attributes.DEX);

  // Feat bonuses (Improved Initiative)
  let featBonus = 0;
  for (const feat of entity.feats) {
    const effect = feat.effect;
    if (effect.type === 'passive' && effect.stat === 'initiative') {
      featBonus += effect.bonus;
    }
  }

  // Skill bonuses
  let skillBonus = 0;

  // Perception ≥3 ranks: +2
  if (entity.skills.Perception >= 3) {
    skillBonus += 2;
  }

  // Stealth total bonus ≥5: +2
  const stealthTotal = getTotalSkillBonus(entity, 'Stealth');
  if (stealthTotal >= 5) {
    skillBonus += 2;
  }

  const bonus = dexMod + featBonus + skillBonus;

  return {
    bonus,
    breakdown: {
      dexMod,
      featBonus,
      skillBonus,
    },
  };
}

/**
 * Roll initiative for an entity
 * @param entity Entity rolling initiative (Character or Creature)
 * @returns Initiative roll result (1d20 + bonus)
 */
export function rollInitiative(entity: Entity): number {
  const { bonus } = calculateInitiativeBonus(entity);
  const roll = Math.floor(Math.random() * 20) + 1; // 1d20
  return roll + bonus;
}
