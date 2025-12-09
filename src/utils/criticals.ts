export type FumbleEffectType = 'drop_weapon' | 'hit_self' | 'off_balance' | 'opening';

export interface FumbleEffect {
  type: FumbleEffectType;
  description: string;
  damage?: string;
  acPenalty?: number;
  givesFreeAttack?: boolean;
  loseTurn?: boolean;
}

export interface CriticalDamageResult {
  formula: string;
  description: string;
}

/**
 * Check if an attack roll is a critical hit
 * @param naturalRoll The natural d20 roll (before modifiers)
 * @returns true if natural 20
 */
export function isCriticalHit(naturalRoll: number): boolean {
  return naturalRoll === 20;
}

/**
 * Check if an attack roll is a critical fumble
 * @param naturalRoll The natural d20 roll (before modifiers)
 * @returns true if natural 1
 */
export function isCriticalFumble(naturalRoll: number): boolean {
  return naturalRoll === 1;
}

/**
 * Calculate critical damage by doubling damage dice but not modifiers
 * Examples:
 *   1d8+3 -> 2d8+3
 *   2d6+5 -> 4d6+5
 *   1d8+1d6+3 -> 2d8+2d6+3 (Sneak Attack)
 *
 * @param baseDamage Base damage formula (e.g., "1d8+3")
 * @returns Critical damage formula and description
 */
export function calculateCriticalDamage(baseDamage: string): CriticalDamageResult {
  // Parse damage formula and double all dice
  // Pattern: XdY where X is number of dice, Y is die size
  const critFormula = baseDamage.replace(/(\d+)d(\d+)/g, (_match, count, size) => {
    const doubledCount = parseInt(count) * 2;
    return `${doubledCount}d${size}`;
  });

  return {
    formula: critFormula,
    description: 'CRITICAL HIT! Double damage dice!',
  };
}

/**
 * Determine fumble effect from 1d4 roll
 * 1 = Drop weapon (lose next turn)
 * 2 = Hit self (1d4 damage)
 * 3 = Off-balance (enemy +2 AC until your next turn)
 * 4 = Opening (enemy gets free attack)
 *
 * @param roll Result of 1d4 roll (1-4)
 * @returns Fumble effect details
 */
export function determineFumbleEffect(roll: number): FumbleEffect {
  switch (roll) {
    case 1:
      return {
        type: 'drop_weapon',
        description: 'You drop your weapon! Lose next turn picking it up.',
        loseTurn: true,
      };

    case 2:
      return {
        type: 'hit_self',
        description: 'You hit yourself in the confusion!',
        damage: '1d4',
      };

    case 3:
      return {
        type: 'off_balance',
        description: 'You stumble off-balance! Enemy gets +2 AC until your next turn.',
        acPenalty: -2,
      };

    case 4:
      return {
        type: 'opening',
        description: 'You leave an opening! Enemy gets a free attack.',
        givesFreeAttack: true,
      };

    default:
      // Fallback for out-of-range rolls
      return {
        type: 'drop_weapon',
        description: 'You drop your weapon! Lose next turn picking it up.',
        loseTurn: true,
      };
  }
}

/**
 * Roll 1d4 to determine fumble effect
 * @returns Fumble effect from 1d4 table
 */
export function rollFumbleEffect(): FumbleEffect {
  const roll = Math.floor(Math.random() * 4) + 1; // 1d4
  return determineFumbleEffect(roll);
}
