import { DiceRoller, DiceRoll } from '@dice-roller/rpg-dice-roller';

const roller = new DiceRoller();

// Debug mode: force next d20 roll to a specific value (1-20)
let forcedD20Roll: number | null = null;
let forcedPlayerD20Roll: number | null = null;
let forcedEnemyD20Roll: number | null = null;

export function setForcedD20Roll(value: number | null, context?: 'player' | 'enemy') {
  if (!context) {
    // Legacy support: set both player and enemy
    forcedD20Roll = value;
  } else if (context === 'player') {
    forcedPlayerD20Roll = value;
  } else if (context === 'enemy') {
    forcedEnemyD20Roll = value;
  }
}

export function clearForcedD20Roll() {
  forcedD20Roll = null;
  forcedPlayerD20Roll = null;
  forcedEnemyD20Roll = null;
}

/**
 * Roll dice using standard notation
 * Examples: '1d20', '2d6+3', '1d8+2'
 */
export function roll(notation: string): number {
  const result = roller.roll(notation) as DiceRoll;
  return result.total;
}

/**
 * Roll d20 with modifiers
 */
export function rollD20(modifier: number = 0): number {
  return roll(`1d20${modifier >= 0 ? '+' : ''}${modifier}`);
}

/**
 * Roll attack: d20 + BAB + ability modifier
 * Returns total, the d20 roll (for crit checking), and formatted output
 */
export function rollAttack(bab: number, abilityMod: number, context?: 'player' | 'enemy'): {
  total: number;
  d20Result: number;
  output: string;
} {
  // Check if we're forcing the d20 roll for debug purposes
  // Priority: context-specific forced roll > legacy forced roll
  let debugRoll: number | null = null;

  if (context === 'player' && forcedPlayerD20Roll !== null) {
    debugRoll = forcedPlayerD20Roll;
    forcedPlayerD20Roll = null;
  } else if (context === 'enemy' && forcedEnemyD20Roll !== null) {
    debugRoll = forcedEnemyD20Roll;
    forcedEnemyD20Roll = null;
  } else if (forcedD20Roll !== null) {
    debugRoll = forcedD20Roll;
    forcedD20Roll = null;
  }

  if (debugRoll !== null) {
    const d20 = debugRoll;
    const modifier = bab + abilityMod;
    const total = d20 + modifier;

    return {
      total,
      d20Result: d20,
      output: `1d20+${modifier}: [${d20}]+${modifier} = ${total} [DEBUG]`,
    };
  }

  const result = roller.roll(`1d20+${bab + abilityMod}`) as DiceRoll;
  // Extract the d20 roll from the result for critical hit checking
  // Type assertion needed as DiceRoll doesn't expose rolls structure
  const d20Result = (result.rolls[0] as unknown as { value?: number })?.value ?? result.total;

  return {
    total: result.total,
    d20Result,
    output: result.output,
  };
}

/**
 * Roll damage: weapon dice + ability modifier
 * Example: rollDamage('1d8', 3) = "1d8+3"
 */
export function rollDamage(weaponDice: string, modifier: number): {
  total: number;
  output: string;
} {
  const notation = `${weaponDice}${modifier >= 0 ? '+' : ''}${modifier}`;
  const result = roller.roll(notation) as DiceRoll;

  return {
    total: result.total,
    output: result.output,
  };
}

/**
 * Roll with advantage (D&D 5e style) - keep highest of 2d20
 * Future-proofing for if we add advantage mechanics
 */
export function rollWithAdvantage(modifier: number = 0): {
  total: number;
  output: string;
} {
  const result = roller.roll(`2d20kh1${modifier >= 0 ? '+' : ''}${modifier}`) as DiceRoll;
  return {
    total: result.total,
    output: result.output,
  };
}

/**
 * Roll with disadvantage (D&D 5e style) - keep lowest of 2d20
 * Future-proofing for if we add disadvantage mechanics
 */
export function rollWithDisadvantage(modifier: number = 0): {
  total: number;
  output: string;
} {
  const result = roller.roll(`2d20kl1${modifier >= 0 ? '+' : ''}${modifier}`) as DiceRoll;
  return {
    total: result.total,
    output: result.output,
  };
}

/**
 * Calculate ability modifier from score (d20 standard)
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}