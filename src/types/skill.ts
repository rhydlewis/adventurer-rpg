export type SkillName =
  | 'Athletics'
  | 'Stealth'
  | 'Perception'
  | 'Arcana'
  | 'Medicine'
  | 'Intimidate';

export type AbilityScore = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface SkillDefinition {
  name: SkillName;
  ability: AbilityScore;
  description: string;
}

export interface SkillRanks {
  Athletics: number;
  Stealth: number;
  Perception: number;
  Arcana: number;
  Medicine: number;
  Intimidate: number;
}

export interface SkillBonus {
  skill: SkillName;
  totalBonus: number;
  breakdown: {
    ranks: number;
    abilityMod: number;
    classSkillBonus: number;
    otherBonuses: number;
  };
}
