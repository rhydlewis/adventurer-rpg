/**
 * Condition system for tracking buffs, debuffs, and status effects in combat.
 * Replaces separate fumbleEffects, dodgeActive, and activeBuffs tracking.
 */

export type ConditionType =
  // Debuffs
  | 'Stunned'
  | 'Poisoned'
  | 'Weakened'
  | 'Blinded'
  | 'Silenced'
  | 'Bleeding' // NEW - Bloody Assault feat
  | 'Disrupted' // NEW - Disruptive Spell feat
  // Buffs
  | 'Strengthened'
  | 'Enchanted'
  | 'Shielded'
  | 'Hidden'
  | 'Guarded'
  | 'Defensive Channel' // NEW - Defensive Channel feat
  // Migrated effects from existing systems
  | 'Dodge'
  | 'Divine Favor'
  | 'Resistance'
  | 'Off-Balance'
  // Level 1 Spell Buffs
  | 'Shield' // +5 AC from Shield spell
  | 'Shield of Faith' // +2 AC from Shield of Faith spell
  | 'Bless Weapon'; // +2 damage from Bless Weapon spell

export interface ConditionModifiers {
  attackBonus?: number;           // Added to attack rolls
  damageBonus?: number;           // Added to damage rolls
  acBonus?: number;               // CRITICAL: Added to AC (fixes bug where Dodge wasn't applied)
  spellAttackBonus?: number;      // Added to spell attack rolls
  spellDcBonus?: number;          // Added to spell save DCs
  saveBonus?: number;             // Added to saving throws
  preventActions?: boolean;       // Prevents all actions (Stunned)
  preventSpellcasting?: boolean;  // Prevents casting spells (Silenced)
  preventTargetedSpells?: boolean; // Prevents casting spells that target enemies (Blinded)
  damagePerTurn?: {               // Damage applied at start of turn
    formula: string;              // Dice notation (e.g., '1d4')
    type: string;                 // Damage type (e.g., 'poison')
  };
}

export interface Condition {
  type: ConditionType;
  category: 'debuff' | 'buff';
  description: string;            // Display text (e.g., '+4 AC', '1d4 poison/turn')
  turnsRemaining: number;         // Decrements each turn, expires at 0
  modifiers: ConditionModifiers;  // All mechanical effects
  appliedOnTurn: number;          // Turn number when condition was applied
}
