import type { Character } from '../types/character';
import { rollDamage } from './dice';

/**
 * Fighter: Second Wind
 * Heal 1d10+1 HP (1/combat, encounter resource)
 */
export function useSecondWind(character: Character): {
  healed: number;
  newHp: number;
  output: string;
} {
  const healing = rollDamage('1d10', 1);
  const oldHp = character.hp;
  const newHp = Math.min(character.maxHp, oldHp + healing.total);
  const actualHealing = newHp - oldHp;

  return {
    healed: actualHealing,
    newHp,
    output: `Second Wind: ${healing.output} HP restored (${oldHp} → ${newHp})`,
  };
}

/**
 * Apply feat bonuses to combat calculations
 * Phase 1.3: Basic feat effects
 */
export function getFeatBonuses(character: Character): {
  attackBonus: number;
  initiativeBonus: number;
  hpBonus: number;
  dodgeACBonus: number; // Extra AC when using Dodge action
} {
  let attackBonus = 0;
  let initiativeBonus = 0;
  let hpBonus = 0;
  let dodgeACBonus = 0;

  character.feats.forEach((feat) => {
    switch (feat.name) {
      case 'Weapon Focus':
        attackBonus += 1;
        break;
      case 'Improved Initiative':
        initiativeBonus += 4;
        break;
      case 'Toughness':
        hpBonus += 3 * character.level;
        break;
      case 'Combat Reflexes':
        dodgeACBonus += 2; // Applied when Dodge ability is active
        break;
    }
  });

  return { attackBonus, initiativeBonus, hpBonus, dodgeACBonus };
}

/**
 * Rogue: Check if Sneak Attack conditions are met
 * +1d6 damage when: (1) winning initiative, OR (2) enemy has condition
 */
export function canSneakAttack(
  rogueInitiative: number,
  enemyInitiative: number,
  _enemyHasCondition: boolean // TODO: Check for conditions when implemented in Phase 1.4
): boolean {
  // For now, just check initiative
  // Phase 1.4 will add condition checking
  return rogueInitiative > enemyInitiative;
}

/**
 * Rogue: Calculate Sneak Attack damage
 */
export function calculateSneakAttackDamage(): {
  roll: string;
  bonus: number;
  description: string;
} {
  const sneakDamage = rollDamage('1d6', 0);
  return {
    roll: sneakDamage.output,
    bonus: sneakDamage.total,
    description: `+${sneakDamage.total} Sneak Attack damage`,
  };
}

/**
 * Rogue: Use Dodge
 * +4 AC until next turn (1/combat, encounter resource)
 */
export function useDodge(): {
  acBonus: number;
  output: string;
} {
  return {
    acBonus: 4,
    output: 'Dodge activated: +4 AC until your next turn',
  };
}

/**
 * Rogue: Evasion (passive)
 * Reflex save success = zero damage (instead of half)
 * This is checked in saving throw resolution, not here
 */
export function hasEvasion(character: Character): boolean {
  return character.class === 'Rogue';
}

/**
 * Check if character can use an ability
 */
export function canUseAbility(character: Character, abilityName: string): {
  canUse: boolean;
  reason?: string;
} {
  const ability = character.resources.abilities.find((a) => a.name === abilityName);

  if (!ability) {
    return { canUse: false, reason: 'Ability not found' };
  }

  if (ability.type === 'at-will') {
    return { canUse: true };
  }

  if (ability.currentUses <= 0) {
    return { canUse: false, reason: 'No uses remaining' };
  }

  return { canUse: true };
}

/**
 * Consume one use of an ability
 */
export function consumeAbilityUse(character: Character, abilityName: string): Character {
  return {
    ...character,
    resources: {
      ...character.resources,
      abilities: character.resources.abilities.map((ability) =>
        ability.name === abilityName && ability.type !== 'at-will'
          ? { ...ability, currentUses: ability.currentUses - 1 }
          : ability
      ),
    },
  };
}
