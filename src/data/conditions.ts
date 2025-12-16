/**
 * Condition definitions for all buffs, debuffs, and status effects.
 * Includes 8 new conditions + 4 migrated from existing systems.
 */

import type { ConditionType, ConditionModifiers } from '../types';

export interface ConditionDefinition {
  type: ConditionType;
  category: 'debuff' | 'buff';
  description: string;
  modifiers: ConditionModifiers;
}

/**
 * Complete condition definitions with all mechanical effects.
 * Stacking rule: Same condition refreshes to max duration, different conditions stack.
 */
export const CONDITION_DEFINITIONS: Record<ConditionType, ConditionDefinition> = {
  // === NEW DEBUFFS ===

  Stunned: {
    type: 'Stunned',
    category: 'debuff',
    description: 'Cannot act',
    modifiers: {
      preventActions: true,
    },
  },

  Poisoned: {
    type: 'Poisoned',
    category: 'debuff',
    description: '1d4 poison/turn, -2 attack',
    modifiers: {
      attackBonus: -2,
      damagePerTurn: {
        formula: '1d4',
        type: 'poison',
      },
    },
  },

  Weakened: {
    type: 'Weakened',
    category: 'debuff',
    description: '-2 attack/damage',
    modifiers: {
      attackBonus: -2,
      damageBonus: -2,
    },
  },

  Blinded: {
    type: 'Blinded',
    category: 'debuff',
    description: '-4 attack, no targeted spells',
    modifiers: {
      attackBonus: -4,
      preventTargetedSpells: true,
    },
  },

  Silenced: {
    type: 'Silenced',
    category: 'debuff',
    description: 'Cannot cast spells',
    modifiers: {
      preventSpellcasting: true,
    },
  },

  // === NEW BUFFS ===

  Strengthened: {
    type: 'Strengthened',
    category: 'buff',
    description: '+2 attack/damage',
    modifiers: {
      attackBonus: 2,
      damageBonus: 2,
    },
  },

  Enchanted: {
    type: 'Enchanted',
    category: 'buff',
    description: '+2 spell attack, +1 spell DC',
    modifiers: {
      spellAttackBonus: 2,
      spellDcBonus: 1,
    },
  },

  Shielded: {
    type: 'Shielded',
    category: 'buff',
    description: '+4 AC',
    modifiers: {
      acBonus: 4,
    },
  },

  // === MIGRATED EFFECTS ===

  Dodge: {
    type: 'Dodge',
    category: 'buff',
    description: '+4 AC',
    modifiers: {
      acBonus: 4,
    },
  },

  'Divine Favor': {
    type: 'Divine Favor',
    category: 'buff',
    description: '+1 attack/saves',
    modifiers: {
      attackBonus: 1,
      saveBonus: 1,
    },
  },

  Resistance: {
    type: 'Resistance',
    category: 'buff',
    description: '+1 saves',
    modifiers: {
      saveBonus: 1,
    },
  },

  'Off-Balance': {
    type: 'Off-Balance',
    category: 'debuff',
    description: '-2 attack',
    modifiers: {
      attackBonus: -2,
    },
  },
};

/**
 * Default durations for conditions (in turns).
 * Can be overridden when applying a condition.
 */
export const DEFAULT_DURATIONS: Record<ConditionType, number> = {
  // New debuffs
  Stunned: 1,
  Poisoned: 3,
  Weakened: 2,
  Blinded: 2,
  Silenced: 2,

  // New buffs
  Strengthened: 2,
  Enchanted: 2,
  Shielded: 3,

  // Migrated effects
  Dodge: 1,
  'Divine Favor': 1,
  Resistance: 1,
  'Off-Balance': 1,
};
