export type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

export interface DiceRoll {
  dice: DiceType;
  count: number;
  modifier: number;
  result: number;
}