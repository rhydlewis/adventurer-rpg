/**
 * Combat action types
 * Phase 1.2: Basic infrastructure
 * Phase 1.3: Specific abilities (Second Wind, Dodge, Cast Cantrip, etc.)
 */

export type ActionType = 'attack' | 'cast_spell' | 'use_ability' | 'use_item';

export interface CombatAction {
  type: ActionType;
  name: string;
  description: string;
  available: boolean;
  disabled?: boolean;
  disabledReason?: string;
}

/**
 * Basic attack action (available to all classes)
 */
export interface AttackAction extends CombatAction {
  type: 'attack';
  variant?: 'power_attack'; // Fighter-specific attack variant
  attackModifier?: number;
  damageModifier?: number;
}

/**
 * Spell casting action (Wizard, Cleric)
 * Phase 1.3: Cantrips implemented
 */
export interface CastSpellAction extends CombatAction {
  type: 'cast_spell';
  spellId: string; // ID of the spell to cast (e.g., 'ray_of_frost')
  spellLevel: number; // 0 = cantrip, 1 = level 1, etc.
  requiresSlot: boolean; // False for cantrips (at-will)
}

/**
 * Class ability action (Second Wind, Dodge, etc.)
 * Phase 1.3+ will implement specific abilities
 */
export interface UseAbilityAction extends CombatAction {
  type: 'use_ability';
  abilityId?: string;
  usesRemaining?: number;
  maxUses?: number;
}

/**
 * Item usage action (healing potion, smoke bomb, etc.)
 */
export interface UseItemAction extends CombatAction {
  type: 'use_item';
  itemId?: string;
  quantity?: number;
}

/**
 * Union type for all action types
 */
export type Action = AttackAction | CastSpellAction | UseAbilityAction | UseItemAction;

/**
 * Result of executing a combat action
 */
export interface ActionResult {
  success: boolean;
  logs: string[];
  damageDealt?: number;
  healingDone?: number;
  error?: string;
}
