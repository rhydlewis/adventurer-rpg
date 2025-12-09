import type { Feat, FeatName } from '../types/feat';

export const FEATS: Record<FeatName, Feat> = {
  'Power Attack': {
    name: 'Power Attack',
    description: 'Toggle ability: -2 to attack rolls, +4 to damage',
    effect: { type: 'toggle', name: 'powerAttack' },
  },
  'Weapon Focus': {
    name: 'Weapon Focus',
    description: 'Gain +1 bonus to attack rolls with your primary weapon',
    effect: { type: 'passive', stat: 'attack', bonus: 1 },
  },
  Toughness: {
    name: 'Toughness',
    description: 'Gain +3 hit points per level',
    effect: { type: 'passive', stat: 'hp', bonus: 3 },
  },
  'Improved Initiative': {
    name: 'Improved Initiative',
    description: 'Gain +4 bonus to initiative rolls',
    effect: { type: 'passive', stat: 'initiative', bonus: 4 },
  },
  'Combat Reflexes': {
    name: 'Combat Reflexes',
    description: 'Gain +2 AC when using the Dodge ability',
    effect: { type: 'conditional', condition: 'dodge', stat: 'ac', bonus: 2 },
  },
};

// Feats available for Fighter at level 1
export const FIGHTER_STARTING_FEATS: FeatName[] = [
  'Power Attack',
  'Weapon Focus',
  'Toughness',
  'Improved Initiative',
  'Combat Reflexes',
];
