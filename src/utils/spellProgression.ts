import type { Character } from '../types/character';
import type { Spell, SpellLevel } from '../types/spell';
import type { SpellLearningResult } from '../types/spellProgression';
import { getCantripsForClass, getLevel1SpellsForClass } from '../data/spells';

/**
 * Spell progression table for Wizard
 * Defines which spells are learned at each level
 */
const WIZARD_SPELL_PROGRESSION: Record<number, { spellsToLearn: number; spellLevel: SpellLevel }> = {
  1: { spellsToLearn: 3, spellLevel: 0 }, // Learn 3 cantrips at level 1
  2: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 2
  3: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 3
  4: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 4
  5: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 5
};

/**
 * Spell progression table for Cleric
 * Similar to Wizard but with divine spells
 */
const CLERIC_SPELL_PROGRESSION: Record<number, { spellsToLearn: number; spellLevel: SpellLevel }> = {
  1: { spellsToLearn: 3, spellLevel: 0 }, // Learn 3 cantrips at level 1
  2: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 2
  3: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 3
  4: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 4
  5: { spellsToLearn: 1, spellLevel: 1 }, // Learn 1 level-1 spell at level 5
};

/**
 * Get spell progression for a character's class at a specific level
 */
export function getSpellProgressionForLevel(
  className: string,
  level: number
): { spellsToLearn: number; spellLevel: SpellLevel } | null {
  if (className === 'Wizard') {
    return WIZARD_SPELL_PROGRESSION[level] || null;
  }
  if (className === 'Cleric') {
    return CLERIC_SPELL_PROGRESSION[level] || null;
  }
  return null;
}

/**
 * Calculate which spells can be learned at level-up
 * Returns spells that the character doesn't already know
 */
export function calculateSpellsToLearn(
  character: Character,
  newLevel: number
): SpellLearningResult | null {
  const progression = getSpellProgressionForLevel(character.class, newLevel);
  if (!progression) return null;

  const { spellsToLearn, spellLevel } = progression;

  // Get all available spells for this class and spell level
  const allSpells = spellLevel === 0
    ? getCantripsForClass(character.class)
    : getLevel1SpellsForClass(character.class);

  // Filter out spells already known
  const knownSpellIds = (character.knownSpells || []).map(s => s.id);
  const availableSpells = allSpells.filter(spell => !knownSpellIds.includes(spell.id));

  return {
    availableSpells,
    spellsToSelect: Math.min(spellsToLearn, availableSpells.length),
    spellLevel,
  };
}

/**
 * Add learned spells to character
 */
export function addSpellsToCharacter(
  character: Character,
  spellsToAdd: Spell[]
): Character {
  const currentSpells = character.knownSpells || [];
  return {
    ...character,
    knownSpells: [...currentSpells, ...spellsToAdd],
  };
}
