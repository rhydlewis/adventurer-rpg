import type { Spell } from '../types/spell';

/**
 * Wizard Cantrips (Level 0, at-will)
 */

export const RAY_OF_FROST: Spell = {
  id: 'ray_of_frost',
  name: 'Ray of Frost',
  level: 0,
  school: 'evocation',
  target: 'single',
  effect: {
    type: 'damage',
    damageDice: '1d3',
    damageType: 'cold',
  },
  description: 'A ray of freezing air and ice shoots toward your target. Ranged spell attack.',
};

export const ACID_SPLASH: Spell = {
  id: 'acid_splash',
  name: 'Acid Splash',
  level: 0,
  school: 'conjuration',
  target: 'single',
  effect: {
    type: 'damage',
    damageDice: '1d3',
    damageType: 'acid',
  },
  description: 'You hurl a bubble of acid at your target. Ranged spell attack.',
};

export const DAZE: Spell = {
  id: 'daze',
  name: 'Daze',
  level: 0,
  school: 'enchantment',
  target: 'single',
  effect: {
    type: 'condition',
    conditionType: 'Stunned',
    conditionDuration: 1,
    targetRestriction: (target) => target.hp <= 5,
  },
  savingThrow: {
    type: 'will',
    onSuccess: 'negates',
  },
  description: 'Daze a creature with 5 HP or less. Will save negates. Stunned for 1 turn.',
};

/**
 * Cleric Cantrips (Level 0, at-will)
 */

export const DIVINE_FAVOR: Spell = {
  id: 'divine_favor',
  name: 'Divine Favor',
  level: 0,
  school: 'divination',
  target: 'self',
  effect: {
    type: 'buff',
    buffType: 'attack',
    buffAmount: 1,
    buffDuration: 1, // Next attack or save
  },
  description: 'Divine power guides your next attack or saving throw (+1).',
};

export const RESISTANCE: Spell = {
  id: 'resistance',
  name: 'Resistance',
  level: 0,
  school: 'abjuration',
  target: 'self',
  effect: {
    type: 'buff',
    buffType: 'save',
    buffAmount: 1,
    buffDuration: 1, // Next save
  },
  description: 'You gain divine protection on your next saving throw (+1).',
};

export const SACRED_FLAME: Spell = {
  id: 'sacred_flame',
  name: 'Sacred Flame',
  level: 0,
  school: 'evocation',
  target: 'single',
  effect: {
    type: 'damage',
    damageDice: '1d4',
    damageType: 'radiant',
  },
  savingThrow: {
    type: 'will',
    onSuccess: 'negates',
  },
  description: 'Flame-like radiance descends on a creature. Will save negates.',
};

/**
 * Cantrip collections by class
 */

export const WIZARD_CANTRIPS: Spell[] = [RAY_OF_FROST, ACID_SPLASH, DAZE];

export const CLERIC_CANTRIPS: Spell[] = [DIVINE_FAVOR, RESISTANCE, SACRED_FLAME];

/**
 * Get cantrips for a character class
 */
export function getCantripsForClass(className: string): Spell[] {
  switch (className) {
    case 'Wizard':
      return WIZARD_CANTRIPS;
    case 'Cleric':
      return CLERIC_CANTRIPS;
    default:
      return [];
  }
}
