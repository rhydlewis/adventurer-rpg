import type { Attributes } from './attributes';
import type { Effect } from './effects';

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
  effects?: Effect[];
  avatarUrl?: string;
}