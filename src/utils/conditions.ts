/**
 * Condition system utilities for applying, managing, and calculating effects.
 */

import type { Condition, ConditionType, ConditionModifiers } from '../types/condition';
import type { Character } from '../types/character';
import type { Creature } from '../types/combat';
import { CONDITION_DEFINITIONS, DEFAULT_DURATIONS } from '../data/conditions';
import { makeSavingThrow } from './savingThrows';
import { roll } from './dice';

/**
 * Apply a condition to a combatant.
 * If the condition already exists, refreshes to maximum duration.
 * If it doesn't exist, adds it with the specified or default duration.
 *
 * @param existing - Current conditions array
 * @param type - Type of condition to apply
 * @param currentTurn - Current turn number (for tracking when applied)
 * @param duration - Optional override for default duration
 * @returns New conditions array with condition applied
 */
export function applyCondition(
  existing: Condition[],
  type: ConditionType,
  currentTurn: number,
  duration?: number
): Condition[] {
  const definition = CONDITION_DEFINITIONS[type];
  const finalDuration = duration ?? DEFAULT_DURATIONS[type];

  // Check if condition already exists
  const existingIndex = existing.findIndex((c) => c.type === type);

  if (existingIndex !== -1) {
    // Refresh to maximum duration
    const updated = [...existing];
    updated[existingIndex] = {
      ...updated[existingIndex],
      turnsRemaining: finalDuration,
      appliedOnTurn: currentTurn,
    };
    return updated;
  }

  // Add new condition
  const newCondition: Condition = {
    type: definition.type,
    category: definition.category,
    description: definition.description,
    turnsRemaining: finalDuration,
    modifiers: definition.modifiers,
    appliedOnTurn: currentTurn,
  };

  return [...existing, newCondition];
}

/**
 * Apply a condition with a saving throw to resist.
 *
 * @param target - Character or creature to apply condition to
 * @param type - Type of condition to apply
 * @param dc - Difficulty class for the save
 * @param saveType - Type of save ('fortitude', 'reflex', or 'will')
 * @param currentTurn - Current turn number
 * @param duration - Optional override for default duration
 * @returns Object with save result and whether condition was applied
 */
export function applyConditionWithSave(
  target: Character | Creature,
  _type: ConditionType,
  dc: number,
  saveType: 'fortitude' | 'reflex' | 'will',
  _currentTurn: number,
  _duration?: number
): {
  saveResult: ReturnType<typeof makeSavingThrow>;
  applied: boolean;
} {
  const saveResult = makeSavingThrow(target, saveType, dc);

  return {
    saveResult,
    applied: !saveResult.success,
  };
}

/**
 * Remove a specific condition from a combatant.
 *
 * @param conditions - Current conditions array
 * @param type - Type of condition to remove
 * @returns New conditions array without the specified condition
 */
export function removeCondition(
  conditions: Condition[],
  type: ConditionType
): Condition[] {
  return conditions.filter((c) => c.type !== type);
}

/**
 * Decrement all condition durations and remove expired ones.
 * Called at the end of each turn.
 *
 * @param conditions - Current conditions array
 * @returns Object with remaining conditions and array of expired conditions
 */
export function decrementConditions(conditions: Condition[]): {
  remaining: Condition[];
  expired: Condition[];
} {
  const remaining: Condition[] = [];
  const expired: Condition[] = [];

  for (const condition of conditions) {
    const updated = { ...condition, turnsRemaining: condition.turnsRemaining - 1 };

    if (updated.turnsRemaining <= 0) {
      expired.push(condition);
    } else {
      remaining.push(updated);
    }
  }

  return { remaining, expired };
}

/**
 * Check if a combatant has a specific condition.
 *
 * @param conditions - Current conditions array
 * @param type - Type of condition to check for
 * @returns True if the condition is present
 */
export function hasCondition(
  conditions: Condition[],
  type: ConditionType
): boolean {
  return conditions.some((c) => c.type === type);
}

/**
 * CRITICAL FUNCTION: Calculate aggregated modifiers from all active conditions.
 * This fixes the bug where AC bonuses (like Dodge) weren't being applied.
 *
 * @param conditions - Current conditions array
 * @returns Aggregated modifiers object
 */
export function calculateConditionModifiers(
  conditions: Condition[]
): ConditionModifiers {
  const result: ConditionModifiers = {};

  for (const condition of conditions) {
    const mods = condition.modifiers;

    // Sum numeric bonuses (positive and negative)
    if (mods.attackBonus !== undefined) {
      result.attackBonus = (result.attackBonus ?? 0) + mods.attackBonus;
    }
    if (mods.damageBonus !== undefined) {
      result.damageBonus = (result.damageBonus ?? 0) + mods.damageBonus;
    }
    if (mods.acBonus !== undefined) {
      result.acBonus = (result.acBonus ?? 0) + mods.acBonus;
    }
    if (mods.spellAttackBonus !== undefined) {
      result.spellAttackBonus = (result.spellAttackBonus ?? 0) + mods.spellAttackBonus;
    }
    if (mods.spellDcBonus !== undefined) {
      result.spellDcBonus = (result.spellDcBonus ?? 0) + mods.spellDcBonus;
    }
    if (mods.saveBonus !== undefined) {
      result.saveBonus = (result.saveBonus ?? 0) + mods.saveBonus;
    }

    // Boolean flags (any true = true)
    if (mods.preventActions) {
      result.preventActions = true;
    }
    if (mods.preventSpellcasting) {
      result.preventSpellcasting = true;
    }
    if (mods.preventTargetedSpells) {
      result.preventTargetedSpells = true;
    }

    // Damage per turn (collect all sources)
    // For now, we'll handle multiple DoT sources in applyConditionDamage
  }

  return result;
}

/**
 * Roll and apply damage-over-time from all conditions.
 * Called at the start of each turn.
 *
 * @param conditions - Current conditions array
 * @returns Object with total damage dealt and detailed breakdown
 */
export function applyConditionDamage(conditions: Condition[]): {
  totalDamage: number;
  damageBreakdown: Array<{
    condition: ConditionType;
    amount: number;
    type: string;
    formula: string;
  }>;
} {
  const damageBreakdown: Array<{
    condition: ConditionType;
    amount: number;
    type: string;
    formula: string;
  }> = [];

  let totalDamage = 0;

  for (const condition of conditions) {
    const { damagePerTurn } = condition.modifiers;

    if (damagePerTurn) {
      const damage = roll(damagePerTurn.formula);

      damageBreakdown.push({
        condition: condition.type,
        amount: damage,
        type: damagePerTurn.type,
        formula: damagePerTurn.formula,
      });

      totalDamage += damage;
    }
  }

  return { totalDamage, damageBreakdown };
}

/**
 * Get all conditions of a specific category.
 *
 * @param conditions - Current conditions array
 * @param category - Category to filter by ('buff' or 'debuff')
 * @returns Filtered conditions array
 */
export function getConditionsByCategory(
  conditions: Condition[],
  category: 'buff' | 'debuff'
): Condition[] {
  return conditions.filter((c) => c.category === category);
}
