import type { Spell, SpellLevel } from './spell';

/**
 * Spell progression configuration per level
 * Defines how many spells can be learned at each level
 */
export interface SpellProgressionLevel {
  level: number;
  spellsToLearn: number; // How many spells can be learned this level
  spellLevel: SpellLevel; // Which spell level to learn from (0 or 1)
}

/**
 * Result of learning spells during level-up
 */
export interface SpellLearningResult {
  availableSpells: Spell[]; // Spells available to learn
  spellsToSelect: number; // How many spells should be selected
  spellLevel: SpellLevel; // Which spell level to learn from
}
