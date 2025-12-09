import type { Attributes } from './attributes';

export type CharacterClass = 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric';

export interface Character {
  name: string;
  class: CharacterClass;
  level: number;
  attributes: Attributes;
  hp: number;
  maxHp: number;
  ac: number;
  bab: number;
  saves: {
    fortitude: number;
    reflex: number;
    will: number;
  };
}