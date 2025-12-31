import { describe, it, expect } from 'vitest';
import type { LevelProgression, LevelUpResult } from '../../types/levelProgression';

describe('Level Progression Types', () => {
  it('should create valid level progression', () => {
    const level2: LevelProgression = {
      level: 2,
      baseAttackBonus: 2,
      fortitudeSave: 3,
      reflexSave: 0,
      willSave: 0,
      classFeatures: ['fighter-bonus-feat'],
      featGained: true,
      skillPoints: 2,
      abilityScoreIncrease: false,
    };

    expect(level2.level).toBe(2);
    expect(level2.featGained).toBe(true);
  });

  it('should create valid level-up result', () => {
    const result: LevelUpResult = {
      oldLevel: 1,
      newLevel: 2,
      hpGained: 8,
      babGained: 1,
      savesGained: { fort: 1, reflex: 0, will: 0 },
      featGained: true,
      skillPoints: 2,
      classFeatures: ['fighter-bonus-feat'],
    };

    expect(result.newLevel).toBe(2);
    expect(result.hpGained).toBe(8);
  });
});
