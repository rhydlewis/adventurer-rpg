import type { Creature } from '../types/creature';
import type { Character } from '../types';
import type { Spell } from '../types';
import { getSpellById } from '../data/spells';

/**
 * Enemy action types
 */
export type EnemyActionType = 'attack' | 'cast_spell';

/**
 * Decide whether enemy should attack or cast a spell
 *
 * Simple heuristic for Phase 1:
 * - If enemy has spells and spell slots, 50% chance to cast
 * - Otherwise, attack
 *
 * Future improvements:
 * - Tactical decision making (player HP, enemy HP, conditions)
 * - Spell type awareness (buff when full HP, damage when player low)
 * - Difficulty scaling (higher difficulty = smarter AI)
 *
 * @param forceSpellCast - Debug flag to force enemy to cast spell (if available)
 */
export function selectEnemyAction(
  enemy: Creature,
  _player: Character,
  availableSpells: Spell[],
  forceSpellCast?: boolean
): EnemyActionType {
  // Debug: Force spell casting if flag is set
  if (forceSpellCast && availableSpells && availableSpells.length > 0) {
    return 'cast_spell';
  }

  // No spells available - must attack
  if (!availableSpells || availableSpells.length === 0) {
    return 'attack';
  }

  // Check if enemy has any spell slots for non-cantrips
  const hasSpellSlots = enemy.resources?.spellSlots &&
    (enemy.resources.spellSlots.level1?.current ?? 0) > 0;

  // Has cantrips available - can always cast
  const hasCantrips = availableSpells.some(spell => spell.level === 0);

  // Can't cast anything - must attack
  if (!hasCantrips && !hasSpellSlots) {
    return 'attack';
  }

  // 50% chance to cast spell
  return Math.random() < 0.5 ? 'cast_spell' : 'attack';
}

/**
 * Select which spell to cast from available spells
 *
 * Simple heuristic for Phase 1:
 * - Filter to spells enemy can afford (has slots for)
 * - Random selection from available spells
 *
 * Future improvements:
 * - Prefer high-damage spells when player is low HP
 * - Prefer debuffs when player is high HP
 * - Don't waste spell slots on nearly-dead players
 * - Consider spell save DCs vs player save bonuses
 */
export function selectSpell(
  enemy: Creature,
  _player: Character,
  availableSpells: Spell[]
): Spell {
  // Filter to spells enemy can cast
  const castableSpells = availableSpells.filter(spell => {
    // Cantrips always castable
    if (spell.level === 0) {
      return true;
    }

    // Check if enemy has spell slot for this level
    const spellSlots = enemy.resources?.spellSlots;
    if (!spellSlots) {
      return false;
    }

    const slotKey = `level${spell.level}` as keyof typeof spellSlots;
    const slot = spellSlots[slotKey];
    return slot && slot.current > 0;
  });

  // Shouldn't happen (caller should check), but fallback to first spell
  if (castableSpells.length === 0) {
    return availableSpells[0];
  }

  // Random selection
  const randomIndex = Math.floor(Math.random() * castableSpells.length);
  return castableSpells[randomIndex];
}

/**
 * Get available spells for an enemy based on their template's spellIds
 */
export function getEnemySpells(spellIds: string[] | undefined): Spell[] {
  if (!spellIds || spellIds.length === 0) {
    return [];
  }

  const spells: Spell[] = [];
  for (const spellId of spellIds) {
    const spell = getSpellById(spellId);
    if (spell) {
      spells.push(spell);
    }
  }

  return spells;
}
