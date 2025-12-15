import type { Attributes } from './attributes';
import type { SkillRanks } from './skill';
import type { Feat } from './feat';
import type { Equipment, InventoryItem } from './equipment';
import type { Resources } from './resource';
import type { Background, CharacterTrait } from './background';

export type CharacterClass = 'Fighter' | 'Rogue' | 'Wizard' | 'Cleric';

export interface Character {
  name: string;
  avatarPath: string;
  class: CharacterClass;
  level: number;
  background?: Background;
  traits: CharacterTrait[];
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
  skills: SkillRanks;
  feats: Feat[];
  equipment: Equipment;
  resources: Resources;

  // Validation campaign: Inventory & Gold
  gold: number;
  inventory: InventoryItem[];
  maxInventorySlots: number;
}