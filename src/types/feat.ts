import type { CharacterClass } from './character';
import type { ConditionType } from './condition';

export type FeatCategory = 'offensive' | 'defensive' | 'utility';

export type FeatType =
  | 'attack_variant' // Shows in attack selector (Power Attack, Guided Hand)
  | 'passive' // Always active (Weapon Finesse, Critical Focus)
  | 'ability'; // Use Ability action (Empower Spell, Defensive Channel)

export interface FeatPrerequisites {
  bab?: number;
  attributes?: { [key: string]: number };
  feats?: string[]; // IDs of required feats
  classRestrictions?: CharacterClass[];
}

export interface ResourceCost {
  type: 'channel_energy' | 'spell_slot';
  amount: number;
  level?: number; // For spell_slot only
}

export interface FeatEffects {
  // Attack modifiers
  attackModifier?: number;
  damageModifier?: number;
  acModifier?: number;

  // Special damage
  bonusDamage?: string; // e.g., "2d6"
  damageType?: string; // e.g., "holy"
  bleedDamage?: string; // e.g., "1d4"

  // Stat swaps
  useWisdomForAttack?: boolean; // Guided Hand
  useDexForAttack?: boolean; // Weapon Finesse
  addDexToDamage?: boolean; // Precision Strike

  // Damage multipliers
  damageMultiplier?: number; // Vital Strike (2x), Empower Spell (1.5x)
  spellDamageMultiplier?: number; // Only applies to spells

  // Critical hit bonuses
  criticalThreatRangeBonus?: number; // Critical Focus (+1)

  // Conditions
  appliesCondition?: ConditionType;
  conditionDuration?: number; // In turns
  conditionEffect?: {
    attackPenalty?: number;
    damagePerTurn?: string;
  };

  // Resource costs
  consumesResource?: ResourceCost;

  // Buff management
  setsState?: 'empowered' | 'disruptiveSpell'; // For wizard abilities

  // Duration
  duration: 'turn' | 'nextTurn' | 'nextSpell' | 'nextAttack' | 'permanent';
}

export interface Feat {
  id: string;
  name: string;
  description: string;
  category: FeatCategory;
  type: FeatType;
  prerequisites: FeatPrerequisites;
  effects: FeatEffects;
}

// Legacy type for backward compatibility
export type FeatName =
  | 'Power Attack'
  | 'Weapon Focus'
  | 'Toughness'
  | 'Improved Initiative'
  | 'Combat Reflexes';

// Legacy effect type for backward compatibility
export type FeatEffect =
  | { type: 'toggle'; name: 'powerAttack' }
  | { type: 'passive'; stat: 'attack' | 'hp' | 'initiative'; bonus: number }
  | { type: 'conditional'; condition: 'dodge'; stat: 'ac'; bonus: number };
