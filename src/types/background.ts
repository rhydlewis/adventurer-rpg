import type { Attributes } from './attributes';
import type { CharacterClass } from './character';

export type StartingQuirk =
  | 'auto-block-first-attack' // Fighter: Border Guard
  | 'start-hidden' // Rogue: Street Urchin
  | 'arcane-shield-turn-1' // Wizard: Academy Dropout
  | 'auto-heal-first-hit'; // Cleric: Temple Acolyte

export interface Background {
  name: string;
  description: string;
  // Legacy fields (keep for backward compatibility)
  skillBonuses?: { [skillName: string]: number }; // e.g., { Stealth: 2 }
  startingGold?: number; // e.g., 150
  // Validation campaign fields
  id?: string;
  class?: CharacterClass;
  dialogueTags?: string[]; // ['authority', 'law', 'military']
  attributeBias?: Partial<Attributes>; // { str: 14, con: 13, wis: 12 }
  taggedSkills?: string[]; // ['Intimidate', 'Perception']
  startingQuirk?: StartingQuirk;
  puzzleAbility?: string; // 'physical-shortcut', 'lock-hints', etc.
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
