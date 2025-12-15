export interface Background {
  name: string;
  description: string;
  skillBonuses: { [skillName: string]: number }; // e.g., { Stealth: 2 }
  startingGold: number; // e.g., 150
}

export interface CharacterTrait {
  name: string;
  description: string;
  mechanical?: string; // Optional mechanical effect description
}

export const BACKGROUNDS: Record<string, Background> = {
  'Street Urchin': {
    name: 'Street Urchin',
    description: 'You grew up on the streets, learning to survive by your wits.',
    skillBonuses: { Stealth: 2, 'Sleight of Hand': 2 },
    startingGold: 50,
  },
  'Noble': {
    name: 'Noble',
    description: 'You come from a wealthy family with connections.',
    skillBonuses: { Diplomacy: 2, 'Knowledge (nobility)': 2 },
    startingGold: 300,
  },
  'Soldier': {
    name: 'Soldier',
    description: 'You served in an army or militia.',
    skillBonuses: { Intimidate: 2, Athletics: 2 },
    startingGold: 100,
  },
};
