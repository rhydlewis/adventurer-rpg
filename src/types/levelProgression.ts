export interface LevelProgression {
  level: number;

  // Base progression
  baseAttackBonus: number;
  fortitudeSave: number;
  reflexSave: number;
  willSave: number;

  // Class-specific
  classFeatures: string[];  // IDs of features gained at this level
  spellsPerDay?: SpellSlots;  // For casters

  // Choices
  featGained: boolean;      // Does player get a feat this level?
  skillPoints: number;      // Skill points to allocate
  abilityScoreIncrease: boolean;  // +1 to any ability (every 4 levels)
}

export interface SpellSlots {
  level0: number;  // Cantrips
  level1: number;
  level2: number;
  level3: number;
}

export interface LevelUpResult {
  oldLevel: number;
  newLevel: number;
  hpGained: number;
  babGained: number;
  savesGained: {
    fort: number;
    reflex: number;
    will: number;
  };
  featGained: boolean;
  skillPoints: number;
  classFeatures: string[];
  spellsLearned?: number;  // Number of new spells to select
}
