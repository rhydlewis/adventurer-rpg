export type FeatName =
  | 'Power Attack'
  | 'Weapon Focus'
  | 'Toughness'
  | 'Improved Initiative'
  | 'Combat Reflexes';

export interface Feat {
  name: FeatName;
  description: string;
  effect: FeatEffect;
}

export type FeatEffect =
  | { type: 'toggle'; name: 'powerAttack' } // -2 attack, +4 damage
  | { type: 'passive'; stat: 'attack'; bonus: number } // Weapon Focus: +1 attack
  | { type: 'passive'; stat: 'hp'; bonus: number } // Toughness: +3 HP per level
  | { type: 'passive'; stat: 'initiative'; bonus: number } // Improved Initiative: +4
  | { type: 'conditional'; condition: 'dodge'; stat: 'ac'; bonus: number }; // Combat Reflexes: +2 AC when dodging
