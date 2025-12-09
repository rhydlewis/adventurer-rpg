import { DiceRoller, DiceRoll } from '@dice-roller/rpg-dice-roller';

const roller = new DiceRoller();

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
export function rollAttack(bab: number, abilityMod: number): {
  total: number;
  d20Result: number;
  output: string;
} {
  const result = roller.roll(`1d20+${bab + abilityMod}`) as DiceRoll;
  // Extract the d20 roll from the result for critical hit checking
  const d20Result = (result.rolls[0] as any)?.value ?? result.total;

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