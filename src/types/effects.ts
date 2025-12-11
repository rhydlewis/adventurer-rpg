export type EffectType = 'buff' | 'debuff';

export interface Effect {
  id: string;
  name: string;
  description: string;
  type: EffectType;
  modifier: number;
  duration?: number; // turns remaining, undefined = permanent
  affectedStat?: 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA' | 'AC' | 'HP';
}
