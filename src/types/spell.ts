/**
 * Spell system types for Phase 1.3
 * Supports cantrips (at-will) and level 1 spells (2 slots/day)
 */

export type SpellLevel = 0 | 1; // 0 = cantrip

export type SpellSchool =
  | 'evocation'
  | 'conjuration'
  | 'enchantment'
  | 'abjuration'
  | 'transmutation'
  | 'necromancy'
  | 'divination'
  | 'illusion';

export type DamageType =
  | 'cold'
  | 'fire'
  | 'acid'
  | 'radiant'
  | 'force'
  | 'slashing'
  | 'piercing'
  | 'bludgeoning';

export type SpellTarget = 'self' | 'single' | 'area';

export type SaveType = 'fortitude' | 'reflex' | 'will';

export type SpellEffectType = 'damage' | 'heal' | 'buff' | 'condition' | 'special';

/**
 * Spell effect definition
 * Different effects based on type
 */
export interface SpellEffect {
  type: SpellEffectType;
  // Damage effect
  damageDice?: string; // e.g., "1d3", "1d4"
  damageType?: DamageType;
  // Heal effect
  healDice?: string; // e.g., "1d8+1"
  // Buff effect
  buffType?: 'attack' | 'save' | 'ac' | 'damage';
  buffAmount?: number;
  buffDuration?: number; // turns
  // Condition effect
  conditionType?: string; // e.g., "Stunned", "Blinded"
  conditionDuration?: number; // turns
  // Special conditions (e.g., Daze only works on enemies ≤5 HP)
  targetRestriction?: (target: { hp: number }) => boolean;
}

/**
 * Spell definition
 */
export interface Spell {
  id: string;
  name: string;
  level: SpellLevel;
  school: SpellSchool;
  target: SpellTarget;
  effect: SpellEffect;
  // Saving throw (if required)
  savingThrow?: {
    type: SaveType;
    onSuccess: 'negates' | 'half' | 'partial';
  };
  // Display
  description: string;
}

/**
 * Result of casting a spell
 */
export interface SpellCastResult {
  success: boolean;
  output: string; // Combat log message
  damage?: number; // If damage spell
  healing?: number; // If healing spell
  conditionApplied?: string; // If condition effect
  saveMade?: boolean; // If save was required
}
