import type { Character, CharacterClass } from '../types/character';
import type { Feat } from '../types/feat';
import { calculateModifier } from './dice';

/**
 * Class hit dice for HP calculation
 */
const CLASS_HIT_DICE: Record<CharacterClass, number> = {
  Fighter: 10,
  Rogue: 8,
  Wizard: 6,
  Cleric: 8,
};

/**
 * BAB progression by class
 * Full BAB (Fighter): +1 per level
 * 3/4 BAB (Rogue, Cleric): +0.75 per level (rounds down)
 * 1/2 BAB (Wizard): +0.5 per level (rounds down)
 */
const CLASS_BAB_PROGRESSION: Record<CharacterClass, (level: number) => number> = {
  Fighter: (level) => level,
  Rogue: (level) => Math.floor((level * 3) / 4),
  Cleric: (level) => Math.floor((level * 3) / 4),
  Wizard: (level) => Math.floor(level / 2),
};

/**
 * Calculate HP increase on level-up
 * Uses average of hit die + CON modifier
 */
export function calculateHPIncrease(
  characterClass: CharacterClass,
  constitution: number
): number {
  const hitDie = CLASS_HIT_DICE[characterClass];
  const averageRoll = Math.floor(hitDie / 2) + 1; // d10 → 6, d8 → 5, d6 → 4
  const conModifier = calculateModifier(constitution);

  return averageRoll + conModifier;
}

/**
 * Calculate BAB at a given level
 */
export function calculateBABIncrease(
  characterClass: CharacterClass,
  oldLevel: number,
  newLevel: number
): number {
  const oldBAB = CLASS_BAB_PROGRESSION[characterClass](oldLevel);
  const newBAB = CLASS_BAB_PROGRESSION[characterClass](newLevel);
  return newBAB - oldBAB;
}

/**
 * Apply level-up to character
 * Increases level, HP, BAB, and adds chosen feat
 * Fully restores HP
 */
export function applyLevelUp(
  character: Character,
  newLevel: number,
  chosenFeat: Feat
): Character {
  const hpIncrease = calculateHPIncrease(character.class, character.attributes.CON);
  const babIncrease = calculateBABIncrease(character.class, character.level, newLevel);

  const newMaxHp = character.maxHp + hpIncrease;

  return {
    ...character,
    level: newLevel,
    maxHp: newMaxHp,
    hp: newMaxHp, // Fully restore HP on level-up
    bab: character.bab + babIncrease,
    feats: [...character.feats, chosenFeat],
  };
}
