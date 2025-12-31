import type { Character } from '../types/character';
import type { LevelUpResult } from '../types/levelProgression';
import { getClassProgression } from '../data/progression/classProgressionTables';

/**
 * Calculate HP gain on level up.
 * Uses class hit die + CON modifier.
 */
export function calculateHpGain(character: Character): number {
  const hitDice = {
    Fighter: 10,
    Rogue: 6,
    Wizard: 4,
    Cleric: 8,
  }[character.class] || 6;

  const conModifier = Math.floor((character.attributes.CON - 10) / 2);

  // For simplicity: average roll + CON mod (minimum 1)
  const averageRoll = Math.floor(hitDice / 2) + 1;
  return Math.max(1, averageRoll + conModifier);
}

/**
 * Calculate level-up bonuses.
 * Pure function - returns new values without mutation.
 */
export function calculateLevelUp(
  character: Character,
  newLevel: number
): LevelUpResult | null {
  const progression = getClassProgression(character.class, newLevel);
  if (!progression) return null;

  const oldProgression = getClassProgression(character.class, character.level);
  if (!oldProgression) return null;

  const hpGained = calculateHpGain(character);
  const babGained = progression.baseAttackBonus - oldProgression.baseAttackBonus;
  const savesGained = {
    fort: progression.fortitudeSave - oldProgression.fortitudeSave,
    reflex: progression.reflexSave - oldProgression.reflexSave,
    will: progression.willSave - oldProgression.willSave,
  };

  return {
    oldLevel: character.level,
    newLevel,
    hpGained,
    babGained,
    savesGained,
    featGained: progression.featGained,
    skillPoints: progression.skillPoints,
    classFeatures: progression.classFeatures,
    spellsLearned: progression.spellsPerDay ? 2 : 0,  // Casters learn 2 new spells per level
  };
}

/**
 * Apply level-up result to character.
 * Returns new character object (immutable).
 */
export function applyLevelUp(
  character: Character,
  levelUpResult: LevelUpResult
): Character {
  const progression = getClassProgression(character.class, levelUpResult.newLevel);
  if (!progression) return character;

  return {
    ...character,
    level: levelUpResult.newLevel,
    maxHp: character.maxHp + levelUpResult.hpGained,
    hp: character.maxHp + levelUpResult.hpGained,  // Full HP on level up
    bab: progression.baseAttackBonus,
    saves: {
      fortitude: progression.fortitudeSave,
      reflex: progression.reflexSave,
      will: progression.willSave,
    },
    // TODO: Add class features, feats, skills when those systems exist
  };
}
