import type { Character } from '../types/character';
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
 * Calculate initiative bonus for a character
 * Initiative = DEX mod + feat bonuses + skill bonuses
 *
 * Bonuses:
 * - Improved Initiative feat: +4
 * - Perception ≥3 ranks: +2
 * - Stealth total bonus ≥5: +2
 *
 * @param character Character to calculate initiative for
 * @returns Initiative result with bonus and breakdown
 */
export function calculateInitiativeBonus(character: Character): InitiativeResult {
  // Base: DEX modifier
  const dexMod = calculateModifier(character.attributes.DEX);

  // Feat bonuses (Improved Initiative)
  let featBonus = 0;
  for (const feat of character.feats) {
    const effect = feat.effect;
    if (effect.type === 'passive' && effect.stat === 'initiative') {
      featBonus += effect.bonus;
    }
  }

  // Skill bonuses
  let skillBonus = 0;

  // Perception ≥3 ranks: +2
  if (character.skills.Perception >= 3) {
    skillBonus += 2;
  }

  // Stealth total bonus ≥5: +2
  const stealthTotal = getTotalSkillBonus(character, 'Stealth');
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
 * Roll initiative for a character
 * @param character Character rolling initiative
 * @returns Initiative roll result (1d20 + bonus)
 */
export function rollInitiative(character: Character): number {
  const { bonus } = calculateInitiativeBonus(character);
  const roll = Math.floor(Math.random() * 20) + 1; // 1d20
  return roll + bonus;
}
